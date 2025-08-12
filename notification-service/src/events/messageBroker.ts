import amqp from "amqplib";
import { env } from "../config/env";
import { handleIncomingEvent } from "./notificationHandler";
import logger  from "../utils/logger";

export const connectBroker = async () => {
  try {
    const conn = await amqp.connect(env.BROKER_URL);
    const channel = await conn.createChannel();

    await channel.assertQueue("notifications");
    logger.info("Connected to message broker and listening...");

    channel.consume("notifications", (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        handleIncomingEvent(event);
        channel.ack(msg);
      }
    });
  } catch (err) {
    logger.error("Message broker connection failed", err);
  }
};
