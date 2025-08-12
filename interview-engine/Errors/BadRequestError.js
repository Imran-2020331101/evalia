const customApiError = require('./CustomApiError');
const { StatusCodes } = require('http-status-codes');

class BadRequestError extends customApiError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError;
