import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const m = vi.hoisted(() => ({ connect: vi.fn(), on: vi.fn() }));
vi.mock('mongoose', () => ({ default: { connect: m.connect, connection: { on: m.on } } }));

import { connectDatabase } from '../../../src/config/database';

describe('connectDatabase', () => {
  let exit: any;
  beforeEach(() => {
    exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
  });
  afterEach(() => { exit.mockRestore(); });

  it('connects with MONGODB_URI and registers connection listeners', async () => {
    m.connect.mockResolvedValue(undefined);
    await connectDatabase();
    expect(m.connect).toHaveBeenCalledWith('mongodb://test-host:27017/test-db');
    expect(console.log).toHaveBeenCalledWith('MongoDB connected successfully');
    expect(m.on.mock.calls.map((c) => c[0])).toEqual(['error', 'disconnected']);
    expect(exit).not.toHaveBeenCalled();
  });

  it('listeners log errors and disconnects', async () => {
    m.connect.mockResolvedValue(undefined);
    await connectDatabase();
    const err = new Error('lost');
    m.on.mock.calls.find((c) => c[0] === 'error')![1](err);
    expect(console.error).toHaveBeenCalledWith('MongoDB connection error:', err);
    m.on.mock.calls.find((c) => c[0] === 'disconnected')![1]();
    expect(console.log).toHaveBeenCalledWith('MongoDB disconnected');
  });

  it('falls back to the local default URI when MONGODB_URI is unset', async () => {
    const saved = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;
    m.connect.mockResolvedValue(undefined);
    try {
      await connectDatabase();
      expect(m.connect).toHaveBeenCalledWith('mongodb://localhost:27017/interview-engine');
    } finally {
      process.env.MONGODB_URI = saved;
    }
  });

  it('logs and exits(1) when connection fails', async () => {
    const err = new Error('ECONNREFUSED');
    m.connect.mockRejectedValue(err);
    await connectDatabase();
    expect(console.error).toHaveBeenCalledWith('Failed to connect to MongoDB:', err);
    expect(exit).toHaveBeenCalledWith(1);
    expect(m.on).not.toHaveBeenCalled();
  });
});
