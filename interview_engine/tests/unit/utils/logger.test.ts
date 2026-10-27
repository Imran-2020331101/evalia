import { describe, it, expect, vi } from 'vitest';
import logger, { logger as namedLogger } from '../../../src/utils/logger';

describe('logger', () => {
  it('default and named exports are the same winston logger', () => {
    expect(logger).toBe(namedLogger);
  });

  it('is configured at info level with a single console transport', () => {
    expect(logger.level).toBe('info');
    expect(logger.transports).toHaveLength(1);
  });

  it('emits JSON with timestamp, level and message', async () => {
    const transport: any = logger.transports[0];
    const seen: any[] = [];
    const spy = vi.spyOn(transport, 'log').mockImplementation((info: any, cb: any) => {
      seen.push(info);
      cb && cb();
    });
    logger.info('hello', { foo: 'bar' });
    await new Promise((r) => setTimeout(r, 20));
    expect(spy).toHaveBeenCalled();
    const info = seen[0];
    expect(info.level).toBe('info');
    expect(info.message).toBe('hello');
    expect(info.foo).toBe('bar');
    expect(info.timestamp).toBeDefined();
    spy.mockRestore();
  });

  it('does not emit debug messages', async () => {
    const transport: any = logger.transports[0];
    const spy = vi.spyOn(transport, 'log').mockImplementation((_i: any, cb: any) => cb && cb());
    logger.debug('hidden');
    await new Promise((r) => setTimeout(r, 20));
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
