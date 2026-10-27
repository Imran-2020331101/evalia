import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('openai', async () => (await import('../mocks/externals')).openaiModule);
vi.mock('@qdrant/js-client-rest', async () => (await import('../mocks/externals')).qdrantModule);
vi.mock('cloudinary', async () => (await import('../mocks/externals')).cloudinaryModule);

describe('app boot with a real config/database module and a stubbed mongoose driver', () => {
  beforeEach(() => { vi.resetModules(); mongoose.deleteModel(/.*/); vi.useFakeTimers({ toFake: ['setTimeout'] }); });
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('connects on startup using the configured URI and driver options', async () => {
    const connect = vi.spyOn(mongoose, 'connect').mockResolvedValue({ connection: mongoose.connection, models: {} } as any);
    await import('../../src/app');
    await vi.waitFor(() => expect(connect).toHaveBeenCalledTimes(1));
    expect(connect.mock.calls[0][0]).toMatch(/^mongodb/);
    expect(connect.mock.calls[0][1]).toMatchObject({ maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
  });

  it('keeps serving requests when MongoDB is unavailable (dev graceful degradation)', async () => {
    const connect = vi.spyOn(mongoose, 'connect').mockRejectedValue(new Error('ECONNREFUSED'));
    const app = (await import('../../src/app')).default;
    await vi.waitFor(() => expect(connect).toHaveBeenCalled());
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    const db = await import('../../src/config/database');
    expect(db.getConnectionStatus().isConnected).toBe(false);
    expect(db.getConnectionStatus().retryCount).toBe(1);
  });

  it('schedules a retry with backoff after a failed connection', async () => {
    const connect = vi.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('down')).mockResolvedValue({ connection: mongoose.connection, models: {} } as any);
    await import('../../src/app');
    await vi.waitFor(() => expect(connect).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(2100);
    await vi.waitFor(() => expect(connect).toHaveBeenCalledTimes(2));
  });
});

describe('model layer (schema validation without a database)', () => {
  beforeEach(() => { vi.resetModules(); mongoose.deleteModel(/.*/); });
  it('Resume + SavedCourse + ExtractedResume schemas are registered on the mongoose instance', async () => {
    await import('../../src/models/Resume');
    await import('../../src/models/SavedCourseSchema');
    await import('../../src/models/ExtractedText');
    expect(mongoose.modelNames()).toEqual(expect.arrayContaining(['Resume', 'SavedCourse', 'ExtractedResume']));
  });
});
