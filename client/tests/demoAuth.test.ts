import { describe, expect, it } from 'vitest'
import { demoLogin } from '@/lib/demo/auth'

describe('demoLogin', () => {
  it('signs in a recruiter when the email says so', async () => {
    const body = await demoLogin('recruiter@demo.evalia.app').json()
    expect(body.user.roles).toEqual(['RECRUITER'])
  })

  it('defaults to a candidate and sets session cookies', async () => {
    const res = demoLogin('anyone@example.com')
    expect((await res.json()).user.roles).toEqual(['USER'])
    expect(res.cookies.get('userEmail')?.value).toBe('candidate@demo.evalia.app')
  })
})
