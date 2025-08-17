import swaggerUi, { JsonObject } from 'swagger-ui-express';
import amqplib, { Channel, Connection } from 'amqplib'

export async function sendNotification(message : JsonObject, channelName : string,) {
  
  let channel: Channel, connection: Connection;

  try {

    const amqpServer = 'amqp://localhost:5672'
    connection = await amqplib.connect(amqpServer)
    channel = await connection.createChannel()

    const exchange = "notify"
    const routingKey = "send-notification"


    await channel.assertExchange(exchange, "direct", {durable: false});

    await channel.assertQueue( channelName ,{durable: true});

    await channel.bindQueue( channelName ,exchange, routingKey);
    
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)))



    setTimeout(()=>{
      connection.close();
    },500);
    
  } catch (error) {
    console.log(error)
  }
}