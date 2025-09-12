import dotenv from 'dotenv';

dotenv.config();

const config = {

  PORT: parseInt(process.env.PORT || '5000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/evalia_ai',
  
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3001'],
  
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  CLOUDINARY_FOLDER_NAME: process.env.CLOUDINARY_FOLDER_NAME || 'evalia-resumes',

  // Logging configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_DIR: process.env.LOG_DIR || './logs',

  REQUEST_TIMEOUT: 120000, 
  KEEPALIVE_TIMEOUT: 130000, // 2.17 minutes
};

export default config;
