// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import CandidateProfilePreview from '@/components/workspace/modals/CandidateProfilePreview'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('@/components/utils/CandidatesResumePanel', () => ({ default: ({ resumeData }: any) => <div>resume-panel-{resumeData ? 'data' : 'none'}</div> }))

const cand = {
  user: { name: 'Jane', location: 'Dhaka', email: 'j@x.com', aboutMe: 'Hello there', profilePictureUrl: 'http://img/p.png', resumeUrl: 'http://x/r.pdf' },
  resumeData: { skills: [] },
}

describe('CandidateProfilePreview', () => {
  it('is hidden with no candidate', () => {
    const { container } = renderWithProviders(<CandidateProfilePreview />)
    expect(container.firstChild).toHaveClass('hidden')
  })

  it('renders candidate info and resume panel', () => {
    renderWithProviders(<CandidateProfilePreview />, { preloadedState: { utils: { previewedCandidate: cand } } })
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('Dhaka')).toBeInTheDocument()
    expect(screen.getByText('j@x.com')).toBeInTheDocument()
    expect(screen.getByText('Hello there')).toBeInTheDocument()
    expect(screen.getByAltText('profile pic')).toBeInTheDocument()
    expect(screen.getByText('resume-panel-data')).toBeInTheDocument()
    expect(screen.getByText('Application Compatibility Review')).toBeInTheDocument()
  })

  it('shows a placeholder icon without a picture and hides resume button without url', () => {
    renderWithProviders(<CandidateProfilePreview />, { preloadedState: { utils: { previewedCandidate: { user: { name: 'No Pic' } } } } })
    expect(screen.queryByAltText('profile pic')).not.toBeInTheDocument()
    expect(screen.queryByText('Resume.pdf')).not.toBeInTheDocument()
  })

  it('opens and closes the resume iframe', async () => {
    const { container } = renderWithProviders(<CandidateProfilePreview />, { preloadedState: { utils: { previewedCandidate: cand } } })
    await userEvent.click(screen.getByText('Resume.pdf'))
    expect(container.querySelector('iframe')).toHaveAttribute('src', 'http://x/r.pdf')
    fireEvent.mouseDown(container.querySelector('iframe')!.parentElement!.parentElement!)
    expect(container.querySelector('iframe')).not.toBeInTheDocument()
  })

  it('generates and shows the compatibility report', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: { matchPercentage: 82, fit: 'Strong', strengths: ['Good React'], weaknesses: ['No Go'] } } })
    renderWithProviders(<CandidateProfilePreview />, { preloadedState: { utils: { previewedCandidate: cand, compatibilityReviewId: 'rev1' } } })
    await userEvent.click(screen.getByRole('button', { name: 'Generate Compatibility Review' }))
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/compatibility/rev1'), expect.anything())
    expect(await screen.findByText(/Overall Match: 82%/)).toBeInTheDocument()
    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(screen.getByText('Good React')).toBeInTheDocument()
    expect(screen.getByText('No Go')).toBeInTheDocument()
  })

  it('keeps the intro when the report request fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('x'))
    renderWithProviders(<CandidateProfilePreview />, { preloadedState: { utils: { previewedCandidate: cand } } })
    await userEvent.click(screen.getByRole('button', { name: 'Generate Compatibility Review' }))
    expect(screen.queryByText(/Overall Match/)).not.toBeInTheDocument()
  })

  it('clears the candidate on outside click', () => {
    const { store } = renderWithProviders(<CandidateProfilePreview />, { preloadedState: { utils: { previewedCandidate: cand } } })
    fireEvent.mouseDown(document.body)
    expect(store.getState().utils.previewedCandidate).toBeNull()
  })
})
