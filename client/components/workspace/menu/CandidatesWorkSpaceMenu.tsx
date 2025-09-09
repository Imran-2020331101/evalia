'use client'

import { Major_Mono_Display } from "next/font/google"
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import coursesLogo from '../../../public/course-icon.svg'
import bookMarkLogo from '../../../public/book-mark.svg'
import exploreLogo from '../../../public/search-icon.svg'
import jobLogo from '../../../public/job-icon.svg'
import allLogo from '../../../public/all.svg'
import completedLogo from '../../../public/completed.svg'
import pendingLogo from '../../../public/pending.svg'
import interviewLogo from '../../../public/interview.svg'
import expiredLogo from '../../../public/ban.svg'
import { useAppSelector } from "@/redux/lib/hooks";
import { user } from "@/redux/features/auth";
import { Bell } from "lucide-react";

const majorMono = Major_Mono_Display({ weight: '400', subsets: ['latin'] });

const CandidatesWorkSpaceMenu = () => {
  const [isShowCourseCategory, setIsShowCourseCategory]=useState(true);
  const [isShowJobCategory, setIsShowJobCategory]=useState(true);
  const [isShowInterviewCategory, setIsShowInterviewCategory]=useState(true);

  const currentNotifications=[1,2];

  const currentUser = useAppSelector(user);

  return (
    <div className='w-full h-full flex flex-col justify-between px-[10px] py-[6%] relative pt-[60px]'>
      <div className="flex justify-between items-end px-4 absolute top-4 left-0 w-full">
          <Link href={'/'} className={`${majorMono.className} text-2xl `}>EVALIA</Link>
          <Link href={'/workspace/notifications'} className="relative inline-block ">
              {/* Bell Icon */}
              <Bell className="text-gray-100 size-6" />

              {/* Badge */}
              {currentNotifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {currentNotifications.length}
                </span>
              )}
            </Link>
        </div>
      <div className="w-full h-auto flex flex-col justify-start">
        
        <div className="w-full h-auto mt-[20px] flex flex-col justify-start items-start pl-[10px] text-gray-400 font-semibold">
          <button className="flex justify-start items-center gap-1" onClick={()=>setIsShowJobCategory((prev)=>!prev)}>
            <Image src={jobLogo} alt="coursesLogo" className="h-[15px] w-auto"/>
            <p className="hover:text-gray-100 text-gray-200">Jobs</p>
          </button>
          <ul className={`pl-4 ${isShowJobCategory?'flex flex-col':'hidden'}  gap-1`}>
            <Link prefetch href={'/workspace/jobs/saved'} className="flex justify-start items-center gap-1 hover:text-gray-300">
              <Image src={bookMarkLogo} alt="saved" className="h-[13px] w-auto"/>
              <p className="text-sm  cursor-pointer">Saved</p>
            </Link>
            <Link prefetch href={'/workspace/jobs/explore'} className="flex justify-start items-center gap-1 hover:text-gray-300">
              <Image src={exploreLogo} alt="explore" className="h-[13px] w-auto"/>
              <p className="text-sm  cursor-pointer">Explore</p>
            </Link>
            <Link prefetch href={'/workspace/jobs/applied'} className="flex justify-start items-center gap-1 hover:text-gray-300">
              <Image src={completedLogo} alt="applied" className="h-[13px] w-auto"/>
              <p className="text-sm  cursor-pointer">Applied</p>
            </Link>
          </ul>
          <button className="flex justify-start items-center gap-1 mt-2" onClick={()=>setIsShowCourseCategory((prev)=>!prev)}>
            <Image src={coursesLogo} alt="coursesLogo" className="h-[17px] w-auto"/>
            <p className="hover:text-gray-100 text-gray-200">Courses</p>
          </button>
          <ul className={`pl-4 ${isShowCourseCategory?'flex flex-col':'hidden'} gap-1`}>
            <li className="flex justify-start items-center gap-1 hover:text-gray-300">
              <Image src={bookMarkLogo} alt="saved" className="h-[13px] w-auto"/>
              <p className="text-sm  cursor-pointer">Saved</p>
            </li>
            <li className="flex justify-start items-center gap-1 hover:text-gray-300">
              <Image src={exploreLogo} alt="explore" className="h-[13px] w-auto"/>
              <p className="text-sm  cursor-pointer">Explore</p>
            </li>
          </ul>
          <button className="flex justify-start items-center gap-1 mt-2" onClick={()=>setIsShowInterviewCategory((prev)=>!prev)}>
            <Image src={interviewLogo} alt="coursesLogo" className="h-[15px] w-auto"/>
            <p className="hover:text-gray-100 text-gray-200">Interviews</p>
          </button>
          <ul className={`pl-4 ${isShowInterviewCategory?'flex flex-col':'hidden'}  gap-1`}>
            <li className="flex justify-start items-center gap-1 hover:text-gray-300">
              <Image src={allLogo} alt="saved" className="h-[13px] w-auto"/>
              <Link prefetch href={'/workspace/interviews/all'} className="text-sm  cursor-pointer">All</Link>
            </li>
            <li className="flex justify-start items-center gap-1 hover:text-gray-300">
              <Image src={pendingLogo} alt="saved" className="h-[13px] w-auto"/>
              <Link prefetch href={'/workspace/interviews/pending'} className="text-sm  cursor-pointer">Pending</Link>
            </li>
            <li className="flex justify-start items-center gap-1 hover:text-gray-300">
              <Image src={completedLogo} alt="explore" className="h-[13px] w-auto"/>
              <Link prefetch href={'/workspace/interviews/completed'} className="text-sm  cursor-pointer">Completed</Link>
            </li>
            <li className="flex justify-start items-center gap-1 hover:text-gray-300">
              <Image src={expiredLogo} alt="expire" className="h-[13px] w-auto"/>
              <Link prefetch href={'/workspace/interviews/expired'} className="text-sm  cursor-pointer">Expired</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full h-auto flex justify-start items-end ">
        <Link href={'/profile'} className="flex items-center gap-2 cursor-pointer">
          <p className="px-2 py-1 rounded-sm bg-gray-600 text-sm uppercase">{currentUser?.user?.name.slice(0,2)}</p>
          <p className="text-gray-300 lowercase">{currentUser?.user?.name.split(' ')[0]}</p>
        </Link>
      </div>
    </div>
  )
}

export default CandidatesWorkSpaceMenu
