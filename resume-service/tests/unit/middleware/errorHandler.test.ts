import { describe, it, expect, vi } from 'vitest';
import errorHandler, { notFoundHandler, asyncHandler } from '../../../src/middleware/errorHandler';
import { BadRequestError, NotFoundError, MissingRequiredFieldError } from '../../../src/errors';
import logger from '../../../src/utils/logger';

function mocks(overrides: any = {}) {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  const req: any = { headers: {}, method: 'POST', url: '/x', ip: '1.1.1.1', body: { a: 1 }, get: vi.fn(() => 'UA'), ...overrides };
  return { req, res, next: vi.fn() };
}
const run = (err: any, o: any = {}) => {
  const m = mocks(o);
  errorHandler(err, m.req, m.res, m.next);
  return { status: m.res.status.mock.calls[0][0], body: m.res.json.mock.calls[0][0], ...m };
};

describe('errorHandler', () => {
  it('handles CustomApiError with details', () => {
    const { status, body } = run(new BadRequestError('bad', ['f1', 'f2']));
    expect(status).toBe(400);
    expect(body).toMatchObject({ success: false, error: 'bad', details: ['f1', 'f2'] });
    expect(body.requestId).toEqual(expect.any(String));
  });

  it('omits details when a CustomApiError has none', () => {
    const { status, body } = run(new NotFoundError('nf'));
    expect(status).toBe(404);
    expect(body.details).toBeUndefined();
  });

  it('uses a MissingRequiredFieldError code as detail', () => {
    expect(run(new MissingRequiredFieldError('file')).body.details).toEqual(['MISSING_FILE']);
  });

  it('honours x-request-id header', () => {
    expect(run(new Error('x'), { headers: { 'x-request-id': 'rid-1' } }).body.requestId).toBe('rid-1');
  });

  it('logs the error; omits body for GET', () => {
    run(new Error('logged'), { method: 'GET' });
    expect(logger.error).toHaveBeenCalledWith('Error logged', expect.objectContaining({ method: 'GET', body: undefined }));
    run(new Error('logged2'));
    expect(logger.error).toHaveBeenCalledWith('Error logged2', expect.objectContaining({ body: { a: 1 } }));
  });

  it('maps CastError to 404', () => {
    const e: any = new Error('cast'); e.name = 'CastError'; e.value = 'abc';
    const { status, body } = run(e);
    expect(status).toBe(404);
    expect(body.error).toBe('Resource not found with id: abc');
  });

  it('maps duplicate key errors to 400 (with and without field)', () => {
    const e: any = new Error('dup'); e.code = 11000; e.keyValue = { email: 'a' };
    let r = run(e);
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('Duplicate field value entered for email');
    const e2: any = new Error('dup'); e2.code = 11000;
    r = run(e2);
    expect(r.body.error).toBe('Duplicate field value entered');
  });

  it('maps mongoose ValidationError to 400 with details', () => {
    const e: any = new Error('v'); e.name = 'ValidationError';
    e.errors = { a: { message: 'A bad' }, b: { message: 'B bad' } };
    const { status, body } = run(e);
    expect(status).toBe(400);
    expect(body.error).toBe('A bad, B bad');
    expect(body.details).toEqual(['A bad', 'B bad']);
  });

  it('maps JWT errors to 401', () => {
    const a: any = new Error('x'); a.name = 'JsonWebTokenError';
    expect(run(a)).toMatchObject({ status: 401, body: { error: 'Invalid token' } });
    const b: any = new Error('x'); b.name = 'TokenExpiredError';
    expect(run(b)).toMatchObject({ status: 401, body: { error: 'Token expired' } });
  });

  it.each([
    ['LIMIT_FILE_SIZE', 'File too large'],
    ['LIMIT_FILE_COUNT', 'Too many files'],
    ['LIMIT_UNEXPECTED_FILE', 'Invalid file type'],
    ['SOMETHING_ELSE', 'File upload error'],
  ])('maps MulterError %s', (code, msg) => {
    const e: any = new Error(code); e.name = 'MulterError';
    expect(run(e)).toMatchObject({ status: 400, body: { error: msg } });
  });

  it('falls back to 500 and the original message', () => {
    expect(run(new Error('weird'))).toMatchObject({ status: 500, body: { success: false, error: 'weird' } });
  });

  it('falls back to "Server Error" for an empty message', () => {
    expect(run(new Error('')).body.error).toBe('Server Error');
  });

  it('respects a plain statusCode on the error', () => {
    const e: any = new Error('teapot'); e.statusCode = 418;
    expect(run(e).status).toBe(418);
  });

  it('BUG: ZodError (invalid input) results in 500 instead of 400', () => {
    const e: any = new Error('[{"message":"Invalid email"}]'); e.name = 'ZodError';
    expect(run(e).status).toBe(500);
  });
});

describe('notFoundHandler', () => {
  it('forwards a 404 error to next', () => {
    const next = vi.fn();
    notFoundHandler({ originalUrl: '/nope' }, {}, next);
    const err = next.mock.calls[0][0];
    expect(err.message).toBe('Route /nope not found');
    expect(err.statusCode).toBe(404);
  });
});

describe('asyncHandler (middleware version)', () => {
  it('passes rejections to next and resolves otherwise', async () => {
    const next = vi.fn();
    const err = new Error('e');
    asyncHandler(async () => { throw err; })({}, {}, next);
    await new Promise((r) => setImmediate(r));
    expect(next).toHaveBeenCalledWith(err);

    const next2 = vi.fn();
    const fn = vi.fn(async () => 1);
    asyncHandler(fn)({}, {}, next2);
    await new Promise((r) => setImmediate(r));
    expect(fn).toHaveBeenCalled();
    expect(next2).not.toHaveBeenCalled();
  });
});
