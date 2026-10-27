import { describe, expect, it } from 'vitest'
import { GET } from '@/app/api/auth/check/route'

describe('GET /api/auth/check', () => {
  it('returns success', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })
})
