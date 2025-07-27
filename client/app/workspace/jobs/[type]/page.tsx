import CandidatesJobContainer from '@/components/workspace/candidates/jobs/CandidatesJobContainer'
import React from 'react'

const JobsTypePage = () => {
  return (
    <div className='w-full h-full'>
       {/* conditional render will take place later between candidate and recruiters */}
      <CandidatesJobContainer/>
    </div>
  )
}

export default JobsTypePage
