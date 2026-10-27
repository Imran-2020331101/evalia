import { describe, it, expect, afterEach, vi } from 'vitest';
import { CustomApiError } from '../../../src/errors/CustomApiError';
import * as errors from '../../../src/errors';

describe('CustomApiError', () => {
  afterEach(() => vi.restoreAllMocks());

  it('defaults to status 500', () => {
    const e = new CustomApiError('boom');
    expect(e.statusCode).toBe(500);
    expect(e.name).toBe('CustomApiError');
    expect(e.message).toBe('boom');
    expect(e.stack).toBeDefined();
  });

  it('accepts a custom status code', () => {
    expect(new CustomApiError('x', 418).statusCode).toBe(418);
  });

  it('works when Error.captureStackTrace is unavailable', () => {
    const original = (Error as any).captureStackTrace;
    (Error as any).captureStackTrace = undefined;
    try {
      const e = new CustomApiError('no capture', 422);
      expect(e.statusCode).toBe(422);
    } finally {
      (Error as any).captureStackTrace = original;
    }
  });

  it('is re-exported with its subclasses from the errors index', () => {
    expect(errors.CustomApiError).toBe(CustomApiError);
    expect(Object.keys(errors).sort()).toEqual(
      ['BadRequestError', 'CustomApiError', 'NotFoundError', 'UnauthenticatedError']
    );
  });
});
