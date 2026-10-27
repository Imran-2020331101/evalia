import { vi } from 'vitest';

/**
 * Build a mongoose-Query-like thenable. Supports `await q`, `q.orFail()`, `q.lean()`.
 * Pass `error` to make it reject. `orFail(err?)` rejects with err (or a default
 * DocumentNotFoundError-like error) when `result` is null/undefined/empty.
 */
export function mockQuery<T>(result: T, error?: unknown) {
  const settle = (): Promise<T> => (error ? Promise.reject(error) : Promise.resolve(result));
  const q: any = {
    then: (res: any, rej: any) => settle().then(res, rej),
    catch: (rej: any) => settle().catch(rej),
    lean: vi.fn(() => q),
    orFail: vi.fn((customErr?: Error) => {
      if (error) return Promise.reject(error);
      if (result === null || result === undefined) {
        const e: any = customErr ?? new Error('No document found for query');
        if (!customErr) e.name = 'DocumentNotFoundError';
        return Promise.reject(e);
      }
      return Promise.resolve(result);
    }),
  };
  return q;
}

/** Minimal fake mongoose document. */
export function fakeDoc<T extends Record<string, any>>(data: T, extra: Record<string, any> = {}) {
  return {
    ...data,
    toObject: vi.fn(() => ({ ...data })),
    toJSON: vi.fn(() => ({ ...data })),
    save: vi.fn(async function (this: any) { return this; }),
    ...extra,
  } as any;
}
