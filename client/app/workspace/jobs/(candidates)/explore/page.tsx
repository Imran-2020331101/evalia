'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ExploreJobContainer from '@/components/workspace/candidates/jobs/ExploreJobContainer'


const ExploreJobsPage = () => {

  return (
    <div className='w-full h-full'>
      <ExploreJobContainer/>
    </div>
  )
}

export default ExploreJobsPage
