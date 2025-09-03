import { Request, Response } from 'express';
import { asyncHandler, ApiResponse, ApiError } from '../utils';

// Example controller showing how to use the error handling utilities
export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  const response = new ApiResponse(200, { status: 'OK', timestamp: new Date() }, 'Service is healthy');
  res.status(200).json(response);
});

// Example of throwing an error
export const testError = asyncHandler(async (req: Request, res: Response) => {
  throw new ApiError(400, 'This is a test error', ['validation error 1', 'validation error 2']);
});

// Example with validation
export const validateExample = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }
  
  if (!name) {
    throw new ApiError(400, 'Name is required');
  }
  
  // Simulate processing
  const result = { email, name, id: Date.now() };
  
  const response = new ApiResponse(201, result, 'Data processed successfully');
  res.status(201).json(response);
});
