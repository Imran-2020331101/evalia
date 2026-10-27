import { describe, it, expect } from 'vitest';
import { UnauthenticatedError } from '../../../src/errors/UnauthenticatedError';
import { CustomApiError } from '../../../src/errors/CustomApiError';

describe('UnauthenticatedError', () => {
  it('is a 401 CustomApiError with its own name', () => {
    const e = new UnauthenticatedError('nope');
    expect(e).toBeInstanceOf(CustomApiError);
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('UnauthenticatedError');
    expect(e.message).toBe('nope');
  });
});
