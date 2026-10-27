import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/resume/advanced-search/route'
import { req } from '../../helpers/routeHelpers'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe('POST /api/resume/advanced-search', () => {
  it('returns both mock candidates by default (topK 10) and echoes params', async () => {
    const body = { jobDescription: 'jd', industry: 'i', skills: ['a'], projects: [], education: 'e', minExperience: 2, weights: { a: 1 }, topK: undefined }
    const res = await POST(req('/api/resume/advanced-search', body))
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.candidates).toHaveLength(2)
    expect(json.candidates[0].name).toBe('John Doe')
    expect(json.searchParams).toMatchObject({ jobDescription: 'jd', industry: 'i', minExperience: 2, weights: { a: 1 } })
  })
  it('applies topK', async () => {
    const res = await POST(req('/api/resume/advanced-search', { topK: 1 }))
    expect((await res.json()).candidates).toHaveLength(1)
  })
  it('topK of 0 falls back to default', async () => {
    const res = await POST(req('/api/resume/advanced-search', { topK: 0 }))
    expect((await res.json()).candidates).toHaveLength(2)
  })
  it('500 on invalid JSON', async () => {
    const res = await POST(req('/api/resume/advanced-search', '{bad'))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ success: false, message: 'Internal server error' })
  })
})
