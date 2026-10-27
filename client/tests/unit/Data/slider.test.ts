import { describe, expect, it } from 'vitest'
import imagesArray from '@/Data/slider'

describe('slider images', () => {
  it('has four images with ids 1..4', () => {
    expect(imagesArray.map((i) => i.id)).toEqual([1, 2, 3, 4])
  })
  it('urls are https', () => {
    for (const i of imagesArray) expect(i.url).toMatch(/^https:\/\//)
  })
})
