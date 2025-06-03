const { ChromaClient } = require('chromadb');
const client = new ChromaClient();

const COLLECTION_NAME = 'documents';

async function storeEmbeddings(chunks, embeddings) {
  const collection = await client.getOrCreateCollection({ name: COLLECTION_NAME });
  const ids = chunks.map((_, i) => `doc-${Date.now()}-${i}`);
  await collection.add({ ids, embeddings, documents: chunks });
}

async function getRelevantChunks(queryEmbedding, k = 5) {
  const collection = await client.getCollection({ name: COLLECTION_NAME });
  const results = await collection.query({ queryEmbeddings: [queryEmbedding], nResults: k });
  return results.documents[0];
}

module.exports = { storeEmbeddings, getRelevantChunks };
