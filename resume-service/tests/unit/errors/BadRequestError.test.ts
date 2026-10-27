import { describe, it, expect } from 'vitest';
import { BadRequestError } from '../../../src/errors/BadRequestError';
import { CustomApiError } from '../../../src/errors/CustomApiError';

describe('BadRequestError', () => {
  it('is a 400 CustomApiError', () => {
    const e = new BadRequestError('bad');
    expect(e).toBeInstanceOf(CustomApiError);
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('BadRequestError');
    expect(e.errors).toEqual([]);
  });
  it('carries error details', () => {
    expect(new BadRequestError('bad', ['f1']).errors).toEqual(['f1']);
  });
});
