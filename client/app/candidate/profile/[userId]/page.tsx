'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Download, 
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
  AlertCircle,
  Calendar,
  Building,
  ExternalLink,
  Star
} from 'lucide-react'
import { Profile } from '@/app/types/UserProfile'

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      console.log('🔍 [DEBUG] Starting fetchCandidateProfile with userId:', userId)
      
      if (!userId) {
        console.error('❌ [ERROR] User ID is required but not provided')
        setError('User ID is required')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        console.log('📡 [API] Making request to Spring Boot backend:', `http://localhost:8080/api/users/profile/${userId}`)
        
        // Fetch candidate's profile data from Spring Boot backend
        const response = await fetch(`http://localhost:8080/api/users/profile/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials:'include'
        })

        console.log('📡 [API] Response status:', response.status, response.statusText)
        console.log('📡 [API] Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ [API ERROR] Response not OK:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          })
          throw new Error(`Failed to fetch candidate profile: ${response.status} ${response.statusText}`)
        }

        const responseText = await response.text()
        console.log('📦 [RAW RESPONSE]:', responseText)

        let profileData: Profile
        try {
          profileData = JSON.parse(responseText)
          console.log('✅ [PARSED DATA] Profile structure:', {
            hasUser: !!profileData.user,
            hasResumeData: !!profileData.resumeData,
            userFields: profileData.user ? Object.keys(profileData.user) : [],
            resumeDataFields: profileData.resumeData ? Object.keys(profileData.resumeData) : []
          })
          
          // Log detailed structure
          if (profileData.user) {
            console.log('👤 [USER DATA]:', profileData.user)
          }
          
          if (profileData.resumeData) {
            console.log('📄 [RESUME DATA] Overview:', {
              industry: profileData.resumeData.industry,
              hasContact: !!profileData.resumeData.contact,
              hasExperience: !!profileData.resumeData.experience && profileData.resumeData.experience.length,
              hasEducation: !!profileData.resumeData.education && profileData.resumeData.education.length,
              hasSkills: !!profileData.resumeData.skills,
              hasProjects: !!profileData.resumeData.projects && profileData.resumeData.projects.length,
              hasCertifications: !!profileData.resumeData.certifications && profileData.resumeData.certifications.length,
              hasAwards: !!profileData.resumeData.awards && profileData.resumeData.awards.length
            })
            
            if (profileData.resumeData.contact) {
              console.log('📞 [CONTACT INFO]:', profileData.resumeData.contact)
            }
            
            if (profileData.resumeData.skills) {
              console.log('🛠️ [SKILLS DATA]:', profileData.resumeData.skills)
            }
          }
        } catch (parseError) {
          console.error('❌ [JSON PARSE ERROR]:', parseError)
          console.log('📝 [RAW TEXT] (first 500 chars):', responseText.substring(0, 500))
          throw new Error('Invalid JSON response from server')
        }

        console.log('✅ [SUCCESS] Profile data loaded successfully')
        setProfile(profileData)
      } catch (error) {
        console.error('❌ [FETCH ERROR] Failed to fetch candidate profile:', error)
        console.error('❌ [ERROR STACK]:', error instanceof Error ? error.stack : 'No stack trace')
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
        console.log('🏁 [COMPLETE] fetchCandidateProfile finished')
      }
    }

    fetchCandidateProfile()
  }, [userId])

  const handleDownloadResume = () => {
    console.log('⬇️ [DOWNLOAD] Attempting to download resume')
    console.log('⬇️ [DOWNLOAD] Profile data:', {
      hasProfile: !!profile,
      hasResumeData: !!profile?.resumeData,
      fileLink: profile?.resumeData?.fileLink
    })
    
    if (profile?.resumeData?.fileLink) {
      console.log('✅ [DOWNLOAD] Opening resume URL:', profile.resumeData.fileLink)
      // Open the resume download URL in a new tab
      window.open(profile.resumeData.fileLink, '_blank')
    } else {
      console.warn('⚠️ [DOWNLOAD] No resume URL available')
      console.log('🔍 [DEBUG] Profile structure:', JSON.stringify(profile, null, 2))
    }
  }

  if (isLoading) {
    console.log('⏳ [LOADING] Showing loading state for userId:', userId)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    console.error('❌ [ERROR STATE] Showing error page:', { error, hasProfile: !!profile })
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Profile</h2>
          <p className="text-gray-400 mb-4">{error || "Profile not found"}</p>
          <button
            onClick={() => router.push('/recruiter/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  // Log successful render
  console.log('🎨 [RENDER] Successfully rendering profile for:', {
    userId,
    userName: profile.user?.name,
    userEmail: profile.user?.email,
    industry: profile.resumeData?.industry,
    hasExperience: !!profile.resumeData?.experience?.length,
    hasEducation: !!profile.resumeData?.education?.length,
    hasSkills: !!profile.resumeData?.skills,
    hasProjects: !!profile.resumeData?.projects?.length
  })

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-5xl mx-auto mt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Candidate Profile
            </h1>
            <p className="text-gray-400">
              Detailed candidate information and professional background
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => router.back()}
              className="flex items-center px-4 py-2 text-gray-300 border border-gray-600 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </button>
            
            {profile.resumeData?.fileLink && (
              <button
                onClick={handleDownloadResume}
                className="flex items-center px-4 py-2 text-white border border-blue-600 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </button>
            )}
          </div>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {(profile.user.name || profile.resumeData.contact?.email?.split('@')[0] || 'U').split(' ').map((n: string) => n[0]).join('')}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{profile.user.name || profile.resumeData.contact?.email?.split('@')[0] || 'Candidate'}</h2>
              <p className="text-blue-400 font-medium mb-3">{profile.resumeData.industry || 'Not specified'}</p>
              
              {profile.resumeData.analysis?.sections && profile.resumeData.analysis.sections.length > 0 && (
                <p className="text-gray-300 mb-4 leading-relaxed">{profile.resumeData.analysis.sections.join(', ')}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-sm">{profile.user.email}</span>
                </div>
                {profile.resumeData.contact?.phone && (
                  <div className="flex items-center text-gray-300">
                    <Phone className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm">{profile.resumeData.contact.phone}</span>
                  </div>
                )}
                {profile.resumeData.contact?.location && (
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm">{profile.resumeData.contact.location}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-sm">Joined {new Date(profile.user.createdAt || profile.resumeData.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-4 mt-4">
                {profile.resumeData.contact?.linkedin && (
                  <a
                    href={profile.resumeData.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {profile.resumeData.contact?.github && (
                  <a
                    href={profile.resumeData.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Experience & Education Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Experience */}
          {profile.resumeData.experience && profile.resumeData.experience.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                Work Experience
              </h2>
              <div className="space-y-6">
                {profile.resumeData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-600 pl-4">
                    <h3 className="font-semibold text-white">{exp.job_title}</h3>
                    <p className="text-blue-400 font-medium">{exp.company}</p>
                    <p className="text-gray-400 text-sm mb-3">{exp.duration}</p>
                    
                    {exp.description && exp.description.length > 0 && (
                      <div className="mb-3">
                        {exp.description.map((desc, descIndex) => (
                          <p key={descIndex} className="text-gray-300 text-sm mb-1">
                            • {desc}
                          </p>
                        ))}
                      </div>
                    )}
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="bg-gray-800 border border-gray-600 rounded p-3">
                        <h4 className="text-sm font-medium text-green-400 mb-2">Key Achievements:</h4>
                        {exp.achievements.map((achievement, achIndex) => (
                          <p key={achIndex} className="text-gray-300 text-xs mb-1">
                            ★ {achievement}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profile.resumeData.education && profile.resumeData.education.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-400" />
                Education
              </h2>
              <div className="space-y-4">
                {profile.resumeData.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-green-600 pl-4">
                    <h3 className="font-semibold text-white">{edu.degree}</h3>
                    <p className="text-green-400 font-medium">{edu.institution}</p>
                    <p className="text-gray-400 text-sm">
                      {edu.year} {edu.gpa && `• GPA: ${edu.gpa}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Projects */}
        {profile.resumeData.projects && profile.resumeData.projects.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-400" />
              Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.resumeData.projects.map((project, index) => (
                <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                  <h3 className="font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{project.description}</p>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Certifications & Awards */}
          <div className="space-y-8">
            {profile.resumeData.certifications && profile.resumeData.certifications.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-400" />
                  Certifications
                </h2>
                <div className="space-y-3">
                  {profile.resumeData.certifications.map((cert, index) => (
                    <div key={index} className="text-gray-300">
                      <p className="font-medium text-white">{cert.title}</p>
                      <p className="text-sm text-gray-400">{cert.provider} • {cert.date}</p>
                      {cert.link && (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                        >
                          View Certificate
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.resumeData.awards && profile.resumeData.awards.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-blue-400" />
                  Awards & Honors
                </h2>
                <div className="space-y-3">
                  {profile.resumeData.awards.map((award, index) => (
                    <div key={index} className="text-gray-300">
                      <p className="font-medium text-white">{award.title}</p>
                      <p className="text-sm text-gray-400">{award.organization} • {award.year}</p>
                      {award.description && (
                        <p className="text-sm text-gray-400 mt-1">{award.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interests & Volunteer */}
          <div className="space-y-8">
            {profile.resumeData.interests && profile.resumeData.interests.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.resumeData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 text-gray-300 border border-gray-600 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.resumeData.volunteer && profile.resumeData.volunteer.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  Volunteer Experience
                </h2>
                <div className="space-y-2">
                  {profile.resumeData.volunteer.map((vol, index) => (
                    <p key={index} className="text-gray-300 text-sm">
                      • {vol}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Code className="w-5 h-5 mr-2 text-blue-400" />
            Skills & Expertise
          </h2>
          <div className="space-y-6">
            {profile.resumeData.skills?.technical && profile.resumeData.skills.technical.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-200 mb-3">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.resumeData.skills.technical.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-900 text-blue-200 border border-blue-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.resumeData.skills?.tools && profile.resumeData.skills.tools.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-200 mb-3">Tools & Frameworks</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.resumeData.skills.tools.map((tool, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-900 text-purple-200 border border-purple-700 rounded-full text-sm"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.resumeData.skills?.soft && profile.resumeData.skills.soft.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-200 mb-3">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.resumeData.skills.soft.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-900 text-green-200 border border-green-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.resumeData.skills?.languages && profile.resumeData.skills.languages.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-200 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.resumeData.skills.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-900 text-orange-200 border border-orange-700 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Last updated: {new Date(profile.resumeData.uploadedAt || profile.user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
