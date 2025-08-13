const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const uploadRoute = require('./routes/upload');
const queryRoute = require('./routes/query');
const ingestRoute = require('./routes/ingest');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/upload', uploadRoute);
app.use('/api/query', queryRoute);
app.use('/api/ingest', ingestRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ragtime API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Ragtime server running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
});
