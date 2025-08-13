const express = require('express');
const multer = require('multer');
const ragService = require('../services/ragService');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept markdown, text, and other text-based files
    const allowedTypes = [
      'text/markdown',
      'text/plain',
      'text/mdx',
      'application/markdown',
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.md') || file.originalname.endsWith('.txt') || file.originalname.endsWith('.mdx')) {
      cb(null, true);
    } else {
      cb(new Error('Only markdown, text, and MDX files are allowed'));
    }
  },
});

// Upload single file
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
      });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    console.log(`📁 Uploading file: ${fileName} (${fileSize} bytes)`);

    // Prepare metadata
    const metadata = {
      fileName,
      fileSize,
      uploadTimestamp: new Date().toISOString(),
      contentType: req.file.mimetype,
    };

    // Ingest the document
    const result = await ragService.ingestDocument(fileContent, metadata);

    res.json({
      success: true,
      data: {
        fileName,
        fileSize,
        ...result,
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      error: 'Failed to upload and process file',
      message: error.message,
    });
  }
});

// Upload text content directly
router.post('/text', async (req, res) => {
  try {
    const { content, metadata = {} } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        error: 'Content is required and must be a string',
      });
    }

    console.log('📝 Uploading text content...');

    const result = await ragService.ingestDocument(content, {
      ...metadata,
      uploadTimestamp: new Date().toISOString(),
      source: 'text-upload',
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Text upload error:', error);
    res.status(500).json({
      error: 'Failed to upload text content',
      message: error.message,
    });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB',
      });
    }
  }
  
  if (error.message.includes('Only markdown')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message,
    });
  }

  next(error);
});

module.exports = router;
