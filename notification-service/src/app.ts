import express from "express";
import mongoose from "mongoose";
import { env } from "./config/env";
import notificationRoutes from "./routes/notificationRoutes";
import { connectBroker } from "./events/messageBroker";
import logger from "./utils/logger";

const app = express();
app.use(express.json());

app.use("/notifications", notificationRoutes);

mongoose.connect(env.MONGO_URI).then(() => logger.info("MongoDB connected"));

connectBroker();

export default app;
