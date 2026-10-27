import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/resume/basic-search/route'
import { jsonRes, req } from '../../helpers/routeHelpers'
import { mockFetch } from '../../mocks/server'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'log').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('POST /api/resume/basic-search', () => {
  it('proxies job_description to backend and returns result', async () => {
    const f = mockFetch(async () => jsonRes({ candidates: [1, 2] }))
    const res = await POST(req('/api/resume/basic-search', { job_description: 'jd', extra: 'ignored' }))
    expect(f).toHaveBeenCalledWith('http://localhost:8080/api/resume/basic-search', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ job_description: 'jd' }), credentials: 'include',
    }))
    expect(await res.json()).toEqual({ candidates: [1, 2] })
  })
  it('500 when backend responds non-ok', async () => {
    mockFetch(async () => jsonRes({}, 503))
    const res = await POST(req('/api/resume/basic-search', { job_description: 'jd' }))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ success: false, message: 'Internal server error' })
  })
  it('500 when fetch throws', async () => {
    mockFetch(async () => { throw new Error('down') })
    const res = await POST(req('/api/resume/basic-search', { job_description: 'jd' }))
    expect(res.status).toBe(500)
  })
  it('500 on invalid request JSON', async () => {
    const res = await POST(req('/api/resume/basic-search', '{bad'))
    expect(res.status).toBe(500)
  })
})
