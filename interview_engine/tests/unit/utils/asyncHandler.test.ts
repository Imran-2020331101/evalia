import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '../../../src/utils/asyncHandler';
import { flushPromises } from '../../helpers/testApp';

describe('asyncHandler', () => {
  it('invokes the wrapped handler with req, res, next', async () => {
    const inner = vi.fn().mockResolvedValue(undefined);
    const next = vi.fn();
    const req: any = {}, res: any = {};
    expect(asyncHandler(inner)(req, res, next)).toBeUndefined();
    await flushPromises();
    expect(inner).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards rejected promises to next(err)', async () => {
    const err = new Error('async fail');
    const next = vi.fn();
    asyncHandler(async () => { throw err; })({} as any, {} as any, next);
    await flushPromises();
    expect(next).toHaveBeenCalledWith(err);
  });

  it('supports synchronous handlers', async () => {
    const inner = vi.fn();
    const next = vi.fn();
    asyncHandler(inner)({} as any, {} as any, next);
    await flushPromises();
    expect(inner).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
  });

  it('lets a synchronous throw propagate (it is not caught by the wrapper)', () => {
    const wrapped = asyncHandler(() => { throw new Error('sync'); });
    expect(() => wrapped({} as any, {} as any, vi.fn())).toThrow('sync');
  });
});
