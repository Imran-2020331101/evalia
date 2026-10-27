// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SupportContainer from '@/components/profile/support/SupportContainer'
import { FAQ } from '@/Data/faq'

describe('SupportContainer', () => {
  it('renders contact info and FAQ categories', () => {
    render(<SupportContainer />)
    expect(screen.getByRole('heading', { name: 'Support' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'evalia.apostrophe@gmail.com' })).toBeInTheDocument()
    expect(screen.getByText('Account & Login')).toBeInTheDocument()
    expect(screen.getAllByText('4 results').length).toBeGreaterThan(0)
  })

  it('expands a category and shows the FAQ answer', async () => {
    render(<SupportContainer />)
    const btn = screen.getByRole('button', { name: /Account & Login/ })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('How to create an Evalia account?')).toBeInTheDocument()
    const answered = FAQ.find((f) => f.question === 'How to create an Evalia account?')
    if (answered) expect(document.body.textContent).toContain(answered.answer.trim().split('\n')[0].trim())
    await userEvent.click(btn)
    expect(screen.queryByText('How to create an Evalia account?')).not.toBeInTheDocument()
  })

  it('submits the ticket form with an alert', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const { container } = render(<SupportContainer />)
    const form = container.querySelector('form')!
    const [name, email] = Array.from(form.querySelectorAll('input'))
    await userEvent.type(name, 'Jo')
    await userEvent.type(email, 'jo@x.com')
    await userEvent.type(form.querySelector('textarea')!, 'help')
    await userEvent.click(screen.getByRole('button', { name: /Submit/ }))
    expect(alert).toHaveBeenCalledWith('Ticket submitted (demo).')
  })
})
