// @vitest-environment jsdom
import { expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const getJobsByOrganization = vi.fn((id: string) => ({ type: 'job/getByOrg/mock', payload: id }))
vi.mock('@/redux/features/job', async (orig) => ({ ...(await orig<any>()), getJobsByOrganization: (id: string) => getJobsByOrganization(id) }))
vi.mock('@/components/workspace/recruiters/jobs/my-jobs/MyJobsContainer', () => ({ default: () => <div data-testid="c" /> }))

import Page from '@/app/workspace/jobs/(recruiters)/[org]/my-jobs/page'

beforeEach(() => getJobsByOrganization.mockClear())

it('renders container and does not fetch without a selected org', () => {
  renderWithProviders(<Page />)
  expect(screen.getByTestId('c')).toBeInTheDocument()
  expect(getJobsByOrganization).not.toHaveBeenCalled()
})

it('fetches jobs for the selected organisation', () => {
  renderWithProviders(<Page />, { preloadedState: { job: { selectedOrgId: 'org-1' } } })
  expect(getJobsByOrganization).toHaveBeenCalledWith('org-1')
})
