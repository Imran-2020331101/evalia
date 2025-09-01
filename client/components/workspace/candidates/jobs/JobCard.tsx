'use client'
import Image from 'next/image'
import axios from 'axios'
import { CheckCheck, Save, Send } from 'lucide-react'

import applyLogo from '../../../../public/paper-plane.svg'
import saveLogo from '../../../../public/book-mark.svg'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { previewedJob, setPreviewedJob, setPreviewOrganization } from '@/redux/features/utils'
import { useEffect, useState } from 'react'
import { appliedJobs, applyJob, applyJobId, applyJobStatus, savedJobs, saveJob, saveJobId, saveJobStatus, setApplyJobId, setApplyJobStatus} from '@/redux/features/job'
import { format } from 'timeago.js'
import { ClipLoader } from 'react-spinners'
import { user } from '@/redux/features/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const JobCard = ({job}:{job:any}) => {
  const {_id, company, title, jobLocation, jobType, status, workPlaceType, salary, createdAt, deadline}=job;
  const [organization,setOrganization]=useState<any>(null);
  const [isApplied, setIsApplied]=useState<boolean>(false)
  const [isSaved, setIsSaved]=useState<boolean>(false)
  const [saveJobId, setSaveJobId]=useState<any>(null)


  const dispatch = useAppDispatch()
  const router = useRouter()

  const currentPreviewedJob = useAppSelector(previewedJob);
  const currentAppliedJobs = useAppSelector(appliedJobs);
  const currentSavedJobs = useAppSelector(savedJobs)
  const currentApplyJobStatus = useAppSelector(applyJobStatus);
  const currentApplyJobId = useAppSelector(applyJobId);
  // const currentSaveJobId = useAppSelector(saveJobId);
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
    setSaveJobId(_id);
    dispatch(saveJob(_id));
  }

  useEffect(()=>{
    const fetchOrg = async ()=>{
      try {
        const organizationId = company.OrganizationId;
        const response = await axios.get(`http://localhost:8080/api/organization/${organizationId}`,{withCredentials:true})
        setOrganization(response.data);
    } catch (error:any) {
        return error
    }
    }
    if(!organization) fetchOrg()
    if(currentApplyJobStatus!=='idle') dispatch(setApplyJobStatus('idle'));
  },[])
  useEffect(()=>{
    const applied = currentAppliedJobs?.find((item:any)=>item._id===_id)
    if(applied) setIsApplied(true);
    const saved = currentSavedJobs?.find((item:any)=>item._id===_id);
    if(saved) setIsSaved(true)
  },[currentAppliedJobs.length, currentSavedJobs.length])
  if(!organization) return null;
  return (
    <div className="w-full h-auto border-b-[1px] border-gray-800 hover:border-blue-400  flex justify-between shrink-0">
      <div className="h-full w-[65%] flex justify-start items-center gap-4">
        <button onClick={()=>dispatch(setPreviewOrganization(organization))} className="w-[55px] h-[50px] self-start rounded-sm">
          <Image src={organization?.organizationProfileImageUrl||'https://i.pinimg.com/736x/cf/41/82/cf4182b20a5c74ceac60149066a52841.jpg'}
           alt='company logo' width={100} height={100} className='w-full h-full object-cover rounded-sm'/>
        </button>
        <div className="flex flex-col h-auto justify-between items-start flex-1">
          <button onClick={()=>dispatch(handleSetPreviewedJOb)} className='text-[12px] text-gray-100 font-semibold tracking-wider cursor-pointer hover:underline'>{title}</button>
          <button onClick={()=>dispatch(handleSetPreviewedJOb)} className="w-full h-auto items-center justify-start flex flex-col overflow-hidden">
            <div className="w-full h-auto flex mt-[2px]">
              <p className='text-[12px] text-gray-300'>{organization?.organizationName||''}</p><p className='font-bold text-sm mx-1'>.</p>
              <p className='text-[12px] text-gray-400'>{workPlaceType}</p>
            </div>
            <div className="w-full h-auto flex mt-[-4px]">
              <p className='text-[12px] text-gray-300'>{jobLocation}</p><p className='font-bold text-sm mx-1'>.</p>
              <p className='text-[12px] text-gray-300'>{`$${salary.from}k - $${salary.to}k`}</p><p className='font-bold text-sm mx-1'>.</p>
              <p className='text-[12px] text-gray-300'>{ deadline?format(createdAt):''}</p>
            </div>
          </button>
        </div>
      </div>
      <div className="h-full w-[20%] flex justify-end items-center gap-4">
        <button  disabled={isSaved?true:false} onClick={handleSaveJob} className={`w-[65px] h-[30px] border-[1px]  flex justify-center items-center rounded-sm gap-1 ${isSaved?'text-gray-200 bg-gray-700 border-gray-500':'text-gray-300 hover:text-green-500 hover:border-green-500 border-gray-300'} cursor-pointer`}>
          {
            currentSaveJobStatus==='pending' && saveJobId===_id?<ClipLoader size={15} color='white'/>:isSaved?<>
          <Save color='white' size={14}/> 
          <p className='text-[10px] font-semibold '>Saved</p>
          </>: <>
          <Save size={14}/> 
          <p className='text-[10px] font-semibold '>Save</p>
          </>
          }
        </button>
        <button disabled={isApplied?true:false} onClick={handleApplyToJob} className={`w-[65px] h-[30px] border-[1px]  flex justify-center items-center rounded-sm gap-1 ${isApplied?'text-gray-200 bg-gray-700 border-gray-500':'text-gray-300 hover:text-blue-500 hover:border-blue-500 border-gray-300'} cursor-pointer`}>
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
      </div>
    </div>
  )
}

export default JobCard
