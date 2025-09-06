import { Request, Response, NextFunction } from 'express';
import { CustomApiError } from '../errors/CustomApiError';

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log('[ERROR HANDLER] Caught error:', err.name, err.message);
  console.log('[ERROR HANDLER] Response sent:', res.headersSent);
  
  if (err instanceof CustomApiError) {
    console.log('[ERROR HANDLER] Sending CustomApiError response');
    res.status(err.statusCode).json({ msg: err.message });
    return;
  }

  // Handle Mongoose DocumentNotFoundError
  if (err.name === 'DocumentNotFoundError') {
    console.log('[ERROR HANDLER] Sending DocumentNotFoundError response');
    res.status(404).json({ 
      success: false,
      message: 'Resource not found' 
    });
    return;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    console.log('[ERROR HANDLER] Sending ValidationError response');
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values((err as any).errors).map((error: any) => error.message)
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    console.log('[ERROR HANDLER] Sending CastError response');
    res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
    return;
  }
  
  console.log('[ERROR HANDLER] Sending generic 500 error response');
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!' 
  });
};
