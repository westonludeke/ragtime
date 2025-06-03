const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async function embedder(textArray) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: textArray,
  });
  return response.data.map(obj => obj.embedding);
};
