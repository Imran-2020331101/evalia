import supertest from 'supertest';
import app from '../../src/app';

/**
 * Express app from src/app.ts (never listens). Callers must vi.mock the
 * database config, models and external services BEFORE this module loads.
 */
export const testApp = app;
export const api = () => supertest(app);
