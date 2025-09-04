'use client'

import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import CandidateCard from "../CandidateCard"
import { previewedShortListedCandidate, setPreviewedShortListedCandidate } from "@/redux/features/job"
import PreviewedShortlistedCard from "./PreviewedShortlistedCard"

const PreviewedShortListModal = () => {
    const dispatch = useAppDispatch()
    const currentPreviewedShortlistedCandidate = useAppSelector(previewedShortListedCandidate)
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
                <button className="w-[48%] py-2 bg-blue-700 hover:bg-blue-600 text-sm text-gray-100 rounded-lg font-semibold">
                    Accept ShortList
                </button>
            </div>
      </div>
      </div>
    </div>
  )
}

export default PreviewedShortListModal
