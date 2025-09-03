import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // If it's not an ApiError instance, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, [], error?.stack);
  }

  // Log the error for debugging (you can replace with proper logging)
  console.error('Error:', {
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error response
  const response = new ApiResponse(
    error.statusCode,
    null,
    error.message
  );

  res.status(error.statusCode).json({
    response,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Handle 404 - Not Found
const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ApiError(
    404,
    `Route ${req.originalUrl} not found`,
    [],
    ''
  );
  next(error);
};

export { errorHandler, notFoundHandler };
