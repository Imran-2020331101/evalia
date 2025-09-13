'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { useAppDispatch } from '@/redux/lib/hooks'
import { setPreviewedCandidate } from '@/redux/features/utils'
import { User } from 'lucide-react'

interface CandidateVector {
  "candidate-id": string
  candidateName: string
  skills?: number
  experience?: number
  projects?: number
  education?: number
}

const SearchCandidateCard = ({ candidate }: { candidate: CandidateVector }) => {
  const [candidateDetails, setCandidateDetails] = useState<any>(null)
  const [isShowDetails, setIsShowDetails] = useState(false)
  const dispatch = useAppDispatch()

  // Fetch full candidate info
  useEffect(() => {
    const fetchCandidateDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/user/${candidate['candidate-id']}/single`,
          { withCredentials: true }
        )
        setCandidateDetails(response.data.data)
      } catch (error) {
        console.error('Error fetching candidate details', error)
      }
    }
    fetchCandidateDetails()
  }, [candidate['candidate-id']])

  if (!candidateDetails) return null

  // Compute total score from available metrics
  const scores = [candidate.skills, candidate.experience, candidate.projects, candidate.education].filter(
    (s) => s !== undefined
  ) as number[]
  const totalScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  return (
    <div className="w-full h-auto flex flex-col justify-start bg-gray-800/60 rounded-lg pr-3">
      <div className="w-full h-auto flex justify-between ">
        <div className="flex-1 flex justify-start gap-2 py-2 px-2">
          <button
            onClick={() => dispatch(setPreviewedCandidate(candidateDetails))}
            className="w-[40px] h-[40px] rounded-full mt-1"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {candidateDetails?.user?.profilePictureUrl ? (
                    <Image
                    width={40}
                    height={40}
                    alt="profile pic"
                    src={candidateDetails?.user?.profilePictureUrl}
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <User className="text-gray-300 w-6 h-6" />
                )}
                </div>
          </button>
          <div className="flex-1 h-[40px] flex flex-col items-start gap-1">
            <button
              onClick={() => dispatch(setPreviewedCandidate(candidateDetails))}
              className="font-semibold hover:underline cursor-pointer text-gray-200"
            >
              {candidateDetails?.user?.name || candidate.candidateName}
            </button>
            <p className="text-xs text-gray-400">{candidateDetails?.user?.location}</p>
          </div>
        </div>

        <button
          onClick={() => setIsShowDetails((prev) => !prev)}
          className="text-[12px] px-3 h-[32px] rounded-md bg-blue-700 hover:bg-blue-600 mt-4"
        >
          {!isShowDetails ? 'Show Details' : 'Hide Details'}
        </button>
      </div>

      {isShowDetails && (
        <div className="w-full flex pb-[20px]">
          {/* Left section - Scores */}
          <div className="w-[50%] h-auto pl-[50px]">
            <div className="space-y-4">
              {candidate.skills !== undefined && (
                <ScoreRow label="Skills" value={candidate.skills} />
              )}
              {candidate.experience !== undefined && (
                <ScoreRow label="Experience" value={candidate.experience} />
              )}
              {candidate.projects !== undefined && (
                <ScoreRow label="Projects" value={candidate.projects} />
              )}
              {candidate.education !== undefined && (
                <ScoreRow label="Education" value={candidate.education} />
              )}
            </div>
          </div>

          <div className="w-[2px] h-[80%] self-center bg-gray-700 ml-10"></div>

          {/* Right section - Total Score */}
          <div className="pt-4 flex-1 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-medium text-gray-300 mb-3">Total Score</p>
            <CircleProgress value={totalScore} />
          </div>
        </div>
      )}
    </div>
  )
}

const ScoreRow = ({ label, value }: { label: string; value: number }) => (
  <div>
    <p className="text-sm font-medium text-gray-300 mb-1">
      {label} ({Math.round(value * 100)}%)
    </p>
    <ProgressBar value={value} />
  </div>
)

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
    <div
      className="bg-blue-500 h-2 rounded-full transition-all"
      style={{ width: `${value * 100}%` }}
    />
  </div>
)

const CircleProgress = ({ value }: { value: number }) => {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          className="text-gray-200"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="48"
          cy="48"
        />
        <circle
          className="text-blue-500 transition-all duration-500"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="48"
          cy="48"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value)}
        />
      </svg>
      <span className="absolute text-lg font-semibold text-gray-400">
        {Math.round(value * 100)}%
      </span>
    </div>
  )
}

export default SearchCandidateCard
