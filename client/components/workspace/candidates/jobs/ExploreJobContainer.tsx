'use client'
import { ScaleLoader } from 'react-spinners'
import JobCard from "./JobCard"
import { exploreAllJobs, exploreJobs, getAllJobsStatus } from '@/redux/features/job'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { useEffect } from 'react'
import Loading from '@/components/utils/Loading'
import Error from '@/components/utils/Error'

const ExploreJobContainer = () => {
  const dispatch = useAppDispatch();
  const currentExploreAllJobs = useAppSelector(exploreJobs)
  const currentExploreAllJobsStatus = useAppSelector(getAllJobsStatus)

  useEffect(()=>{
    if(!currentExploreAllJobs.length) dispatch(exploreAllJobs())
  },[])
  if(currentExploreAllJobsStatus==='pending') return <Loading/>
  if(currentExploreAllJobsStatus==='error') return <Error/>
  return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-[60%] h-[92%] flex flex-col overflow-y-scroll scrollbar-hidden gap-4">
          {
            currentExploreAllJobs.map((item:any)=><JobCard key={item._id} job={item}/>)
          }
        </div>
      </div>
  )
}

export default ExploreJobContainer
