import { describe, it, expect, vi, beforeEach } from 'vitest';

// Tiny in-memory stand-in for a Redis server speaking the node-redis v5 client API.
const { store, fake } = vi.hoisted(() => {
  const store = new Map<string, string>();
  const handlers: Record<string, (...a: any[]) => void> = {};
  const fake = {
    isOpen: false,
    on: (e: string, h: any) => { handlers[e] = h; return fake; },
    connect: async () => { fake.isOpen = true; },
    set: async (k: string, v: string) => { store.set(k, v); return 'OK'; },
    get: async (k: string) => store.get(k) ?? null,
    emit: (e: string, ...a: any[]) => handlers[e]?.(...a),
  };
  return { store, fake };
});
vi.mock('redis', () => ({ createClient: vi.fn(() => fake) }));

describe('redis client integration', () => {
  beforeEach(() => { store.clear(); fake.isOpen = false; vi.resetModules(); });

  it('connects on import and seeds the smoke-test key', async () => {
    const { default: client } = await import('../../src/config/redisClient');
    await vi.waitFor(() => expect(store.get('test')).toBe('hello from memurai'));
    expect(client).toBe(fake);
    expect(fake.isOpen).toBe(true);
  });

  it('the exported client can be used for further reads/writes', async () => {
    const { default: client } = await import('../../src/config/redisClient');
    await vi.waitFor(() => expect(fake.isOpen).toBe(true));
    await client.set('k', 'v');
    await expect(client.get('k')).resolves.toBe('v');
    await expect(client.get('missing')).resolves.toBeNull();
  });

  it('error events are logged and do not throw', async () => {
    await import('../../src/config/redisClient');
    await vi.waitFor(() => expect(fake.isOpen).toBe(true));
    expect(() => fake.emit('error', new Error('ECONNRESET'))).not.toThrow();
    expect(console.log).toHaveBeenCalledWith('Redis Client Error', expect.objectContaining({ message: 'ECONNRESET' }));
  });
});
