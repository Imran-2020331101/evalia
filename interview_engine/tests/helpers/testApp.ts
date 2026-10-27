import 'express-async-errors';
import express, { Application, Router } from 'express';
import cors from 'cors';
import { vi } from 'vitest';
import { errorHandlerMiddleware } from '../../src/middlewares/ErrorHandler';
import { interviewRouter } from '../../src/routes/interview';

/**
 * Builds the same Express pipeline as src/server.ts (cors, json, routes,
 * /health, error handler) WITHOUT spawning python, socket.io or listening.
 * `extraRouter` lets tests mount routes that throw specific errors.
 */
export function createTestApp(extraRouter?: Router): Application {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/interview', interviewRouter);
  if (extraRouter) app.use('/test', extraRouter);
  app.get('/health', (_req, res) => res.send('ok'));
  app.use(errorHandlerMiddleware);
  return app;
}

/** Lets pending promise callbacks (asyncHandler chains) settle. */
export const flushPromises = () => new Promise<void>((r) => setImmediate(r));

/** Minimal chainable Express response double. */
export function mockRes() {
  const res: any = {};
  res.status = vi.fn();
  res.json = vi.fn();
  res.send = vi.fn();
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}
