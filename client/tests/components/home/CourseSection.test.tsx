// @vitest-environment jsdom
import { expect, it, vi, afterEach } from 'vitest'
import { screen, act } from '@testing-library/react'
import CourseSection, { sampleCourses } from '@/components/home/CourseSection'
import { renderWithProviders } from '../../helpers/renderWithProviders'
import { Draggable } from '../../helpers/gsapMock'

afterEach(() => vi.useRealTimers())

it('renders a card per sample course', () => {
  renderWithProviders(<CourseSection />)
  expect(screen.getByLabelText('Courses carousel container')).toBeInTheDocument()
  for (const c of sampleCourses) expect(screen.getAllByText(c.title).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('article')).toHaveLength(sampleCourses.length)
})

it('creates a draggable when the track overflows the container', async () => {
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', (cb: any) => (cb(0), 0))
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 5000 })
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 1000 })
  const { unmount } = renderWithProviders(<CourseSection />)
  expect(Draggable.create).toHaveBeenCalled()
  await act(async () => { vi.advanceTimersByTime(1100); window.dispatchEvent(new Event('resize')) })
  unmount()
  vi.unstubAllGlobals()
  delete (HTMLElement.prototype as any).scrollWidth
  delete (HTMLElement.prototype as any).offsetWidth
})
