import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

// Import configuration and utilities
import config from './config';
import logger, { logStartup } from './utils/logger';
import connectDB from './config/database';

// Import middleware
import requestLogger from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';

// Import routes
import routes from './routes';

// Interface for application health status
interface HealthStatus {
  success: boolean;
  message: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  system: {
    platform: string;
    arch: string;
    nodeVersion: string;
    cpuUsage: NodeJS.CpuUsage;
  };
}

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
  const app: Application = express();

  // Connect to database
  connectDB();

  // CORS middleware with enhanced configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (config.CORS_ORIGINS.includes(origin) || config.NODE_ENV === 'development') {
          return callback(null, true);
        }
        
        logger.security('CORS policy violation', { origin, allowedOrigins: config.CORS_ORIGINS });
        return callback(new Error('Not allowed by CORS policy'), false);
      },
      credentials: true,
      optionsSuccessStatus: 200,
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    })
  );

  // Security headers middleware
  app.use((req: Request, res: Response, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.removeHeader('X-Powered-By');
    next();
  });

  // Request logging middleware
  app.use(requestLogger as any);

  // Body parsing middleware with enhanced limits and error handling
  app.use(express.json({ 
    limit: config.MAX_FILE_SIZE,
    verify: (req: any, res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        logger.security('Invalid JSON payload received', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          contentLength: req.get('Content-Length'),
        });
        throw new Error('Invalid JSON payload');
      }
    }
  }));

  app.use(express.urlencoded({ 
    extended: true, 
    limit: config.MAX_FILE_SIZE,
    parameterLimit: 100,
  }));

  // Static files with security headers
  app.use('/uploads', (req: Request, res: Response, next) => {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  }, express.static(path.join(__dirname, '../uploads'), {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Only allow PDF files to be served
      if (!filePath.endsWith('.pdf')) {
        res.setHeader('Content-Disposition', 'attachment');
      }
    },
  }));

  // API routes
  app.use('/api', routes);

  // Health check endpoint with detailed system information
  app.get('/health', (req: Request, res: Response) => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const healthStatus: HealthStatus = {
      success: true,
      message: 'Evalia Resume Service is healthy',
      version: '2.0.0',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memoryUsage: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        cpuUsage,
      },
    };

    logger.info('Health check requested', {
      requestId: (req as any).requestId,
      uptime: healthStatus.uptime,
      memoryUsed: healthStatus.memoryUsage.heapUsed,
    });

    res.json(healthStatus);
  });

  // Root endpoint with enhanced information
  app.get('/', (req: Request, res: Response) => {
    const response = {
      success: true,
      message: 'Welcome to Evalia Resume Service API v2.0',
      version: '2.0.0',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        api: '/api',
        docs: '/api/docs',
        resume: '/api/resume',
      },
      features: [
        'Resume upload and parsing',
        'AI-powered content analysis', 
        'Vector-based candidate search',
        'Real-time processing status',
        'Comprehensive error handling',
        'Structured logging',
      ],
    };

    logger.info('Root endpoint accessed', {
      requestId: (req as any).requestId,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    res.json(response);
  });

  // API documentation endpoint
  app.get('/api/docs', (req: Request, res: Response) => {
    res.json({
      title: 'Evalia Resume Service API',
      version: '2.0.0',
      description: 'AI-powered resume processing and candidate matching service',
      endpoints: {
        'GET /health': 'Service health status',
        'GET /api/health': 'API health check',
        'POST /api/resume/upload': 'Upload and process resume',
        'GET /api/resume/:id': 'Get resume details',
        'POST /api/resume/search': 'Search candidates',
        'POST /api/resume/basic-search': 'Basic candidate search',
      },
      contact: {
        team: 'Evalia Development Team',
        email: 'dev@evalia.com',
      },
    });
  });

  // 404 handler for undefined routes
  app.use('*', (req: Request, res: Response) => {
    logger.security('404 - Route not found', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: (req as any).requestId,
    });

    res.status(404).json({
      success: false,
      error: 'Route not found',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
      availableEndpoints: [
        'GET /',
        'GET /health',
        'GET /api/docs',
        'POST /api/resume/upload',
        'GET /api/resume/:id',
        'POST /api/resume/search',
      ],
      timestamp: new Date().toISOString(),
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler as any);

  // Log application startup
  logStartup();

  return app;
};

// Create and export the application
const app: Application = createApp();

export default app;
