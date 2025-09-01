'use client'
import { ScaleLoader } from 'react-spinners'
import JobCard from "./JobCard"
import { getAllAppliedJobs, appliedJobs, getAllJobsStatus } from '@/redux/features/job'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { useEffect } from 'react'
import Loading from '@/components/utils/Loading'
import Error from '@/components/utils/Error'

const AppliedJobContainer = () => {
  const dispatch = useAppDispatch();
  const currentAppliedJobs = useAppSelector(appliedJobs)
  const currentExploreAllJobsStatus = useAppSelector(getAllJobsStatus)

  useEffect(()=>{
    if(!currentAppliedJobs.length) dispatch(getAllAppliedJobs())
  },[])
  if(currentExploreAllJobsStatus==='pending') return <Loading/>
  if(currentExploreAllJobsStatus==='error') return <Error/>
  return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-[60%] h-[92%] flex flex-col overflow-y-scroll scrollbar-hidden gap-4">
          {
            currentAppliedJobs.map((item:any)=><JobCard key={item._id} job={item}/>)
          }
        </div>
      </div>
  )
}

export default AppliedJobContainer
