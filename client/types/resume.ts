// Resume search related types
export interface Candidate {
  id: string
  name: string
  email: string
  skills: {
    score: number
    details: string[]
  }
  experience: {
    score: number
    years: number
    companies: string[]
  }
  projects: {
    score: number
    count: number
    projects: string[]
  }
  education: {
    score: number
    degree: string
    institution: string
    gpa: number
  }
  totalScore: number
}

export interface Filters {
  institution: string
  degree: string
  minGPA: number
  minExperience: number
  industry: string
  skills: string
  projects: string
  jobDescription: string
}

export interface Weights {
  skills: number
  experience: number
  projects: number
  education: number
}

export type SortBy = 'totalScore' | 'skills' | 'experience' | 'projects' | 'education'
export type SortOrder = 'asc' | 'desc'
