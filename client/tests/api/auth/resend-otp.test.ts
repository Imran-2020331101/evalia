import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonRes, loadRoute, req } from '../../helpers/routeHelpers'
import { mockFetch } from '../../mocks/server'

const R = '@/app/api/auth/resend-otp/route'

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('POST /api/auth/resend-otp', () => {
  it('demo mode', async () => {
    const { POST } = await loadRoute(R, true)
    const res = await POST(req('/api/auth/resend-otp', { email: 'a@b.co' }))
    expect(await res.json()).toEqual({ success: true, message: 'OTP resent (demo)' })
  })

  it('requires email', async () => {
    const { POST } = await loadRoute(R)
    const res = await POST(req('/api/auth/resend-otp', {}))
    expect(res.status).toBe(400)
    expect((await res.json()).message).toBe('Email is required')
  })

  it('validates email format', async () => {
    const { POST } = await loadRoute(R)
    const res = await POST(req('/api/auth/resend-otp', { email: 'bad' }))
    expect(res.status).toBe(400)
    expect((await res.json()).message).toBe('Please enter a valid email address')
  })

  it('success with JSON body', async () => {
    const { POST } = await loadRoute(R)
    const f = mockFetch(async () => jsonRes({ message: 'sent', data: { x: 1 } }))
    const res = await POST(req('/api/auth/resend-otp', { email: 'a@b.co' }))
    expect(f).toHaveBeenCalledWith('http://localhost:8080/api/auth/resend-otp', expect.objectContaining({ body: JSON.stringify({ email: 'a@b.co' }) }))
    expect(await res.json()).toEqual({ success: true, message: 'sent', data: { x: 1 } })
  })

  it('success with JSON body lacking message/data uses defaults', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({}))
    const res = await POST(req('/api/auth/resend-otp', { email: 'a@b.co' }))
    expect(await res.json()).toEqual({ success: true, message: 'OTP has been resent to your email', data: null })
  })

  it('success with plain text body', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes('OTP sent text', 200, 'text/plain'))
    const res = await POST(req('/api/auth/resend-otp', { email: 'a@b.co' }))
    expect((await res.json()).message).toBe('OTP sent text')
  })

  it('forwards JSON error and default message', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({ message: 'too soon' }, 429))
    let res = await POST(req('/api/auth/resend-otp', { email: 'a@b.co' }))
    expect(res.status).toBe(429)
    expect((await res.json()).message).toBe('too soon')
    mockFetch(async () => jsonRes({}, 400))
    res = await POST(req('/api/auth/resend-otp', { email: 'a@b.co' }))
    expect((await res.json()).message).toBe('Failed to resend OTP')
  })

  it('reads text on non-JSON error, and falls back when empty', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => ({ ok: false, status: 500, json: async () => { throw new Error() }, text: async () => 'oops', headers: new Headers() }))
    let res = await POST(req('/api/auth/resend-otp', { email: 'a@b.co' }))
    expect((await res.json()).message).toBe('oops')
    mockFetch(async () => ({ ok: false, status: 500, json: async () => { throw new Error() }, text: async () => '', headers: new Headers() }))
    res = await POST(req('/api/auth/resend-otp', { email: 'a@b.co' }))
    expect((await res.json()).message).toBe('Failed to resend OTP')
  })

  it('500 on thrown error', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => { throw new Error('down') })
    const res = await POST(req('/api/auth/resend-otp', { email: 'a@b.co' }))
    expect(res.status).toBe(500)
  })
})
