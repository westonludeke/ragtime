const express = require('express');
const dotenv = require('dotenv');
const uploadRoute = require('./routes/upload');
const queryRoute = require('./routes/query');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/upload', uploadRoute);
app.use('/query', queryRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
