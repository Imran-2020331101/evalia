'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award,
  Code,
  Languages,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ResumeData {
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
      description: string
    }> | string[]
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

export default function PreviewPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const router = useRouter()

  useEffect(() => {
    // Get resume data from sessionStorage
    const storedData = sessionStorage.getItem('resumeData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setResumeData(data)
      } catch (error) {
        console.error('Failed to parse resume data:', error)
        router.push('/upload/pdf')
      }
    } else {
      // No data found, redirect back to upload
      router.push('/upload/pdf')
    }
    setIsLoading(false)
  }, [router])

  const handleSave = async () => {
    if (!resumeData) return

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetch('http://localhost:5000/api/resume/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData.data),
      })

      if (!response.ok) {
        throw new Error('Failed to save resume')
      }

      setSaveStatus('success')
      
      // Clear session storage and redirect after successful save
      setTimeout(() => {
        sessionStorage.removeItem('resumeData')
        router.push('/dashboard') // or wherever you want to redirect after save
      }, 2000)
    } catch (error) {
      console.error('Save failed:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetry = () => {
    sessionStorage.removeItem('resumeData')
    router.push('/upload/pdf')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume data...</p>
        </div>
      </div>
    )
  }

  if (!resumeData || !resumeData.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Resume Data Found</h2>
          <p className="text-gray-600 mb-4">Please upload a resume first.</p>
          <button
            onClick={() => router.push('/upload/pdf')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Upload
          </button>
        </div>
      </div>
    )
  }

  const { data } = resumeData

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Review Your Resume
            </h1>
            <p className="text-gray-600">
              Please review the extracted information and confirm it's correct
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-upload
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-800 font-medium">Resume saved successfully! Redirecting...</span>
            </div>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800 font-medium">Failed to save resume. Please try again.</span>
            </div>
          </div>
        )}

        {/* Resume Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <User className="w-6 h-6 mr-2" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {data.contact.email || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {data.contact.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {data.contact.location || 'Not provided'}
                </p>
              </div>
              {data.contact.linkedin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <p className="text-blue-600 hover:underline">
                    <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer">
                      {data.contact.linkedin}
                    </a>
                  </p>
                </div>
              )}
              {data.contact.github && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                  <p className="text-blue-600 hover:underline">
                    <a href={data.contact.github} target="_blank" rel="noopener noreferrer">
                      {data.contact.github}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0 || data.skills.languages?.length > 0 || data.skills.tools?.length > 0 || data.skills.other?.length > 0) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Skills
              </h2>
              <div className="space-y-4">
                {data.skills.technical && data.skills.technical.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.technical.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.soft && data.skills.soft.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.soft.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.languages && data.skills.languages.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.tools && data.skills.tools.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Tools & Frameworks</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.tools.map((tool, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.other && data.skills.other.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Other Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.other.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Work Experience
              </h2>
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4">
                    <h3 className="font-semibold text-gray-900">{exp.job_title}</h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    <p className="text-gray-600 text-sm mb-2">
                      {exp.duration}
                    </p>
                    {exp.description && Array.isArray(exp.description) && exp.description.length > 0 && (
                      <div className="mb-2">
                        {exp.description.map((desc, descIndex) => (
                          <p key={descIndex} className="text-gray-700 mb-1">
                            {typeof desc === 'string' ? desc : JSON.stringify(desc)}
                          </p>
                        ))}
                      </div>
                    )}
                    {exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex}>
                            {typeof achievement === 'string' ? achievement : JSON.stringify(achievement)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-green-200 pl-4">
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-green-600 font-medium">{edu.institution}</p>
                    <p className="text-gray-600 text-sm">
                      {edu.year} {edu.gpa && `• GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Projects
              </h2>
              <div className="space-y-4">
                {data.projects.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    {project.description && (
                      <p className="text-gray-700 mt-1">{project.description}</p>
                    )}
                    {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {typeof tech === 'string' ? tech : JSON.stringify(tech)}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.url && (
                      <p className="mt-2">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Project
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Certifications
                </h2>
                <div className="space-y-3">
                  {data.certifications.map((cert, index) => {
                    // Handle both object and string formats
                    if (typeof cert === 'object') {
                      return (
                        <div key={index} className="text-gray-700">
                          <p className="font-medium">{cert.title}</p>
                          <p className="text-sm text-gray-600">{cert.provider} • {cert.date}</p>
                          {cert.description && (
                            <p className="text-sm text-gray-600 mt-1">{cert.description}</p>
                          )}
                        </div>
                      )
                    } else {
                      // Fallback for string format
                      return (
                        <div key={index} className="text-gray-700">
                          • {typeof cert === 'string' ? cert : JSON.stringify(cert)}
                        </div>
                      )
                    }
                  })}
                </div>
              </div>
            )}

            {/* Awards */}
            {data.awards && data.awards.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Awards & Honors
                </h2>
                <div className="space-y-3">
                  {data.awards.map((award, index) => (
                    <div key={index} className="text-gray-700">
                      <p className="font-medium">{award.title}</p>
                      <p className="text-sm text-gray-600">{award.organization} • {award.year}</p>
                      {award.description && (
                        <p className="text-sm text-gray-600 mt-1">{award.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {data.interests && data.interests.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {typeof interest === 'string' ? interest : JSON.stringify(interest)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Volunteer Experience */}
          {data.volunteer && data.volunteer.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Volunteer Experience
              </h2>
              <ul className="space-y-2">
                {data.volunteer.map((vol, index) => (
                  <li key={index} className="text-gray-700">
                    • {typeof vol === 'string' ? vol : JSON.stringify(vol)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => router.push('/upload/pdf')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </button>
          
          <div className="text-sm text-gray-500">
            Review the information above and click "Save Resume" when ready
          </div>
        </div>
      </div>
    </div>
  )
}