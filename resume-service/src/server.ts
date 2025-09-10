import { Server } from 'http';
import app from './app';
import config from './config';
import logger, { logShutdown, logUnhandledError } from './utils/logger';

// Server instance type
let server: Server;

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal: string): void => {
  logger.info(`📡 Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close((err) => {
      if (err) {
        logger.error('❌ Error during server shutdown:', err);
        process.exit(1);
      }
      
      logShutdown(`Graceful shutdown on ${signal}`);
      process.exit(0);
    });
    
    // Force shutdown after timeout
    setTimeout(() => {
      logger.error('⏰ Graceful shutdown timeout. Forcing shutdown...');
      process.exit(1);
    }, 30000); // 30 seconds timeout
  } else {
    logShutdown(`Immediate shutdown on ${signal}`);
    process.exit(0);
  }
};

/**
 * Start the server with comprehensive error handling
 */
const startServer = (): void => {
  try {
    const PORT = config.PORT || 5001;
    
    // Start the server
    server = app.listen(PORT, () => {
      logger.info('🚀 Evalia Resume Service successfully started', {
        port: PORT,
        environment: config.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        processId: process.pid,
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      });

      // Log configuration summary
      logger.info('⚙️ Service configuration loaded', {
        logLevel: config.LOG_LEVEL,
        corsOrigins: config.CORS_ORIGINS.length,
        maxFileSize: `${Math.round(config.MAX_FILE_SIZE / 1024 / 1024)}MB`,
        hasOpenAIKey: !!config.OPENAI_API_KEY,
        hasOpenRouterKey: !!config.OPENROUTER_API_KEY,
        hasPineconeKey: !!config.PINECONE_API_KEY,
        hasCloudinaryConfig: !!(config.CLOUDINARY_URL || 
          (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET)),
      });
    });

    // Configure server timeouts
    server.timeout = config.REQUEST_TIMEOUT;
    server.keepAliveTimeout = config.KEEPALIVE_TIMEOUT;
    server.headersTimeout = config.KEEPALIVE_TIMEOUT + 1000; // Should be higher than keepAliveTimeout

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

      // Handle specific listen errors with friendly messages
      switch ((error as any).code) {
        case 'EACCES':
          logger.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
        case 'EADDRINUSE':
          logger.error(`❌ ${bind} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });

    // Handle client connection errors
    server.on('clientError', (err: any, socket: any) => {
      logger.error('Client connection error:', {
        error: err.message,
        code: err.code || 'UNKNOWN',
        remoteAddress: socket.remoteAddress || 'unknown',
      });
      
      // Close the socket safely
      if (!socket.destroyed) {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      }
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Set up process event handlers for graceful shutdown and error handling
 */
const setupProcessHandlers = (): void => {
  // Graceful shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const errorMessage = reason instanceof Error ? reason.message : String(reason);
    const errorStack = reason instanceof Error ? reason.stack : undefined;
    
    logUnhandledError(
      new Error(`Unhandled Promise Rejection: ${errorMessage}`),
      'unhandledRejection'
    );
    
    logger.error('🚨 Unhandled Promise Rejection detected', {
      reason: errorMessage,
      stack: errorStack,
      promise: promise.toString(),
      timestamp: new Date().toISOString(),
    });

    // In development, don't exit the process
    if (config.NODE_ENV === 'development') {
      logger.warn('⚠️ Development mode: continuing despite unhandled rejection');
      return;
    }

    // In production, gracefully shutdown
    gracefulShutdown('unhandledRejection');
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logUnhandledError(error, 'uncaughtException');
    
    logger.error('💥 Uncaught Exception detected - shutting down', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
    });

    // Always exit on uncaught exception
    gracefulShutdown('uncaughtException');
  });

  // Handle warning events
  process.on('warning', (warning) => {
    logger.warn('⚠️ Node.js warning detected', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
      timestamp: new Date().toISOString(),
    });
  });

  // Log process exit
  process.on('exit', (code) => {
    logger.info(`👋 Process exiting with code: ${code}`, {
      uptime: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  });
};

// Initialize process handlers
setupProcessHandlers();

// Start the server
startServer();

// Export the server (initialized after startServer is called)
export { server };
export default app;
