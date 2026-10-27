// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InterviewShowcase from '@/components/home/InterviewShowcase'

it('toggles video playback via the overlay button', async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  render(<InterviewShowcase />)
  await userEvent.click(screen.getByRole('button'))
  expect(play).toHaveBeenCalledTimes(1)
  expect(screen.getByAltText(/Play/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button'))
  expect(pause).toHaveBeenCalledTimes(1)
  expect(screen.getByAltText(/Pause/)).toBeInTheDocument()
})
