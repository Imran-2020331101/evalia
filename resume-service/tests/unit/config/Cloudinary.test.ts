import { describe, it, expect, vi, beforeEach } from 'vitest';

const configSpy = vi.fn();
vi.mock('cloudinary', () => ({ v2: { config: configSpy, uploader: {} } }));

describe('config/Cloudinary', () => {
  beforeEach(() => { vi.resetModules(); configSpy.mockClear(); });

  it('configures cloudinary from env vars and exports the v2 client', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'cn';
    process.env.CLOUDINARY_API_KEY = 'ak';
    process.env.CLOUDINARY_API_SECRET = 'as';
    const mod = await import('../../../src/config/Cloudinary');
    expect(configSpy).toHaveBeenCalledWith({ cloud_name: 'cn', api_key: 'ak', api_secret: 'as' });
    expect(mod.default.config).toBe(configSpy);
  });
});
