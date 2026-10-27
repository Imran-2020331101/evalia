// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import EditProfileForm from '@/components/profile/candidate/EditProfileForm'

it('renders the (currently empty) placeholder form', () => {
  const { container } = render(<EditProfileForm />)
  expect(container.firstChild).toBeEmptyDOMElement()
})
