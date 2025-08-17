import express, { Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import connectDB from './config/database';
import routes from './routes';
import swaggerUi, { JsonObject } from 'swagger-ui-express';
import openApiSpec from './docs/openapi';
import { sendNotification } from './utils/notify';

const app = express();


connectDB(); 

app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/test-notification",(req: Request,res: Response)=>{
  // Dummy values for testing
  const companyInfo = { id: "imranbinazad777@outlook.com" };
  const title = "Senior Software Engineer";
  const savedJob = { _id: "test-job-456" };
  
  const notification = {
    userId: companyInfo.id,
    type: "job.posting.created",
    jobTitle: title,
    jobId: savedJob._id || "unknown"
  }
  sendNotification(notification,"notifications");
  res.send('Test notification sent successfully')
})
app.use('/api', routes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec as any));
app.get('/api/docs.json', (req: Request, res: Response) => {
  res.json(openApiSpec);
});




app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to Evalia upskill engine',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});


export default app;
