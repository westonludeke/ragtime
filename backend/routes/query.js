const express = require('express');
const ragService = require('../services/ragService');

const router = express.Router();

// Query endpoint
router.post('/', async (req, res) => {
  try {
    const { query, options = {} } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string',
      });
    }

    console.log(`🔍 Processing query: "${query}"`);

    const result = await ragService.query(query, options);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Query error:', error);
    res.status(500).json({
      error: 'Failed to process query',
      message: error.message,
    });
  }
});

// Get collection stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await ragService.getCollectionStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      error: 'Failed to get collection stats',
      message: error.message,
    });
  }
});

// Clear collection
router.delete('/clear', async (req, res) => {
  try {
    const result = await ragService.clearCollection();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Clear error:', error);
    res.status(500).json({
      error: 'Failed to clear collection',
      message: error.message,
    });
  }
});

module.exports = router;
