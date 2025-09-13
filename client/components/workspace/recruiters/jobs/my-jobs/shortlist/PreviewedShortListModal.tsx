'use client'

import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import CandidateCard from "../CandidateCard"
import { markAsShortListed, markAsShortListedByAI, markShortlistedByAiStatus, markShortlistedStatus, previewedShortListedCandidate, recruitersSelectedJob, setMarkShortListedByAiStatus, setMarkShortListedStatus, setPreviewedShortListedCandidate } from "@/redux/features/job"
import PreviewedShortlistedCard from "./PreviewedShortlistedCard"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { usePathname, useRouter } from "next/navigation"
import { ClipLoader } from "react-spinners"

const PreviewedShortListModal = () => {
    const [isMounted, setIsMounted]=useState(false);
    const dispatch = useAppDispatch()
    const router = useRouter()
    const pathname = usePathname();
    const parts = pathname.split("/");
    parts.pop(); 
    parts.push("sortlist");
    const newUrl = parts.join("/");
    const currentPreviewedShortlistedCandidate = useAppSelector(previewedShortListedCandidate)
    const currentSelectedRecruiterJob = useAppSelector(recruitersSelectedJob)
    const currentMarkShortListedStatus = useAppSelector(markShortlistedByAiStatus)

    const handleMarkAsShortlisted = ()=>{
      const tempData = currentPreviewedShortlistedCandidate.map((item:any)=>item['candidate-id'])
      const data = {
      "candidateIds":tempData
    }
      const jobId = currentSelectedRecruiterJob._id;
      console.log(data, jobId, 'test ')
      dispatch(markAsShortListed({jobId,data}))
    }
  
  useEffect(()=>{
    if(currentMarkShortListedStatus==='success'){
      setMarkShortListedByAiStatus('idle');
      toast.success('Candidates successfully shortlisted !');
      dispatch(setPreviewedShortListedCandidate([]));
      // router.push(newUrl)
    }
    else if(currentMarkShortListedStatus==='error'){
      toast.error('Something went wrong , please try again later!')
    }
  },[currentMarkShortListedStatus])
  return (
    <div className={`${currentPreviewedShortlistedCandidate.length?'fixed':'hidden'} top-0 left-0 right-0 bottom-0 z-[110] bg-black/30`}>
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-[40%] h-[70%] bg-gray-900 rounded-lg flex flex-col  gap-1">
            <div className="w-full flex-1 overflow-y-scroll scrollbar-hidden px-[10px] gap-2 flex flex-col pt-2">
                {
                  currentPreviewedShortlistedCandidate?.map((item:any, index:any)=><PreviewedShortlistedCard key={index} candidate={item}/>)
                }
                
            </div>
        

            <div className="w-full h-[70px] bg-gray-800/60 rounded-b-lg flex justify-center items-center gap-2">
                <button onClick={()=>dispatch(setPreviewedShortListedCandidate([]))} className="w-[48%] py-2 bg-slate-700/80 hover:bg-slate-700 text-sm text-gray-100 rounded-lg font-semibold">
                    Cancel
                </button>
                <button onClick={handleMarkAsShortlisted} disabled={currentMarkShortListedStatus==='pending'?true:false} className="w-[48%] py-2 bg-blue-700 hover:bg-blue-600 text-sm text-gray-100 rounded-lg font-semibold">
                    {
                      currentMarkShortListedStatus==='pending'?<><ClipLoader size={14}/> Accept ShortList</>:'Accept ShortList'
                    }
                </button>
            </div>
      </div>
      </div>
    </div>
  )
}

export default PreviewedShortListModal
