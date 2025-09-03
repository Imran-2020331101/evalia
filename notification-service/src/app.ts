import express from "express";
import mongoose from "mongoose";
import { env } from "./config/env";
import notificationRoutes from "./routes/notificationRoutes";
import testRoutes from "./routes/testRoutes";
import { connectBroker } from "./events/messageBroker";
import { errorHandler, notFoundHandler } from "./middleware";
import logger from "./utils/logger";

const app = express();
app.use(express.json());

// Routes
app.use("/notifications", notificationRoutes);
app.use("/api", testRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

mongoose.connect(env.MONGO_URI).then(() => logger.info("MongoDB connected"));

connectBroker();

export default app;
