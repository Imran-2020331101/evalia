'use client'
import { useEffect, useState } from 'react'
import CreateJobForm from '@/components/workspace/recruiters/jobs/create/CreateJobForm'
import PreviewCreatedJob from '@/components/workspace/recruiters/jobs/create/PreviewCreatedJob'
import { domainType, interviewQAStateType, basicStateType, JobType, WorkPlaceType, EmploymentLevelType } from '@/types/create-job'
import Switch from '@mui/material/Switch'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { getJobsByOrganization, selectedOrgId } from '@/redux/features/job'
import { useRouter } from 'next/navigation'

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
  const [isShowPreview, setIsShowPreview]=useState(true);
  const [requirement, setRequirement]=useState<domainType[]>([]);
  const [responsibilities, setResponsibilities]=useState<domainType[]>([]);
  const [skills, setSkills]=useState<domainType[]>([]);
  const [interviewQA, setInterviewQA] = useState<interviewQAStateType[]>([]);

  const dispatch = useAppDispatch()
  const router = useRouter()

  const currentSelectedOrgId = useAppSelector(selectedOrgId)

  useEffect(()=>{
    if(!currentSelectedOrgId) return;
    dispatch(getJobsByOrganization(currentSelectedOrgId))
  },[currentSelectedOrgId])

  if(!currentSelectedOrgId) return null;
  return (
    <div className='w-full h-full flex justify-center relative'>
      <button onClick={()=>setIsShowPreview((prev)=>!prev)} className="absolute right-3 top-2 z-30 cursor-pointer group">
        <div className="relative w-full h-full">
          <div className={` top-[110%] right-[20%] absolute `}>
            <p className='group-hover:flex hidden text-[12px] px-[10px] rounded-lg w-[100px] py-[5px] bg-gray-600 text-white'>{isShowPreview?'Hide Preview':'Show Preview'}</p>
          </div>
          <div className="flex gap-1 items-center text-[12px]">
            <Switch defaultChecked/>
          </div>
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
