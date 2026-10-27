import { describe, it, expect } from 'vitest';
import { UnauthorizedError } from '../../../src/errors/UnauthorizedError';
import { CustomApiError } from '../../../src/errors/CustomApiError';

describe('UnauthorizedError', () => {
  it('is a 403 CustomApiError', () => {
    const e = new UnauthorizedError('msg');
    expect(e).toBeInstanceOf(CustomApiError);
    expect(e).toBeInstanceOf(Error);
    expect(e.statusCode).toBe(403);
    expect(e.message).toBe('msg');
    expect(e.name).toBe('UnauthorizedError');
  });
});
