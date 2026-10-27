// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import { axiosFns, resetAxios } from '@/tests/helpers/axiosMock'
import OrganizationCard from '@/components/profile/recruiter/OrganizationCard'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const org: any = {
  id: 'o1', organizationName: 'Acme', organizationNameBangla: 'অ্যাকমি', organizationProfileImageUrl: '',
  yearOfEstablishment: '2010', industryType: 'IT', organizationAddress: 'Dhaka', organizationAddressBangla: 'ঢাকা',
  websiteUrl: 'https://acme.io', businessDescription: 'We build',
}
beforeEach(() => { resetAxios(); vi.spyOn(console, 'log').mockImplementation(() => {}); vi.spyOn(console, 'error').mockImplementation(() => {}) })

describe('OrganizationCard', () => {
  it('shows organization details with default logo and website without protocol', async () => {
    renderWithProviders(<OrganizationCard organization={org} />)
    expect(await screen.findByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('IT')).toBeInTheDocument()
    expect(screen.getByText('We build')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'acme.io' })).toHaveAttribute('href', 'https://acme.io')
    expect(screen.getByAltText('Company Logo').getAttribute('src')).toMatch(/pinimg/)
  })
  it('edits and saves via updateOrganization', async () => {
    renderWithProviders(<OrganizationCard organization={{ ...org, organizationProfileImageUrl: 'http://logo' }} />)
    expect(screen.getByAltText('Company Logo')).toHaveAttribute('src', 'http://logo')
    await userEvent.click((await screen.findByText('Acme')).closest('div')!.parentElement!.querySelector('.absolute button')!)
    const name = screen.getByPlaceholderText('Company Name')
    await userEvent.type(name, '2')
    await userEvent.type(screen.getByPlaceholderText('Business Description'), '!')
    await userEvent.click(screen.getByRole('button', { name: /Save/ }))
    expect(axiosFns.patch.mock.calls.length + axiosFns.put.mock.calls.length).toBeGreaterThan(0)
    const payload = [...axiosFns.patch.mock.calls, ...axiosFns.put.mock.calls][0]
    expect(JSON.stringify(payload)).toContain('Acme2')
  })
  it('cancels editing and deletes', async () => {
    renderWithProviders(<OrganizationCard organization={org} />)
    const editBtn = () => document.querySelector('.absolute.top-2 button') as HTMLElement
    await userEvent.click(editBtn())
    await userEvent.click(screen.getByRole('button', { name: /Cancel/ }))
    expect(screen.getByText('Acme')).toBeInTheDocument()
    await userEvent.click(editBtn())
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))
    expect(axiosFns.delete).toHaveBeenCalledWith(expect.stringContaining('o1'), expect.anything())
  })
  it('closes the editor after a successful update', async () => {
    const { store } = renderWithProviders(<OrganizationCard organization={org} />, { preloadedState: { auth: { orgUpdateStatus: 'success' } } })
    await waitFor(() => expect(store.getState().auth.orgUpdateStatus).toBe('idle'))
  })
  it('uploads a logo', async () => {
    axiosFns.post.mockResolvedValue({ data: { coverPhotoUrl: 'http://new' } })
    const { container } = renderWithProviders(<OrganizationCard organization={org} />)
    const file = new File(['x'], 'l.png', { type: 'image/png' })
    fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [file] } })
    await waitFor(() => expect(axiosFns.post).toHaveBeenCalledWith(expect.stringContaining('/organization/o1/profile-photo'), expect.any(FormData), expect.anything()))
    await waitFor(() => expect(axiosFns.patch.mock.calls.length + axiosFns.put.mock.calls.length).toBeGreaterThan(0))
  })
  it('ignores an empty logo selection and clicks input through logo button', async () => {
    const { container } = renderWithProviders(<OrganizationCard organization={org} />)
    fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [] } })
    expect(axiosFns.post).not.toHaveBeenCalled()
    await userEvent.click(screen.getByAltText('Company Logo'))
  })
})
