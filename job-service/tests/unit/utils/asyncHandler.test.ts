import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '../../../src/utils/asyncHandler';

const flush = () => new Promise((r) => setImmediate(r));

describe('asyncHandler', () => {
  it('runs the wrapped handler without calling next on success', async () => {
    const handler = vi.fn(async () => {});
    const next = vi.fn();
    asyncHandler(handler)({} as any, {} as any, next);
    await flush();
    expect(handler).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards rejected promises to next', async () => {
    const err = new Error('boom');
    const next = vi.fn();
    asyncHandler(async () => { throw err; })({} as any, {} as any, next);
    await flush();
    expect(next).toHaveBeenCalledWith(err);
  });

  it('forwards synchronous throws? (documents behaviour)', () => {
    const next = vi.fn();
    // Sync throw happens before Promise.resolve wraps it, so it propagates.
    expect(() => asyncHandler(() => { throw new Error('sync'); })({} as any, {} as any, next)).toThrow('sync');
  });

  it('supports sync handlers returning void', async () => {
    const next = vi.fn();
    asyncHandler(() => {})({} as any, {} as any, next);
    await flush();
    expect(next).not.toHaveBeenCalled();
  });
});
