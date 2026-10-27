import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/auth/logout/route'
import { req } from '../../helpers/routeHelpers'

afterEach(() => vi.restoreAllMocks())

describe('POST /api/auth/logout', () => {
  it('expires known cookies', async () => {
    const res = await POST(req('/api/auth/logout'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, message: 'Logged out' })
    for (const n of ['token', 'tokenType', 'userEmail', 'userName']) {
      expect(res.cookies.get(n)?.value).toBe('')
    }
    expect(res.headers.getSetCookie().every((c) => /Max-Age=0/i.test(c))).toBe(true)
  })
  it('also clears extra cookies sent by the client, skipping blank names', async () => {
    const res = await POST(req('/api/auth/logout', undefined, { headers: { cookie: 'foo=1; bar=2; =x; token=t' } }))
    expect(res.cookies.get('foo')?.value).toBe('')
    expect(res.cookies.get('bar')?.value).toBe('')
    expect(res.cookies.getAll().length).toBe(6)
  })
  it('returns 500 on unexpected errors', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const bad: any = { get headers() { throw new Error('boom') } }
    const res = await POST(bad)
    expect(res.status).toBe(500)
    expect((await res.json()).message).toBe('Internal server error')
  })
})
