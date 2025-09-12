'use client'
import { markAsShortListed, markShortlistedStatus, recruitersSelectedJob } from "@/redux/features/job"
import { setCompatibilityReviewId, setPreviewedCandidate } from "@/redux/features/utils"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import axios from "axios"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ClipLoader } from "react-spinners"
import { format } from "timeago.js"

interface propType{candidateEmail:any,applicantId:any, applicantStatus:any, appliedAt:any, reviewId:any, selected?:any, toggleSelectSingle?:any}

const CandidateCard = ({candidate}:{candidate:any}) => {
   const handleViewProfile = ()=>{

   }
  return (
    <div className='w-full h-[60px] shrink-0 flex justify-start items-center px-2 gap-3 text-[12px] text-gray-200 border-b-[1px] border-gray-700 pb-2 hover:border-blue-500 transition-colors duration-300 '>
        <button  className="w-[40px] h-[40px] rounded-full ">
            <Image width={40} height={40} alt="profile pic" src={''} className="w-full h-full object-cover rounded-full"/>
        </button>
        <button  className="flex-1 h-[40px] flex flex-col items-start gap-1">
            <p className='font-semibold'>{''}</p>
            <div className="w-full flex-1 flex justify-start items-center gap-2 text-[11px] ">
                <p className={`text-teal-500`}>{''}</p><p className='text-[13px] font-extrabold'>{` . `}</p>
                <p>{}</p><p className='text-[13px] font-extrabold'>{` . `}</p>
                {
                    // appliedAt?<p>{`Applied : ${format(appliedAt)}`}</p>:null
                }
            </div>
        </button>
        <div className=" self-start mt-[-5px]  relative group">
            <p className="text-lg font-bold">...</p>
            <div className="absolute hidden group-hover:flex flex-col w-[200px] h-auto top-5 right-0 border border-gray-700 rounded-md z-10 bg-gray-900 backdrop-blur-2xl text-[10px] font-semibold">
                <button onClick={handleViewProfile} className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-blue-600 cursor-pointer">
                    View Profile
                </button>
            </div>
        </div>
    </div>
  )
}

export default CandidateCard
