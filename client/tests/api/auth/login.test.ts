import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonRes, loadRoute, req } from '../../helpers/routeHelpers'
import { mockFetch } from '../../mocks/server'

const R = '@/app/api/auth/login/route'

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('POST /api/auth/login', () => {
  it('demo mode short-circuits to demo login', async () => {
    const { POST } = await loadRoute(R, true)
    const f = mockFetch(() => { throw new Error('should not be called') })
    const res = await POST(req('/api/auth/login', { email: 'recruiter@x.io', password: 'p' }))
    expect(f).not.toHaveBeenCalled()
    expect((await res.json()).user.roles).toEqual(['RECRUITER'])
  })

  it('sets session cookies on success and posts credentials to backend', async () => {
    const { POST } = await loadRoute(R)
    const f = mockFetch(async () => jsonRes({ name: 'A', email: 'a@b.co', roles: ['USER'], accessToken: 'tok', tokenType: 'JWT' }))
    const res = await POST(req('/api/auth/login', { email: 'a@b.co', password: 'pw' }))
    expect(f).toHaveBeenCalledWith('http://localhost:8080/api/auth/login', expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'a@b.co', password: 'pw' }) }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, user: { name: 'A', email: 'a@b.co', roles: ['USER'] } })
    expect(res.cookies.get('token')?.value).toBe('tok')
    expect(res.cookies.get('tokenType')?.value).toBe('JWT')
    expect(res.cookies.get('userEmail')?.value).toBe('a@b.co')
    expect(res.cookies.get('userName')?.value).toBe('A')
  })

  it('defaults tokenType to Bearer and uses secure cookies in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({ name: 'A', email: 'a@b.co', roles: [], accessToken: 'tok' }))
    const res = await POST(req('/api/auth/login', { email: 'a@b.co', password: 'pw' }))
    expect(res.cookies.get('tokenType')?.value).toBe('Bearer')
    expect(res.headers.getSetCookie().every((c: string) => /Secure/i.test(c))).toBe(true)
  })

  it('sets no cookies when backend returns no accessToken', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({ name: 'A', email: 'a@b.co', roles: [] }))
    const res = await POST(req('/api/auth/login', { email: 'a@b.co', password: 'pw' }))
    expect(res.status).toBe(200)
    expect(res.cookies.getAll()).toHaveLength(0)
  })

  it('forwards backend error message and status', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({ message: 'Bad credentials' }, 401))
    const res = await POST(req('/api/auth/login', { email: 'a', password: 'b' }))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ success: false, message: 'Bad credentials' })
  })

  it('falls back to "Login failed" when error JSON has no message', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({}, 403))
    const res = await POST(req('/api/auth/login', { email: 'a', password: 'b' }))
    expect(res.status).toBe(403)
    expect((await res.json()).message).toBe('Login failed')
  })

  it('falls back to "Login failed" when error body is not JSON', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes('nope', 502, 'text/plain'))
    const res = await POST(req('/api/auth/login', { email: 'a', password: 'b' }))
    expect(res.status).toBe(502)
    expect((await res.json()).message).toBe('Login failed')
  })

  it('returns 500 when backend is unreachable', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => { throw new Error('ECONNREFUSED') })
    const res = await POST(req('/api/auth/login', { email: 'a', password: 'b' }))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ success: false, message: 'Internal server error' })
  })

  it('returns 500 on malformed request body', async () => {
    const { POST } = await loadRoute(R)
    const res = await POST(req('/api/auth/login', '{not json'))
    expect(res.status).toBe(500)
  })
})
