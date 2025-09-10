import dotenv from 'dotenv';
import * as process from 'process';

// Load environment variables
dotenv.config();

// Configuration interface
interface Config {
  // Server Configuration
  PORT: number;
  NODE_ENV: string;
  
  // Database Configuration
  MONGODB_URI: string;
  REDIS_URL?: string;
  
  // File Upload Configuration
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  UPLOAD_DIR: string;
  TEMP_DIR: string;
  PROCESSED_DIR: string;
  
  // CORS Configuration
  CORS_ORIGINS: string[];
  
  // AI Service Configuration
  OPENAI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  PINECONE_API_KEY?: string;
  PINECONE_ENVIRONMENT?: string;
  PINECONE_INDEX?: string;
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  CLOUDINARY_URL?: string;
  
  // Logging Configuration
  LOG_LEVEL: string;
  LOG_DIR: string;
  
  // Security Configuration
  JWT_SECRET?: string;
  ENCRYPTION_KEY?: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Performance Configuration
  REQUEST_TIMEOUT: number;
  KEEPALIVE_TIMEOUT: number;
}

// Default configuration values
const DEFAULT_CONFIG: Partial<Config> = {
  PORT: 5001,
  NODE_ENV: 'development',
  MONGODB_URI: 'mongodb://localhost:27017/evalia_ai',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf'],
  UPLOAD_DIR: './uploads',
  TEMP_DIR: './uploads/temp',
  PROCESSED_DIR: './uploads/processed',
  CORS_ORIGINS: ['http://localhost:3000', 'http://localhost:3001'],
  LOG_LEVEL: 'info',
  LOG_DIR: './logs',
  PINECONE_INDEX: 'resume-bot',
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  KEEPALIVE_TIMEOUT: 65000, // 65 seconds
};

/**
 * Parse environment variable as number with default fallback
 */
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse environment variable as string array with default fallback
 */
const parseStringArray = (value: string | undefined, defaultValue: string[]): string[] => {
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Validate required environment variables
 */
const validateRequiredEnvVars = (): void => {
  const requiredVars = ['MONGODB_URI'];
  const missingVars: string[] = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

/**
 * Create and validate configuration object
 */
const createConfig = (): Config => {
  // Validate required environment variables
  if (process.env.NODE_ENV !== 'test') {
    validateRequiredEnvVars();
  }
  
  return {
    // Server Configuration
    PORT: parseNumber(process.env.PORT, DEFAULT_CONFIG.PORT!),
    NODE_ENV: process.env.NODE_ENV || DEFAULT_CONFIG.NODE_ENV!,
    
    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || DEFAULT_CONFIG.MONGODB_URI!,
    REDIS_URL: process.env.REDIS_URL,
    
    // File Upload Configuration
    MAX_FILE_SIZE: parseNumber(process.env.MAX_FILE_SIZE, DEFAULT_CONFIG.MAX_FILE_SIZE!),
    ALLOWED_FILE_TYPES: parseStringArray(process.env.ALLOWED_FILE_TYPES, DEFAULT_CONFIG.ALLOWED_FILE_TYPES!),
    UPLOAD_DIR: process.env.UPLOAD_DIR || DEFAULT_CONFIG.UPLOAD_DIR!,
    TEMP_DIR: process.env.TEMP_DIR || DEFAULT_CONFIG.TEMP_DIR!,
    PROCESSED_DIR: process.env.PROCESSED_DIR || DEFAULT_CONFIG.PROCESSED_DIR!,
    
    // CORS Configuration
    CORS_ORIGINS: parseStringArray(process.env.CORS_ORIGINS, DEFAULT_CONFIG.CORS_ORIGINS!),
    
    // AI Service Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
    PINECONE_INDEX: process.env.PINECONE_INDEX || DEFAULT_CONFIG.PINECONE_INDEX!,
    
    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    
    // Logging Configuration
    LOG_LEVEL: process.env.LOG_LEVEL || DEFAULT_CONFIG.LOG_LEVEL!,
    LOG_DIR: process.env.LOG_DIR || DEFAULT_CONFIG.LOG_DIR!,
    
    // Security Configuration
    JWT_SECRET: process.env.JWT_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, DEFAULT_CONFIG.RATE_LIMIT_WINDOW_MS!),
    RATE_LIMIT_MAX_REQUESTS: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, DEFAULT_CONFIG.RATE_LIMIT_MAX_REQUESTS!),
    
    // Performance Configuration
    REQUEST_TIMEOUT: parseNumber(process.env.REQUEST_TIMEOUT, DEFAULT_CONFIG.REQUEST_TIMEOUT!),
    KEEPALIVE_TIMEOUT: parseNumber(process.env.KEEPALIVE_TIMEOUT, DEFAULT_CONFIG.KEEPALIVE_TIMEOUT!),
  };
};

// Export the configuration
const config: Config = createConfig();

// Log configuration status (excluding sensitive data)
const logSafeConfig = () => {
  const safeConfig = {
    PORT: config.PORT,
    NODE_ENV: config.NODE_ENV,
    LOG_LEVEL: config.LOG_LEVEL,
    MAX_FILE_SIZE: config.MAX_FILE_SIZE,
    CORS_ORIGINS: config.CORS_ORIGINS,
    UPLOAD_DIR: config.UPLOAD_DIR,
    hasOpenAIKey: !!config.OPENAI_API_KEY,
    hasOpenRouterKey: !!config.OPENROUTER_API_KEY,
    hasPineconeKey: !!config.PINECONE_API_KEY,
    hasCloudinaryConfig: !!(config.CLOUDINARY_URL || (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET)),
    hasRedisURL: !!config.REDIS_URL,
  };
  
  return safeConfig;
};

export default config;
export { Config, logSafeConfig, validateRequiredEnvVars };
