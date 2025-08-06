import express, { Request, Response } from 'express';
import cors from 'cors';

// Import configuration and utilities
import config from './config';
import connectDB from './config/database';

// Import middleware
import errorHandler from './middleware/errorHandler';

// Import routes
import routes from './routes';

// Create Express app
const app = express();

// // Connect to database
connectDB();

// CORS middleware
app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to Evalia upskill engine",
    version: "1.0.0",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

export default app;
