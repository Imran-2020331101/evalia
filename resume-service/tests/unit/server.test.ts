import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';

const { listen } = vi.hoisted(() => ({ listen: vi.fn() }));
vi.mock('../../src/app', () => ({ default: { listen } }));

function makeServer() {
  const server: any = new EventEmitter();
  server.close = vi.fn((cb: () => void) => cb());
  return server;
}

describe('server bootstrap', () => {
  let server: any;
  let handlers: Record<string, () => void>;
  let exit: any;

  beforeEach(() => {
    vi.resetModules();
    listen.mockReset();
    server = makeServer();
    listen.mockImplementation((_port: number, cb: () => void) => { cb(); return server; });
    handlers = {};
    vi.spyOn(process, 'on').mockImplementation(((evt: string, h: any) => { handlers[evt] = h; return process; }) as any);
    exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
  });
  afterEach(() => vi.restoreAllMocks());

  it('listens on the configured port, sets timeouts and exports the app', async () => {
    const mod = await import('../../src/server');
    const config = (await import('../../src/config')).default;
    expect(listen).toHaveBeenCalledWith(config.PORT, expect.any(Function));
    expect(server.timeout).toBe(config.REQUEST_TIMEOUT);
    expect(server.keepAliveTimeout).toBe(config.KEEPALIVE_TIMEOUT);
    expect(mod.default).toEqual({ listen });
  });

  it('exits on EADDRINUSE', async () => {
    await import('../../src/server');
    exit.mockImplementation((() => { throw new Error('process.exit called'); }) as any);
    // process.exit is stubbed to throw so we can observe that the handler stops there.
    expect(() => server.emit('error', Object.assign(new Error('in use'), { code: 'EADDRINUSE' }))).toThrow('process.exit called');
    expect(exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('already in use'));
  });

  it('rethrows other server errors', async () => {
    await import('../../src/server');
    expect(() => server.emit('error', Object.assign(new Error('boom'), { code: 'EOTHER' }))).toThrow('boom');
  });

  it.each(['SIGTERM', 'SIGINT'])('shuts down gracefully on %s', async (sig) => {
    await import('../../src/server');
    handlers[sig]();
    expect(server.close).toHaveBeenCalled();
    expect(exit).toHaveBeenCalledWith(0);
  });
});
