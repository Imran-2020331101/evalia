// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', async () => await import('@/tests/helpers/axiosMock'))
import { axiosFns, resetAxios } from '@/tests/helpers/axiosMock'
import RecruiterProfileContainer from '@/components/profile/recruiter/RecruiterProfileContainer'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

const user = { user: { name: 'Rita', bio: 'Head of HR', location: 'Dhaka', email: 'r@x.com', aboutMe: 'hello there', coverPictureUrl: 'http://c.jpg', profilePictureUrl: 'http://p.jpg' } }
const org = { id: 'o1', organizationName: 'Acme', organizationNameBangla: 'b', yearOfEstablishment: '2010', industryType: 'IT', organizationAddress: 'a', organizationAddressBangla: 'ab', websiteUrl: 'https://a.io', businessDescription: 'd', organizationProfileImageUrl: '' }
beforeEach(() => { resetAxios(); vi.spyOn(console, 'log').mockImplementation(() => {}) })

describe('RecruiterProfileContainer', () => {
  it('shows user info and fetches organizations when none loaded', () => {
    renderWithProviders(<RecruiterProfileContainer user={user} />)
    expect(screen.getByText('Rita')).toBeInTheDocument()
    expect(screen.getByText('Head of HR')).toBeInTheDocument()
    expect(screen.getByText('r@x.com')).toBeInTheDocument()
    expect(screen.getByText('hello there')).toBeInTheDocument()
    expect(screen.getAllByAltText('profile-photo')).toHaveLength(2)
    expect(axiosFns.get).toHaveBeenCalledWith(expect.stringContaining('organization/all'), expect.anything())
  })
  it('shows placeholders when profile is blank, and skips fetch when orgs are loaded', () => {
    renderWithProviders(<RecruiterProfileContainer user={{ user: {} }} />, { preloadedState: { auth: { organizations: [org] } } })
    expect(screen.getByText('No bio found, make a short bio')).toBeInTheDocument()
    expect(screen.getByText(/No location found/)).toBeInTheDocument()
    expect(screen.getByText(/You haven’t added an About/)).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(axiosFns.get).not.toHaveBeenCalled()
  })
  it('edits basic info and submits', async () => {
    renderWithProviders(<RecruiterProfileContainer user={user} />)
    await userEvent.click(screen.getByText('Rita').querySelector('button')!)
    const name = screen.getByLabelText('Full Name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Rina')
    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
    expect(axiosFns.patch.mock.calls.length + axiosFns.put.mock.calls.length + axiosFns.post.mock.calls.length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Rita')).toBeInTheDocument()
  })
  it('edits the about section', async () => {
    renderWithProviders(<RecruiterProfileContainer user={user} />)
    await userEvent.click(screen.getByText('About').parentElement!.querySelector('button')!)
    expect(screen.getByText('Edit About')).toBeInTheDocument()
    await userEvent.type(document.querySelector('textarea')!, ' more')
    await userEvent.click(screen.getByText('Edit About').parentElement!.querySelector('button')!)
    expect(axiosFns.patch.mock.calls.length + axiosFns.put.mock.calls.length + axiosFns.post.mock.calls.length).toBeGreaterThan(0)
  })
  it('opens and cancels the create organization dialog', async () => {
    renderWithProviders(<RecruiterProfileContainer user={user} />)
    await userEvent.click(screen.getByRole('button', { name: /Create A New Organization/ }))
    expect(screen.getByText('Create New Organization')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Cancel/ }))
    expect(screen.queryByText('Create New Organization')).not.toBeInTheDocument()
  })
  it('uploads cover and profile photos', () => {
    const { container } = renderWithProviders(<RecruiterProfileContainer user={user} />)
    const [profile, cover] = Array.from(container.querySelectorAll('input[type=file]'))
    const f = new File(['x'], 'a.png', { type: 'image/png' })
    fireEvent.change(cover, { target: { files: [f] } })
    fireEvent.change(profile, { target: { files: [f] } })
    fireEvent.change(cover, { target: { files: [] } })
    expect(axiosFns.post.mock.calls.length + axiosFns.put.mock.calls.length + axiosFns.patch.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
  it('scrolls to a hash target', () => {
    vi.useFakeTimers()
    window.location.hash = '#create-organization'
    renderWithProviders(<RecruiterProfileContainer user={user} />)
    vi.runAllTimers()
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    window.location.hash = ''
    vi.useRealTimers()
  })
})
