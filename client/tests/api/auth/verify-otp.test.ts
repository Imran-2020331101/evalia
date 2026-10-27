import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonRes, loadRoute, req } from '../../helpers/routeHelpers'
import { mockFetch } from '../../mocks/server'

const R = '@/app/api/auth/verify-otp/route'

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('POST /api/auth/verify-otp', () => {
  it('demo mode logs in', async () => {
    const { POST } = await loadRoute(R, true)
    const res = await POST(req('/api/auth/verify-otp', { email: 'a@b.co', otp: '1' }))
    expect((await res.json()).user.roles).toEqual(['USER'])
  })

  it.each([
    [{ email: 'a@b.co' }, 'Email and OTP are required'],
    [{ otp: '1234' }, 'Email and OTP are required'],
    [{ email: 'a@b.co', otp: '123' }, 'OTP must be 4 digits'],
    [{ email: 'a@b.co', otp: '12a4' }, 'OTP must be 4 digits'],
  ])('validates %#', async (body, message) => {
    const { POST } = await loadRoute(R)
    const res = await POST(req('/api/auth/verify-otp', body))
    expect(res.status).toBe(400)
    expect((await res.json()).message).toBe(message)
  })

  it('verifies successfully (JSON)', async () => {
    const { POST } = await loadRoute(R)
    const f = mockFetch(async () => jsonRes({ message: 'verified', data: { a: 1 } }))
    const res = await POST(req('/api/auth/verify-otp', { email: 'a@b.co', otp: '1234' }))
    expect(f).toHaveBeenCalledWith('http://localhost:8080/api/auth/verify', expect.objectContaining({ body: JSON.stringify({ email: 'a@b.co', otp: '1234' }) }))
    expect(await res.json()).toEqual({ success: true, message: 'verified', data: { a: 1 } })
  })

  it('defaults message/data when JSON lacks them', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes({}))
    const res = await POST(req('/api/auth/verify-otp', { email: 'a@b.co', otp: '1234' }))
    expect(await res.json()).toEqual({ success: true, message: 'Email verified successfully', data: null })
  })

  it('handles plain text success', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => jsonRes('all good', 200, 'text/plain'))
    const res = await POST(req('/api/auth/verify-otp', { email: 'a@b.co', otp: '1234' }))
    expect((await res.json()).message).toBe('all good')
  })

  it('forwards backend errors with fallbacks', async () => {
    const { POST } = await loadRoute(R)
    const body = { email: 'a@b.co', otp: '1234' }
    mockFetch(async () => jsonRes({ message: 'Invalid OTP' }, 400))
    let res = await POST(req('/api/auth/verify-otp', body))
    expect(res.status).toBe(400)
    expect((await res.json()).message).toBe('Invalid OTP')
    mockFetch(async () => jsonRes({}, 400))
    res = await POST(req('/api/auth/verify-otp', body))
    expect((await res.json()).message).toBe('OTP verification failed')
    mockFetch(async () => ({ ok: false, status: 410, json: async () => { throw new Error() }, text: async () => 'expired', headers: new Headers() }))
    res = await POST(req('/api/auth/verify-otp', body))
    expect(res.status).toBe(410)
    expect((await res.json()).message).toBe('expired')
    mockFetch(async () => ({ ok: false, status: 410, json: async () => { throw new Error() }, text: async () => '', headers: new Headers() }))
    res = await POST(req('/api/auth/verify-otp', body))
    expect((await res.json()).message).toBe('OTP verification failed')
  })

  it('500 when fetch throws', async () => {
    const { POST } = await loadRoute(R)
    mockFetch(async () => { throw new Error('down') })
    const res = await POST(req('/api/auth/verify-otp', { email: 'a@b.co', otp: '1234' }))
    expect(res.status).toBe(500)
  })
})
