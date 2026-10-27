import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import requestLogger, {
  createRequestLogger, generateRequestId, sanitizeData, getClientIP, shouldLogBody,
} from '../../../src/middleware/requestLogger';
import logger from '../../../src/utils/logger';

const L = logger as any;

function makeReqRes(reqOver: any = {}, resOver: any = {}) {
  const req: any = Object.assign(new EventEmitter(), {
    method: 'GET', url: '/a', ip: '9.9.9.9', query: {}, body: undefined, headers: {},
    get: (h: string) => (h === 'User-Agent' ? 'UA' : undefined),
  }, reqOver);
  const res: any = Object.assign(new EventEmitter(), {
    statusCode: 200, headersSent: false, get: vi.fn(() => undefined),
  }, resOver);
  return { req, res };
}

describe('generateRequestId', () => {
  it('has the req_<ts>_<rand> shape and is unique', () => {
    const a = generateRequestId(), b = generateRequestId();
    expect(a).toMatch(/^req_\d+_[a-z0-9]+$/);
    expect(a).not.toBe(b);
  });
});

describe('sanitizeData', () => {
  it('returns non-objects unchanged', () => {
    expect(sanitizeData(null)).toBeNull();
    expect(sanitizeData('s')).toBe('s');
    expect(sanitizeData(5)).toBe(5);
    expect(sanitizeData(undefined)).toBeUndefined();
  });
  it('redacts sensitive keys case-insensitively, recursively', () => {
    const out = sanitizeData({ Password: 'p', apiKey: 'k', user: { token: 't', name: 'n', nested: { SECRET: 's' } }, n: null, ok: 1 });
    expect(out).toEqual({ Password: '[REDACTED]', apiKey: '[REDACTED]', user: { token: '[REDACTED]', name: 'n', nested: { SECRET: '[REDACTED]' } }, n: null, ok: 1 });
  });
  it('does not mutate the input', () => {
    const input = { password: 'x' };
    sanitizeData(input);
    expect(input.password).toBe('x');
  });
});

describe('getClientIP', () => {
  it('prefers x-forwarded-for first entry', () => {
    expect(getClientIP({ headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }, ip: 'z' } as any)).toBe('1.1.1.1');
  });
  it('falls back to x-real-ip, x-client-ip, connection, ip, unknown', () => {
    expect(getClientIP({ headers: { 'x-real-ip': 'r' } } as any)).toBe('r');
    expect(getClientIP({ headers: { 'x-client-ip': 'c' } } as any)).toBe('c');
    expect(getClientIP({ headers: {}, connection: { remoteAddress: 'conn' }, ip: 'ip' } as any)).toBe('conn');
    expect(getClientIP({ headers: {}, ip: 'ip' } as any)).toBe('ip');
    expect(getClientIP({ headers: {} } as any)).toBe('unknown');
  });
});

describe('shouldLogBody', () => {
  const r = (method: string, ct?: string) => ({ method, headers: ct ? { 'content-type': ct } : {} } as any);
  it('only for POST/PUT/PATCH with JSON', () => {
    expect(shouldLogBody(r('GET', 'application/json'))).toBe(false);
    expect(shouldLogBody(r('post', 'application/json'))).toBe(true);
    expect(shouldLogBody(r('PUT', 'application/json; charset=utf-8'))).toBe(true);
    expect(shouldLogBody(r('PATCH', 'application/json'))).toBe(true);
  });
  it('never for multipart/octet-stream/other/missing content-type', () => {
    expect(shouldLogBody(r('POST', 'multipart/form-data; boundary=x'))).toBe(false);
    expect(shouldLogBody(r('POST', 'application/octet-stream'))).toBe(false);
    expect(shouldLogBody(r('POST', 'text/plain'))).toBe(false);
    expect(shouldLogBody(r('POST'))).toBe(false);
  });
});

