import { describe, it, expect } from 'vitest';
import winston from 'winston';
import defaultLogger, { logger } from '../../../src/config/logger';

describe('logger', () => {
  it('exports a winston logger as both named and default export', () => {
    expect(defaultLogger).toBe(logger);
    expect(logger.level).toBe('info');
  });

  it('logs to a single Console transport', () => {
    expect(logger.transports).toHaveLength(1);
    expect(logger.transports[0]).toBeInstanceOf(winston.transports.Console);
  });

  it('exposes standard level methods', () => {
    for (const m of ['info', 'warn', 'error'] as const) expect(logger[m]).toBeTypeOf('function');
    expect(() => logger.info('hello', { a: 1 })).not.toThrow();
    expect(() => logger.error(new Error('x'))).not.toThrow();
  });
});
