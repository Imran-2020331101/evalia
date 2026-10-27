// Controllable replacement for `next/navigation`, installed globally from tests/setup.ts.
import { vi } from 'vitest'

export const router = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}
export const nav = {
  pathname: '/',
  params: {} as Record<string, string>,
  search: new URLSearchParams(),
}

export function setNav(opts: { pathname?: string; params?: Record<string, string>; search?: string | Record<string, string> } = {}) {
  nav.pathname = opts.pathname ?? '/'
  nav.params = opts.params ?? {}
  nav.search = new URLSearchParams(opts.search ?? '')
}
export function resetNav() {
  Object.values(router).forEach((f) => f.mockReset())
  setNav()
}

export const useRouter = () => router
export const usePathname = () => nav.pathname
export const useParams = () => nav.params
export const useSearchParams = () => nav.search
export const redirect = vi.fn((url: string) => {
  throw new Error('NEXT_REDIRECT:' + url)
})
export const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})
