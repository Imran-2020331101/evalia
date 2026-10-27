// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
import { axiosFns, resetAxios } from '@/tests/helpers/axiosMock'
import CreateOrganizationForm from '@/components/profile/recruiter/CreateOrganizationForm'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

beforeEach(() => { resetAxios(); vi.spyOn(console, 'log').mockImplementation(() => {}) })

describe('CreateOrganizationForm', () => {
  it('shows validation errors for empty required fields', async () => {
    renderWithProviders(<CreateOrganizationForm setIsCreateNewOrg={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /Create/ }))
    for (const m of ['Organization name is required', 'Year of establishment is required', 'Organization address is required', 'Industry type is required', 'Business description is required', 'You must accept the privacy policy']) {
      expect(screen.getByText(m)).toBeInTheDocument()
    }
    expect(axiosFns.post).not.toHaveBeenCalled()
  })
  it('submits a valid form', async () => {
    renderWithProviders(<CreateOrganizationForm setIsCreateNewOrg={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Github'), 'Acme')
    await userEvent.type(screen.getByPlaceholderText('e.g. 2010'), '2010')
    await userEvent.type(screen.getByPlaceholderText('e.g. Information Technology'), 'IT')
    await userEvent.type(screen.getByPlaceholderText('e.g. Sylhet, Bangladesh'), 'Dhaka')
    await userEvent.type(screen.getByPlaceholderText('e.g. 100'), '10')
    await userEvent.type(screen.getByPlaceholderText('e.g. 157***'), '1')
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://a.io')
    await userEvent.type(screen.getByPlaceholderText(/Write a short/), 'desc')
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Create/ }))
    expect(screen.queryByText('Organization name is required')).not.toBeInTheDocument()
    expect(axiosFns.post).toHaveBeenCalledWith(expect.stringContaining('organization/new'), expect.objectContaining({ organizationName: 'Acme', yearOfEstablishment: '2010' }), expect.anything())
  })
  it('cancel closes the form', async () => {
    const close = vi.fn()
    renderWithProviders(<CreateOrganizationForm setIsCreateNewOrg={close} />)
    await userEvent.click(screen.getByRole('button', { name: /Cancel/ }))
    expect(close).toHaveBeenCalledWith(false)
  })
  it('closes and resets the status after successful creation', async () => {
    const close = vi.fn()
    const { store } = renderWithProviders(<CreateOrganizationForm setIsCreateNewOrg={close} />, { preloadedState: { auth: { orgCreationStatus: 'success' } } })
    await waitFor(() => expect(close).toHaveBeenCalledWith(false))
    expect(store.getState().auth.orgCreationStatus).toBe('idle')
  })
  it('disables the button while pending', () => {
    renderWithProviders(<CreateOrganizationForm setIsCreateNewOrg={vi.fn()} />, { preloadedState: { auth: { orgCreationStatus: 'pending' } } })
    expect(screen.getAllByRole('button')[0]).toBeDisabled()
  })
})
