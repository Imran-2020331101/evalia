import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));

describe('config', () => {
  const env = { ...process.env };
  beforeEach(() => vi.resetModules());
  afterEach(() => { process.env = { ...env }; });

  it('uses defaults when env is unset', async () => {
    for (const k of ['NODE_ENV', 'PORT', 'CORS_ORIGINS', 'MONGODB_URI', 'JWT_SECRET', 'OPENAI_API_KEY']) delete process.env[k];
    const { default: config } = await import('../../../src/config');
    expect(config).toMatchObject({
      NODE_ENV: 'development',
      PORT: 7001,
      CORS_ORIGINS: ['http://localhost:3000', 'http://localhost:3001'],
      MONGODB_URI: 'mongodb://localhost:27017/evalia_ai',
      JWT_SECRET: 'your-secret-key',
    });
    expect(config.OPENAI_API_KEY).toBeUndefined();
  });

  it('reads overrides from env', async () => {
    Object.assign(process.env, {
      NODE_ENV: 'production', PORT: '9000', CORS_ORIGINS: 'http://a.com,http://b.com',
      MONGODB_URI: 'mongodb://x', JWT_SECRET: 's', OPENAI_API_KEY: 'k', CLOUDINARY_URL: 'c',
    });
    const { default: config } = await import('../../../src/config');
    expect(config).toMatchObject({
      NODE_ENV: 'production', PORT: 9000, CORS_ORIGINS: ['http://a.com', 'http://b.com'],
      MONGODB_URI: 'mongodb://x', JWT_SECRET: 's', OPENAI_API_KEY: 'k', CLOUDINARY_URL: 'c',
    });
  });
});
