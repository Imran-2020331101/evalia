import amqp from "amqplib";
import { env } from "../config/env";
import { handleIncomingEvent } from "../in-app/handlers/inapp-notification.handler";
import logger  from "../utils/logger";
import { handleIncomingMailEvent } from "../mail/handlers/mail-notification.handler";

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

    channel.consume("email-notification",(msg) => {
      if(msg){
        const event = JSON.parse(msg.content);
        console.log(event);
        handleIncomingMailEvent(event);
        channel.ack(msg);
      }
    })

  } catch (err) {
    logger.error("Message broker connection failed", err);
  }
};
