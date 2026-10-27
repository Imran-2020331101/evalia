import { vi } from 'vitest'

/** Installs a global fetch mock and returns it. Call vi.unstubAllGlobals() to restore. */
export function mockFetch(impl: (...args: any[]) => any) {
  const fn = vi.fn(impl)
  vi.stubGlobal('fetch', fn)
  return fn
}
