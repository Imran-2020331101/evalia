import { describe, it, expect } from 'vitest';
import { NotFoundError } from '../../../src/errors/NotFoundError';
import { CustomApiError } from '../../../src/errors/CustomApiError';

describe('NotFoundError', () => {
  it('is a 404 CustomApiError', () => {
    const e = new NotFoundError('missing');
    expect(e).toBeInstanceOf(CustomApiError);
    expect(e.statusCode).toBe(404);
    expect(e.message).toBe('missing');
  });

  it('keeps the base class name (it does not override name, unlike its siblings)', () => {
    expect(new NotFoundError('x').name).toBe('CustomApiError');
  });
});
