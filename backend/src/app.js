const express = require('express');
const cors = require('cors');
const ticketRoutes = require('./routes/ticketRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable CORS for frontend integration
app.use(cors());

// Built-in JSON body parser
app.use(express.json());

// API Routes mounting
app.use('/tickets', ticketRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'OK', 
    message: 'DeskFlow API is running' 
  });
});

// Catch-all route for unhandled requests
app.use((req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global central error handler middleware
app.use(errorHandler);

module.exports = app;
