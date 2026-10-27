import { afterEach, beforeEach, vi } from 'vitest'
import React from 'react'

// next/* mocks (overridable per test file with their own vi.mock).
vi.mock('next/navigation', async () => await import('./helpers/navMock'))
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, ...rest }: any) =>
    React.createElement('img', { src: typeof src === 'string' ? src : src?.src, alt, ...rest }),
}))
vi.mock('next/link', () => ({
  default: ({ href, children, prefetch, ...rest }: any) =>
    React.createElement('a', { href: typeof href === 'string' ? href : href?.pathname, ...rest }, children),
}))

vi.mock('next/font/google', () => {
  const font = () => ({ className: 'mock-font', style: {} })
  return { Didact_Gothic: font, Major_Mono_Display: font, Kodchasan: font, Syncopate: font, Comfortaa: font, Michroma: font }
})
vi.mock('gsap', async () => await import('./helpers/gsapMock'))
vi.mock('gsap/all', async () => await import('./helpers/gsapMock'))
vi.mock('@gsap/react', async () => await import('./helpers/gsapMock'))

if (typeof window !== 'undefined') {
  await import('@testing-library/jest-dom/vitest')
  const { cleanup } = await import('@testing-library/react')
  const { resetNav } = await import('./helpers/navMock')

  class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  class IO extends RO {
    takeRecords() {
      return []
    }
  }
  ;(globalThis as any).ResizeObserver ??= RO
  ;(globalThis as any).IntersectionObserver ??= IO
  window.scrollTo = vi.fn() as any
  Element.prototype.scrollTo ??= vi.fn() as any
  Element.prototype.scrollIntoView ??= vi.fn()
  window.matchMedia ??= ((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as any

  // Node >= 25 ships an experimental global localStorage that shadows jsdom's; install a plain shim.
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    let ok = false
    try { ok = typeof (globalThis as any)[name]?.clear === 'function' } catch {}
    if (!ok) {
      const data = new Map<string, string>()
      const shim = {
        getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
        setItem: (k: string, v: string) => void data.set(k, String(v)),
        removeItem: (k: string) => void data.delete(k),
        clear: () => data.clear(),
        key: (i: number) => [...data.keys()][i] ?? null,
        get length() { return data.size },
      }
      Object.defineProperty(globalThis, name, { value: shim, configurable: true, writable: true })
      Object.defineProperty(window, name, { value: shim, configurable: true, writable: true })
    }
  }

  // Node >=22 exposes a broken global localStorage that shadows jsdom's; install a working one.
  if (typeof localStorage === 'undefined' || typeof localStorage.clear !== 'function') {
    const makeStorage = () => {
      let m = new Map<string, string>()
      return {
        get length() { return m.size },
        key: (i: number) => [...m.keys()][i] ?? null,
        getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
        setItem: (k: string, v: string) => void m.set(k, String(v)),
        removeItem: (k: string) => void m.delete(k),
        clear: () => { m = new Map() },
      }
    }
    for (const name of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(globalThis, name, { configurable: true, value: makeStorage() })
      Object.defineProperty(window, name, { configurable: true, value: (globalThis as any)[name] })
    }
  }

  beforeEach(() => resetNav())
  afterEach(() => cleanup())
}
