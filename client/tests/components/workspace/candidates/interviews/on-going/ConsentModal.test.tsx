// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConsentModal from '@/components/workspace/candidates/interviews/on-going/ConsentModal'

afterEach(() => vi.useRealTimers())

describe('ConsentModal', () => {
  it('renders the consent text with Accept disabled until consent is checked', async () => {
    render(<ConsentModal setIsStarted={vi.fn()} />)
    expect(screen.getByText(/Consent to Participate/)).toBeInTheDocument()
    const accept = screen.getByRole('button', { name: 'Accept & Continue' })
    expect(accept).toBeDisabled()
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(3)
    await userEvent.click(boxes[0])
    expect(accept).toBeEnabled()
    await userEvent.click(boxes[1])
    await userEvent.click(boxes[2])
    expect(boxes[1]).toBeChecked()
    expect(boxes[2]).toBeChecked()
  })

  it('accepting records consent then calls setIsStarted(false) after the delay', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const setIsStarted = vi.fn()
    render(<ConsentModal setIsStarted={setIsStarted} />)
    await userEvent.click(screen.getAllByRole('checkbox')[0])
    await userEvent.click(screen.getByRole('button', { name: 'Accept & Continue' }))
    expect(screen.getByText('Consent Recorded')).toBeInTheDocument()
    expect(setIsStarted).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(2000) })
    expect(setIsStarted).toHaveBeenCalledWith(false)
  })

  it('declining shows the declined panel with a contact link', async () => {
    render(<ConsentModal setIsStarted={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Decline' }))
    expect(screen.getByText('Consent Declined')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'privacy@evalia.ai' })).toHaveAttribute('href', 'mailto:privacy@evalia.ai')
  })
})
