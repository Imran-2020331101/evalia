import amqp from "amqplib";
import { env } from "../config/env";
import { handleIncomingEvent } from "./notificationHandler";
import logger  from "../utils/logger";

export const connectBroker = async () => {
  try {
    const conn = await amqp.connect('amqp://localhost:5672');
    const channel = await conn.createChannel();

    await channel.assertQueue("notifications",{ durable: true });
    logger.info("Connected to message broker and listening...");

    channel.consume("notifications", (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content)
        console.log(event);
        handleIncomingEvent(event);
        channel.ack(msg);
      }
    });

    channel.consume("send-mail",(msg) => {
      if(msg){
        const event = JSON.parse(msg.content);
        console.log(event);

        channel.ack(msg);
      }
    })

  } catch (err) {
    logger.error("Message broker connection failed", err);
  }
};
