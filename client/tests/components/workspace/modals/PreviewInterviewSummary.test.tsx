// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import PreviewInterviewSummary, { dummyEvaluation } from '@/components/workspace/modals/PreviewInterviewSummary'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('@mui/x-charts/BarChart', () => ({ BarChart: () => <div data-testid="bar-chart" /> }))

const interview = {
  summary: 'Great candidate overall',
  questionsAnswers: [
    { question: 'Tell me about you', candidateAnswer: 'I am Sam' },
    { question: 'Unanswered', candidateAnswer: '' },
  ],
}
const evaluation = {
  overallScore: 0.78, contentAggregate: 80, commAggregate: 70, integrityAggregate: 60, responsivenessAggregate: 90, modelVersion: '1.3', reviewerId: 'r',
  flags: ['low_eye_contact'], publishedAt: '2025-01-01T00:00:00Z',
  perQuestion: [{ questionIndex: 0, contentScore: 85, communicationScore: 80, finalScore: 83, keywordsMatched: ['react', 'hooks'], fillerRate: 0.03 }],
}

beforeEach(() => {
  axios.get.mockReset()
  axios.get.mockImplementation((url: string) =>
    url.endsWith('/evaluation') ? Promise.resolve({ data: { data: evaluation } }) : Promise.resolve({ data: { data: interview } }))
})

describe('PreviewInterviewSummary', () => {
  it('exports dummy evaluation data', () => {
    expect(dummyEvaluation.perQuestion).toHaveLength(5)
  })

  it('is hidden when no summary id is selected', () => {
    const { container } = renderWithProviders(<PreviewInterviewSummary />)
    expect(container.firstChild).toHaveClass('hidden')
  })

  it('loads and renders evaluation and transcript', async () => {
    renderWithProviders(<PreviewInterviewSummary />, { preloadedState: { interview: { previewedInterviewSummaryId: 'i1' } } })
    expect(await screen.findByText('Interview Summary')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/interviews/i1/evaluation'), expect.anything())
    expect(screen.getByText('78%')).toBeInTheDocument()
    expect(screen.getByText('1 questions')).toBeInTheDocument()
    expect(screen.getByText('v1.3')).toBeInTheDocument()
    expect(screen.getByText('Reviewed')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByText('Great candidate overall')).toBeInTheDocument()
    expect(await screen.findByText('I am Sam')).toBeInTheDocument()
    expect(screen.queryByText(/Unanswered/)).not.toBeInTheDocument()
    expect(screen.getByText(/Flags: low_eye_contact/)).toBeInTheDocument()
  })

  it('expands and collapses question details', async () => {
    renderWithProviders(<PreviewInterviewSummary />, { preloadedState: { interview: { previewedInterviewSummaryId: 'i1' } } })
    await userEvent.click(await screen.findByRole('button', { name: 'Details' }))
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('Filler rate')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Hide' }))
    expect(screen.queryByText('Filler rate')).not.toBeInTheDocument()
  })

  it('falls back when requests fail', async () => {
    axios.get.mockReset(); axios.get.mockRejectedValue(new Error('x'))
    renderWithProviders(<PreviewInterviewSummary />, { preloadedState: { interview: { previewedInterviewSummaryId: 'i1' } } })
    expect(await screen.findByText('No summary available.')).toBeInTheDocument()
    expect(screen.getByText('No transcript available.')).toBeInTheDocument()
    expect(screen.getByText(/Flags: None/)).toBeInTheDocument()
  })

  it('closes on outside click', async () => {
    const { store } = renderWithProviders(<PreviewInterviewSummary />, { preloadedState: { interview: { previewedInterviewSummaryId: 'i1' } } })
    await screen.findByText('Interview Summary')
    fireEvent.mouseDown(document.body)
    expect(store.getState().interview.previewedInterviewSummaryId).toBeNull()
  })
})
