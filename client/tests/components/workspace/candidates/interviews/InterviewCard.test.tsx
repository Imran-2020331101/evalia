// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import InterviewCard from '@/components/workspace/candidates/interviews/InterviewCard'

const org = { organizationName: 'Acme', organizationProfileImageUrl: 'http://img/o.png' }
const mk = (interviewStatus: string) => ({ id: 'i1', interviewStatus, jobTitle: 'Dev', organizationId: 'o1' })

beforeEach(() => { axios.get.mockReset(); axios.get.mockResolvedValue({ data: org }) })

describe('InterviewCard', () => {
  it('renders nothing without an organization', async () => {
    axios.get.mockRejectedValue(new Error('x'))
    const { container } = renderWithProviders(<InterviewCard item={mk('SCHEDULED')} detailsCardId={null} setDetailsCardId={vi.fn()} />)
    await waitFor(() => expect(axios.get).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })
  it('does not fetch without organizationId', () => {
    const { container } = renderWithProviders(<InterviewCard item={{ ...mk('SCHEDULED'), organizationId: undefined }} detailsCardId={null} setDetailsCardId={vi.fn()} />)
    expect(axios.get).not.toHaveBeenCalled()
    expect(container).toBeEmptyDOMElement()
  })
  it('scheduled: join link', async () => {
    renderWithProviders(<InterviewCard item={mk('SCHEDULED')} detailsCardId={null} setDetailsCardId={vi.fn()} />)
    expect(await screen.findByText('Dev')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Join Interview/ })).toHaveAttribute('href', '/workspace/interviews/on-going/i1')
    expect(screen.queryByText('View Summary')).not.toBeInTheDocument()
  })
  it('completed: view summary dispatches id', async () => {
    const { store } = renderWithProviders(<InterviewCard item={mk('COMPLETED')} detailsCardId={null} setDetailsCardId={vi.fn()} />)
    await userEvent.click(await screen.findByRole('button', { name: /View Summary/ }))
    expect(store.getState().interview.previewedInterviewSummaryId).toBe('i1')
    expect(screen.queryByText(/Join Interview/)).not.toBeInTheDocument()
  })
  it('cancelled: shows status and org preview click', async () => {
    const { store } = renderWithProviders(<InterviewCard item={mk('CANCELLED')} detailsCardId={null} setDetailsCardId={vi.fn()} />)
    expect(await screen.findByText('CANCELLED')).toHaveClass('text-red-400')
    await userEvent.click(screen.getByAltText('Organization Logo'))
    expect(store.getState().utils.previewOrganization).toEqual(org)
  })
  it('shows N/A when org has no image', async () => {
    axios.get.mockResolvedValue({ data: { organizationName: 'NoImg' } })
    renderWithProviders(<InterviewCard item={mk('SCHEDULED')} detailsCardId={null} setDetailsCardId={vi.fn()} />)
    expect(await screen.findByText('N/A')).toBeInTheDocument()
  })
})
