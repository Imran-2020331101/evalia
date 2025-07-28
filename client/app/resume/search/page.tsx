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
  minExperience: number
  skills: string
  technologies: string
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
  const [advancedSearchEnabled, setAdvancedSearchEnabled] = useState(false)
  const [topK, setTopK] = useState(10)
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    institution: '',
    minGPA: 0,
    minExperience: 0,
    skills: '',
    technologies: ''
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

  // Sample institutions for filter dropdown
  const [institutions, setInstitutions] = useState<string[]>([
    'MIT', 'Stanford University', 'Harvard University', 'UC Berkeley', 'Carnegie Mellon','Shahjalal University Of Science and Technology',
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
          advancedSearch: advancedSearchEnabled,
          topK
        }),
        credentials: 'include',
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
    
    // Check if the new total would exceed 100
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

  const clearFilters = () => {
    setFilters({
      institution: '',
      minGPA: 0,
      minExperience: 0,
      skills: '',
      technologies: ''
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/30'
    if (score >= 60) return 'text-yellow-400 bg-yellow-900/30'
    return 'text-red-400 bg-red-900/30'
  }

  return (
    <div className="min-h-screen bg-black p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Your Next Hire</h1>
          <p className="text-slate-400">Find and evaluate candidates with advanced filtering and scoring</p>
        </div>
        
        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-80 bg-gray-900 rounded-xl shadow-2xl p-4 h-fit border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Filters</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdvancedSearchEnabled(!advancedSearchEnabled)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-all ${
                    advancedSearchEnabled
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                    advancedSearchEnabled ? 'border-white bg-white' : 'border-gray-400'
                  }`}>
                    {advancedSearchEnabled && (
                      <svg className="w-1.5 h-1.5 text-blue-600" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    )}
                  </div>
                  precision search
                </button>
                <button 
                  onClick={clearFilters}
                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded border border-blue-400/30 hover:border-blue-300/50 transition-all"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Skills</h3>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="JavaScript, Python, React..."
                className="w-full px-2 py-2 text-sm border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
              />
              {filters.skills && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {filters.skills.split(',').map(skill => skill.trim()).filter(skill => skill).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 text-xs bg-blue-900/50 text-blue-200 rounded border border-blue-700"
                    >
                      {skill}
                      <button
                        onClick={() => {
                          const skillsArray = filters.skills.split(',').map(s => s.trim()).filter(s => s)
                          skillsArray.splice(index, 1)
                          setFilters(prev => ({ ...prev, skills: skillsArray.join(', ') }))
                        }}
                        className="ml-1 text-blue-300 hover:text-blue-100 font-bold text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          
            {/* Education Filters */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Education</h3>
              
              <div className="mb-3">
                <select
                  value={filters.institution}
                  onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
                  className="w-full px-2 py-2 text-sm border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Institutions</option>
                  {institutions.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-300 w-16">Min GPA:</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  value={filters.minGPA}
                  onChange={(e) => setFilters(prev => ({ ...prev, minGPA: parseFloat(e.target.value) }))}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Experience Filters */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Experience</h3>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-300 w-16">Min Exp:</label>
                <input
                  type="number"
                  min="0"
                  value={filters.minExperience}
                  onChange={(e) => setFilters(prev => ({ ...prev, minExperience: parseInt(e.target.value) }))}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Projects Filters */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Projects</h3>
              <input
                type="text"
                value={filters.technologies}
                onChange={(e) => setFilters(prev => ({ ...prev, technologies: e.target.value }))}
                placeholder="React, Node.js, MongoDB..."
                className="w-full px-2 py-2 text-sm border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
              />
              {filters.technologies && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {filters.technologies.split(',').map(tech => tech.trim()).filter(tech => tech).map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 text-xs bg-purple-900/50 text-purple-200 rounded border border-purple-700"
                    >
                      {tech}
                      <button
                        onClick={() => {
                          const techArray = filters.technologies.split(',').map(t => t.trim()).filter(t => t)
                          techArray.splice(index, 1)
                          setFilters(prev => ({ ...prev, technologies: techArray.join(', ') }))
                        }}
                        className="ml-1 text-purple-300 hover:text-purple-100 font-bold text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Extra Search features*/}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-300 w-16">Extra:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Additional criteria..."
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Top K Results */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-300 w-16">Top K:</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Category Weights */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Weights</h3>
              <div className="space-y-2 bg-black p-3 rounded border border-gray-700">
                {Object.entries(weights).map(([category, weight]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-gray-200 capitalize">
                        {category}
                      </label>
                      <span className="text-xs font-semibold text-blue-400 bg-gray-800 px-1.5 py-0.5 rounded">{weight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weight}
                      onChange={(e) => handleWeightChange(category as keyof Weights, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded appearance-none cursor-pointer slider"
                    />
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1 border-t border-gray-600">
                  <span className={`text-xs ${Object.values(weights).reduce((sum, w) => sum + w, 0) === 100 ? 'text-gray-300' : 'text-yellow-400'}`}>
                    Total: {Object.values(weights).reduce((sum, w) => sum + w, 0)}%
                  </span>
                  <button 
                    onClick={resetWeights}
                    className="text-xs text-blue-400 hover:text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/20 hover:border-blue-300/40 transition-all"
                  >
                    Reset
                  </button>
                </div>
                {Object.values(weights).reduce((sum, w) => sum + w, 0) !== 100 && (
                  <div className="mt-2 px-2 py-1 bg-yellow-900/30 border border-yellow-600/50 rounded text-xs text-yellow-300">
                    ⚠️ Weights should sum to 100% for accurate scoring
                  </div>
                )}
              </div>
            </div>


            {/* Search Button */}
            <button
              onClick={searchCandidates}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                'Search Candidates'
              )}
            </button>
          </div>

          {/* Main Content - Results Table */}
          <div className="flex-1 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  Search Results ({filteredCandidates.length} candidates)
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('skills')}
                    >
                      Skills Score {sortBy === 'skills' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('experience')}
                    >
                      Experience Score {sortBy === 'experience' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('projects')}
                    >
                      Projects Score {sortBy === 'projects' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('education')}
                    >
                      Education Score {sortBy === 'education' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSort('totalScore')}
                    >
                      Total Score {sortBy === 'totalScore' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                        Loading candidates...
                      </td>
                    </tr>
                  ) : filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                        No candidates found. Try adjusting your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-white">{candidate.name}</div>
                            <div className="text-sm text-gray-400">{candidate.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.skills.score)}`}>
                            {candidate.skills.score}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {candidate.skills.details.slice(0, 2).join(', ')}
                            {candidate.skills.details.length > 2 && '...'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.experience.score)}`}>
                            {candidate.experience.score}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {candidate.experience.years} years
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.projects.score)}`}>
                            {candidate.projects.score}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {candidate.projects.count} projects
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.education.score)}`}>
                            {candidate.education.score}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {candidate.education.degree}
                          </div>
                          <div className="text-xs text-gray-400">
                            GPA: {candidate.education.gpa}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full ${getScoreColor(candidate.totalScore)}`}>
                            {candidate.totalScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                          <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            View Details
                          </button>
                          <button className="text-green-400 hover:text-green-300 font-medium transition-colors">
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