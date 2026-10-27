// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrganizationPreview from '@/components/workspace/modals/OrganizationPreview'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const org = {
  organizationName: 'Acme', organizationNameBangla: 'অ্যাকমি', organizationProfileImageUrl: 'http://img/a.png', yearOfEstablishment: 1999,
  numberOfEmployees: '50-100', organizationAddress: '1 Road', industryType: 'Tech', businessDescription: 'Does things', businessLicenseNo: 'LIC-1',
  websiteUrl: 'https://acme.test', acceptPrivacyPolicy: true, verified: true, ownerEmail: 'o@acme.test',
}

afterEach(() => vi.restoreAllMocks())

describe('OrganizationPreview', () => {
  it('is hidden without an organization', () => {
    const { container } = renderWithProviders(<OrganizationPreview />)
    expect(container.firstChild).toHaveClass('hidden')
    expect(screen.getByText('Not verified')).toBeInTheDocument()
  })

  it('shows full organization details', () => {
    renderWithProviders(<OrganizationPreview />, { preloadedState: { utils: { previewOrganization: org } } })
    expect(screen.getByRole('dialog', { name: 'Acme preview' })).toBeInTheDocument()
    expect(screen.getByText('( 1999 )')).toBeInTheDocument()
    expect(screen.getByText('অ্যাকমি')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
    expect(screen.getByText('50-100')).toBeInTheDocument()
    expect(screen.getByText('1 Road')).toBeInTheDocument()
    expect(screen.getByText('LIC-1')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Visit website' })).toHaveAttribute('href', 'https://acme.test')
    expect(screen.getByAltText('Acme logo')).toBeInTheDocument()
  })

  it('shows fallbacks for sparse data', () => {
    renderWithProviders(<OrganizationPreview />, { preloadedState: { utils: { previewOrganization: { organizationName: 'Bare' } } } })
    expect(screen.getByText('Not verified')).toBeInTheDocument()
    expect(screen.getByText('N/A')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
    expect(screen.queryByAltText('Bare logo')).not.toBeInTheDocument()
  })

  it('copies the email and website', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderWithProviders(<OrganizationPreview />, { preloadedState: { utils: { previewOrganization: org } } })
    const [emailCopy, siteCopy] = screen.getAllByRole('button', { name: 'Copy' })
    await userEvent.click(emailCopy)
    expect(writeText).toHaveBeenCalledWith('o@acme.test')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument())
    await userEvent.click(siteCopy)
    expect(writeText).toHaveBeenCalledWith('https://acme.test')
  })

  it('survives a clipboard failure', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('no')) } })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderWithProviders(<OrganizationPreview />, { preloadedState: { utils: { previewOrganization: org } } })
    await userEvent.click(screen.getAllByRole('button', { name: 'Copy' })[0])
    expect(screen.queryByText('Copied')).not.toBeInTheDocument()
  })

  it('closes on outside click only', () => {
    const { store } = renderWithProviders(<OrganizationPreview />, { preloadedState: { utils: { previewOrganization: org } } })
    fireEvent.mouseDown(screen.getByText('Does things'))
    expect(store.getState().utils.previewOrganization).not.toBeNull()
    fireEvent.mouseDown(document.body)
    expect(store.getState().utils.previewOrganization).toBeNull()
  })
})
