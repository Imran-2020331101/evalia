import { beforeEach, vi } from "vitest";
import logger from "../src/utils/logger";

// Must be set before any src module reads process.env at import time.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/test";
process.env.EMAIL_USERNAME = "sender@test.local";
process.env.EMAIL_PASSWORD = "pw";
process.env.FRONTEND_URL = "http://localhost:3000";

logger.silent = true;

// Keep test output readable; individual tests may assert on these spies.
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
