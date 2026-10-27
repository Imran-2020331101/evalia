import { describe, it, expect } from 'vitest';
import { UnauthenticatedError } from '../../../src/errors/UnauthenticatedError';
import { CustomApiError } from '../../../src/errors/CustomApiError';

describe('UnauthenticatedError', () => {
  it('is a 401 CustomApiError', () => {
    const e = new UnauthenticatedError('msg');
    expect(e).toBeInstanceOf(CustomApiError);
    expect(e).toBeInstanceOf(Error);
    expect(e.statusCode).toBe(401);
    expect(e.message).toBe('msg');
    expect(e.name).toBe('UnauthenticatedError');
  });
});
