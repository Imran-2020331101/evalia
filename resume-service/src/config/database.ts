import mongoose, { Connection } from 'mongoose';
import config from './index';
import logger from '../utils/logger';

// Database connection interface
interface DatabaseConnection {
  connection: Connection;
  isConnected: boolean;
  retryCount: number;
  maxRetries: number;
}

// Connection state
let dbConnection: DatabaseConnection = {
  connection: {} as Connection,
  isConnected: false,
  retryCount: 0,
  maxRetries: 5,
};

/**
 * Database connection options with enhanced configuration
 */
const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  retryReads: true,
};

/**
 * Connect to MongoDB with retry logic and comprehensive error handling
 */
const connectDB = async (): Promise<Connection | null> => {
  try {
    // If already connected, return existing connection
    if (dbConnection.isConnected && mongoose.connection.readyState === 1) {
      logger.database('Using existing database connection', {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState,
      });
      return mongoose.connection;
    }

    logger.database('Attempting to connect to MongoDB...', {
      uri: config.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//[username]:[password]@'), // Hide credentials
      environment: config.NODE_ENV,
      attempt: dbConnection.retryCount + 1,
      maxRetries: dbConnection.maxRetries,
    });

    // Connect to MongoDB
    const connection = await mongoose.connect(config.MONGODB_URI, connectionOptions);
    
    // Update connection state
    dbConnection.connection = connection.connection;
    dbConnection.isConnected = true;
    dbConnection.retryCount = 0;

    logger.database('✅ MongoDB connected successfully', {
      host: connection.connection.host,
      port: connection.connection.port,
      name: connection.connection.name,
      readyState: connection.connection.readyState,
      models: Object.keys(connection.models),
    });

    // Set up connection event handlers
    setupConnectionHandlers();

    return connection.connection;

  } catch (error) {
    dbConnection.isConnected = false;
    dbConnection.retryCount++;

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('❌ Database connection failed', {
      error: errorMessage,
      attempt: dbConnection.retryCount,
      maxRetries: dbConnection.maxRetries,
      environment: config.NODE_ENV,
    });

    // Retry logic for production, graceful degradation for development
    if (dbConnection.retryCount < dbConnection.maxRetries) {
      const retryDelay = Math.min(1000 * Math.pow(2, dbConnection.retryCount), 30000); // Exponential backoff, max 30s
      
      logger.database(`Retrying database connection in ${retryDelay}ms...`, {
        nextAttempt: dbConnection.retryCount + 1,
        delay: retryDelay,
      });

      setTimeout(() => connectDB(), retryDelay);
      return null;
    }

    // Handle final failure
    if (config.NODE_ENV === 'production') {
      logger.error('💥 Database connection failed permanently in production', {
        finalAttempt: dbConnection.retryCount,
        maxRetries: dbConnection.maxRetries,
      });
      process.exit(1);
    } else {
      logger.database('⚠️ Running without database connection in development mode', {
        warning: 'Some features may not work without database',
      });
      return null;
    }
  }
};

/**
 * Set up MongoDB connection event handlers
 */
const setupConnectionHandlers = (): void => {
  const connection = mongoose.connection;

  // Connection established
  connection.on('connected', () => {
    dbConnection.isConnected = true;
    logger.database('🔗 Mongoose connected to MongoDB', {
      host: connection.host,
      name: connection.name,
    });
  });

  // Connection error
  connection.on('error', (error) => {
    dbConnection.isConnected = false;
    logger.error('🚨 Mongoose connection error', {
      error: error.message,
      host: connection.host,
    });
  });

  // Connection disconnected
  connection.on('disconnected', () => {
    dbConnection.isConnected = false;
    logger.database('🔌 Mongoose disconnected from MongoDB', {
      host: connection.host || 'unknown',
    });
  });

  // Connection reconnected
  connection.on('reconnected', () => {
    dbConnection.isConnected = true;
    dbConnection.retryCount = 0;
    logger.database('🔄 Mongoose reconnected to MongoDB', {
      host: connection.host,
      name: connection.name,
    });
  });

  // Connection ready
  connection.on('open', () => {
    logger.database('📂 Mongoose connection opened', {
      readyState: connection.readyState,
      host: connection.host,
    });
  });

  // Connection timeout
  connection.on('timeout', () => {
    logger.database('⏰ Mongoose connection timeout', {
      host: connection.host,
    });
  });

  // Connection close
  connection.on('close', () => {
    dbConnection.isConnected = false;
    logger.database('🚪 Mongoose connection closed', {
      host: connection.host || 'unknown',
    });
  });
};

/**
 * Gracefully close database connection
 */
const closeDB = async (): Promise<void> => {
  try {
    if (dbConnection.isConnected) {
      await mongoose.connection.close();
      dbConnection.isConnected = false;
      logger.database('✅ Database connection closed gracefully');
    }
  } catch (error) {
    logger.error('❌ Error closing database connection', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get current database connection status
 */
const getConnectionStatus = (): {
  isConnected: boolean;
  readyState: number;
  host?: string;
  name?: string;
  retryCount: number;
} => {
  return {
    isConnected: dbConnection.isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    retryCount: dbConnection.retryCount,
  };
};

/**
 * Health check for database connection
 */
const healthCheck = async (): Promise<{
  status: 'healthy' | 'unhealthy' | 'connecting';
  details: any;
}> => {
  try {
    const adminDb = mongoose.connection.db?.admin();
    if (adminDb) {
      const result = await adminDb.ping();
      return {
        status: 'healthy',
        details: {
          ping: result,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
        },
      };
    } else {
      return {
        status: 'unhealthy',
        details: {
          reason: 'Database admin interface not available',
          readyState: mongoose.connection.readyState,
        },
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : String(error),
        readyState: mongoose.connection.readyState,
      },
    };
  }
};

export default connectDB;
export { 
  closeDB, 
  getConnectionStatus, 
  healthCheck,
  DatabaseConnection 
};
