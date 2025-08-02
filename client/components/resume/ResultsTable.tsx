'use client'

import { Candidate, SortBy, SortOrder } from '@/types/resume'

interface ResultsTableProps {
  candidates: Candidate[]
  loading: boolean
  sortBy: SortBy
  setSortBy: React.Dispatch<React.SetStateAction<SortBy>>
  sortOrder: SortOrder
  onSort: (column: SortBy) => void
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  candidates,
  loading,
  sortBy,
  setSortBy,
  sortOrder,
  onSort,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/30'
    if (score >= 60) return 'text-yellow-400 bg-yellow-900/30'
    return 'text-red-400 bg-red-900/30'
  }

  return (
    <div className="flex-1 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            Search Results ({candidates.length} candidates)
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
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
                onClick={() => onSort('skills')}
              >
                Skills Score {sortBy === 'skills' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => onSort('experience')}
              >
                Experience Score {sortBy === 'experience' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => onSort('projects')}
              >
                Projects Score {sortBy === 'projects' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => onSort('education')}
              >
                Education Score {sortBy === 'education' && (sortOrder === 'desc' ? '↓' : '↑')}
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => onSort('totalScore')}
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
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                  No candidates found. Try adjusting your search criteria.
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => (
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
  )
}

export default ResultsTable
