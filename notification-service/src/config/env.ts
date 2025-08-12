import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5001,
  MONGO_URI: process.env.MONGO_URI || "",
  BROKER_URL: process.env.BROKER_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "change-me"
};
