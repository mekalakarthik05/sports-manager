const ApiError = require('../utils/ApiError');
const env = require('../config/env');

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists (duplicate)';
  }
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference (foreign key violation)';
  }
  if (err.code === '23502') {
    statusCode = 400;
    message = 'Required field missing';
  }

  const response = {
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
