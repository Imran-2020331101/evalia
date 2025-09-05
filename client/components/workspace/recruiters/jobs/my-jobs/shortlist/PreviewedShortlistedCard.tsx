'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import Image from 'next/image';
import { format } from 'timeago.js';
import { useAppDispatch } from '@/redux/lib/hooks';
import { setPreviewedCandidate } from '@/redux/features/utils';

const PreviewedShortlistedCard = ({candidate}:{candidate:any}) => {
  const [candidateDetails, setCandidateDetails]=useState<any>(null);
  const [isShowDetails, setIsShowDetails]=useState(false);

  const dispatch = useAppDispatch()

  useEffect(()=>{
    const fetchApplicantsData = async(userId:any)=>{
            try {
                const response = await axios.get(`http://localhost:8080/api/user/${userId}/single`, {withCredentials:true});
                console.log(response.data, 'applicants fetched');
                setCandidateDetails(response.data.data);

            } catch (error) {
                console.log(error);
            }
        }
         fetchApplicantsData(candidate.id);
  },[])
  if(!candidateDetails) return null;
  return (
    <div className="w-full h-auto flex flex-col justify-start bg-gray-700/60 rounded-lg pr-3">
      <div className="w-full h-auto flex justify-between ">
        <div className="flex-1 h-auto shrink-0  flex justify-start gap-2 py-2 px-2 ">
        <button onClick={()=>dispatch(setPreviewedCandidate(candidateDetails))}  className="w-[40px] h-[40px] rounded-full mt-1">
            <Image width={40} height={40} alt="profile pic" src={candidateDetails?.user?.profilePictureUrl} className="w-full h-full object-cover rounded-full"/>
        </button>
        <div className="flex-1 h-[40px] flex flex-col items-start gap-1">
            <button onClick={()=>dispatch(setPreviewedCandidate(candidateDetails))} className='font-semibold hover:underline cursor-pointer'>{candidateDetails?.user?.name||''}</button>
            <div className="w-full flex-1 flex justify-start items-center gap-2 text-[11px] ">
                <p className={`text-teal-500`}>{'PENDING'}</p><p className='text-[13px] font-extrabold'>{` . `}</p>
                <p>{candidateDetails?.user?.location}</p><p className='text-[13px] font-extrabold'>{` . `}</p>
                {
                    candidateDetails?.appliedAt?<p>{`Applied : ${format(candidateDetails.appliedAt)}`}</p>:null
                }
            </div>
        </div>
      </div>
      <button onClick={()=>setIsShowDetails((prev)=>!prev)} className='text-[12px]  px-3 h-[32px] rounded-md bg-blue-700 hover:bg-blue-600 mt-4'>
        {!isShowDetails?'Show Details':'hide details'}
      </button>
      </div>
      {
        isShowDetails?
        <div className="w-full flex pb-[20px]">
          <div className="w-[50%] h-auto pl-[50px]">
          <div className="w-full flex flex-col">
             {/* Scores */}
          <div className="space-y-4">
            {
              candidate?.skills?
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">Skills</p>
                  <ProgressBar value={candidate?.skills.score || 0} />
                </div>
              :null
            }
            {
              candidate?.experience && <div>
              <p className="text-sm font-medium text-gray-300 mb-1">Experience</p>
              <ProgressBar value={candidate?.experience.score || 0} />
            </div>
            }
            {
              candidate?.projects && <div>
              <p className="text-sm font-medium text-gray-300 mb-1">Projects</p>
              <ProgressBar value={candidate?.projects.score || 0} />
            </div>
            }
            {
              candidate?.education && <div>
              <p className="text-sm font-medium text-gray-300 mb-1">Education</p>
              <ProgressBar value={candidate?.education.score || 0} />
            </div>
            }
            
            
          </div>
          </div>
        </div>
        <div className="w-[2px] h-[80%] self-center bg-gray-700 ml-10"></div>
        {/* Total Score */}
        {candidate?.totalScore !== undefined && (
          <div className="pt-4 flex-1 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-medium text-gray-300 mb-3">Total Score</p>

            <div className="relative inline-flex items-center justify-center">
              {/* Circle Progress */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                />
                <circle
                  className="text-blue-500 transition-all duration-500"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="48"
                  cy="48"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={
                    2 * Math.PI * 40 * (1 - candidate.totalScore)
                  }
                />
              </svg>

              {/* Text inside circle */}
              <span className="absolute text-lg font-semibold text-gray-400">
                {Math.round(candidate.totalScore * 100)}%
              </span>
            </div>
          </div>
        )}

        </div>
        :null
      }
    </div>
  )
}


const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className="bg-blue-500 h-2 rounded-full transition-all"
        style={{ width: `${value * 100}%` }}
      />
    </div>
  )



export default PreviewedShortlistedCard
