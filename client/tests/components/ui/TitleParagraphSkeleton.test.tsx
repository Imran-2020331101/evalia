// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import TitleParagraphSkeleton from '@/components/ui/TitleParagraphSkeleton'

it('renders a title bar and three paragraph lines', () => {
  const { container } = render(<TitleParagraphSkeleton />)
  expect(container.querySelectorAll('.bg-gray-800')).toHaveLength(4)
})
