// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import QuoteSection from '@/components/home/QuoteSection'

it('renders an empty spacer section', () => {
  const { container } = render(<QuoteSection />)
  expect(container.firstChild).toBeEmptyDOMElement()
})
