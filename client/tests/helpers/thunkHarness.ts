import { expect, vi } from 'vitest'

export type ThunkCase = {
  name: string
  thunk: (arg?: any) => any
  arg?: any
  method: 'get' | 'post' | 'patch' | 'delete'
  url: string
  /** expected body arg for post/patch */
  body?: any
  /** value resolved by axios (response.data) */
  data?: any
  /** expected fulfilled payload; defaults to data */
  payload?: any
  fallback: string
}

/** Runs success, server-error, and network-error paths for one thunk against a mocked axios. */
export function runThunkCase(axios: any, c: ThunkCase, opts: { silence?: boolean } = {}) {
  const dispatchWith = async () => {
    const actions: any[] = []
    const dispatch = (a: any) => actions.push(a)
    const result = await c.thunk(c.arg)(dispatch, () => ({}), undefined)
    return { result, actions }
  }
  return {
    async success() {
      axios[c.method].mockReset()
      axios[c.method].mockResolvedValueOnce({ data: c.data })
      const { result } = await dispatchWith()
      expect(result.type.endsWith('/fulfilled')).toBe(true)
      expect(result.payload).toEqual('payload' in c ? c.payload : c.data)
      const call = axios[c.method].mock.calls[0]
      expect(call[0]).toBe(c.url)
      if (c.method === 'post' || c.method === 'patch') {
        if ('body' in c) expect(call[1]).toEqual(c.body)
        expect(call[2]).toEqual({ withCredentials: true })
      } else {
        expect(call[1]).toEqual({ withCredentials: true })
      }
    },
    async serverError() {
      axios[c.method].mockReset()
      axios[c.method].mockRejectedValueOnce({ response: { data: 'boom' } })
      const { result } = await dispatchWith()
      expect(result.type.endsWith('/rejected')).toBe(true)
      expect(result.payload).toEqual({ message: 'boom' })
    },
    async networkError() {
      axios[c.method].mockReset()
      axios[c.method].mockRejectedValueOnce(new Error('net'))
      const { result } = await dispatchWith()
      expect(result.type.endsWith('/rejected')).toBe(true)
      expect(result.payload).toEqual({ message: c.fallback })
    },
  }
}

export const silenceConsole = () => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
}
