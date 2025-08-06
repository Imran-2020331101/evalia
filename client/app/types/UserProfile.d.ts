// Main Profile interface matching Java Profile DTO
export interface Profile {
  resumeData: ResumeDTO
  user: UserEntity
}

// User entity interface matching Java userEntity
export interface UserEntity {
  id: string
  email: string
  name?: string
  role?: string
  createdAt?: string
  updatedAt?: string
  // Add other user fields as needed
}

// Resume DTO interface matching Java ResumeDTO
export interface ResumeDTO {
  filename: string
  originalName: string
  fileLink: string
  metadata: Metadata
  industry: string
  analysis: Analysis
  skills: Skills
  experience: Experience[]
  education: Education[]
  projects: Project[]
  certifications: Certification[]
  awards: Award[]
  volunteer: string[]
  interests: string[]
  contact: Contact
  uploadedBy: string
  uploadedAt: Date
  processedAt: Date
  status: string
}

// Inner interfaces matching Java inner DTO classes
export interface Metadata {
  pages: number
  info: Record<string, any>
  version: string
}

export interface Analysis {
  wordCount: number
  characterCount: number
  hasEmail: boolean
  hasPhone: boolean
  sections: string[]
  keywords: string[]
}

export interface Skills {
  technical: string[]
  soft: string[]
  languages: string[]
  tools: string[]
  other: string[]
}

export interface Experience {
  job_title: string
  company: string
  duration: string
  description: string[]
  achievements: string[]
}

export interface Education {
  degree: string
  institution: string
  year: string
  gpa: string
}

export interface Project {
  title: string
  description: string
  technologies: string[]
  url: string
}

export interface Certification {
  title: string
  provider: string
  date: string
  link: string
}

export interface Award {
  title: string
  organization: string
  year: string
  description: string
}

export interface Contact {
  email: string
  phone: string
  linkedin: string
  github: string
  location: string
}
