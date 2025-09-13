'use client'

import Image from 'next/image'
import axios from 'axios'
import { CheckCheck, Save, Send } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { previewedJob, setPreviewedJob, setPreviewOrganization } from '@/redux/features/utils'
import { useEffect, useState } from 'react'
import { appliedJobs, applyJob, applyJobId, applyJobStatus, savedJobs, saveJob, saveJobId, saveJobStatus, setApplyJobId, setApplyJobStatus, setSaveJobId, unsaveJob} from '@/redux/features/job'
import { format } from 'timeago.js'
import { ClipLoader } from 'react-spinners'
import { user } from '@/redux/features/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const JobCard = ({jobItem}:{jobItem:any}) => {
  const [job,setJob]=useState<any>({});
  const {_id, company, title, jobLocation, jobType, status, workPlaceType, salary, createdAt, deadline}=job;
  const [organization,setOrganization]=useState<any>(null);
  const [isApplied, setIsApplied]=useState<boolean>(false)
  const [isSaved, setIsSaved]=useState<boolean>(false)
  const [isLoadingFetchJob, setIsLoadingFetchJob]=useState<boolean>(false);
  const [isShowDetails, setIsShowDetails] = useState<boolean>(false);

  const dispatch = useAppDispatch()
  const router = useRouter()

  const currentPreviewedJob = useAppSelector(previewedJob);
  const currentAppliedJobs = useAppSelector(appliedJobs);
  const currentSavedJobs = useAppSelector(savedJobs)
  const currentApplyJobStatus = useAppSelector(applyJobStatus);
  const currentApplyJobId = useAppSelector(applyJobId);
  const currentSaveJobId = useAppSelector(saveJobId);
  const currentSaveJobStatus = useAppSelector(saveJobStatus);
  const currentUser = useAppSelector(user);

  
  const handleSetPreviewedJOb = ()=>{
    dispatch(setPreviewedJob({...job, company:organization}))
    setPreviewedJob(true)
  }
  const handleApplyToJob = ()=>{
    if(!currentUser?.resumeData){
      toast.error('please build your profile first :(');
      router.push('/profile')
      return;
    }
    dispatch(setApplyJobId(_id));
    dispatch(applyJob(_id));
  }
  const handleSaveJob = ()=>{
    dispatch(setSaveJobId(_id))
    dispatch(saveJob(_id));
  }
  const handleUnsaveJob = ()=>{
    dispatch(setSaveJobId(_id))
    dispatch(unsaveJob(_id))
  }

  useEffect(()=>{
    const {jobId}=jobItem;
    const fetchJob = async()=>{
      try {
        setIsLoadingFetchJob(true);
        const response = await axios.get(`http://localhost:8080/api/job/${jobId}`,{withCredentials:true})
        console.log(response.data, 'fetchJob')
        setJob(response.data.data);
      } catch (error:any) {
        console.log(error)
      }
      finally{
        setIsLoadingFetchJob(false);
      }
    }
    fetchJob();
  },[jobItem])

  useEffect(()=>{
    const fetchOrg = async ()=>{
      try {
        const organizationId = company?.OrganizationId;
        const response = await axios.get(`http://localhost:8080/api/organization/${organizationId}`,{withCredentials:true})
        setOrganization(response.data);
    } catch (error:any) {
        return error
    }
    }
    if(!organization && company) fetchOrg()
    if(currentApplyJobStatus!=='idle') dispatch(setApplyJobStatus('idle'));
  },[company])
  useEffect(()=>{
    const applied = currentAppliedJobs?.find((item:any)=>item?._id===_id)
    if(applied) setIsApplied(true);
    const saved = currentSavedJobs?.find((item:any)=>item?._id===_id);
    if(saved) setIsSaved(true)
    else {setIsSaved(false)}
  },[currentAppliedJobs?.length, currentSavedJobs?.length, job])
  if(!organization) return null;

  // derive metrics from jobItem vector
  const metrics = [jobItem?.skills, jobItem?.experience, jobItem?.projects, jobItem?.education].filter((m:any)=>m!==null && m!==undefined) as number[]
  const totalScore = metrics.length>0 ? metrics.reduce((a,b)=>a+b,0)/metrics.length : 0

  return (
    <div className="w-full h-auto border-b-[1px] border-transparent bg-gray-900/40 px-1  transition-colors duration-300 py-2 rounded-lg hover:border-blue-400  flex flex-col justify-between shrink-0">
      <div className="h-full w-auto flex justify-start items-center gap-4">
        <button onClick={()=>dispatch(setPreviewOrganization(organization))} className="w-[55px] h-[50px] self-start rounded-sm">
          <Image src={organization?.organizationProfileImageUrl||'https://i.pinimg.com/736x/cf/41/82/cf4182b20a5c74ceac60149066a52841.jpg'}
           alt='company logo' width={100} height={100} className='w-full h-full object-cover rounded-sm'/>
        </button>
        <div className="flex flex-col h-auto justify-between items-start flex-1">
          <button onClick={()=>dispatch(handleSetPreviewedJOb)} className='text-[12px] text-gray-100 font-semibold tracking-wider cursor-pointer hover:underline text-left'>{title}</button>
          <button onClick={()=>dispatch(handleSetPreviewedJOb)} className="w-full h-auto items-center justify-start flex flex-col overflow-hidden">
            <div className="w-full h-auto flex mt-[2px]">
              <p className='text-[12px] text-gray-300'>{organization?.organizationName||''}</p>
            </div>
            <div className="w-full h-auto flex mt-[-4px]">
              <p className='text-[12px] text-gray-300'>{jobLocation}</p><p className='font-bold text-sm mx-1'>.</p>
              <p className='text-[12px] text-gray-300'>{ deadline?format(createdAt):''}</p>
            </div>
          </button>
        </div>
              <div className="h-full w-auto flex justify-end items-center gap-1 mt-2">
        {/* <button  disabled={currentApplyJobStatus==='pending' ?true:false} onClick={!isSaved?handleSaveJob:handleUnsaveJob} className={`w-[60px] py-2 rounded-sm border border-gray-300 ${isSaved?'bg-gray-700 text-gray-100':'hover:border-blue-500 text-white  bg-gray-900'} flex font-semibold justify-center items-center cursor-pointer gap-1`}>
          {
            currentSaveJobStatus==='pending' && currentSaveJobId===_id?<ClipLoader size={15} color='white'/>:isSaved?<>
          <Save color='white' size={14}/> 
          <p className='text-[10px] font-semibold '>Saved</p>
          </>: <>
          <Save size={14}/> 
          <p className='text-[10px] font-semibold '>Save</p>
          </>
          }
        </button> */}
        <button disabled={isApplied?true:false} onClick={handleApplyToJob} className={`w-[60px] py-2 ml-2 rounded-sm font-bold ${isApplied?'bg-gray-700 text-gray-100':'bg-indigo-700 hover:bg-indigo-600 text-white'} flex justify-center items-center cursor-pointer gap-1`}>
          {
            currentApplyJobStatus==='pending' && currentApplyJobId===_id?<ClipLoader size={15} color='white'/>:isApplied?<>
          <CheckCheck size={14}/> 
          <p className='text-[10px] font-semibold '>Applied</p>
          </>: <>
          <Send size={14}/> 
          <p className='text-[10px] font-semibold '>Apply</p>
          </>
          }
        </button>

        <button onClick={()=>setIsShowDetails(prev=>!prev)} className="ml-2 text-[12px] px-1 py-1 rounded-md bg-blue-700 hover:bg-blue-600 text-white">
          {!isShowDetails? 'Show Details' : 'Hide Details'}
        </button>
      </div>
      </div>


      {isShowDetails && (
        <div className="w-full mt-3 flex pb-2">
          <div className="w-[50%] pl-4">
            {jobItem.skills!==null && jobItem.skills!==undefined && <ScoreRow label='Skills' value={jobItem.skills} />}
            {jobItem.experience!==null && jobItem.experience!==undefined && <ScoreRow label='Experience' value={jobItem.experience} />}
            {jobItem.projects!==null && jobItem.projects!==undefined && <ScoreRow label='Projects' value={jobItem.projects} />}
            {jobItem.education!==null && jobItem.education!==undefined && <ScoreRow label='Education' value={jobItem.education} />}
          </div>

          <div className="w-[2px] h-[80%] self-center bg-gray-700 m-4"></div>

          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-medium text-gray-300 mb-3">Total Match</p>
            <CircleProgress value={totalScore} />
            <p className="text-xs text-gray-400 mt-2">Based on job vector</p>
          </div>
        </div>
      )}
    </div>
  )
}

const ScoreRow = ({ label, value }:{label:string, value:any})=>{
  const numeric = value ?? 0
  return (
    <div className="mb-3">
      <p className="text-xs  text-gray-300 mb-1">{label} ({Math.round(numeric*100)}%)</p>
      <ProgressBar value={numeric} />
    </div>
  )
}

const ProgressBar = ({value}:{value:number})=> (
  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
    <div className="h-2 rounded-full transition-all bg-blue-500" style={{width:`${Math.min(Math.max(value*100,0),100)}%`}}/>
  </div>
)

const CircleProgress = ({value}:{value:number})=>{
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const safeValue = Math.min(Math.max(value,0),1)
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle className="text-gray-700" strokeWidth={8} stroke="currentColor" fill="transparent" r={radius} cx={48} cy={48} />
        <circle className="text-blue-500 transition-all duration-500" strokeWidth={8} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={48} cy={48} strokeDasharray={circumference} strokeDashoffset={circumference*(1-safeValue)} />
      </svg>
      <span className="absolute text-lg font-semibold text-gray-200">{Math.round(safeValue*100)}%</span>
    </div>
  )
}

export default JobCard
