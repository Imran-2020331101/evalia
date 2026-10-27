import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonRes, loadRoute, req } from '../../helpers/routeHelpers'
import { mockFetch } from '../../mocks/server'

const R = '@/app/api/auth/register/route'
const good = { name: 'A', email: 'a@b.co', password: 'secret1', role: 'USER' }

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('POST /api/auth/register', () => {
  it('demo mode returns ok without calling backend', async () => {
    const { POST } = await loadRoute(R, true)
    const f = mockFetch(async () => jsonRes({}))
    const res = await POST(req('/api/auth/register', {}))
    expect(f).not.toHaveBeenCalled()
    expect(await res.json()).toEqual({ success: true, message: 'Registered (demo)' })
  })

  it.each([
    [{ email: 'a@b.co', password: 'secret1' }, 'All fields are required'],
    [{ name: 'A', password: 'secret1' }, 'All fields are required'],
    [{ name: 'A', email: 'a@b.co' }, 'All fields are required'],
    [{ ...good, password: '123' }, 'Password must be at least 6 characters long'],
    [{ ...good, email: 'not-an-email' }, 'Please enter a valid email address'],
  ])('validates input %#', async (body, message) => {
    const { POST } = await loadRoute(R)
    const f = mockFetch(async () => jsonRes({}))
    const res = await POST(req('/api/auth/register', body))
    expect(res.status).toBe(400)
    expect((await res.json()).message).toBe(message)
    expect(f).not.toHaveBeenCalled()
  })

  it('registers via JSON response and sets token cookies', async () => {
    const { POST } = await loadRoute(R)
    const f = mockFetch(async () => jsonRes({ accessToken: 't', tokenType: 'JWT' }))
    const res = await POST(req('/api/auth/register', good))
    expect(f).toHaveBeenCalledWith('http://localhost:8080/api/auth/register', expect.objectContaining({ body: JSON.stringify(good) }))
    expect(await res.json()).toEqual({ success: true })
    expect(res.cookies.get('token')?.value).toBe('t')
    expect(res.cookies.get('tokenType')?.value).toBe('JWT')
  })

  it('defaults tokenType to Bearer', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({ accessToken: 't' }))
    const res = await POST(req('/api/auth/register', good))
    expect(res.cookies.get('tokenType')?.value).toBe('Bearer')
  })

  it('success without accessToken sets no cookies', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({}))
    const res = await POST(req('/api/auth/register', good))
    expect(res.cookies.getAll()).toHaveLength(0)
  })

  it('parses non-JSON content-type body as JSON text', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({ accessToken: 'x' }, 200, 'text/plain'))
    const res = await POST(req('/api/auth/register', good))
    expect(res.cookies.get('token')?.value).toBe('x')
  })

  it('plain-text non-JSON success body (e.g. "User registered success!") yields 500', async () => {
    // Documents current behaviour: route JSON.parses plain text and throws.
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes('User registered success!', 200, 'text/plain'))
    const res = await POST(req('/api/auth/register', good))
    expect(res.status).toBe(500)
  })

  it('missing content-type header treated as non-JSON', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => new Response(JSON.stringify({ accessToken: 'q' }), { status: 200 }))
    const res = await POST(req('/api/auth/register', good))
    // Response with string body defaults to text/plain content-type
    expect(res.cookies.get('token')?.value).toBe('q')
  })

  it('forwards backend JSON error', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({ message: 'Email exists' }, 409))
    const res = await POST(req('/api/auth/register', good))
    expect(res.status).toBe(409)
    expect((await res.json()).message).toBe('Email exists')
  })

  it('uses default message when error JSON lacks message', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({}, 400))
    const res = await POST(req('/api/auth/register', good))
    expect((await res.json()).message).toBe('Registration failed')
  })

  it('reads text when error body is not JSON', async () => {
    const { POST } = await loadRoute(R)
    // json() consumes body and fails; make text() available via a stub response
    mockFetch(async () => ({
      ok: false, status: 422,
      json: async () => { throw new Error('bad json') },
      text: async () => 'plain error',
      headers: new Headers(),
    }))
    const res = await POST(req('/api/auth/register', good))
    expect(res.status).toBe(422)
    expect((await res.json()).message).toBe('plain error')
  })

  it('uses default message when error text is empty', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => ({ ok: false, status: 500, json: async () => { throw new Error() }, text: async () => '', headers: new Headers() }))
    const res = await POST(req('/api/auth/register', good))
    expect((await res.json()).message).toBe('Registration failed')
  })

  it('returns 500 if backend throws', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => { throw new Error('down') })
    const res = await POST(req('/api/auth/register', good))
    expect(res.status).toBe(500)
  })
})
