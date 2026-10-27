import { describe, expect, it } from 'vitest'
import { GET } from '@/app/api/auth/token/route'

describe('GET /api/auth/token', () => {
  it('returns success', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })
})
