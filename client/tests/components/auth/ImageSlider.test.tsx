// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import ImageSlider from '@/components/auth/ImageSlider'
import imagesArray from '@/Data/slider'

afterEach(() => vi.useRealTimers())

it('renders all slider images', () => {
  const { container } = render(<ImageSlider />)
  expect(container.querySelectorAll('img')).toHaveLength(imagesArray.length)
})

it('slides on the interval, reversing direction at the start', () => {
  vi.useFakeTimers()
  const { container } = render(<ImageSlider />)
  const first = () => (container.querySelector('img')!.parentElement as HTMLElement).style.transform
  expect(first()).toBe('translateX(-0%)')
  act(() => { vi.advanceTimersByTime(10000) }) // flips direction
  act(() => { vi.advanceTimersByTime(10000) }) // moves forward
  expect(first()).toBe('translateX(-100%)')
})

it('clears its interval on unmount', () => {
  vi.useFakeTimers()
  const spy = vi.spyOn(globalThis, 'clearInterval')
  const { unmount } = render(<ImageSlider />)
  unmount()
  expect(spy).toHaveBeenCalled()
})
