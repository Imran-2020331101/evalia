import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 6001,
  MONGO_URI: process.env.MONGO_URI || "",
  BROKER_URL: process.env.BROKER_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "change-me",
  
  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  FROM_EMAIL: process.env.FROM_EMAIL || "noreply@evalia.com",
  FROM_NAME: process.env.FROM_NAME || "Evalia Team",
  
  // AI Server Integration
  AI_SERVER_URL: process.env.AI_SERVER_URL || "http://localhost:5000",
  UPSKILL_ENGINE_URL: process.env.UPSKILL_ENGINE_URL || "http://localhost:7000"
};
