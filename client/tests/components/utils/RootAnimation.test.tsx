// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render } from '@testing-library/react'
import FloatingBackground from '@/components/utils/RootAnimation'

it('spawns five floating balls after mount', () => {
  const { container } = render(<FloatingBackground />)
  expect(container.querySelectorAll('.neon-glow')).toHaveLength(5)
})
