import { describe, expect, it } from 'vitest'
import { services } from '@/Data/home'

describe('home services', () => {
  it('has six services with sequential ids', () => {
    expect(services.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6])
  })
  it('every service has name, title, description and https url', () => {
    for (const s of services) {
      expect(s.name && s.title && s.description).toBeTruthy()
      expect(s.url).toMatch(/^https:\/\//)
    }
  })
  it('names are unique', () => {
    expect(new Set(services.map((s) => s.name)).size).toBe(services.length)
  })
})
