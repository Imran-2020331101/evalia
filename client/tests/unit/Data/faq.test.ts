import { describe, expect, it } from 'vitest'
import { FAQ } from '@/Data/faq'

describe('FAQ data', () => {
  it('has entries with non-empty question and answer', () => {
    expect(FAQ.length).toBeGreaterThan(0)
    for (const f of FAQ) {
      expect(f.question.trim().length).toBeGreaterThan(0)
      expect(f.answer.trim().length).toBeGreaterThan(0)
    }
  })
  it('questions are unique', () => {
    const q = FAQ.map((f) => f.question)
    expect(new Set(q).size).toBe(q.length)
  })
})
