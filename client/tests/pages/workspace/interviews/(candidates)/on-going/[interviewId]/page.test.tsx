// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@mui/x-charts/Gauge', () => ({ Gauge: (p: any) => <div data-testid="gauge" data-value={p.value} /> }))
const agentProps = vi.hoisted(() => ({ last: null as any }))
vi.mock('@/components/workspace/candidates/interviews/on-going/ConsentModal', () => ({
  default: ({ setIsStarted }: any) => <button onClick={() => setIsStarted(false)}>consent</button>,
}))
vi.mock('@/components/workspace/candidates/interviews/on-going/InterviewAgent', () => ({
  default: (p: any) => { agentProps.last = p; return <div data-testid="agent" /> },
}))

import Page from '@/app/workspace/interviews/(candidates)/on-going/[interviewId]/page'

describe('Interview on-going page', () => {
  it('starts on the consent step with an empty transcript and 1% confidence', () => {
    render(<Page />)
    expect(screen.getByText('consent')).toBeInTheDocument()
    expect(screen.queryByTestId('agent')).not.toBeInTheDocument()
    expect(screen.getByTestId('gauge')).toHaveAttribute('data-value', '1')
    expect(screen.getByText('Live Transcript')).toBeInTheDocument()
  })

  it('switches to the interview agent after consent and wires state setters', async () => {
    const { container } = render(<Page />)
    await userEvent.click(screen.getByText('consent'))
    expect(screen.getByTestId('agent')).toBeInTheDocument()

    act(() => agentProps.last.setTranscript([{ role: 'user', text: 'Hi there' }, { role: 'assistant', text: 'Welcome' }]))
    expect(screen.getByText('Hi there')).toHaveClass('self-end')
    expect(screen.getByText('Welcome')).toHaveClass('self-start')

    act(() => agentProps.last.setOverallPerformance(72.9))
    expect(screen.getByTestId('gauge')).toHaveAttribute('data-value', '72')

    expect(container.querySelectorAll('span span').length).toBe(0)
    act(() => agentProps.last.setIsSpeaking(true))
    expect(container.querySelectorAll('span span').length).toBeGreaterThan(0)
  })

  it('stops the vapi session from the hang-up button', async () => {
    render(<Page />)
    await userEvent.click(screen.getByText('consent'))
    const stop = vi.fn()
    act(() => agentProps.last.setVapi({ stop }))
    await userEvent.click(document.querySelector('button.bg-gray-900')!)
    expect(stop).toHaveBeenCalled()
  })

  it('hang-up is harmless before a vapi instance exists', async () => {
    render(<Page />)
    await userEvent.click(document.querySelector('button.bg-gray-900')!)
  })
})
