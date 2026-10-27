import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => ({
  connect: vi.fn(),
  info: vi.fn(), error: vi.fn(), warn: vi.fn(),
}));
vi.mock('mongoose', () => ({ default: { connect: h.connect } }));
vi.mock('../../../src/config/logger', () => ({
  logger: { info: h.info, error: h.error, warn: h.warn },
}));

import connectDB from '../../../src/config/database';

describe('connectDB', () => {
  const env = { ...process.env };
  beforeEach(() => {
    h.connect.mockReset();
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it('connects with MONGODB_URI and logs the host', async () => {
    process.env.MONGODB_URI = 'mongodb://db/x';
    h.connect.mockResolvedValue({ connection: { host: 'db-host' } });
    await connectDB();
    expect(h.connect).toHaveBeenCalledWith('mongodb://db/x');
    expect(h.info).toHaveBeenCalledWith('MongoDB Connected: db-host');
  });

  it('falls back to the local default URI', async () => {
    delete process.env.MONGODB_URI;
    h.connect.mockResolvedValue({ connection: { host: 'h' } });
    await connectDB();
    expect(h.connect).toHaveBeenCalledWith('mongodb://localhost:27017/evalia_ai');
  });

  it('logs and continues on failure outside production', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
    process.env.NODE_ENV = 'development';
    h.connect.mockRejectedValue(new Error('refused'));
    await expect(connectDB()).resolves.toBeUndefined();
    expect(h.error).toHaveBeenCalledWith('Database connection failed:', 'refused');
    expect(h.warn).toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('exits with code 1 on failure in production', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
    process.env.NODE_ENV = 'production';
    h.connect.mockRejectedValue(new Error('refused'));
    await connectDB();
    expect(exit).toHaveBeenCalledWith(1);
  });
});
