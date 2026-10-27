// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const getJobsByOrganization = vi.fn((id: string) => ({ type: 'm/byOrg', payload: id }))
vi.mock('@/redux/features/job', async (o) => ({ ...(await o<any>()), getJobsByOrganization: (id: string) => getJobsByOrganization(id) }))
vi.mock('@/components/workspace/recruiters/jobs/create/CreateJobForm', () => ({
  default: (p: any) => (
    <div data-testid="form">
      <button onClick={() => p.setBasicState({ ...p.basicState, title: 'Hello' })}>set-title</button>
    </div>
  ),
}))
vi.mock('@/components/workspace/recruiters/jobs/create/PreviewCreatedJob', () => ({
  default: (p: any) => <div data-testid="preview">{p.basicState.title}|{p.basicState.jobType}</div>,
}))

import Page from '@/app/workspace/jobs/(recruiters)/[org]/create/page'

beforeEach(() => getJobsByOrganization.mockClear())
const withOrg = { preloadedState: { job: { selectedOrgId: 'org-7' } } }

describe('CreateJobPage', () => {
  it('renders nothing without a selected organisation', () => {
    const { container } = renderWithProviders(<Page />)
    expect(container).toBeEmptyDOMElement()
    expect(getJobsByOrganization).not.toHaveBeenCalled()
  })

  it('loads org jobs and shows form with preview by default', () => {
    renderWithProviders(<Page />, withOrg)
    expect(getJobsByOrganization).toHaveBeenCalledWith('org-7')
    expect(screen.getByTestId('form')).toBeInTheDocument()
    expect(screen.getByTestId('preview')).toBeInTheDocument()
  })

  it('shares basic state between form and preview', async () => {
    renderWithProviders(<Page />, withOrg)
    expect(screen.getByTestId('preview')).toHaveTextContent(/^\|/)
    await userEvent.click(screen.getByText('set-title'))
    expect(screen.getByTestId('preview')).toHaveTextContent('Hello')
  })

  it('toggles the preview panel', async () => {
    renderWithProviders(<Page />, withOrg)
    expect(screen.getByText('Hide Preview')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Hide Preview').closest('button')!)
    expect(screen.queryByTestId('preview')).not.toBeInTheDocument()
    expect(screen.getByText('Show Preview')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Show Preview').closest('button')!)
    expect(screen.getByTestId('preview')).toBeInTheDocument()
  })
})
