// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Page from '@/app/workspace/jobs/page'

// Source page is an intentionally empty coloured placeholder.
it('renders an empty placeholder block', () => {
  const { container } = render(<Page />)
  expect(container.firstChild).toBeEmptyDOMElement()
  expect(container.firstChild).toHaveClass('w-full', 'h-full')
})
