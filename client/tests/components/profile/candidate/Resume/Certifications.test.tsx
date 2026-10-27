// @vitest-environment jsdom
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Certifications from '@/components/profile/candidate/Resume/Certifications'

const data = [{ title: 'AWS', provider: 'Amazon', date: '2023', link: 'http://c.io' }]
const Host = ({ initial = data as any[] }) => {
  const [v, setV] = useState<any[]>(initial)
  return <Certifications certs={v} setCerts={setV} />
}

describe('Certifications', () => {
  it('renders certifications', () => {
    render(<Host />)
    expect(screen.getByText('AWS')).toBeInTheDocument()
    expect(screen.getByText(/Amazon/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'http://c.io' })).toBeInTheDocument()
  })
  it('edits, adds, removes and saves', async () => {
    render(<Host />)
    await userEvent.click(within(screen.getByRole('heading', { name: /Certifications/ })).getByRole('button'))
    expect(screen.getByText('Edit Certifications')).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText('Certification Title'), '2')
    await userEvent.type(screen.getByPlaceholderText(/Provider/), '2')
    await userEvent.type(screen.getByPlaceholderText(/Date/), '2')
    await userEvent.type(screen.getByPlaceholderText('https://example.com/certificate'), '/x')
    await userEvent.click(screen.getByText('Add Certification'))
    expect(screen.getAllByPlaceholderText('Certification Title')).toHaveLength(2)
    const x = screen.getAllByRole('button').filter((b) => b.className.includes('red'))
    await userEvent.click(x[x.length - 1])
    await userEvent.click(screen.getByText('Save Changes'))
    expect(screen.getByText('AWS2')).toBeInTheDocument()
  })
})
