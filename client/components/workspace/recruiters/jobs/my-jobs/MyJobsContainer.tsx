'use client'
import { useAppSelector } from "@/redux/lib/hooks"
import JobCard from "./JobCard"
import { fetchJobStatus, myJobs } from "@/redux/features/job"
import { useEffect } from "react"
import { ScaleLoader } from "react-spinners"

const MyJobsContainer = () => {
  const myCurrentJobs = useAppSelector(myJobs)
  const currentJobFetchStatus = useAppSelector(fetchJobStatus)
  useEffect(()=>console.log(myCurrentJobs, 'myCurrentJobs'))
  return (
    <div className="w-full h-full flex justify-center items-center relative">
        {currentJobFetchStatus==='pending'?<div className="w-full h-full absolute top-0 left-0 flex justify-center items-center">
          <ScaleLoader color="white" barCount={4} height={24}/>
        </div>:null}
        <div className="w-[60%] h-[92%] flex flex-col overflow-y-scroll scrollbar-hidden gap-4">
            {
              myCurrentJobs.map((item:any)=><JobCard job={item} key={item._id}/>)
            }
        </div>
      </div>
  )
}

export default MyJobsContainer
