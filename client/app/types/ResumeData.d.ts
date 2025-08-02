export interface ResumeData {
  success: boolean
  data: {
    // From ResumeDTO
    filename: string
    originalName: string
    fileLink: string
    industry?: string
    skills: {
      technical: string[]
      soft: string[]
      languages: string[]
      tools: string[]
      other: string[]
    }
    experience: Array<{
      job_title: string
      company: string
      duration: string
      description: string[]
      achievements: string[]
    }>
    education: Array<{
      degree: string
      institution: string
      year: string
      gpa?: string
    }>
    projects: Array<{
      title: string
      description: string
      technologies: string[]
      url?: string
    }>
    certifications: Array<{
      title: string
      provider: string
      date: string
      link: string
    }> 
    awards: Array<{
      title: string
      organization: string
      year: string
      description: string
    }>
    volunteer: string[]
    interests: string[]
    contact: {
      email: string
      phone: string
      linkedin?: string
      github?: string
      location?: string
    }
    status: 'processing' | 'completed' | 'failed'
    
    // Additional data added by controller
    downloadUrl: string
    metadata: {
      pages: number
      info: any
      version: string
    }
    analysis: {
      wordCount: number
      characterCount: number
      hasEmail: boolean
      hasPhone: boolean
      sections: string[]
      keywords: string[]
    }
    uploadedBy: string
    processedAt: Date
  }
}