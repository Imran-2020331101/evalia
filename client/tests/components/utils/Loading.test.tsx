// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Loading from '@/components/utils/Loading'

it('renders a 4 bar loader', () => {
  const { container } = render(<Loading />)
  expect(container.querySelectorAll('span span').length).toBeGreaterThanOrEqual(4)
})
