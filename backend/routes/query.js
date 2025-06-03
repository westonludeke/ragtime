const express = require('express');
const embedder = require('../services/embedder');
const retriever = require('../services/retriever');
const { OpenAI } = require('openai');

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { query } = req.body;
  const queryEmbedding = await embedder([query]);
  const topChunks = await retriever.getRelevantChunks(queryEmbedding[0]);
  
  const prompt = `Answer the question using the following context:\n${topChunks.join('\n')}\n\nQuestion: ${query}`;
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo'
  });

  res.json({ answer: completion.choices[0].message.content });
});

module.exports = router;
