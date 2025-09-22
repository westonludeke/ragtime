require('dotenv').config();
const { OpenAI } = require('@langchain/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { Chroma } = require('@langchain/community/vectorstores/chroma');

class RAGService {
  constructor() {
    this.openai = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.1,
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small',
    });

    // Chroma connection/config (persistent via Chroma server)
    this.collectionName = process.env.CHROMA_COLLECTION_NAME || 'ragtime';
    this.chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    // OpenAI text-embedding-3-small => 1536 dims
    const defaultDims = 1536;
    const envDimsRaw = process.env.CHROMA_NUM_DIMENSIONS;
    const envDims = envDimsRaw !== undefined ? Number(envDimsRaw) : undefined;
    this.numDimensions = Number.isFinite(envDims) && envDims > 0 ? envDims : defaultDims;
    if (envDimsRaw !== undefined && !(Number.isFinite(envDims) && envDims > 0)) {
      console.warn(`⚠️ Invalid CHROMA_NUM_DIMENSIONS='${envDimsRaw}', falling back to ${defaultDims}`);
    }
    // Optional collection metadata (keeps default cosine space)
    this.collectionMetadata = { 'hnsw:space': 'cosine' };

    // Lazily-initialized Chroma vector store instance
    this.vectorStore = null;
    this.vectorStoreInitPromise = null;

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', ' ', ''],
    });

    this.qaPrompt = PromptTemplate.fromTemplate(`
You are a helpful AI assistant that answers questions based on the provided documentation context. 

Context information:
{context}

Question: {question}

Instructions:
1. Answer the question using ONLY the information provided in the context above
2. If the context doesn't contain enough information to answer the question, say "I don't have enough information to answer this question based on the available documentation."
3. Be concise but thorough in your response
4. If you reference specific information, mention that it comes from the documentation
5. Use markdown formatting for better readability

Answer: `);
  }

  async getVectorStore() {
    if (this.vectorStore) return this.vectorStore;
    if (!this.vectorStoreInitPromise) {
      this.vectorStoreInitPromise = (async () => {
        try {
          const vs = await Chroma.fromExistingCollection(this.embeddings, {
            collectionName: this.collectionName,
            url: this.chromaUrl,
            numDimensions: this.numDimensions,
            collectionMetadata: this.collectionMetadata,
          });
          // Ensure collection is created/available
          await vs.ensureCollection();
          this.vectorStore = vs;
          return vs;
        } catch (err) {
          const hint = `Unable to connect to Chroma at ${this.chromaUrl}. Make sure a Chroma server is running (e.g., docker or \`chroma run --path <dir>\`) and that CHROMA_URL is set correctly.`;
          console.error('❌ Chroma init error:', err?.message || err, '\n', hint);
          // Allow retries on subsequent calls
          this.vectorStoreInitPromise = null;
          throw new Error(`${hint}`);
        }
      })();
    }
    return this.vectorStoreInitPromise;
  }

  async ingestDocument(content, metadata = {}) {
    try {
      console.log('📄 Ingesting document...');
      
      // Split the document into chunks
      const chunks = await this.textSplitter.splitText(content);
      console.log(`📝 Split into ${chunks.length} chunks`);

      // Add metadata to each chunk
      const documents = chunks.map((chunk, index) => ({
        pageContent: chunk,
        metadata: {
          ...metadata,
          chunkIndex: index,
          totalChunks: chunks.length,
          timestamp: new Date().toISOString(),
        },
      }));

      // Store in Chroma (persistent vector DB)
      const vectorStore = await this.getVectorStore();
      await vectorStore.addDocuments(documents);
      console.log('✅ Document ingested successfully');

      return {
        success: true,
        chunksCount: chunks.length,
        message: `Successfully ingested ${chunks.length} chunks`,
      };
    } catch (error) {
      console.error('❌ Error ingesting document:', error);
      throw error;
    }
  }

  async query(question, options = {}) {
    try {
      console.log('🤔 Processing query:', question);

      // Get relevant documents
      const { k = 5, searchType = 'similarity' } = options || {};
      const vectorStore = await this.getVectorStore();
      const retriever = vectorStore.asRetriever({ k, searchType });

      const docs = await retriever.getRelevantDocuments(question);

      if (docs.length === 0) {
        return {
          answer: "I don't have enough information to answer this question based on the available documentation.",
          sources: [],
          question,
          timestamp: new Date().toISOString(),
        };
      }

      // Create context from documents
      const context = docs.map(doc => doc.pageContent).join('\n\n');

      // Create prompt
      const prompt = await this.qaPrompt.format({
        context,
        question,
      });

      // Get response from OpenAI
      const response = await this.openai.invoke(prompt);

      // Extract source documents for attribution
      const sources = docs.map((doc, index) => ({
        id: index + 1,
        content: doc.pageContent.substring(0, 200) + '...',
        metadata: doc.metadata,
      }));

      return {
        answer: response,
        sources,
        question,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error processing query:', error);
      throw error;
    }
  }

  async getCollectionStats() {
    try {
      const vectorStore = await this.getVectorStore();
      const collection = await vectorStore.ensureCollection();
      let documentCount = 0;
      try {
        documentCount = await collection.count();
      } catch (e) {
        // If count isn't available, keep 0 and continue
      }
      return { documentCount, collectionName: this.collectionName, chromaUrl: this.chromaUrl };
    } catch (error) {
      console.error('❌ Error getting collection stats:', error);
      return { documentCount: 0, collectionName: this.collectionName, chromaUrl: this.chromaUrl };
    }
  }

  async clearCollection() {
    try {
      const vectorStore = await this.getVectorStore();
      // Drop and recreate the collection to clear all items deterministically
      const collectionName = vectorStore.collectionName || this.collectionName;
      // Lazy import to avoid ESM/CJS interop issues
      const { ChromaClient } = await import('chromadb');
      const client = new ChromaClient({ path: this.chromaUrl });
      try {
        await client.deleteCollection({ name: collectionName });
      } catch (e) {
        const msg = String(e?.message || e).toLowerCase();
        // Make idempotent: ignore not-found errors
        if (!msg.includes('not found')) throw e;
      }
      // Reset local cache and re-init
      this.vectorStore = null;
      this.vectorStoreInitPromise = null;
      await this.getVectorStore();
      console.log('🗑️ Collection cleared');
      return { success: true, message: 'Collection cleared successfully' };
    } catch (error) {
      console.error('❌ Error clearing collection:', error);
      throw error;
    }
  }
}

module.exports = new RAGService();
