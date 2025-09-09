'use client'

import Image from 'next/image'

import completedLogo from '../../../../public/completed-green.svg'
import pendingLogo from '../../../../public/pending-blue.svg'
import expiredLogo from '../../../../public/ban-red.svg'
import { Dot } from 'lucide-react'
import Link from 'next/link'

interface interviewCardType {
  item:any,
  detailsCardId:number|null,
  setDetailsCardId:React.Dispatch<React.SetStateAction<number | null>>
}

const InterviewCard = ({item, detailsCardId, setDetailsCardId}:interviewCardType) => {

  const {id, interviewStatus, jobTitle} = item;

  return (
    <div className='w-full shrink-0 transition-colors duration-300 py-1 flex justify-between bg-gray-900/40 border-b border-transparent hover:border-blue-400 text-sm rounded-lg'>
        <section className='w-full h-auto flex justify-start py-2 px-2  gap-2 '>
          <Image src={interviewStatus==='SCHEDULED'?pendingLogo:interviewStatus==='CANCELLED'?expiredLogo:completedLogo} alt={''} className='w-auto h-[40px] object-cover rounded-sm'/>
          <div className="flex flex-col gap-1 justify-start">
            <p className="text-[13px] text-gray-200">{jobTitle}</p>
            <div className="flex justify-start">
              <p className="text-gray-400 text-[12px]">Company Name </p><Dot className='size-5 font-bold'/>
              <Image src={interviewStatus==='SCHEDULED'?pendingLogo:interviewStatus==='CANCELLED'?expiredLogo:completedLogo} alt={jobTitle} className='w-auto h-[14px] object-cover rounded-sm mr-1'/>
              <p className={` ${interviewStatus==='SCHEDULED'?'text-blue-400':interviewStatus==='CANCELLED'?'text-red-400':'text-green-300'} uppercase text-[10px] `}>{interviewStatus}</p>
            </div>
          </div>
        </section>
        <section className='h-full flex items-end pb-3 pr-8 gap-3'>
          <button  className='px-6 py-1 shrink-0 rounded-sm bg-red-700 hover:bg-red-600 text-gray-50 text-xs'>Delete</button>
          {
            interviewStatus==='SCHEDULED'&& <Link href={`/workspace/interviews/on-going/${id}`} className='px-3 py-1 shrink-0 rounded-sm bg-blue-700 hover:bg-blue-600 text-gray-50 text-xs'>Join Interview</Link>
          }
        </section>
    </div>
  )
}

export default InterviewCard 
