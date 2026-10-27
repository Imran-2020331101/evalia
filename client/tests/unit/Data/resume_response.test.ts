import { describe, expect, it } from 'vitest'
import { ResumeResponse } from '@/Data/resume_response'

describe('ResumeResponse sample', () => {
  const d: any = (ResumeResponse as any).data
  it('is a successful response', () => {
    expect((ResumeResponse as any).success).toBe(true)
  })
  it('has expected resume sections', () => {
    for (const k of ['skills', 'experience', 'education', 'projects', 'contact', 'certifications', 'metadata', 'analysis']) {
      expect(d).toHaveProperty(k)
    }
    expect(d.skills.technical.length).toBeGreaterThan(0)
    expect(d.status).toBe('completed')
  })
  it('processedAt is a valid Date', () => {
    expect(d.processedAt).toBeInstanceOf(Date)
    expect(Number.isNaN(d.processedAt.getTime())).toBe(false)
  })
})
