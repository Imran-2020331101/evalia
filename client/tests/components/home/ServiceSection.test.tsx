// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ServiceSection from '@/components/home/ServiceSection'
import { services } from '@/Data/home'

it('lists every service with its image and title', () => {
  render(<ServiceSection />)
  expect(screen.getByText('Services')).toBeInTheDocument()
  for (const s of services) {
    expect(screen.getByText(s.name)).toBeInTheDocument()
    expect(screen.getByAltText(s.title)).toHaveAttribute('src', s.url)
  }
})
