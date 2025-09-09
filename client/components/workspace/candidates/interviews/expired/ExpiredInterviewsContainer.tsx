'use client'
import React, { useEffect, useState } from 'react'
import InterviewContainer from '../InterviewContainer'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks';
import { allInterviews, getallInterviews , getAllInterviewStatus} from '@/redux/features/interview';
import { CalendarX } from 'lucide-react';
import { ScaleLoader } from 'react-spinners';

const ExpiredInterviewsContainer = () => {
  const [interviews, setInterviews]=useState<any>(null);
  const currentAllInterviews = useAppSelector(allInterviews);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const currentGetAllInterviewsStatus = useAppSelector(getAllInterviewStatus)

  const dispatch = useAppDispatch();

  useEffect(()=>{
    if(!currentAllInterviews.length) {dispatch(getallInterviews());return;}
    const expiredInterviews = currentAllInterviews?.filter((item:any)=>item.interviewStatus==='CANCELLED')||[];
    setInterviews(expiredInterviews);
    setIsMounted(true);
  },[currentAllInterviews.length])
  if(currentGetAllInterviewsStatus==='pending' || !isMounted) return <div className="w-full h-full flex justify-center items-center">
    <ScaleLoader barCount={4} color='white'/>
  </div>;
  return (
    <>
      {
        interviews?.length?<InterviewContainer interviews={interviews}/>:
         <section className="flex flex-col w-full h-full items-center justify-center text-center px-4">
            <div className="flex flex-col items-center">
                {/* Icon */}
                <div className="p-4 rounded-full bg-gray-100 mb-4">
                <CalendarX className="w-8 h-8 text-gray-500" />
                </div>

                {/* Texts */}
                <h2 className="text-2xl font-semibold text-gray-300">
                No Expired Interviews
                </h2>
                <p className="mt-2 text-gray-400 max-w-md">
                You don’t have any expired interviews at the moment. Expired interviews will appear here for your reference.
                </p>
            </div>
        </section>
      }
    </>
  )
}

export default ExpiredInterviewsContainer
