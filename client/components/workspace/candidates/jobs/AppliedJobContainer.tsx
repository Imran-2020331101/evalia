'use client'
import JobCard from "./JobCard"
import { getAllAppliedJobs, appliedJobs, getAllJobsStatus } from '@/redux/features/job'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { useEffect } from 'react'
import Loading from '@/components/utils/Loading'
import Error from '@/components/utils/Error'
import { Briefcase } from 'lucide-react'  // hero icon

const AppliedJobContainer = () => {
  const dispatch = useAppDispatch();
  const currentAppliedJobs = useAppSelector(appliedJobs)
  const currentExploreAllJobsStatus = useAppSelector(getAllJobsStatus)

  useEffect(()=>{
    if(!currentAppliedJobs.length || currentExploreAllJobsStatus==='error') {
      dispatch(getAllAppliedJobs())
    }
  },[])

  if(currentExploreAllJobsStatus==='pending') return <Loading/>
  if(currentExploreAllJobsStatus==='error') return <Error/>

  // 🔹 HERO SECTION (when no applied jobs exist)
  if(!currentAppliedJobs.length){
    return (
      <section className="flex flex-col w-full h-full items-center justify-center text-center px-4">
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full bg-gray-100 mb-4">
            <Briefcase className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-300">
            No Applied Jobs Yet
          </h2>
          <p className="mt-2 text-gray-400 max-w-md">
            You haven’t applied to any jobs yet. Once you start applying, all your applications will appear here in your dashboard.
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
          currentAppliedJobs.map((item:any)=>(
            <JobCard key={item._id} job={item}/>
          ))
        }
      </div>
    </div>
  )
}

export default AppliedJobContainer
