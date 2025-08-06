import { ReactNode } from 'react'

interface CandidateLayoutProps {
  children: ReactNode
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
  return (
    <div className="candidate-layout">
      {children}
    </div>
  )
}