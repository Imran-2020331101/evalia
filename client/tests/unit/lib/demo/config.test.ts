import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('demo config', () => {
  it('DEMO is false by default', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', '')
    const c = await import('@/lib/demo/config')
    expect(c.DEMO).toBe(false)
  })
  it('DEMO is true when env is "true"', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true')
    const c = await import('@/lib/demo/config')
    expect(c.DEMO).toBe(true)
  })
  it('exports demo emails', async () => {
    const c = await import('@/lib/demo/config')
    expect(c.DEMO_CANDIDATE_EMAIL).toBe('candidate@demo.evalia.app')
    expect(c.DEMO_RECRUITER_EMAIL).toBe('recruiter@demo.evalia.app')
  })
})
