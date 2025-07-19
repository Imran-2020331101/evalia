const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/evalia_ai"
    );

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("Database connection failed:", error.message);
    logger.warn("Running without database connection in development mode");
    // Don't exit in development - allow server to run without DB
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
