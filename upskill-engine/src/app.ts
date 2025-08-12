import express, { Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import connectDB from './config/database';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import openApiSpec from './docs/openapi';
import amqplib, { Channel, Connection } from 'amqplib'

const app = express();


connectDB(); 

let channel: Channel, connection: Connection;



// connect to rabbitmq
async function sendNotification() {
  try {

    const amqpServer = 'amqp://localhost:5672'
    connection = await amqplib.connect(amqpServer)
    channel = await connection.createChannel()

    const exchange = "job"
    const routingKey = "job_match"

    const message = "This time it is different yay"
    await channel.assertExchange(exchange, "direct", {durable: false});
    // make sure that the order channel is created, if not this statement will create it
    await channel.assertQueue('job_queue',{durable: false});

    await channel.bindQueue("job_queue",exchange, routingKey);
    
    channel.publish(exchange, routingKey, Buffer.from(message))
    console.log("This time it is different yay");
    setTimeout(()=>{
      connection.close();
    },500);
  } catch (error) {
    console.log(error)
  }
}

app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec as any));
app.get('/api/docs.json', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

app.get("/test-notification",(req: Request,res: Response)=>{
  
  sendNotification();

  res.send('Order submitted')
})



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
