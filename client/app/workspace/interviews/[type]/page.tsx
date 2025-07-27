import CandidatesInterviewContainer from '@/components/workspace/candidates/interviews/InterviewContainer'
import React from 'react'

const interviewTypePage = () => {
  return (
    <div className='w-full h-full'>
      {/* conditional render will take place later between candidate and recruiters */}
      <CandidatesInterviewContainer/>
    </div>
  )
}

export default interviewTypePage
