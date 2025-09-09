'use client'
import JobCard from "./JobCard"
import { exploreAllJobs, exploreJobs, getAllJobsStatus } from '@/redux/features/job'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { useEffect } from 'react'
import Loading from '@/components/utils/Loading'
import Error from '@/components/utils/Error'
import { Search } from 'lucide-react'  // Hero icon

const ExploreJobContainer = () => {
  const dispatch = useAppDispatch();
  const currentExploreAllJobs = useAppSelector(exploreJobs)
  const currentExploreAllJobsStatus = useAppSelector(getAllJobsStatus)

  useEffect(()=>{
    if(!currentExploreAllJobs.length || currentExploreAllJobsStatus==='error') {
      dispatch(exploreAllJobs())
    }
  },[])

  if(currentExploreAllJobsStatus==='pending') return <Loading/>
  if(currentExploreAllJobsStatus==='error') return <Error/>

  // 🔹 HERO SECTION (when no jobs available to explore)
  if(!currentExploreAllJobs.length){
    return (
      <section className="flex flex-col w-full h-full items-center justify-center text-center px-4">
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full bg-gray-100 mb-4">
            <Search className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-300">
            No Jobs Available
          </h2>
          <p className="mt-2 text-gray-400 max-w-md">
            Currently, there are no jobs available to explore. Please check back later for new opportunities.
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
          currentExploreAllJobs.map((item:any)=>(
            <JobCard key={item._id} job={item}/>
          ))
        }
      </div>
    </div>
  )
}

export default ExploreJobContainer
