// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from '@/tests/helpers/axiosMock'
import RecruiterForm from '@/components/auth/requirements/recruiter/RecruiterForm'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))

beforeEach(() => { axios.post.mockReset(); axios.post.mockRejectedValue({}) })

const fillAll = async () => {
  await userEvent.type(screen.getByPlaceholderText('e.g. Github'), 'Acme')
  await userEvent.type(screen.getByPlaceholderText('e.g. 2010'), '2001')
  await userEvent.type(screen.getByPlaceholderText('e.g. Information Technology'), 'Tech')
  await userEvent.type(screen.getByPlaceholderText('e.g. Sylhet, Bangladesh'), 'Dhaka')
  await userEvent.type(screen.getByPlaceholderText('Write a short business businessDescription...'), 'Stuff')
}

describe('RecruiterForm (create organization during signup)', () => {
  it('shows all required-field errors on empty submit', async () => {
    renderWithProviders(<RecruiterForm onSignUp />)
    await userEvent.click(screen.getByRole('button', { name: /Create/ }))
    expect(screen.getByText('Organization name is required')).toBeInTheDocument()
    expect(screen.getByText('Year of establishment is required')).toBeInTheDocument()
    expect(screen.getByText('Organization address is required')).toBeInTheDocument()
    expect(screen.getByText('Industry type is required')).toBeInTheDocument()
    expect(screen.getByText('Business description is required')).toBeInTheDocument()
    expect(screen.getByText('You must accept the privacy policy')).toBeInTheDocument()
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('submits a valid form to the organization endpoint', async () => {
    renderWithProviders(<RecruiterForm onSignUp />)
    await fillAll()
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: /Create/ }))
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/organization/new'), expect.objectContaining({ organizationName: 'Acme', acceptPrivacyPolicy: true }), expect.anything())
    expect(screen.queryByText('Organization name is required')).not.toBeInTheDocument()
  })

  it('cancel clears the form and toggles the auth role modal', async () => {
    const { store } = renderWithProviders(<RecruiterForm onSignUp />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Github'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: /Skip for now/ }))
    expect(screen.getByPlaceholderText('e.g. Github')).toHaveValue('')
    expect(store.getState().utils.isShowAuthRole).toBe(true)
  })

  it('selects a logo file via the hidden input', async () => {
    const { container } = renderWithProviders(<RecruiterForm onSignUp />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, new File(['x'], 'logo.png', { type: 'image/png' }))
    expect(input.files?.[0].name).toBe('logo.png')
  })

  it('closes the modal when creation succeeds', () => {
    const { store } = renderWithProviders(<RecruiterForm onSignUp />, { preloadedState: { auth: { orgCreationStatus: 'success' } } })
    expect(store.getState().auth.orgCreationStatus).toBe('idle')
    expect(store.getState().utils.isShowAuthRole).toBe(true)
  })
})
