'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import axios from 'axios'
import completedLogo from '../../../../public/completed-green.svg'
import pendingLogo from '../../../../public/pending-blue.svg'
import expiredLogo from '../../../../public/ban-red.svg'
import { Trash2, Dot, ArrowUpRight, Clapperboard } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch } from '@/redux/lib/hooks'

interface interviewCardType {
  item:any,
  detailsCardId:number|null,
  setDetailsCardId:React.Dispatch<React.SetStateAction<number | null>>
}

const InterviewCard = ({item, detailsCardId, setDetailsCardId}:interviewCardType) => {

    const dispatch = useAppDispatch();

    const [org, setOrg]=useState<any>(null);
    const {id, interviewStatus, jobTitle,organizationId} = item;

    const getOrganizationById = async(OrganizationId:string)=>{
      try {
        const response = await axios.get(`http://localhost:8080/api/organization/${OrganizationId}`,{withCredentials:true})
        console.log(response.data, 'ogranization by id')
        setOrg(response.data)
      } catch (error:any) {
        console.log(error)
      }
    }
  useEffect(() => {
    console.log("organizationId in effect:", organizationId)
    if (organizationId) getOrganizationById(organizationId)
  }, [organizationId])
  useEffect(()=>console.log(org,'org'),[org])
  if(!org) return null;
  return (
    <div className='w-full shrink-0 transition-colors duration-300 py-1 flex justify-between bg-gray-900/40 border-b border-transparent hover:border-blue-400 text-sm rounded-lg'>
        <section className='w-full h-auto flex justify-start py-2 px-2  gap-2 '>
          {org?.organizationProfileImageUrl ? (
            <Image
              src={org.organizationProfileImageUrl}
              alt="Organization Logo"
              width={40}
              height={40}
              className="w-auto h-[40px] object-cover rounded-sm"
            />
          ) : (
            <div className="w-[40px] h-[40px] bg-gray-200 rounded-sm flex items-center justify-center">
              <span className="text-xs text-gray-500">N/A</span>
            </div>
          )}
                    <div className="flex flex-col gap-1 justify-start">
            <p className="text-[13px] text-gray-200">{jobTitle}</p>
            <div className="flex justify-start">
              <p className="text-gray-400 text-[12px]">{org?.organizationName} </p><Dot className='size-5 font-bold'/>
              <Image src={interviewStatus==='SCHEDULED'?pendingLogo:interviewStatus==='CANCELLED'?expiredLogo:completedLogo} alt={jobTitle} className='w-auto h-[14px] object-cover rounded-sm mr-1'/>
              <p className={` ${interviewStatus==='SCHEDULED'?'text-blue-400':interviewStatus==='CANCELLED'?'text-red-400':'text-green-300'} uppercase text-[10px] `}>{interviewStatus}</p>
            </div>
          </div>
        </section>
        <section className='h-full flex items-end pb-3 pr-8 gap-3'>
          <button  className='px-6 py-1 shrink-0 rounded-sm border border-red-500 hover:bg-red-600 text-gray-50 text-xs flex gap-1 f'> <Trash2 className='size-4'/> Delete</button>
          {
            interviewStatus==='SCHEDULED'&& <Link href={`/workspace/interviews/on-going/${id}`} className='px-3 py-1 shrink-0 rounded-sm bg-blue-700 hover:bg-blue-600 text-gray-50 text-xs flex gap-1'> <ArrowUpRight className='size-4'/> Join Interview</Link>
          }
          {
            interviewStatus==='COMPLETED'&& <button  className='px-3 py-1 shrink-0 rounded-sm bg-green-700 hover:bg-green-600 text-gray-50 text-xs flex gap-1'> <Clapperboard className='size-4'/>View Summary</button>
          }
        </section>
    </div>
  )
}

export default InterviewCard 
