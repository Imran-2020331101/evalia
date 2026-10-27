import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/resume/save/route'
import { req } from '../../helpers/routeHelpers'

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('POST /api/resume/save', () => {
  it('saves after the simulated delay and returns an id', async () => {
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
    const p = POST(req('/api/resume/save', { skills: [] }))
    await vi.advanceTimersByTimeAsync(1000)
    const res = await p
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json).toMatchObject({ success: true, message: 'Resume saved successfully' })
    expect(json.id).toMatch(/^resume_\d+$/)
  })
  it('500 with details for an Error', async () => {
    const res = await POST(req('/api/resume/save', '{bad'))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Failed to save resume')
    expect(typeof json.details).toBe('string')
    expect(json.details).not.toBe('Unknown error')
  })
  it('500 with "Unknown error" for non-Error throws', async () => {
    const bad: any = { json: () => Promise.reject('string-reason') }
    const res = await POST(bad)
    expect(res.status).toBe(500)
    expect((await res.json()).details).toBe('Unknown error')
  })
})
