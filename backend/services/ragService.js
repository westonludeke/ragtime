require('dotenv').config();
const { OpenAI } = require('@langchain/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');

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

    // Use in-memory vector store for simplicity
    this.vectorStore = new MemoryVectorStore(this.embeddings);

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

      // Store in vector database
      await this.vectorStore.addDocuments(documents);
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
      const retriever = this.vectorStore.asRetriever({
        k: 5,
        searchType: 'similarity',
      });

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
      // For MemoryVectorStore, we can't easily get the count
      // but we can return a basic structure
      return {
        documentCount: 'In-memory (count not available)',
        collectionName: 'memory-store',
      };
    } catch (error) {
      console.error('❌ Error getting collection stats:', error);
      return { documentCount: 0, collectionName: 'memory-store' };
    }
  }

  async clearCollection() {
    try {
      // For MemoryVectorStore, we need to create a new instance
      this.vectorStore = new MemoryVectorStore(this.embeddings);
      console.log('🗑️ Collection cleared');
      return { success: true, message: 'Collection cleared successfully' };
    } catch (error) {
      console.error('❌ Error clearing collection:', error);
      throw error;
    }
  }
}

module.exports = new RAGService();
