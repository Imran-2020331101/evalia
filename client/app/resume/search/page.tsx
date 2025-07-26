'use client'

import { useState, useEffect } from 'react'

interface Candidate {
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
    technologies: string[]
  }
  education: {
    score: number
    degree: string
    institution: string
    gpa: number
  }
  totalScore: number
}

interface Filters {
  institution: string
  minGPA: number
  maxGPA: number
  minExperience: number
  maxExperience: number
  skills: string[]
  technologies: string[]
}

interface Weights {
  skills: number
  experience: number
  projects: number
  education: number
}

const ResumeSearchPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    institution: '',
    minGPA: 0,
    maxGPA: 4.0,
    minExperience: 0,
    maxExperience: 20,
    skills: [],
    technologies: []
  })

  // Weights state (default equal weights)
  const [weights, setWeights] = useState<Weights>({
    skills: 25,
    experience: 25,
    projects: 25,
    education: 25
  })

  // Sort state
  const [sortBy, setSortBy] = useState<'totalScore' | 'skills' | 'experience' | 'projects' | 'education'>('totalScore')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Sample institutions and skills for filter dropdowns
  const [institutions, setInstitutions] = useState<string[]>([
    'MIT', 'Stanford University', 'Harvard University', 'UC Berkeley', 'Carnegie Mellon'
  ])
  const [availableSkills, setAvailableSkills] = useState<string[]>([
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'Machine Learning', 'AWS', 'Docker'
  ])

  const searchCandidates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/resume/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          filters,
          weights,
          sortBy,
          sortOrder
        }),
      })

      const data = await response.json()
      if (data.success) {
        setCandidates(data.candidates)
        setFilteredCandidates(data.candidates)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWeightChange = (category: keyof Weights, value: number) => {
    const newWeights = { ...weights, [category]: value }
    
    // Ensure weights sum to 100
    const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
    if (total <= 100) {
      setWeights(newWeights)
    }
  }

  const resetWeights = () => {
    setWeights({ skills: 25, experience: 25, projects: 25, education: 25 })
  }

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handleSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const clearFilters = () => {
    setFilters({
      institution: '',
      minGPA: 0,
      maxGPA: 4.0,
      minExperience: 0,
      maxExperience: 20,
      skills: [],
      technologies: []
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Resume Search & Ranking</h1>
        
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-80 bg-white rounded-lg shadow-md p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
              <button 
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>

            {/* Search Query */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter keywords, skills, or job titles..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Weights */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Category Weights</h3>
              <div className="space-y-3">
                {Object.entries(weights).map(([category, weight]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {category}
                      </label>
                      <span className="text-sm text-gray-600">{weight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weight}
                      onChange={(e) => handleWeightChange(category as keyof Weights, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
                <div className="text-xs text-gray-500">
                  Total: {Object.values(weights).reduce((sum, w) => sum + w, 0)}%
                </div>
                <button 
                  onClick={resetWeights}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset to Equal (25% each)
                </button>
              </div>
            </div>

            {/* Education Filters */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Education</h3>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
                </label>
                <select
                  value={filters.institution}
                  onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Institutions</option>
                  {institutions.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min GPA
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={filters.minGPA}
                    onChange={(e) => setFilters(prev => ({ ...prev, minGPA: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max GPA
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={filters.maxGPA}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxGPA: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Experience Filters */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Experience</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Years
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minExperience}
                    onChange={(e) => setFilters(prev => ({ ...prev, minExperience: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Years
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.maxExperience}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxExperience: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => handleSkillFilter(skill)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.skills.includes(skill)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={searchCandidates}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Searching...' : 'Search Candidates'}
            </button>
          </div>

          {/* Main Content - Results Table */}
          <div className="flex-1 bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Search Results ({filteredCandidates.length} candidates)
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="totalScore">Total Score</option>
                    <option value="skills">Skills Score</option>
                    <option value="experience">Experience Score</option>
                    <option value="projects">Projects Score</option>
                    <option value="education">Education Score</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('skills')}
                    >
                      Skills Score {sortBy === 'skills' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('experience')}
                    >
                      Experience Score {sortBy === 'experience' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('projects')}
                    >
                      Projects Score {sortBy === 'projects' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('education')}
                    >
                      Education Score {sortBy === 'education' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalScore')}
                    >
                      Total Score {sortBy === 'totalScore' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Loading candidates...
                      </td>
                    </tr>
                  ) : filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No candidates found. Try adjusting your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-500">{candidate.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.skills.score)}`}>
                            {candidate.skills.score}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {candidate.skills.details.slice(0, 2).join(', ')}
                            {candidate.skills.details.length > 2 && '...'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.experience.score)}`}>
                            {candidate.experience.score}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {candidate.experience.years} years
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.projects.score)}`}>
                            {candidate.projects.score}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {candidate.projects.count} projects
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.education.score)}`}>
                            {candidate.education.score}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {candidate.education.degree}
                          </div>
                          <div className="text-xs text-gray-500">
                            GPA: {candidate.education.gpa}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(candidate.totalScore)}`}>
                            {candidate.totalScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            View Details
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Contact
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeSearchPage