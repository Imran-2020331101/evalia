import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => ({ listen: vi.fn(), config: vi.fn() }));
vi.mock('dotenv', () => ({ default: { config: h.config } }));
vi.mock('../../src/app', () => ({ default: { listen: h.listen } }));

describe('index.ts (server bootstrap)', () => {
  const env = { ...process.env };
  beforeEach(() => vi.resetModules());
  afterEach(() => { process.env = { ...env }; });

  it('loads env and listens on PORT', async () => {
    process.env.PORT = '8123';
    await import('../../index');
    expect(h.config).toHaveBeenCalled();
    expect(h.listen).toHaveBeenCalledWith('8123', expect.any(Function));
    h.listen.mock.calls[0][1]();
    expect(console.log).toHaveBeenCalledWith('Job service running in ', { port: '8123' });
  });

  it('defaults to port 7000', async () => {
    delete process.env.PORT;
    await import('../../index');
    expect(h.listen).toHaveBeenCalledWith(7000, expect.any(Function));
  });
});
