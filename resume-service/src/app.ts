import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import connectDB from './config/database';
import errorHandler from './middleware/errorHandler';
import routes from './routes';

const app: Application = express();

connectDB();

// CORS
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true,
}));


app.use(express.json({ limit: config.MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: true, limit: config.MAX_FILE_SIZE }));

// Routes
app.use('/api', routes);


app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Resume Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});


app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Evalia Resume Service',
    endpoints: {
      health: '/health',
      api: '/api',
      upload: '/api/resume/upload',
      extract: '/api/resume/extract-details',
    },
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `${req.method} ${req.originalUrl} does not exist`,
  });
});

app.use(errorHandler as any);

export default app;
