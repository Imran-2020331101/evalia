'use client'

import React from 'react'
import { Filters, Weights } from '../../types/resume'


interface SearchFiltersProps {
  filters: Filters
  weights: Weights
  topK: number
  loading: boolean
  onTopKChange: (topK: number) => void
  onFiltersChange: (filters: Filters) => void
  onWeightsChange: (weights: Weights) => void
  onSearch: () => void
  onClearFilters: () => void
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  weights,
  topK,
  loading,
  onTopKChange,
  onFiltersChange,
  onWeightsChange,
  onSearch,
  onClearFilters
}) => {
  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Media', 'Government', 'Non-profit'
  ]

  const degrees = [
    'High School', 'Associate Degree', 'Bachelor\'s Degree', 
    'Master\'s Degree', 'PhD', 'Professional Certification'
  ]

  const handleWeightChange = (key: keyof Weights, value: number) => {
    onWeightsChange({ ...weights, [key]: value })
  }

  return (
    <div className="w-80 bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Clear All
        </button>
      </div>

      {/* Minimum Experience */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Minimum Experience (years)
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={filters.minExperience}
          onChange={(e) => onFiltersChange({
            ...filters,
            minExperience: parseInt(e.target.value) || 0
          })}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
        />
      </div>

      {/* Industry */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Industry
        </label>
        <select
          value={filters.industry}
          onChange={(e) => onFiltersChange({ ...filters, industry: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Skills
        </label>
        <textarea
          value={filters.skills}
          onChange={(e) => onFiltersChange({ ...filters, skills: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Enter skills (e.g., JavaScript, Python, React...)"
        />
      </div>

      {/* Projects */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Projects
        </label>
        <textarea
          value={filters.projects}
          onChange={(e) => onFiltersChange({ ...filters, projects: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Enter project keywords..."
        />
      </div>

      {/* Institution */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Institution
        </label>
        <input
          type="text"
          value={filters.institution}
          onChange={(e) => onFiltersChange({ ...filters, institution: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter institution name..."
        />
      </div>

      {/* Degree */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Degree
        </label>
        <select
          value={filters.degree}
          onChange={(e) => onFiltersChange({ ...filters, degree: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Degrees</option>
          {degrees.map((degree) => (
            <option key={degree} value={degree}>{degree}</option>
          ))}
        </select>
      </div>

      {/* Minimum GPA */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Minimum GPA
        </label>
        <input
          type="number"
          min="0"
          max="4"
          step="0.1"
          value={filters.minGPA}
          onChange={(e) => onFiltersChange({
            ...filters,
            minGPA: parseFloat(e.target.value) || 0
          })}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.0"
        />
      </div>

      {/* Job Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Job Description
        </label>
        <textarea
          value={filters.jobDescription}
          onChange={(e) => onFiltersChange({ ...filters, jobDescription: e.target.value })}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Paste job description or requirements..."
        />
      </div>

      {/* Top K Results */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Results
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={topK}
          onChange={(e) => onTopKChange(parseInt(e.target.value) || 10)}
          className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="10"
        />
      </div>

      {/* Advanced Search Button */}
      <div className="mb-6">
        <button
          onClick={onSearch}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Advanced Search
        </button>
      </div>

      

      {/* Advanced Filters */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700">Search Weights</h4>
          
          {/* Skills Weight */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Skills Match ({weights.skills}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.skills}
              onChange={(e) => handleWeightChange('skills', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Experience Weight */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Experience ({weights.experience}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.experience}
              onChange={(e) => handleWeightChange('experience', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Projects Weight */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Projects ({weights.projects}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.projects}
              onChange={(e) => handleWeightChange('projects', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Education Weight */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Education ({weights.education}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.education}
              onChange={(e) => handleWeightChange('education', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
    </div>
  )
}

export default SearchFilters
