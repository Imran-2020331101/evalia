// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/app/workspace/jobs/(candidates)/explore/loading'

it('renders the spinner centred', () => {
  const { container } = render(<Loading />)
  expect(container.firstChild).toHaveClass('justify-center', 'items-center')
  expect(container.querySelectorAll('span span').length).toBeGreaterThanOrEqual(4)
})
