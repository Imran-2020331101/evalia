import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';

const conn: any = Object.assign(new EventEmitter(), {
  readyState: 1, host: 'h', name: 'db', port: 27017, db: undefined as any, close: vi.fn(async () => {}),
});
const connect = vi.fn();

vi.mock('mongoose', () => ({
  default: { connect, connection: conn },
  connect,
  connection: conn,
}));

async function load(nodeEnv = 'test') {
  vi.resetModules();
  process.env.NODE_ENV = nodeEnv;
  const logger = (await import('../../../src/utils/logger')).default as any;
  const mod = await import('../../../src/config/database');
  return { mod, logger };
}

const okConnection = () => ({ connection: conn, models: { Resume: {} } });

describe('config/database', () => {
  beforeEach(() => {
    connect.mockReset();
    conn.removeAllListeners();
    conn.readyState = 1;
    conn.db = undefined;
    conn.close.mockClear();
  });
  afterEach(() => { vi.useRealTimers(); process.env.NODE_ENV = 'test'; });

  describe('connectDB', () => {
    it('connects, masks credentials and registers handlers', async () => {
      process.env.MONGODB_URI = 'mongodb://user:pass@host/db';
      const { mod, logger } = await load();
      connect.mockResolvedValue(okConnection());
      const res = await mod.default();
      expect(res).toBe(conn);
      expect(connect).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ maxPoolSize: 10, family: 4 }));
      expect(conn.listenerCount('connected')).toBe(1);
      expect(conn.eventNames().sort()).toEqual(['close', 'connected', 'disconnected', 'error', 'open', 'reconnected', 'timeout']);
      const firstLog = logger.database.mock.calls[0];
      expect(firstLog[0]).toMatch(/Attempting/);
      delete process.env.MONGODB_URI;
    });

    it('reuses the existing connection when already connected', async () => {
      const { mod, logger } = await load();
      connect.mockResolvedValue(okConnection());
      await mod.default();
      connect.mockClear();
      const res = await mod.default();
      expect(res).toBe(conn);
      expect(connect).not.toHaveBeenCalled();
      expect(logger.database).toHaveBeenCalledWith('Using existing database connection', expect.any(Object));
    });

    it('retries with exponential backoff on failure', async () => {
      vi.useFakeTimers();
      const { mod, logger } = await load();
      connect.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce(okConnection());
      const res = await mod.default();
      expect(res).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Database connection failed'), expect.objectContaining({ error: 'down', attempt: 1 }));
      expect(mod.getConnectionStatus().retryCount).toBe(1);
      await vi.advanceTimersByTimeAsync(2000);
      expect(connect).toHaveBeenCalledTimes(2);
      expect(mod.getConnectionStatus().isConnected).toBe(true);
      expect(mod.getConnectionStatus().retryCount).toBe(0);
    });

    it('stringifies non-Error failures', async () => {
      vi.useFakeTimers();
      const { mod, logger } = await load();
      connect.mockRejectedValue('plain string');
      await mod.default();
      expect(logger.error).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ error: 'plain string' }));
    });

    it('degrades gracefully in development after max retries', async () => {
      vi.useFakeTimers();
      const { mod, logger } = await load('development');
      connect.mockRejectedValue(new Error('down'));
      await mod.default();
      for (let i = 0; i < 5; i++) await vi.advanceTimersByTimeAsync(40000);
      expect(connect).toHaveBeenCalledTimes(5);
      expect(logger.database).toHaveBeenCalledWith(expect.stringContaining('without database'), expect.any(Object));
    });

    it('exits the process after max retries in production', async () => {
      vi.useFakeTimers();
      const { mod, logger } = await load('production');
      const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as any);
      connect.mockRejectedValue(new Error('down'));
      await mod.default();
      for (let i = 0; i < 5; i++) await vi.advanceTimersByTimeAsync(40000);
      expect(exit).toHaveBeenCalledWith(1);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('permanently'), expect.any(Object));
      exit.mockRestore();
    });
  });

  describe('connection event handlers', () => {
    it('update state and log for every event', async () => {
      const { mod, logger } = await load();
      connect.mockResolvedValue(okConnection());
      await mod.default();
      logger.database.mockClear();

      conn.emit('error', new Error('boom'));
      expect(mod.getConnectionStatus().isConnected).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('connection error'), expect.objectContaining({ error: 'boom' }));

      conn.emit('connected');
      expect(mod.getConnectionStatus().isConnected).toBe(true);

      conn.emit('disconnected');
      expect(mod.getConnectionStatus().isConnected).toBe(false);

      conn.emit('reconnected');
      expect(mod.getConnectionStatus()).toMatchObject({ isConnected: true, retryCount: 0 });

      conn.emit('open');
      conn.emit('timeout');
      conn.emit('close');
      expect(mod.getConnectionStatus().isConnected).toBe(false);
      expect(logger.database).toHaveBeenCalledTimes(6);
    });

    it('falls back to "unknown" host on disconnect/close', async () => {
      const { mod, logger } = await load();
      connect.mockResolvedValue(okConnection());
      await mod.default();
      const host = conn.host; conn.host = undefined;
      logger.database.mockClear();
      conn.emit('disconnected'); conn.emit('close');
      expect(logger.database).toHaveBeenCalledWith(expect.any(String), { host: 'unknown' });
      conn.host = host;
    });
  });

  describe('closeDB', () => {
    it('closes when connected', async () => {
      const { mod, logger } = await load();
      connect.mockResolvedValue(okConnection());
      await mod.default();
      await mod.closeDB();
      expect(conn.close).toHaveBeenCalled();
      expect(logger.database).toHaveBeenCalledWith(expect.stringContaining('closed gracefully'));
    });
    it('is a no-op when not connected', async () => {
      const { mod } = await load();
      await mod.closeDB();
      expect(conn.close).not.toHaveBeenCalled();
    });
    it('logs close errors (Error and non-Error)', async () => {
      const { mod, logger } = await load();
      connect.mockResolvedValue(okConnection());
      await mod.default();
      conn.close.mockRejectedValueOnce(new Error('x'));
      await mod.closeDB();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error closing'), { error: 'x' });
      conn.emit('connected');
      conn.close.mockRejectedValueOnce('str');
      await mod.closeDB();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error closing'), { error: 'str' });
    });
  });

  describe('getConnectionStatus', () => {
    it('reports initial state', async () => {
      const { mod } = await load();
      expect(mod.getConnectionStatus()).toEqual({ isConnected: false, readyState: 1, host: 'h', name: 'db', retryCount: 0 });
    });
  });

  describe('healthCheck', () => {
    it('is healthy when ping succeeds', async () => {
      const { mod } = await load();
      conn.db = { admin: () => ({ ping: vi.fn(async () => ({ ok: 1 })) }) };
      const r = await mod.healthCheck();
      expect(r.status).toBe('healthy');
      expect(r.details.ping).toEqual({ ok: 1 });
    });
    it('is unhealthy when admin interface is missing', async () => {
      const { mod } = await load();
      conn.db = undefined;
      const r = await mod.healthCheck();
      expect(r.status).toBe('unhealthy');
      expect(r.details.reason).toMatch(/not available/);
    });
    it('is unhealthy when ping throws (Error and non-Error)', async () => {
      const { mod } = await load();
      conn.db = { admin: () => ({ ping: async () => { throw new Error('nope'); } }) };
      expect((await mod.healthCheck()).details.error).toBe('nope');
      conn.db = { admin: () => ({ ping: async () => { throw 'str'; } }) };
      expect((await mod.healthCheck()).details.error).toBe('str');
    });
  });
});
