import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config';
import connectDB from './config/database';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import openApiSpec from './docs/openapi';
import { sendNotification } from './utils/notify';


const app = express();

// Connect to database
connectDB();

// Middleware: CORS
app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Middleware: Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Test notification endpoint
 * Only for development/testing purposes
 */
app.get('/test-notification', (req: Request, res: Response) => {
  // Dummy values for testing
  const companyInfo = { id: 'imranbinazad777@outlook.com' };
  const title = 'Senior Software Engineer';
  const savedJob = { _id: 'test-job-456' };

  const notification = {
    userId: companyInfo.id,
    type: 'job.posting.created',
    jobTitle: title,
    jobId: savedJob._id || 'unknown',
  };
  sendNotification(notification, 'notifications');
  res.send('Test notification sent successfully');
});

// Main API routes
app.use('/api', routes);

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api/docs.json', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

// Health check & root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Evalia upskill engine',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

export default app;
