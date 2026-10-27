import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '../../../src/utils/asyncHandler';

describe('asyncHandler', () => {
  const req: any = {};
  const res: any = {};

  it('runs the async handler and does not call next on success', async () => {
    const next = vi.fn();
    const fn = vi.fn(async () => {});
    asyncHandler(fn)(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards rejections to next', async () => {
    const next = vi.fn();
    const err = new Error('fail');
    asyncHandler(async () => { throw err; })(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(next).toHaveBeenCalledWith(err);
  });

  it('forwards synchronous throws of a sync handler? (documents behaviour)', () => {
    const next = vi.fn();
    // A sync throw escapes Promise.resolve(...) argument evaluation and is not caught.
    expect(() => asyncHandler(() => { throw new Error('sync'); })(req, res, next)).toThrow('sync');
    expect(next).not.toHaveBeenCalled();
  });

  it('handles sync handlers that return void', async () => {
    const next = vi.fn();
    asyncHandler(() => {})(req, res, next);
    await new Promise((r) => setImmediate(r));
    expect(next).not.toHaveBeenCalled();
  });
});
