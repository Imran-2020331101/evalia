// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import SearchCandidateContainer from '@/components/workspace/recruiters/search-candidate/SearchCandidateContainer'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('@/components/workspace/recruiters/search-candidate/CandidateCard', () => ({ default: ({ candidate }: any) => <div>match-{candidate.candidateName}</div> }))

describe('SearchCandidateContainer', () => {
  it('renders the intro copy', () => {
    render(<SearchCandidateContainer />)
    expect(screen.getByText('Search candidates by job description')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write your job description here...')).toBeInTheDocument()
  })

  it('submits the job description and lists matches', async () => {
    axios.post.mockResolvedValueOnce({ data: { data: [{ candidateName: 'Ann' }, { candidateName: 'Bob' }] } })
    render(<SearchCandidateContainer />)
    await userEvent.type(screen.getByPlaceholderText('Write your job description here...'), 'Need a React dev')
    await userEvent.click(screen.getByRole('button'))
    expect(await screen.findByText('match-Ann')).toBeInTheDocument()
    expect(screen.getByText('match-Bob')).toBeInTheDocument()
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/resume/shortlist/10'), { job_description: 'Need a React dev' }, expect.anything())
  })

  it('handles a failed search without crashing', async () => {
    axios.post.mockRejectedValueOnce(new Error('x'))
    render(<SearchCandidateContainer />)
    await userEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    expect(screen.queryByText(/match-/)).not.toBeInTheDocument()
  })
})
