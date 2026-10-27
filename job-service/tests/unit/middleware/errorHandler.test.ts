import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/config/logger', () => ({ logger: { error: vi.fn() } }));

import errorHandler from '../../../src/middleware/errorHandler';
import { logger } from '../../../src/config/logger';

function run(err: any) {
  const res: any = { status: vi.fn(() => res), json: vi.fn(() => res) };
  const req: any = { method: 'GET', url: '/x', ip: '1.1.1.1' };
  errorHandler(err, req, res, vi.fn());
  return res;
}

describe('errorHandler middleware', () => {
  it('uses the error statusCode and message', () => {
    const res = run(Object.assign(new Error('teapot'), { statusCode: 418 }));
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'teapot' });
    expect(logger.error).toHaveBeenCalledWith('Error teapot', expect.objectContaining({ method: 'GET', url: '/x', ip: '1.1.1.1' }));
  });

  it('defaults to 500 and "Server Error" when no message', () => {
    const res = run(new Error(''));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Server Error' });
  });

  it('maps CastError to 404', () => {
    const res = run(Object.assign(new Error('cast'), { name: 'CastError' }));
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Resource not found' });
  });

  it('maps duplicate key (11000) to 400', () => {
    const res = run(Object.assign(new Error('dup'), { code: 11000 }));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Duplicate field value entered' });
  });

  it('maps ValidationError to 400 with joined messages', () => {
    const res = run(Object.assign(new Error('v'), {
      name: 'ValidationError',
      errors: { a: { message: 'a bad' }, b: { message: 'b bad' } },
    }));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'a bad, b bad' });
  });

  it('handles ValidationError without errors map', () => {
    const res = run(Object.assign(new Error('v'), { name: 'ValidationError' }));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Server Error' });
  });
});
