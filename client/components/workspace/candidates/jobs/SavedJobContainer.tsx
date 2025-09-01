'use client'
import { ScaleLoader } from 'react-spinners'
import JobCard from "./JobCard"
import { exploreAllJobs, exploreJobs, getAllJobsStatus, getAllSavedJobs, savedJobs } from '@/redux/features/job'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { useEffect } from 'react'
import Loading from '@/components/utils/Loading'
import Error from '@/components/utils/Error'

const SavedJobContainer = () => {
  const dispatch = useAppDispatch();
  const currentAllSavedJobs = useAppSelector(savedJobs)
  const currentGetAllSavedJobsStatus = useAppSelector(getAllJobsStatus)

  useEffect(()=>{
    if(!currentAllSavedJobs.length) dispatch(getAllSavedJobs())
  },[])
  if(currentGetAllSavedJobsStatus==='pending') return <Loading/>
  if(currentGetAllSavedJobsStatus==='error') return <Error/>
  return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-[60%] h-[92%] flex flex-col overflow-y-scroll scrollbar-hidden gap-4">
          {
            currentAllSavedJobs.map((item:any)=><JobCard key={item._id} job={item}/>)
          }
        </div>
      </div>
  )
}

export default SavedJobContainer
