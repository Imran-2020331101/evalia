import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));

const KEYS = ['PORT', 'NODE_ENV', 'MONGODB_URI', 'CORS_ORIGINS', 'LOG_LEVEL', 'LOG_DIR', 'CLOUDINARY_FOLDER_NAME'];

describe('config/index', () => {
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => { vi.resetModules(); KEYS.forEach((k) => { saved[k] = process.env[k]; delete process.env[k]; }); });
  afterEach(() => { KEYS.forEach((k) => { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }); });

  const load = async () => (await import('../../../src/config')).default;

  it('uses defaults when env is empty', async () => {
    const c = await load();
    expect(c.PORT).toBe(5000);
    expect(c.NODE_ENV).toBe('development');
    expect(c.MONGODB_URI).toBe('mongodb://localhost:27017/evalia_ai');
    expect(c.CORS_ORIGINS).toEqual(['http://localhost:3000', 'http://localhost:3001']);
    expect(c.MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    expect(c.CLOUDINARY_FOLDER_NAME).toBe('evalia-resumes');
    expect(c.LOG_LEVEL).toBe('info');
    expect(c.LOG_DIR).toBe('./logs');
    expect(c.REQUEST_TIMEOUT).toBe(120000);
    expect(c.KEEPALIVE_TIMEOUT).toBe(130000);
  });

  it('reads overrides from env and trims CORS origins', async () => {
    Object.assign(process.env, {
      PORT: '8080', NODE_ENV: 'production', MONGODB_URI: 'mongodb://db/x', CORS_ORIGINS: 'https://a.com , https://b.com',
      LOG_LEVEL: 'debug', LOG_DIR: '/var/log', CLOUDINARY_FOLDER_NAME: 'f',
    });
    const c = await load();
    expect(c).toMatchObject({ PORT: 8080, NODE_ENV: 'production', MONGODB_URI: 'mongodb://db/x',
      CORS_ORIGINS: ['https://a.com', 'https://b.com'], LOG_LEVEL: 'debug', LOG_DIR: '/var/log', CLOUDINARY_FOLDER_NAME: 'f' });
  });

  it('loads dotenv', async () => {
    await load();
    const dotenv = (await import('dotenv')).default;
    expect(dotenv.config).toHaveBeenCalled();
  });

  it('BUG: does not define ALLOWED_FILE_TYPES (used by middleware/fileValidation) nor OPEN_ROUTER_API_KEY', async () => {
    const c: any = await load();
    expect(c.ALLOWED_FILE_TYPES).toBeUndefined();
    expect(c.OPENROUTER_API_KEY).toBeUndefined(); // env var actually read elsewhere is OPEN_ROUTER_API_KEY
  });
});
