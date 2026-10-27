// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileSideBar from '@/components/profile/ProfileSideBar'
import { router } from '../../helpers/navMock'

it('renders sections and routes to support / guideline pages', async () => {
  render(<ProfileSideBar />)
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
  expect(screen.getByText('Help & Support')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Invoices/ })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Support/ }))
  expect(router.push).toHaveBeenCalledWith('/profile/support')
  await userEvent.click(screen.getByRole('button', { name: /Recruitment Guideline/ }))
  expect(router.push).toHaveBeenCalledWith('/profile/recruitment&guideline')
})
