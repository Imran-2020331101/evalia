'use client'
import { useAppSelector } from "@/redux/lib/hooks"
import JobCard from "./JobCard"
import { myJobs } from "@/redux/features/job"
import { useEffect } from "react"

const MyJobsContainer = () => {
  const myCurrentJobs = useAppSelector(myJobs)
  useEffect(()=>console.log(myCurrentJobs, 'myCurrentJobs'))
  return (
    <div className="w-full h-full flex justify-center items-center">
        <div className="w-[60%] h-[92%] flex flex-col overflow-y-scroll scrollbar-hidden gap-4">
            {
              myCurrentJobs.map((item:any)=><JobCard jobId={item.jobId} key={item.jobId}/>)
            }
        </div>
      </div>
  )
}

export default MyJobsContainer
