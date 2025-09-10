import logger from '../utils/logger';
import { CustomApiError } from '../errors';

// Type definitions for error handling
interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: { [key: string]: { message: string } };
}

interface ErrorResponse {
  success: boolean;
  error: string;
  details?: string[];
  requestId?: string;
}

interface MongooseValidationError extends Error {
  name: 'ValidationError';
  errors: { [key: string]: { message: string } };
}

interface MongoCastError extends Error {
  name: 'CastError';
  path: string;
  value: any;
}

interface MongoDuplicateError extends Error {
  code: 11000;
  keyPattern?: { [key: string]: number };
  keyValue?: { [key: string]: any };
}

/**
 * Global error handler middleware for Express applications
 * Handles various types of errors and provides consistent error responses
 * @param err - Error object
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
const errorHandler = (
  err: CustomError,
  req: any,
  res: any,
  next: any
): void => {
  let error: CustomError = { ...err };
  error.message = err.message;

  // Generate request ID for tracking
  const requestId = req.headers['x-request-id'] as string || 
                   `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Log error with detailed information
  logger.error(`Error ${err.message}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId,
    stack: err.stack,
    body: req.method !== 'GET' ? req.body : undefined,
  });

  // Handle CustomApiError instances first
  if (err instanceof CustomApiError) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: err.message,
      requestId,
    };
    
    if (err.errors && err.errors.length > 0) {
      errorResponse.details = err.errors;
    }
    
    return res.status(err.statusCode).json(errorResponse);
  }

  // Handle different types of errors
  
  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const castError = err as MongoCastError;
    const message = `Resource not found with id: ${castError.value}`;
    error = { 
      message, 
      statusCode: 404,
      name: 'CastError'
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const duplicateError = err as MongoDuplicateError;
    const field = Object.keys(duplicateError.keyValue || {})[0];
    const message = field 
      ? `Duplicate field value entered for ${field}`
      : 'Duplicate field value entered';
    error = { 
      message, 
      statusCode: 400,
      name: 'DuplicateError'
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationError = err as MongooseValidationError;
    const messages = Object.values(validationError.errors).map(
      (val) => val.message
    );
    error = { 
      message: messages.join(', '), 
      statusCode: 400,
      name: 'ValidationError'
    };
  }

  // JWT authentication errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      statusCode: 401,
      name: 'AuthenticationError'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      statusCode: 401,
      name: 'AuthenticationError'
    };
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    switch (err.message) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Invalid file type';
        break;
      default:
        message = 'File upload error';
    }
    error = {
      message,
      statusCode: 400,
      name: 'FileUploadError'
    };
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: error.message || 'Server Error',
    requestId,
  };

  // Add details for validation errors
  if (err.name === 'ValidationError' && err.errors) {
    errorResponse.details = Object.values(err.errors).map(val => val.message);
  }

  // Set appropriate status code
  const statusCode = error.statusCode || 500;

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors for unmatched routes
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
const notFoundHandler = (
  req: any,
  res: any,
  next: any
): void => {
  const error: CustomError = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error wrapper to catch errors in async route handlers
 * @param fn - Async function to wrap
 * @returns Wrapped function that catches errors
 */
const asyncHandler = (
  fn: (req: any, res: any, next: any) => Promise<any>
) => {
  return (req: any, res: any, next: any): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
export { 
  notFoundHandler, 
  asyncHandler, 
  CustomError, 
  ErrorResponse,
  MongooseValidationError,
  MongoCastError,
  MongoDuplicateError 
};