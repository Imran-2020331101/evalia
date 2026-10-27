import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

// The global setup mocks the logger; here we want the real module.
vi.unmock('../../../src/utils/logger');

async function loadLogger(env: Record<string, string> = {}) {
  vi.resetModules();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-test-'));
  process.env.LOG_DIR = path.join(dir, 'nested', 'logs');
  Object.assign(process.env, env);
  const mod = await vi.importActual<typeof import('../../../src/utils/logger')>('../../../src/utils/logger');
  return { mod, dir };
}

describe('logger (real implementation)', () => {
  const origEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...origEnv };
  });

  it('creates the log directory and exposes custom methods', async () => {
    const { mod } = await loadLogger();
    expect(fs.existsSync(process.env.LOG_DIR!)).toBe(true);
    const l = mod.default;
    for (const m of ['logWithContext', 'request', 'response', 'database', 'external', 'security', 'performance']) {
      expect(typeof (l as any)[m]).toBe('function');
    }
    // silence transports output
    l.transports.forEach((t) => (t.silent = true));
  });

  it('domain methods delegate to logWithContext with prefix + category', async () => {
    const { mod } = await loadLogger();
    const l = mod.default;
    l.transports.forEach((t) => (t.silent = true));
    const spy = vi.spyOn(l, 'log');
    const cases: [string, string, string, string][] = [
      ['request', 'http', '🌐', 'request'],
      ['response', 'http', '📤', 'response'],
      ['database', 'info', '🗄️', 'database'],
      ['external', 'info', '🔗', 'external'],
      ['security', 'warn', '🔒', 'security'],
      ['performance', 'info', '⚡', 'performance'],
    ];
    for (const [method, level, emoji, category] of cases) {
      spy.mockClear();
      (l as any)[method]('msg', { extra: 1 });
      expect(spy).toHaveBeenCalledWith(level, `${emoji} msg`, expect.objectContaining({ category, extra: 1, timestamp: expect.any(String) }));
    }
    spy.mockClear();
    l.logWithContext('error', 'plain');
    expect(spy).toHaveBeenCalledWith('error', 'plain', expect.objectContaining({ timestamp: expect.any(String) }));
  });

  it('adds a console transport outside production and not in production', async () => {
    const dev = await loadLogger({ NODE_ENV: 'development' });
    dev.mod.default.transports.forEach((t) => (t.silent = true));
    expect(dev.mod.default.transports.some((t) => t.constructor.name === 'Console')).toBe(true);
    const devCount = dev.mod.default.transports.length;

    const prod = await loadLogger({ NODE_ENV: 'production' });
    prod.mod.default.transports.forEach((t) => (t.silent = true));
    expect(prod.mod.default.transports.some((t) => t.constructor.name === 'Console')).toBe(false);
    expect(prod.mod.default.transports.length).toBe(devCount - 1);
  });

  it('child logger inherits custom methods; helper loggers emit', async () => {
    const { mod } = await loadLogger();
    mod.default.transports.forEach((t) => (t.silent = true));
    const child = mod.createChildLogger({ requestId: 'r1' });
    for (const m of ['logWithContext', 'request', 'response', 'database', 'external', 'security', 'performance']) {
      expect(typeof (child as any)[m]).toBe('function');
    }
    expect(() => child.database('hello')).not.toThrow();

    const info = vi.spyOn(mod.default, 'info');
    const error = vi.spyOn(mod.default, 'error');
    mod.logStartup();
    expect(info).toHaveBeenCalledWith(expect.stringContaining('starting up'), expect.objectContaining({ version: '2.0.0' }));
    mod.logShutdown('SIGTERM');
    expect(info).toHaveBeenCalledWith(expect.stringContaining('shutting down'), expect.objectContaining({ reason: 'SIGTERM' }));
    const err = new Error('oops');
    mod.logUnhandledError(err, 'ctx');
    expect(error).toHaveBeenCalledWith(expect.stringContaining('Unhandled'), expect.objectContaining({ error: 'oops', context: 'ctx', name: 'Error' }));
  });

  it('formats messages through the dev console format', async () => {
    const { mod } = await loadLogger({ NODE_ENV: 'development' });
    const l = mod.default;
    const { MESSAGE } = await import('triple-beam');
    const consoleT: any = l.transports.find((t) => t.constructor.name === 'Console');
    const written: string[] = [];
    consoleT.log = (info: any, cb: any) => { written.push(String(info[MESSAGE])); cb && cb(); };
    l.transports.filter((t) => t !== consoleT).forEach((t) => (t.silent = true));
    l.info('hello', { requestId: 'rq', userId: 'u1', foo: 'bar' });
    l.info('plain');
    await new Promise((r) => setTimeout(r, 20));
    expect(written.some((m) => m.includes('hello') && m.includes('[ReqID: rq]') && m.includes('[UserID: u1]') && m.includes('foo: "bar"'))).toBe(true);
    expect(written.some((m) => m.includes('plain') && !m.includes('ReqID'))).toBe(true);
  });

  it('writes JSON lines to the log files (prod format, pretty-printed in development)', async () => {
    for (const env of ['production', 'development']) {
      const { mod } = await loadLogger({ NODE_ENV: env });
      const l = mod.default;
      l.transports.forEach((t) => { if (t.constructor.name === 'Console') t.silent = true; });
      l.info('file-line', { a: 1 });
      l.error(new Error('with-stack') as any);
      await new Promise((r) => setTimeout(r, 150));
      const content = fs.readFileSync(path.join(process.env.LOG_DIR!, 'combined.log'), 'utf8');
      expect(content).toContain('file-line');
      expect(content).toContain('evalia-resume-service');
      if (env === 'development') expect(content).toContain('\n  "level"');
    }
  });

  it('honours the default LOG_LEVEL fallback', async () => {
    const { mod } = await loadLogger({ LOG_LEVEL: 'warn' });
    mod.default.transports.forEach((t) => (t.silent = true));
    expect(mod.default.level).toBe('warn');
  });
});
