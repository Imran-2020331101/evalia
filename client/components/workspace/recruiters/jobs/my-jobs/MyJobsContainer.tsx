import JobCard from "./JobCard"

const MyJobsContainer = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
        <div className="w-[60%] h-[92%] flex flex-col overflow-y-scroll scrollbar-hidden gap-4">
            <JobCard/>
            <JobCard/>
            <JobCard/>
            <JobCard/>
            <JobCard/>
            <JobCard/>
            <JobCard/>
            <JobCard/>
            <JobCard/>
        </div>
      </div>
  )
}

export default MyJobsContainer
