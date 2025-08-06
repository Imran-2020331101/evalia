'use client'

import { useState, useEffect } from 'react'
import { Candidate, Filters, Weights, SortBy, SortOrder } from '@/types/resume'
import SearchBar from '@/components/resume/SearchBar'
import ResultsTable from '@/components/resume/ResultsTable'
import SearchFilters from '@/components/resume/SearchFilters'

const ResumeSearchPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [advancedSearchEnabled, setAdvancedSearchEnabled] = useState(false)
  const [topK, setTopK] = useState(10)
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    institution: '',
    degree: '',
    minGPA: 0,
    minExperience: 0,
    industry: '',
    skills: '',
    projects: '',
    jobDescription: ''
  })

  // Weights state (default equal weights)
  const [weights, setWeights] = useState<Weights>({
    skills: 25,
    experience: 25,
    projects: 25,
    education: 25
  })

  // Sort state
  const [sortBy, setSortBy] = useState<SortBy>('totalScore')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Basic search - only job description
  const basicSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/resume/basic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: filters.jobDescription,
        }),
        credentials: 'include',
      })

      const data = await response.json()
      console.log(data);
      if (data.success) {
        setCandidates(data.candidates)
        setFilteredCandidates(data.candidates)
      }
    } catch (error) {
      console.error('Basic search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Advanced search - all filters and weights
  const advancedSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/resume/advanced-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: filters.jobDescription,
          industry: filters.industry,
          skills: filters.skills,
          projects: filters.projects,
          education: {
            degree: filters.degree,
            institute: filters.institution,
            minGPA: filters.minGPA,
          },
          minExperience: filters.minExperience,
          weights,
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
      console.error('Advanced search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetWeights = () => {
    setWeights({ skills: 25, experience: 25, projects: 25, education: 25 })
  }

  const handleSort = (column: SortBy) => {
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
      degree: '',
      minGPA: 0,
      minExperience: 0,
      industry: '',
      skills: '',
      projects: '',
      jobDescription: ''
    })
  }

  return (
    <div className="min-h-screen bg-black p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Discover Your Next Hire</h1>
          <p className="text-slate-400">Find and evaluate candidates with advanced filtering and scoring</p>
        </div>
        
        <SearchBar 
          filters={filters}
          setFilters={setFilters}
          loading={loading}
          onSearch={basicSearch}
        />
        
        <div className="flex gap-8">
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            weights={weights}
            onWeightsChange={setWeights}
            topK={topK}
            onTopKChange={setTopK}
            loading={loading}
            onSearch={advancedSearch}
            onClearFilters={clearFilters}
    />

          <ResultsTable
            candidates={filteredCandidates}
            loading={loading}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </div>
      </div>
    </div>
  )
}

export default ResumeSearchPage