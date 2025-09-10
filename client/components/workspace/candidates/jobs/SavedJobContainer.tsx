'use client'
import JobCard from "./JobCard"
import { getAllSavedJobs, savedJobs, getAllJobsStatus } from '@/redux/features/job'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { useEffect } from 'react'
import Loading from '@/components/utils/Loading'
import Error from '@/components/utils/Error'
import { Bookmark } from 'lucide-react'  // Hero icon

const SavedJobContainer = () => {
  const dispatch = useAppDispatch();
  const currentAllSavedJobs = useAppSelector(savedJobs)
  const currentGetAllSavedJobsStatus = useAppSelector(getAllJobsStatus)

  useEffect(()=>{
    if(!currentAllSavedJobs?.length || currentGetAllSavedJobsStatus==='error') {
      dispatch(getAllSavedJobs())
    }
  },[])

  if(currentGetAllSavedJobsStatus==='pending') return <Loading/>
  if(currentGetAllSavedJobsStatus==='error') return <Error/>

  // 🔹 HERO SECTION (when no saved jobs exist)
  if(!currentAllSavedJobs?.length){
    return (
      <section className="flex flex-col w-full h-full items-center justify-center text-center px-4">
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full bg-gray-100 mb-4">
            <Bookmark className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-300">
            No Saved Jobs Yet
          </h2>
          <p className="mt-2 text-gray-400 max-w-md">
            You haven’t saved any jobs yet. Save jobs while exploring to quickly access them later in your dashboard.
          </p>
        </div>
      </section>
    )
  }

  // 🔹 NORMAL JOB LIST
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-[60%] h-[92%] flex flex-col overflow-y-scroll scrollbar-hidden gap-4">
        {
          currentAllSavedJobs.map((item:any)=>(
            <JobCard key={item._id} job={item}/>
          ))
        }
      </div>
    </div>
  )
}

export default SavedJobContainer