describe('requestLogger middleware', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('annotates the request, logs it, and calls next', () => {
    const { req, res } = makeReqRes({ query: { password: 'x', q: '1' }, method: 'POST', body: { token: 't', a: 1 }, headers: { 'content-type': 'application/json' }, user: { id: 'u1' } });
    const next = vi.fn();
    requestLogger(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.requestId).toMatch(/^req_/);
    expect(typeof req.startTime).toBe('number');
    const meta = L.info.mock.calls[0][1];
    expect(L.info.mock.calls[0][0]).toContain('Incoming request');
    expect(meta).toMatchObject({ method: 'POST', url: '/a', ip: '9.9.9.9', userAgent: 'UA', userId: 'u1',
      query: { password: '[REDACTED]', q: '1' }, body: { token: '[REDACTED]', a: 1 } });
  });

  it('omits query/body when empty / not loggable', () => {
    const { req, res } = makeReqRes();
    requestLogger(req, res, vi.fn());
    const meta = L.info.mock.calls[0][1];
    expect(meta.query).toBeUndefined();
    expect(meta.body).toBeUndefined();
  });

  it.each([
    [200, 'info'], [302, 'info'], [404, 'warn'], [500, 'error'],
  ])('logs completed requests with status %s at level %s', (status, level) => {
    const { req, res } = makeReqRes({}, { statusCode: status, get: vi.fn(() => '123') });
    requestLogger(req, res, vi.fn());
    L.info.mockClear();
    res.emit('finish');
    const call = L[level].mock.calls.find((c: any[]) => String(c[0]).includes('Request completed'));
    expect(call).toBeTruthy();
    expect(call[1]).toMatchObject({ statusCode: status, contentLength: '123', responseSize: 123 });
  });

  it('leaves responseSize undefined without Content-Length', () => {
    const { req, res } = makeReqRes();
    requestLogger(req, res, vi.fn());
    res.emit('finish');
    const call = L.info.mock.calls.find((c: any[]) => String(c[0]).includes('Request completed'));
    expect(call[1].responseSize).toBeUndefined();
  });

  it('warns about slow requests (>1s) only', () => {
    const { req, res } = makeReqRes();
    requestLogger(req, res, vi.fn());
    vi.advanceTimersByTime(500);
    res.emit('finish');
    expect(L.warn).not.toHaveBeenCalled();

    const b = makeReqRes();
    requestLogger(b.req, b.res, vi.fn());
    vi.advanceTimersByTime(1500);
    b.res.emit('finish');
    expect(L.warn).toHaveBeenCalledWith(expect.stringContaining('Slow request'), expect.objectContaining({ statusCode: 200 }));
  });

  it('warns on client disconnect only if headers were not sent', () => {
    const a = makeReqRes();
    requestLogger(a.req, a.res, vi.fn());
    a.req.emit('close');
    expect(L.warn).toHaveBeenCalledWith(expect.stringContaining('Client disconnected'), expect.any(Object));

    L.warn.mockClear();
    const b = makeReqRes({}, { headersSent: true });
    requestLogger(b.req, b.res, vi.fn());
    b.req.emit('close');
    expect(L.warn).not.toHaveBeenCalled();
  });

  it('logs response errors', () => {
    const { req, res } = makeReqRes();
    requestLogger(req, res, vi.fn());
    res.emit('error', new Error('socket'));
    expect(L.error).toHaveBeenCalledWith(expect.stringContaining('Response error'), expect.objectContaining({ error: 'socket' }));
  });
});

describe('createRequestLogger', () => {
  it('skips excluded paths', () => {
    const mw = createRequestLogger({ excludePaths: ['/health'] });
    const { req, res } = makeReqRes({ url: '/health/live' });
    const next = vi.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(L.info).not.toHaveBeenCalled();
  });
  it('delegates to requestLogger otherwise (default options too)', () => {
    for (const mw of [createRequestLogger(), createRequestLogger({ excludePaths: ['/health'] })]) {
      L.info.mockClear();
      const { req, res } = makeReqRes({ url: '/api' });
      const next = vi.fn();
      mw(req, res, next);
      expect(next).toHaveBeenCalledOnce();
      expect(L.info).toHaveBeenCalled();
    }
  });
});
