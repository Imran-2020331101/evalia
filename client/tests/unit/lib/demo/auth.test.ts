import { afterEach, describe, expect, it, vi } from 'vitest'
import { demoLogin, demoOk } from '@/lib/demo/auth'

afterEach(() => vi.unstubAllEnvs())

describe('demoLogin', () => {
  it('treats emails containing "recruiter" (any case) as recruiter', async () => {
    const res = demoLogin('Hello.RECRUITER@x.io')
    const body = await res.json()
    expect(body.user).toMatchObject({ name: 'Jordan Hayes', roles: ['RECRUITER'] })
    expect(res.cookies.get('userEmail')?.value).toBe('recruiter@demo.evalia.app')
  })
  it('defaults to candidate when email is undefined', async () => {
    const res = demoLogin()
    expect((await res.json()).user.roles).toEqual(['USER'])
    expect(res.cookies.get('userName')?.value).toBe('Alex Rahman')
  })
  it('sets httpOnly on token cookies only', () => {
    const res = demoLogin('a@b.c')
    expect(res.cookies.get('token')?.value).toBe('demo-token')
    expect(res.cookies.get('tokenType')?.value).toBe('Bearer')
    const header = res.headers.getSetCookie().join('\n')
    expect(header).toMatch(/token=demo-token;.*HttpOnly/i)
    expect(header).toMatch(/userEmail=[^\n]*Max-Age=86400/i)
    expect(header.split('\n').find((l) => l.startsWith('userEmail'))).not.toMatch(/HttpOnly/i)
  })
  it('sets secure cookies in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const header = demoLogin('a@b.c').headers.getSetCookie().join('\n')
    expect(header).toMatch(/Secure/i)
  })
})

describe('demoOk', () => {
  it('defaults message to ok', async () => {
    expect(await demoOk().json()).toEqual({ success: true, message: 'ok' })
  })
  it('uses custom message', async () => {
    expect(await demoOk('hi').json()).toEqual({ success: true, message: 'hi' })
  })
})
