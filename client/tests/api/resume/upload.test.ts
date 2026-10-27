import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/resume/upload/route'
import { jsonRes } from '../../helpers/routeHelpers'
import { mockFetch } from '../../mocks/server'

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const formReq = (withFile = true) => {
  const fd = new FormData()
  if (withFile) fd.append('file', new Blob(['%PDF'], { type: 'application/pdf' }), 'cv.pdf')
  return { formData: async () => fd } as any
}

describe('POST /api/resume/upload', () => {
  it('forwards the form data to the AI server', async () => {
    const f = mockFetch(async () => jsonRes({ success: true, data: { id: 1 } }))
    const res = await POST(formReq())
    expect(f).toHaveBeenCalledWith('http://localhost:5000/api/resume/upload', expect.objectContaining({ method: 'POST' }))
    expect((f.mock.calls[0][1] as any).body).toBeInstanceOf(FormData)
    expect(await res.json()).toEqual({ success: true, data: { id: 1 } })
  })
  it('500 when AI server is non-ok', async () => {
    mockFetch(async () => jsonRes({}, 500))
    const res = await POST(formReq())
    expect(res.status).toBe(500)
    const j = await res.json()
    expect(j.error).toBe('Failed to process resume upload')
    expect(j.details).toContain('500')
  })
  it('500 when fetch throws an Error', async () => {
    mockFetch(async () => { throw new Error('down') })
    const res = await POST(formReq())
    expect((await res.json()).details).toBe('down')
  })
  it('"Unknown error" when a non-Error is thrown', async () => {
    mockFetch(async () => { throw 'x' })
    const res = await POST(formReq())
    expect((await res.json()).details).toBe('Unknown error')
  })
})
