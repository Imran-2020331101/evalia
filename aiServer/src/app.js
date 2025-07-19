const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");

// Import configuration and utilities
const config = require("./config");
const logger = require("./utils/logger");
const connectDB = require("./config/database");

// Import middleware
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const routes = require("./routes");

// Create Express app
const app = express();

// Connect to database
connectDB();

// CORS middleware
app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Request logging middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// File upload middleware
app.use(
  fileUpload({
    limits: {
      fileSize: config.MAX_FILE_SIZE,
    },
    abortOnLimit: true,
    responseOnLimit: "File size limit exceeded",
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "../uploads/temp"),
    preserveExtension: true,
    safeFileNames: true,
    debug: config.NODE_ENV === "development",
  })
);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Evalia AI Server",
    version: "1.0.0",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

module.exports = app;
