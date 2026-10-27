// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import JobCard from '@/components/workspace/recruiters/jobs/my-jobs/JobCard'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))

const job = { _id: 'j1', title: 'SRE', company: { OrganizationId: 'o1' }, jobLocation: 'Dhaka', workPlaceType: 'Hybrid', salary: { from: 2, to: 4 } }
const state = { auth: { organizations: [{ id: 'o1', organizationName: 'Acme', organizationProfileImageUrl: 'http://img/a.png' }] } }

describe('recruiter JobCard', () => {
  it('renders job info with view links', () => {
    renderWithProviders(<JobCard job={job} />, { preloadedState: state })
    expect(screen.getByText('SRE')).toHaveAttribute('href', 'my-jobs/j1')
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('Hybrid')).toBeInTheDocument()
    expect(screen.getByText('Dhaka')).toBeInTheDocument()
    expect(screen.getByText('$2k - $4k')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View/ })).toHaveAttribute('href', 'my-jobs/j1')
  })

  it('deletes the job and disables the button', async () => {
    renderWithProviders(<JobCard job={job} />, { preloadedState: state })
    const btn = screen.getByRole('button', { name: /Delete/ })
    await userEvent.click(btn)
    expect(btn).toBeDisabled()
    expect(axios.delete).toHaveBeenCalled()
  })
})
