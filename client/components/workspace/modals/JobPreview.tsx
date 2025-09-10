'use client'

import Image from "next/image"
import { Didact_Gothic, Major_Mono_Display } from "next/font/google"
import { useEffect, useState } from "react"
import { format } from "timeago.js";

import rightLogo from '../../../public/go-right.svg'
import leftLogo from '../../../public/go-left.svg'
import saveLogo from '../../../public/book-mark.svg'
import applyLogo from '../../../public/paper-plane.svg'
import exitLogo from '../../../public/x-solid.svg'
import evaliaLogo from '../../../public/evalia-short.png'
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { previewedJob, setPreviewedJob, setPreviewOrganization } from "@/redux/features/utils"
import { user } from "@/redux/features/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { appliedJobs, applyJob, applyJobId, applyJobStatus, savedJobs, saveJob, saveJobId, saveJobStatus, setApplyJobId, setSaveJobId, unsaveJob } from "@/redux/features/job";
import { ClipLoader } from "react-spinners";
import { Save , Send , CheckCheck} from "lucide-react";

const didact_gothic = Didact_Gothic({ weight: ['400'], subsets: ['latin'] })

const JobPreview = () => {
    const [isShowApplyButton, setIsShowApplyButton] = useState(true);
    const [isSaved, setIsSaved]=useState<boolean>(false);
    const [isApplied, setIsApplied]=useState<boolean>(false);

    const dispatch = useAppDispatch()
    const router  = useRouter()

    const currentUser = useAppSelector(user)
    const currentSavedJobs = useAppSelector(savedJobs)
    const currentAppliedJobs = useAppSelector(appliedJobs)
    const currentApplyJobId = useAppSelector(applyJobId)
    const currentSaveJobId = useAppSelector(saveJobId)
    const currentSaveJobStatus = useAppSelector(saveJobStatus)
    const currentApplyJobStatus = useAppSelector(applyJobStatus)
    const currentPreviewedJob = useAppSelector(previewedJob)

    const {_id, company, title, jobLocation,employmentLevel, jobType, status, workPlaceType, salary, createdAt, requirements, responsibilities, skills,jobDescription, deadline}=currentPreviewedJob || {};

    const handleExit =()=>{
        dispatch(setPreviewedJob(null));
        setIsApplied(false);
        setIsSaved(false);
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
    const formattedDeadline = ()=>{
        if(deadline){
            const date = new Date(deadline)
            const formatted = date.toLocaleDateString(); 
            return formatted;
        }
    }
    useEffect(()=>{
        const applied = currentAppliedJobs?.find((item:any)=>item?._id===_id)
        if(applied) setIsApplied(true);
        const saved = currentSavedJobs?.find((item:any)=>item?._id===_id);
        if(saved) setIsSaved(true)
        else setIsSaved(false)
    },[currentAppliedJobs?.length, currentSavedJobs?.length,_id])
    return (
    <div className={` ${didact_gothic.className} ${currentPreviewedJob?'fixed':'hidden'} tracking-wider top-0 left-0 right-0 bottom-0 z-[120] `}>
        <button className="fixed top-4 left-2 z-10 cursor-pointer">
            <Image src={evaliaLogo} alt="logo" className=" w-[45px]"/>
        </button>
        <button onClick={handleExit} className="fixed top-3 right-3 z-10 cursor-pointer">
            <Image src={exitLogo} alt="exit" className="w-[18px]"/>
        </button>
      <div className="w-full h-full backdrop-blur-2xl z-10 flex justify-center overflow-hidden ">
        <section className="w-[60%] h-full bg-slate-900/40 flex flex-col justify-start py-[40px] px-[2%]  overflow-y-scroll scrollbar-hidden relative ">
            <div className="absolute w-[250px] h-[80px] rounded-l-full top-[40px] right-0">
                <div className={`w-full h-full rounded-l-full bg-slate-800 flex items-center justify-start pl-2 gap-2 transition-transform duration-500 ${isShowApplyButton?'translate-x-0':' translate-x-[210px]'}`}>
                    <button onClick={()=>setIsShowApplyButton((prev)=>!prev)} className="p-2 rounded-full cursor-pointer">
                        <Image src={isShowApplyButton?rightLogo:leftLogo} alt="direction" className="w-[25px] object-cover"/>
                    </button>
                    <button disabled={currentApplyJobStatus==='pending' ?true:false} onClick={!isSaved?handleSaveJob:handleUnsaveJob} className={`px-2 py-2 rounded-sm border border-gray-300 ${isSaved?'bg-gray-700 text-gray-100':'hover:border-blue-500 text-white  bg-gray-900'} flex font-semibold justify-center items-center cursor-pointer gap-1`}>
                       {
                            currentSaveJobStatus==='pending' && currentSaveJobId===_id?<ClipLoader size={15} color='white'/>:isSaved?<>
                            <Save color='white' size={14}/> 
                            <p className='text-[10px] font-semibold '>Saved</p>
                            </>: <>
                            <Save size={14}/> 
                            <p className='text-[10px] font-semibold '>Save</p>
                            </>
                        }
                    </button>
                    <button disabled={isApplied?true:false} onClick={handleApplyToJob} className={`px-2 py-2 ml-2 rounded-sm font-bold ${isApplied?'bg-gray-700 text-gray-100':'bg-indigo-700 hover:bg-indigo-600 text-white'} flex justify-center items-center cursor-pointer gap-1`}>
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
            <div className="w-full h-auto flex flex-col justify-start items-start ">
                <section className="w-[60%] h-auto flex justify-start items-start gap-4">
                    <button onClick={()=>dispatch(setPreviewOrganization(company))} className="w-[80px] h-[70px] rounded-xl ">
                        <Image className="w-full h-full rounded-xl object-cover" width={150} height={120} src={company?.organizationProfileImageUrl||'https://i.pinimg.com/736x/cf/41/82/cf4182b20a5c74ceac60149066a52841.jpg'} alt="company logo" />
                    </button>
                    <div className="flex-1 h-auto flex flex-col items-start ">
                        <button onClick={()=>dispatch(setPreviewOrganization(company))} className="font-semibold tracking-widest">{company?.organizationName||''}</button>
                        <p className="w-full h-[40px] overflow-hidden text-[13px] text-gray-300">
                            {company?.businessDescription||''}
                        </p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6">
                    <p className="font-semibold text-[20px]">{title||''}</p>
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-100">
                        <p className="text-[13px]">{`$${salary?.from}k - $${salary?.to}k`}</p><p>{` | `}</p>
                        <p className="text-[13px]">{workPlaceType || ''}</p><p>{` | `}</p>
                        <p className="text-[13px]">{employmentLevel||''}</p><p>{` | `}</p>
                        <p className="text-[13px]">{jobType || ''}</p>
                    </div>
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-300">
                        <p className="text-[13px]">{`Posted : ${deadline?format(createdAt):''} `}</p><p>{` . `}</p>
                        <p className="text-[13px]">{`Application Deadline : `}<span className="text-red-500">{formattedDeadline()}</span></p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">About the opportunity : </p>
                    <p className="text-[12px]">
                        {jobDescription || ''}
                    </p>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Requirements : </p>
                    {
                        requirements?.map((item:any, index:number)=><div key={index} className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${item.category} : `}
                            </span>
                            {item.description}
                        </p>
                    </div>)
                    }
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Responsibilities : </p>
                    {
                        responsibilities?.map((item:any, index:number)=><div key={index} className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${item.category} : `}
                            </span>
                            {item.description}
                        </p>
                    </div>)
                    }
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Preferred Skills : </p>
                    {
                        skills?.map((item:any, index:number)=><div key={index} className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${item.category} : `}
                            </span>
                            {item.description}
                        </p>
                    </div>)
                    }
                </section>
            </div>
        </section>
      </div>
    </div>
  )
}

export default JobPreview
