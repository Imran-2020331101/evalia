import express from 'express'
import logger from "../utils/logger";

// Custom type definitions for Express objects
interface Request {
  method: string;
  url: string;
  ip: string;
  query: any;
  body: any;
  headers: any;
  connection?: {
    remoteAddress?: string;
  };
  get(header: string): string | undefined;
  on(event: string, listener: (...args: any[]) => void): void;
}

interface Response {
  statusCode: number;
  headersSent: boolean;
  on(event: string, listener: (...args: any[]) => void): void;
  get(header: string): string | undefined;
}

type NextFunction = () => void;

// Extended request interface with additional properties
interface ExtendedRequest extends Request {
  startTime?: number;
  requestId?: string;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

// Request metadata interface
interface RequestMetadata {
  method: string;
  url: string;
  ip: string | undefined;
  userAgent: string | undefined;
  requestId?: string;
  userId?: string;
  timestamp: string;
  query?: any;
  body?: any;
  headers?: Record<string, any>;
}

// Response metadata interface
interface ResponseMetadata extends RequestMetadata {
  statusCode: number;
  duration: string;
  contentLength?: string;
  responseSize?: number;
}

/**
 * Generate unique request ID
 * @returns Unique request identifier
 */
const generateRequestId = (): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${randomSuffix}`;
};

/**
 * Sanitize sensitive data from request body/query
 * @param data - Data to sanitize
 * @returns Sanitized data object
 */
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'apikey',
    'api_key',
    'authorization',
    'auth',
    'secret',
    'key',
    'credential',
    'ssn',
    'credit_card',
    'creditcard'
  ];

  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
};

/**
 * Get client IP address with proxy support
 * @param req - Express request object
 * @returns Client IP address
 */
const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const clientIP = req.headers['x-client-ip'] as string;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || clientIP || req.connection?.remoteAddress || req.ip || 'unknown';
};

/**
 * Determine if request should include body in logs
 * @param req - Express request object
 * @returns Boolean indicating if body should be logged
 */
const shouldLogBody = (req: Request): boolean => {
  const method = req.method.toUpperCase();
  const contentType = req.headers['content-type'] || '';
  
  // Only log bodies for POST, PUT, PATCH requests with JSON content
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return false;
  }
  
  // Don't log file uploads or form data
  if (contentType.includes('multipart/form-data') || 
      contentType.includes('application/octet-stream')) {
    return false;
  }
  
  return contentType.includes('application/json');
};

/**
 * Enhanced request logging middleware with comprehensive tracking
 */
const requestLogger = (req: ExtendedRequest, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const requestId = generateRequestId();
  
  // Add request metadata to request object
  req.startTime = start;
  req.requestId = requestId;

  // Prepare request metadata
  const requestMetadata: RequestMetadata = {
    method: req.method,
    url: req.url,
    ip: getClientIP(req),
    userAgent: req.get("User-Agent"),
    requestId,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    query: Object.keys(req.query).length > 0 ? sanitizeData(req.query) : undefined,
    body: shouldLogBody(req) && req.body ? sanitizeData(req.body) : undefined,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'accept': req.headers['accept'],
      'origin': req.headers['origin'],
      'referer': req.headers['referer'],
    }
  };

  // Log incoming request
  logger.info("📨 Incoming request", requestMetadata);

  // Track response completion
  res.on("finish", () => {
    const duration = Date.now() - start;
    const contentLength = res.get('Content-Length');
    
    const responseMetadata: ResponseMetadata = {
      ...requestMetadata,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength,
      responseSize: contentLength ? parseInt(contentLength, 10) : undefined,
    };

    // Determine log level based on status code
    const logLevel = res.statusCode >= 500 ? 'error' :
                    res.statusCode >= 400 ? 'warn' :
                    res.statusCode >= 300 ? 'info' : 'info';

    // Log response with appropriate level
    const statusEmoji = res.statusCode >= 500 ? '❌' :
                       res.statusCode >= 400 ? '⚠️' :
                       res.statusCode >= 300 ? '↩️' : '✅';

    logger[logLevel](`${statusEmoji} Request completed`, responseMetadata);

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn(`🐌 Slow request detected`, {
        requestId,
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  // Handle connection errors
  req.on('close', () => {
    if (!res.headersSent) {
      logger.warn("🔌 Client disconnected", {
        requestId,
        method: req.method,
        url: req.url,
        duration: `${Date.now() - start}ms`,
      });
    }
  });

  // Handle response errors
  res.on('error', (error: Error) => {
    logger.error("💥 Response error", {
      requestId,
      method: req.method,
      url: req.url,
      error: error.message,
      stack: error.stack,
      duration: `${Date.now() - start}ms`,
    });
  });

  next();
};

/**
 * Create request logger with custom configuration
 * @param options - Configuration options
 * @returns Configured request logger middleware
 */
const createRequestLogger = (options: {
  logBody?: boolean;
  logHeaders?: boolean;
  logQuery?: boolean;
  slowRequestThreshold?: number;
  excludePaths?: string[];
} = {}) => {
  const {
    logBody = true,
    logHeaders = true,
    logQuery = true,
    slowRequestThreshold = 1000,
    excludePaths = []
  } = options;

  return (req: ExtendedRequest, res: Response, next: NextFunction): void => {
    // Skip logging for excluded paths
    if (excludePaths.some(path => req.url.startsWith(path))) {
      return next();
    }

    // Use main logger with custom options
    requestLogger(req, res, next);
  };
};

// Export the middleware and utilities
export default requestLogger;

export {
  createRequestLogger,
  generateRequestId,
  sanitizeData,
  getClientIP,
  shouldLogBody,
  ExtendedRequest,
  RequestMetadata,
  ResponseMetadata,
};