'use client'
import { useState } from 'react'
import CreateJobForm from '@/components/workspace/recruiters/jobs/create/CreateJobForm'
import PreviewCreatedJob from '@/components/workspace/recruiters/jobs/create/PreviewCreatedJob'
import { SlidersVertical } from 'lucide-react'
import { domainType, interviewQAStateType, basicStateType, JobType, WorkPlaceType, EmploymentLevelType } from '@/types/create-job'

const CreateJobPage = () => {
  const [basicState, setBasicState] = useState<basicStateType>({
    title:'',
    jobDescription:'',
    jobLocation:'',
    salaryFrom:'0',
    salaryTo:'0',
    deadline:'',
    jobType: JobType.FULL_TIME,
    isOpenJobType:false,
    workPlaceType:WorkPlaceType.HYBRID,
    isOpenWorkPlaceType:false,
    employmentLevelType: EmploymentLevelType.ENTRY,
    isOpenEmploymentLevelType:false
  })
  const [isShowPreview, setIsShowPreview]=useState(false);
  const [requirement, setRequirement]=useState<domainType[]>([]);
  const [responsibilities, setResponsibilities]=useState<domainType[]>([]);
  const [skills, setSkills]=useState<domainType[]>([]);
  const [interviewQA, setInterviewQA] = useState<interviewQAStateType[]>([]);

  return (
    <div className='w-full h-full flex justify-center relative'>
      <button onClick={()=>setIsShowPreview((prev)=>!prev)} className="absolute right-3 top-2 z-30 cursor-pointer group">
        <div className="relative w-full h-full ">
          <div className={` top-[110%] right-[100%] absolute `}>
            <p className='group-hover:flex hidden text-[12px] px-[10px] rounded-lg w-[100px] py-[5px] bg-gray-600 text-white'>{isShowPreview?'Hide Preview':'Show Preview'}</p>
          </div>
          <SlidersVertical size={20}/>
        </div>
      </button>
      <section className={` h-full ${!isShowPreview?'w-[60%]':'w-[55%]'}`}>
        <CreateJobForm 
        requirement={requirement}
        setRequirement={setRequirement}
        responsibilities={responsibilities}
        setResponsibilities={setResponsibilities}
        skills={skills}
        interviewQA ={interviewQA}
        setSkills={setSkills}
        basicState={basicState}
        setBasicState={setBasicState}
        setInterviewQA={setInterviewQA}
        />
      </section>
      {
        isShowPreview && <section className="w-[45%] h-full ">
        <PreviewCreatedJob
         requirement={requirement}
         responsibilities={responsibilities}
         skills={skills}
         basicState={basicState}
         interviewQA={interviewQA}
        />
      </section>
      }
    </div>
  )
}

export default CreateJobPage
