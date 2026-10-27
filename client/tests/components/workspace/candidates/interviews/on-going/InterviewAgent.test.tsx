// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import axios from '@/tests/helpers/axiosMock'
import InterviewAgent from '@/components/workspace/candidates/interviews/on-going/InterviewAgent'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { setNav } from '../../../../../helpers/navMock'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('@/components/workspace/candidates/interviews/on-going/ConfidenceAnalysis', () => ({
  default: ({ isEndEvaluation }: any) => <div>confidence-{String(isEndEvaluation)}</div>,
}))

const vapi = vi.hoisted(() => {
  const handlers: Record<string, any> = {}
  return { handlers, on: vi.fn((e: string, cb: any) => { handlers[e] = cb }), start: vi.fn().mockResolvedValue(undefined), stop: vi.fn() }
})
vi.mock('@vapi-ai/web', () => ({ default: vi.fn(() => vapi) }))

const props = () => ({ vapi: null as any, setVapi: vi.fn(), setIsSpeaking: vi.fn(), transcript: [], setTranscript: vi.fn(), setOverallPerformance: vi.fn() })

beforeEach(() => {
  setNav({ pathname: '/workspace/interviews/on-going/int-1' })
  axios.get.mockReset(); axios.post.mockReset()
  axios.get.mockRejectedValue(new Error('x'))
  axios.post.mockResolvedValue({ data: {} })
  vapi.start.mockClear(); vapi.stop.mockClear()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('InterviewAgent', () => {
  it('creates the vapi instance and fetches interview details', async () => {
    const p = props()
    renderWithProviders(<InterviewAgent {...p} />)
    expect(p.setVapi).toHaveBeenCalledWith(vapi)
    expect(screen.getByText('confidence-false')).toBeInTheDocument()
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/interviews/int-1'), expect.anything()))
  })

  it('wires speech events and accumulates transcript messages', () => {
    const p = props()
    renderWithProviders(<InterviewAgent {...p} />)
    act(() => vapi.handlers['speech-start']())
    expect(p.setIsSpeaking).toHaveBeenCalledWith(true)
    act(() => vapi.handlers['speech-end']())
    expect(p.setIsSpeaking).toHaveBeenLastCalledWith(false)
    act(() => vapi.handlers['call-start']())
    act(() => vapi.handlers.error(new Error('boom')))
    act(() => vapi.handlers.message({ type: 'other' }))
    expect(p.setTranscript).not.toHaveBeenCalled()
    act(() => vapi.handlers.message({ type: 'transcript', role: 'user', transcript: 'hi' }))
    const updater = p.setTranscript.mock.calls[0][0]
    expect(updater([])).toEqual([{ role: 'user', text: 'hi' }])
  })

  it('on call end posts the transcript and previews the summary', async () => {
    const p = props()
    const { store } = renderWithProviders(<InterviewAgent {...p} />)
    await act(async () => { await vapi.handlers['call-end']() })
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/interviews/int-1/transcript'), { transcript: [] }, expect.anything())
    expect(store.getState().interview.previewedInterviewSummaryId).toBe('int-1')
  })

  it('on call end failure clears the evaluation overlay', async () => {
    axios.post.mockRejectedValue(new Error('fail'))
    const p = props()
    renderWithProviders(<InterviewAgent {...p} />)
    await act(async () => { await vapi.handlers['call-end']() })
    expect(screen.queryByText(/evaluation is in progress/)).not.toBeInTheDocument()
  })

  it('starts the call once questions are loaded and vapi is provided', async () => {
    axios.get.mockResolvedValue({ data: { data: { jobTitle: 'Dev', questionsAnswers: [{ question: 'Q1' }] } } })
    const p = { ...props(), vapi }
    renderWithProviders(<InterviewAgent {...p} />, { preloadedState: { auth: { user: { user: { name: 'Sam' } } } } })
    await waitFor(() => expect(vapi.start).toHaveBeenCalledTimes(1))
    expect(vapi.start.mock.calls[0][0].firstMessage).toContain('Sam')
    expect(vapi.start.mock.calls[0][0].model.messages[0].content).toContain('Q1,')
  })

  it('stops vapi on unmount', () => {
    const { unmount } = renderWithProviders(<InterviewAgent {...props()} />)
    unmount()
    expect(vapi.stop).toHaveBeenCalled()
  })
})
