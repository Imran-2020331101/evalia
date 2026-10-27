import { describe, it, expect } from 'vitest';
import { NotFoundError } from '../../../src/errors/NotFoundError';
import { CustomApiError } from '../../../src/errors/CustomApiError';

describe('NotFoundError', () => {
  it('is a 404 CustomApiError', () => {
    const e = new NotFoundError('msg');
    expect(e).toBeInstanceOf(CustomApiError);
    expect(e).toBeInstanceOf(Error);
    expect(e.statusCode).toBe(404);
    expect(e.message).toBe('msg');
    expect(e.name).toBe('NotFoundError');
  });
});
