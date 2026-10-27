// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const setCookie = (email: string) => {
  document.cookie = `userEmail=${encodeURIComponent(email)}; path=/`
}
const clearCookie = () => {
  document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

describe('mockApi route with cookies', () => {
  beforeEach(() => {
    vi.resetModules()
    clearCookie()
  })

  it('serves the candidate user and persists updates per session', async () => {
    const { route } = await import('@/lib/demo/mockApi')
    setCookie('candidate@demo.evalia.app')
    expect(route({ method: 'get', path: 'user/profile', body: undefined }).data.data.user.roles).toContain('USER')
    const upd = route({ method: 'patch', path: 'user/update/details', body: { bio: 'new bio' } })
    expect(upd.data.data.bio).toBe('new bio')
    expect(route({ method: 'get', path: 'user/profile', body: undefined }).data.data.user.bio).toBe('new bio')
    route({ method: 'post', path: 'resume/save', body: { industry: 'Z' } })
    expect(route({ method: 'get', path: 'user/profile', body: undefined }).data.data.resumeData).toEqual({ industry: 'Z' })
  })

  it('switches to recruiter fixtures when cookie says recruiter', async () => {
    const { route } = await import('@/lib/demo/mockApi')
    setCookie('recruiter@demo.evalia.app')
    expect(route({ method: 'get', path: 'user/profile', body: undefined }).data.data.user.roles).toContain('RECRUITER')
    setCookie('candidate@demo.evalia.app')
    expect(route({ method: 'get', path: 'user/profile', body: undefined }).data.data.user.roles).toContain('USER')
  })
})

describe('installDemoApi', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    delete (window as any).__evaliaDemo
  })

  it('does nothing when DEMO is off', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'false')
    const { installDemoApi } = await import('@/lib/demo/mockApi')
    const before = window.fetch
    installDemoApi()
    expect(window.fetch).toBe(before)
    expect((window as any).__evaliaDemo).toBeUndefined()
  })

  it('patches axios and fetch in demo mode, only once', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true')
    const realFetch = vi.fn(async () => new Response('real', { status: 200 }))
    window.fetch = realFetch as any
    const axios = (await import('axios')).default
    const { installDemoApi } = await import('@/lib/demo/mockApi')
    installDemoApi()
    expect((window as any).__evaliaDemo).toBe(true)
    const patchedFetch = window.fetch
    installDemoApi() // second call is a no-op
    expect(window.fetch).toBe(patchedFetch)

    // fetch: backend url is intercepted (string, URL, Request forms)
    const r1 = await window.fetch('http://localhost:8080/api/job/active-jobs?x=1')
    expect((await r1.json()).data.jobs.length).toBeGreaterThan(0)
    const r2 = await window.fetch(new URL('http://localhost:4000/api/notifications'))
    expect((await r2.json()).data.length).toBe(3)
    const r3 = await window.fetch({ url: 'http://localhost:5000/course/save', } as any, { method: 'POST', body: JSON.stringify({ videoId: 'abc' }) })
    expect((await r3.json()).data.savedCourses.some((c: any) => c.videoId === 'abc')).toBe(true)
    // invalid JSON string body is passed through as string
    const r4 = await window.fetch('http://localhost:8080/api/resume/save', { method: 'POST', body: 'not json' })
    expect(r4.status).toBe(200)
    // non-backend -> real fetch
    await window.fetch('https://example.com/x')
    expect(realFetch).toHaveBeenCalledWith('https://example.com/x', undefined)

    // axios: backend url intercepted via adapter
    vi.useFakeTimers()
    const p = axios.get('http://localhost:8080/api/job/active-jobs/')
    await vi.advanceTimersByTimeAsync(200)
    const res = await p
    expect(res.status).toBe(200)
    expect(res.data.data.jobs.length).toBeGreaterThan(0)
    const p2 = axios.post('http://localhost:8080/api/course/save', { videoId: 'zz' })
    await vi.advanceTimersByTimeAsync(200)
    expect((await p2).data.data.savedCourses.length).toBeGreaterThan(0)
    const p3 = axios.post('http://localhost:8080/api/resume/save', 'oops-not-json')
    await vi.advanceTimersByTimeAsync(200)
    expect((await p3).status).toBe(200)
    vi.useRealTimers()
  })

  it('axios passes non-backend urls to the real adapter', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true')
    const axios = (await import('axios')).default
    const { installDemoApi } = await import('@/lib/demo/mockApi')
    installDemoApi()
    // Unreachable host: real adapter is invoked and rejects (no demo response).
    await expect(axios.get('http://127.0.0.1:1/never', { timeout: 500 })).rejects.toBeTruthy()
  })
})
