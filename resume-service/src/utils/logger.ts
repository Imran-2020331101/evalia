import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from '../config';

// Log level type definition
type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

// Extended log metadata interface
interface LogMetadata {
  service?: string;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  module?: string;
  function?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  error?: Error | string;
  stack?: string;
  [key: string]: any;
}

// Custom logger interface extending Winston Logger
interface CustomLogger extends winston.Logger {
  logWithContext(level: LogLevel, message: string, metadata?: LogMetadata): void;
  request(message: string, metadata?: LogMetadata): void;
  response(message: string, metadata?: LogMetadata): void;
  database(message: string, metadata?: LogMetadata): void;
  external(message: string, metadata?: LogMetadata): void;
  security(message: string, metadata?: LogMetadata): void;
  performance(message: string, metadata?: LogMetadata): void;
}

/**
 * Ensure log directory exists
 */
const ensureLogDirectory = (): void => {
  const logDir = path.resolve(config.LOG_DIR);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

/**
 * Custom log format for structured logging
 */
const customFormat = winston.format.printf(({ timestamp, level, message, service, ...metadata }) => {
  const logEntry = {
    timestamp,
    level,
    service,
    message,
    ...metadata,
  };

  return JSON.stringify(logEntry, null, config.NODE_ENV === 'development' ? 2 : 0);
});

/**
 * Create development console format with colors and simple output
 */
const devConsoleFormat = winston.format.combine(
  winston.format.colorize({
    all: true,
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      verbose: 'cyan',
      debug: 'blue',
      silly: 'grey'
    }
  }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId, userId, ...rest }) => {
    let logMessage = `[${timestamp}] ${level}: ${message}`;
    
    if (requestId) logMessage += ` [ReqID: ${requestId}]`;
    if (userId) logMessage += ` [UserID: ${userId}]`;
    
    // Add additional metadata if present
    const metaKeys = Object.keys(rest).filter(key => !['service', 'timestamp', 'level', 'message'].includes(key));
    if (metaKeys.length > 0) {
      const metaString = metaKeys.map(key => `${key}: ${JSON.stringify(rest[key])}`).join(', ');
      logMessage += ` {${metaString}}`;
    }
    
    return logMessage;
  })
);

/**
 * Production JSON format for structured logging
 */
const prodFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  customFormat
);

/**
 * Create file transport with rotation
 */
const createFileTransport = (filename: string, level?: LogLevel) => {
  return new winston.transports.File({
    filename: path.join(config.LOG_DIR, filename),
    level,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    format: prodFormat,
    handleExceptions: level === 'error',
    handleRejections: level === 'error',
  });
};

// Ensure log directory exists
ensureLogDirectory();

/**
 * Create enhanced Winston logger with custom methods
 */
const createLogger = (): CustomLogger => {
  const baseLogger = winston.createLogger({
    level: config.LOG_LEVEL || 'info',
    format: prodFormat,
    defaultMeta: { 
      service: 'evalia-resume-service',
      version: '2.0.0',
      environment: config.NODE_ENV 
    },
    transports: [
      // Error logs - separate file for errors only
      createFileTransport('error.log', 'error'),
      
      // Combined logs - all log levels
      createFileTransport('combined.log'),
      
      // Application logs - info and above
      createFileTransport('app.log', 'info'),
      
      // HTTP request logs
      createFileTransport('requests.log', 'http'),
    ],
    // Handle uncaught exceptions and unhandled rejections
    exceptionHandlers: [
      createFileTransport('exceptions.log')
    ],
    rejectionHandlers: [
      createFileTransport('rejections.log')
    ],
    exitOnError: false,
  });

  // Add console transport in development
  if (config.NODE_ENV !== 'production') {
    baseLogger.add(
      new winston.transports.Console({
        format: devConsoleFormat,
        level: 'debug',
      })
    );
  }

  // Extend the logger with custom methods
  const customLogger = baseLogger as CustomLogger;

  // Add context-aware logging method
  customLogger.logWithContext = function(level: LogLevel, message: string, metadata?: LogMetadata) {
    this.log(level, message, {
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  };

  // Add domain-specific logging methods
  customLogger.request = function(message: string, metadata?: LogMetadata) {
    this.logWithContext('http', `🌐 ${message}`, { category: 'request', ...metadata });
  };

  customLogger.response = function(message: string, metadata?: LogMetadata) {
    this.logWithContext('http', `📤 ${message}`, { category: 'response', ...metadata });
  };

  customLogger.database = function(message: string, metadata?: LogMetadata) {
    this.logWithContext('info', `🗄️ ${message}`, { category: 'database', ...metadata });
  };

  customLogger.external = function(message: string, metadata?: LogMetadata) {
    this.logWithContext('info', `🔗 ${message}`, { category: 'external', ...metadata });
  };

  customLogger.security = function(message: string, metadata?: LogMetadata) {
    this.logWithContext('warn', `🔒 ${message}`, { category: 'security', ...metadata });
  };

  customLogger.performance = function(message: string, metadata?: LogMetadata) {
    this.logWithContext('info', `⚡ ${message}`, { category: 'performance', ...metadata });
  };

  return customLogger;
};

// Create and configure the logger instance
const logger: CustomLogger = createLogger();

/**
 * Create a child logger with additional default metadata
 */
export const createChildLogger = (defaultMeta: LogMetadata): CustomLogger => {
  const childLogger = logger.child(defaultMeta) as CustomLogger;
  
  // Copy custom methods to child logger
  childLogger.logWithContext = logger.logWithContext.bind(childLogger);
  childLogger.request = logger.request.bind(childLogger);
  childLogger.response = logger.response.bind(childLogger);
  childLogger.database = logger.database.bind(childLogger);
  childLogger.external = logger.external.bind(childLogger);
  childLogger.security = logger.security.bind(childLogger);
  childLogger.performance = logger.performance.bind(childLogger);
  
  return childLogger;
};

/**
 * Log application startup information
 */
export const logStartup = (): void => {
  logger.info('🚀 Evalia Resume Service starting up', {
    version: '2.0.0',
    environment: config.NODE_ENV,
    port: config.PORT,
    logLevel: config.LOG_LEVEL,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log application shutdown
 */
export const logShutdown = (reason: string): void => {
  logger.info('🛑 Evalia Resume Service shutting down', {
    reason,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log unhandled errors with context
 */
export const logUnhandledError = (error: Error, context?: string): void => {
  logger.error('💥 Unhandled error occurred', {
    error: error.message,
    stack: error.stack,
    name: error.name,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Export the main logger and types
export default logger;
export { LogLevel, LogMetadata, CustomLogger };