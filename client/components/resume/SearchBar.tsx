'use client'

import { Filters } from '@/types/resume'

interface SearchBarProps {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  loading: boolean
  onSearch: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({ filters, setFilters, loading, onSearch }) => {
  return (
    <div className="mb-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
      <div className="text-center mb-6">
        <p className="text-gray-400">Describe your ideal candidate in plain English - our AI will find the perfect match</p>
      </div>
      
      <div className="relative max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            value={filters.jobDescription || ''}
            onChange={(e) => setFilters((prev: Filters) => ({ ...prev, jobDescription: e.target.value }))}
            placeholder="Example: 'Looking for a senior full-stack developer with 5+ years experience in React and Node.js, preferably with a computer science degree from a top university and experience building scalable web applications...'"
            className="w-full h-32 px-6 py-4 pr-16 text-lg bg-gray-800 text-white rounded-xl border-2 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 resize-none shadow-inner"
            rows={4}
          />
          
          {/* Search Button as Icon */}
          <button
            onClick={onSearch}
            disabled={loading || !(filters.jobDescription || '').trim()}
            className="absolute top-4 right-4 p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            title={loading ? "AI is analyzing candidates..." : "Search for candidates"}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* Character count */}
          <div className="absolute bottom-3 right-4 text-xs text-gray-500">
            {(filters.jobDescription || '').length}/500
          </div>
        </div>
        
        {/* Search suggestions */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-gray-400 mr-2">Try these:</span>
          {[
            "Senior React developer with AWS experience",
            "Data scientist with Python and machine learning background", 
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setFilters((prev: Filters) => ({ ...prev, jobDescription: suggestion }))}
              className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 hover:text-white transition-all duration-200 border border-gray-600 hover:border-gray-500"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchBar
