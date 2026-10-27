// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import NProgress from 'nprogress'
import ProgressBar from '@/components/utils/ProgressBar'
import { setNav } from '../../helpers/navMock'

afterEach(() => vi.useRealTimers())

it('does not start on first render, starts and finishes on path change', () => {
  vi.useFakeTimers()
  const start = vi.spyOn(NProgress, 'start')
  const done = vi.spyOn(NProgress, 'done')
  const { rerender, container } = render(<ProgressBar />)
  expect(container).toBeEmptyDOMElement()
  expect(start).not.toHaveBeenCalled()
  setNav({ pathname: '/next' })
  rerender(<ProgressBar />)
  expect(start).toHaveBeenCalledTimes(1)
  act(() => { vi.advanceTimersByTime(500) })
  expect(done).toHaveBeenCalled()
})
