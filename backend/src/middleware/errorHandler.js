// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      messages
    });
  }

  // Mongoose Cast Error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid Identifier format'
    });
  }

  // Custom App Error (e.g. invalid status transitions)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Fallback for unexpected errors
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected server error occurred' 
      : err.message
  });
};

module.exports = errorHandler;
