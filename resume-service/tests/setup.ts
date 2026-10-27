import { vi, beforeEach } from 'vitest';
import os from 'os';
import path from 'path';

// Deterministic, offline environment. Set before any src module is imported.
process.env.NODE_ENV = 'test';
process.env.LOG_DIR = path.join(os.tmpdir(), 'resume-service-test-logs');
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.OPEN_ROUTER_API_KEY = 'test-openrouter-key';
process.env.QDRANT_API_KEY = 'test-qdrant-key';
process.env.QDRANT_HOST = 'http://localhost:6333';
process.env.QDRANT_COLLECTION_NAME = 'resume-test';
process.env.CLOUDINARY_FOLDER_NAME = 'test-folder';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';
process.env.JOB_SERVICE_URL = 'http://job-service.test';
process.env.YT_API_KEY = 'yt-test';

// Never write log files / spam the console during tests (logger.test.ts uses importActual).
vi.mock('../src/utils/logger', () => {
  const logger: Record<string, any> = {};
  for (const m of ['error', 'warn', 'info', 'debug', 'http', 'verbose', 'silly', 'log',
    'request', 'response', 'database', 'external', 'security', 'performance', 'logWithContext']) {
    logger[m] = vi.fn();
  }
  return {
    default: logger,
    createChildLogger: vi.fn(() => logger),
    logStartup: vi.fn(),
    logShutdown: vi.fn(),
    logUnhandledError: vi.fn(),
  };
});

// Silence noisy console output from source; re-applied each test because some suites call vi.restoreAllMocks().
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
