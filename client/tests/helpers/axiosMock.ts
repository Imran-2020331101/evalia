import { vi } from 'vitest'

/** Factory for vi.mock('axios'): every verb rejects by default so thunks settle as `rejected`. */
export const axiosFns = {
  get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn(),
}
export function resetAxios() {
  Object.values(axiosFns).forEach((f) => f.mockReset().mockRejectedValue(new Error('network')))
}
resetAxios()
const instance = { ...axiosFns, interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }, defaults: { adapter: undefined } }
export default { ...instance, create: vi.fn(() => instance), isAxiosError: () => false }
