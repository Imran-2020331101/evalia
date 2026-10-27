// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Layout from '@/app/workspace/interviews/(candidates)/on-going/[interviewId]/layout'

it('wraps children in the centred interview frame', () => {
  render(<Layout><p>inside</p></Layout>)
  expect(screen.getByText('inside').parentElement).toHaveClass('w-[80%]')
})
