import mongoose from 'mongoose';
import { logger } from './logger';

const connectDB = async (): Promise<void> => {
  try {
    console.log(process.env.MONGODB_URI)
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/evalia_ai"
    );

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error("Database connection failed:", error.message);
    logger.warn("Running without database connection in development mode");
    // Don't exit in development - allow server to run without DB
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export default connectDB;
