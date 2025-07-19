require("dotenv").config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/evalia_ai",

  // File Upload Configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ["application/pdf"],
  UPLOAD_DIR: "./uploads",

  // CORS Configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:3001"],

  // AI Service Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_DIR: "./logs",
};
