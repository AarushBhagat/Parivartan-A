const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeFirebase } = require('./firebase');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
initializeFirebase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support form-data

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/grievances', require('./routes/grievances'));
app.use('/api/issues', require('./routes/issues')); // Added for mobile app compatibility
app.use('/api/upload', require('./routes/upload')); // AWS S3 upload routes

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Department Dashboard Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://172.20.10.3:${PORT}`);
  console.log(`\nBackend is ready to accept connections from mobile app!`);
});