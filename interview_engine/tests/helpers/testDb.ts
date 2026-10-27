import { vi } from 'vitest';

/**
 * Builds a thenable that behaves like a mongoose Query: supports
 * orFail()/sort()/exec() and can be awaited. Used instead of a real
 * MongoDB so tests stay offline (mongoose is mocked, not mongodb-memory-server).
 */
export function mockQuery<T>(value: T, opts: { reject?: Error } = {}) {
  const settle = () => (opts.reject ? Promise.reject(opts.reject) : Promise.resolve(value));
  const q: any = {
    orFail: vi.fn(() => settle()),
    sort: vi.fn(() => settle()),
    exec: vi.fn(() => settle()),
    then: (res: any, rej: any) => settle().then(res, rej),
    catch: (rej: any) => settle().catch(rej),
  };
  return q;
}

/** Error shaped like mongoose's DocumentNotFoundError (what orFail() throws). */
export function documentNotFoundError() {
  const e = new Error('No document found for query');
  e.name = 'DocumentNotFoundError';
  return e;
}

export const VALID_ID = '507f1f77bcf86cd799439011';
export const VALID_ID_2 = '507f1f77bcf86cd799439012';
export const VALID_ID_3 = '507f1f77bcf86cd799439013';
