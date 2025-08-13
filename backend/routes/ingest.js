const express = require('express');
const docIngester = require('../services/docIngester');

const router = express.Router();

// Ingest LangChain documentation from GitHub
router.post('/langchain-docs', async (req, res) => {
  try {
    console.log('🚀 Starting LangChain docs ingestion...');
    
    const result = await docIngester.fetchLangChainDocs();
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ LangChain docs ingestion error:', error);
    res.status(500).json({
      error: 'Failed to ingest LangChain documentation',
      message: error.message,
    });
  }
});

// Ingest content from URL
router.post('/url', async (req, res) => {
  try {
    const { url, metadata = {} } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL is required and must be a string',
      });
    }

    console.log(`🌐 Ingesting content from URL: ${url}`);
    
    const result = await docIngester.ingestFromUrl(url, metadata);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ URL ingestion error:', error);
    res.status(500).json({
      error: 'Failed to ingest content from URL',
      message: error.message,
    });
  }
});

// Ingest text content
router.post('/text', async (req, res) => {
  try {
    const { text, metadata = {} } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Text content is required and must be a string',
      });
    }

    console.log('📝 Ingesting text content...');
    
    const result = await docIngester.ingestFromText(text, metadata);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Text ingestion error:', error);
    res.status(500).json({
      error: 'Failed to ingest text content',
      message: error.message,
    });
  }
});

module.exports = router;
