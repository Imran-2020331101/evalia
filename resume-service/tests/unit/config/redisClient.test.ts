import { describe, it, expect, vi, beforeEach } from 'vitest';

const client = {
  on: vi.fn(),
  connect: vi.fn(async () => {}),
  set: vi.fn(async () => 'OK'),
  get: vi.fn(async () => 'hello from memurai'),
};
const createClient = vi.fn(() => client);
vi.mock('redis', () => ({ createClient }));

describe('config/redisClient', () => {
  beforeEach(() => { vi.resetModules(); Object.values(client).forEach((f) => f.mockClear()); createClient.mockClear(); });

  it('creates a client for the local redis url, connects and runs a smoke test', async () => {
    const mod = await import('../../../src/config/redisClient');
    await vi.waitFor(() => expect(client.get).toHaveBeenCalled());
    expect(createClient).toHaveBeenCalledWith({ url: 'redis://localhost:6379' });
    expect(client.connect).toHaveBeenCalled();
    expect(client.set).toHaveBeenCalledWith('test', 'hello from memurai');
    expect(client.get).toHaveBeenCalledWith('test');
    expect(mod.default).toBe(client);
  });

  it('registers an error handler that logs', async () => {
    await import('../../../src/config/redisClient');
    const [event, handler] = client.on.mock.calls[0] as any;
    expect(event).toBe('error');
    handler(new Error('conn'));
    expect(console.log).toHaveBeenCalledWith('Redis Client Error', expect.any(Error));
  });
});
