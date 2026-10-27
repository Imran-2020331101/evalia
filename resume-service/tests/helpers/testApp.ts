import type { Application } from 'express';
import { vi } from 'vitest';

vi.mock('../../src/config/database', () => ({
  default: vi.fn(async () => null),
  closeDB: vi.fn(),
  getConnectionStatus: vi.fn(),
  healthCheck: vi.fn(),
}));

/**
 * Returns the Express app from src/app.ts without listening on a port.
 * connectDB is mocked so nothing touches MongoDB.
 */
export async function getApp(): Promise<Application> {
  return (await import('../../src/app')).default;
}
