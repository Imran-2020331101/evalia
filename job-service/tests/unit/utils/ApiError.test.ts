import { describe, it, expect } from 'vitest';
import { ApiError } from '../../../src/utils/ApiError';

describe('ApiError', () => {
  it('sets defaults', () => {
    const e = new ApiError(500);
    expect(e).toBeInstanceOf(Error);
    expect(e.statusCode).toBe(500);
    expect(e.message).toBe('Something went wrong');
    expect(e.success).toBe(false);
    expect(e.data).toBeNull();
    expect(e.errors).toEqual([]);
    expect(e.stack).toBeTruthy();
  });

  it('keeps custom message, errors and stack', () => {
    const e = new ApiError(400, 'bad', ['a'], 'custom-stack');
    expect(e.message).toBe('bad');
    expect(e.errors).toEqual(['a']);
    expect(e.stack).toBe('custom-stack');
  });
});
