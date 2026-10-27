// @vitest-environment jsdom
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Awards from '@/components/profile/candidate/Resume/Awards'

const data = [{ title: 'Best', organization: 'Org', year: '2022', description: 'for work' }]
const Host = ({ initial = data as any[] }) => {
  const [v, setV] = useState<any[]>(initial)
  return <Awards editedAwards={v} setAwards={setV} />
}

describe('Awards', () => {
  it('renders awards (description optional)', () => {
    const { unmount } = render(<Host />)
    expect(screen.getByText('Best')).toBeInTheDocument()
    expect(screen.getByText('for work')).toBeInTheDocument()
    unmount()
    render(<Host initial={[{ title: 'T', organization: 'O', year: '1' }]} />)
    expect(screen.queryByText('for work')).not.toBeInTheDocument()
  })
  it('edits, adds, removes and saves', async () => {
    render(<Host />)
    await userEvent.click(within(screen.getByRole('heading', { name: /Awards/ })).getByRole('button'))
    await userEvent.type(screen.getByPlaceholderText('Award Title'), '2')
    await userEvent.type(screen.getByPlaceholderText('Organization'), '2')
    await userEvent.type(screen.getByPlaceholderText(/Year/), '2')
    await userEvent.type(screen.getByPlaceholderText(/Optional description/), '!')
    await userEvent.click(screen.getByText('Add Award'))
    expect(screen.getAllByPlaceholderText('Award Title')).toHaveLength(2)
    const x = screen.getAllByRole('button').filter((b) => b.className.includes('red'))
    await userEvent.click(x[x.length - 1])
    await userEvent.click(screen.getByText('Save Changes'))
    expect(screen.getByText('Best2')).toBeInTheDocument()
  })
})
