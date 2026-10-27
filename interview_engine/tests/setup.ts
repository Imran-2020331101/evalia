import { beforeEach, vi } from 'vitest';

// Deterministic, offline environment for every test.
process.env.NODE_ENV = 'test';
process.env.API_NINJAS_KEY = 'test-ninja-key';
process.env.OPEN_ROUTER_API_KEY = 'test-openrouter-key';
process.env.AMQP_SERVER = 'amqp://test-host';
process.env.JOB_SERVICE_URL = 'http://job-service.test';
process.env.MONGODB_URI = 'mongodb://test-host:27017/test-db';

// The source code logs heavily; keep test output readable.
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
