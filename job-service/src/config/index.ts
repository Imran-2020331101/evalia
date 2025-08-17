import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  NODE_ENV: string;
  PORT: number;
  CORS_ORIGINS: string[];
  MONGODB_URI: string;
  OPENAI_API_KEY?: string;
  PINECONE_API_KEY?: string;
  JWT_SECRET: string;
  CLOUDINARY_URL?: string;
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "7001", 10),

  // CORS configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:3001"],

  // Database
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/evalia_ai",

  // External APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,

  // Other configurations
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
};

export default config;
