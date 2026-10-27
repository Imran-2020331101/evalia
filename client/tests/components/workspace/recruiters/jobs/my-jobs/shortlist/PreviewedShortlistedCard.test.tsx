// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import Card from '@/components/workspace/recruiters/jobs/my-jobs/shortlist/PreviewedShortlistedCard'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))

const details = { user: { name: 'Jane Full', location: 'Dhaka', profilePictureUrl: 'http://img/p.png' } }
const cand = { 'candidate-id': 'c1', candidateName: 'Jane', skills: 0.8, experience: 0.6, projects: 0.4, education: 1 }

beforeEach(() => { axios.get.mockReset(); axios.get.mockResolvedValue({ data: { data: details } }) })

describe('PreviewedShortlistedCard', () => {
  it('renders nothing if details cannot be fetched', async () => {
    axios.get.mockRejectedValue(new Error('x'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = renderWithProviders(<Card candidate={cand} />)
    await waitFor(() => expect(axios.get).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('renders details and fetches by candidate id', async () => {
    renderWithProviders(<Card candidate={cand} />)
    expect(await screen.findByText('Jane Full')).toBeInTheDocument()
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/user/c1/single'), expect.anything())
    expect(screen.getByText('Dhaka')).toBeInTheDocument()
    expect(screen.getByAltText('profile pic')).toBeInTheDocument()
  })

  it('falls back to candidateName and the user icon', async () => {
    axios.get.mockResolvedValue({ data: { data: { user: {} } } })
    renderWithProviders(<Card candidate={cand} />)
    expect(await screen.findByText('Jane')).toBeInTheDocument()
    expect(screen.queryByAltText('profile pic')).not.toBeInTheDocument()
  })

  it('opens the candidate preview from the name', async () => {
    const { store } = renderWithProviders(<Card candidate={cand} />)
    await userEvent.click(await screen.findByText('Jane Full'))
    expect(store.getState().utils.previewedCandidate).toEqual(details)
  })

  it('toggles score details with total score', async () => {
    renderWithProviders(<Card candidate={cand} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Show Details' }))
    expect(screen.getByText('Skills (80%)')).toBeInTheDocument()
    expect(screen.getByText('Experience (60%)')).toBeInTheDocument()
    expect(screen.getByText('Projects (40%)')).toBeInTheDocument()
    expect(screen.getByText('Education (100%)')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Hide Details' }))
    expect(screen.queryByText('Total Score')).not.toBeInTheDocument()
  })

  it('only shows provided metrics', async () => {
    renderWithProviders(<Card candidate={{ 'candidate-id': 'c2', candidateName: 'X', skills: 0.5 }} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Show Details' }))
    expect(screen.getByText('Skills (50%)')).toBeInTheDocument()
    expect(screen.queryByText(/Experience/)).not.toBeInTheDocument()
  })
})
