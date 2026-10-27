import { describe, it, expect } from 'vitest';
import { BadRequestError } from '../../../src/errors/BadRequestError';
import { CustomApiError } from '../../../src/errors/CustomApiError';

describe('BadRequestError', () => {
  it('is a 400 CustomApiError with its own name', () => {
    const e = new BadRequestError('bad');
    expect(e).toBeInstanceOf(CustomApiError);
    expect(e).toBeInstanceOf(Error);
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('BadRequestError');
    expect(e.message).toBe('bad');
  });
});
