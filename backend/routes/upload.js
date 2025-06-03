const express = require('express');
const multer = require('multer');
const chunker = require('../services/chunker');
const embedder = require('../services/embedder');
const retriever = require('../services/retriever'); // Will store chunks

const router = express.Router();
const upload = multer();

router.post('/', upload.single('file'), async (req, res) => {
  const text = req.file.buffer.toString('utf-8');
  const chunks = chunker(text);
  const embeddings = await embedder(chunks);
  await retriever.storeEmbeddings(chunks, embeddings);
  res.status(200).send('Document uploaded and processed');
});

module.exports = router;
