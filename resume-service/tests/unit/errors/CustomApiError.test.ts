import { describe, it, expect } from 'vitest';
import { CustomApiError } from '../../../src/errors/CustomApiError';

describe('CustomApiError', () => {
  it('uses defaults', () => {
    const e = new CustomApiError('boom');
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toBe('boom');
    expect(e.statusCode).toBe(500);
    expect(e.errors).toEqual([]);
    expect(e.data).toBeNull();
    expect(e.success).toBe(false);
    expect(e.name).toBe('CustomApiError');
    expect(e.stack).toBeDefined();
  });

  it('accepts status, errors and a custom stack', () => {
    const e = new CustomApiError('x', 418, ['a', 'b'], 'custom-stack');
    expect(e.statusCode).toBe(418);
    expect(e.errors).toEqual(['a', 'b']);
    expect(e.stack).toBe('custom-stack');
  });

  it('works when captureStackTrace is unavailable', () => {
    const orig = (Error as any).captureStackTrace;
    (Error as any).captureStackTrace = undefined;
    try {
      const e = new CustomApiError('no-capture');
      expect(e.message).toBe('no-capture');
    } finally {
      (Error as any).captureStackTrace = orig;
    }
  });
});
