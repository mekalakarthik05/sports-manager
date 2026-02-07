class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Export the class directly so existing `require('../utils/ApiError')`
// calls receive the constructor, not an object wrapper.
module.exports = ApiError;
