'use client'
import { useAppSelector } from "@/redux/lib/hooks"
import JobCard from "./JobCard"
import { myJobs } from "@/redux/features/job"

const MyJobsContainer = () => {
  const myCurrentJobs = useAppSelector(myJobs)
  return (
    <div className="w-full h-full flex justify-center items-center">
        <div className="w-[60%] h-[92%] flex flex-col overflow-y-scroll scrollbar-hidden gap-4">
            {
              myCurrentJobs.map((item:any)=><JobCard jobId={item.id} key={item.id}/>)
            }
        </div>
      </div>
  )
}

export default MyJobsContainer
