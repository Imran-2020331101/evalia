import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: any;
}

// Global error handler middleware
const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  let error: CustomError = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error ${err.message}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    stack: err.stack,
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 } as CustomError;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 } as CustomError;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors || {}).map((val: any) => val.message);
    error = { message: message.join(", "), statusCode: 400 } as CustomError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

export default errorHandler;
