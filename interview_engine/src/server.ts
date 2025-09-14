import dotenv from 'dotenv';
dotenv.config();
dotenv.config();
import 'express-async-errors';
import { Server as SocketServer, Socket } from 'socket.io';
import { spawn, ChildProcess } from 'child_process';
import { createServer, Server as HttpServer } from 'http';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { errorHandlerMiddleware } from './middlewares/ErrorHandler';
import { interviewRouter } from './routes/interview';
import { IVideoFrameData, IPythonMetricsResult } from './types/interview.types';
import { connectDatabase } from './config/database';
import { interviewService } from './services/InterviewService';
import { intergrityService } from './services/IntegrityService';
import { Interview } from './models/InterviewSchema';



const app: Application = express();
const server: HttpServer = createServer(app);
const io: SocketServer = new SocketServer(server, { 
  cors: { origin: '*' } 
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/interview', interviewRouter);
app.get('/health', (req: Request, res: Response) => res.send('ok'));

// Error handler
app.use(errorHandlerMiddleware);

// Spawn Python worker
const py: ChildProcess = spawn('venv/Scripts/python.exe', ['python/worker.py']);

py.stdout?.on('data', (data: Buffer) => {
  try {
    const result: IPythonMetricsResult = JSON.parse(data.toString());
    const { interviewId, metrics } = result;
    const integrityScore = intergrityService.updateIntegrity(interviewId, metrics);
    io.to(interviewId).emit('metrics', integrityScore);
  } catch (err) {
    console.error('Error parsing Python output:', err);
  }
});

py.stderr?.on('data', (data: Buffer) => {
  const msg: string = data.toString();
  if (msg.toLowerCase().includes('error')) {
    console.error(`Python error: ${msg}`);
  } else {
    console.log(`Python log: ${msg}`);

  }
});

// Socket.IO connection handling
io.on('connection', (socket: Socket) => {
  const { interviewId } = socket.handshake.query as { interviewId: string };
  
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
  });

  socket.on('video-frames', (data: IVideoFrameData) => {
    if (py.stdin) {
      py.stdin.write(JSON.stringify(data) + '\n');
    }
  });
  socket.on('disconnection',(interviewId: string) =>{
    console.log('disconnecting interview evaluation');
    const { finalScore, details } = intergrityService.finalizeIntegrity(interviewId);
    Interview.findByIdAndUpdate(interviewId,{
      $set: {integrityScore : finalScore}
    })
    //  interviewService.markInterviewAsCompleted(interviewId);
  })
});


const startApp = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Interview service is listening on port ${port}`);
    });
  } catch (error) {
    console.log('Failed to start server:', error);
    process.exit(1);
  }
};

startApp();
