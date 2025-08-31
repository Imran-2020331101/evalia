'use client'
import Image from 'next/image'
import axios from 'axios'

import applyLogo from '../../../../public/paper-plane.svg'
import saveLogo from '../../../../public/book-mark.svg'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { previewedJob, setPreviewedJob } from '@/redux/features/utils'
import { useEffect, useState } from 'react'
import { applyJob } from '@/redux/features/job'

const JobCard = ({job}:{job:any}) => {
  const {_id, company, title, jobLocation, jobType, status, workPlaceType, salary, createdAt}=job;
  const [organization,setOrganization]=useState<any>(null);
  const dispatch = useAppDispatch()
  const currentPreviewedJob = useAppSelector(previewedJob)
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
    fetchOrg()
  },[])
  return (
    <div className="w-full h-[70px] border-b-[1px] border-gray-800 hover:border-blue-400  flex justify-between shrink-0">
      <div className="h-full w-[65%] flex justify-start items-center gap-4">
        <div className="w-[50px] h-[45px]  rounded-sm">
          <Image src={organization?.organizationProfileImageUrl||'https://i.pinimg.com/736x/cf/41/82/cf4182b20a5c74ceac60149066a52841.jpg'}
           alt='company logo' width={100} height={100} className='w-full h-full object-cover rounded-sm'/>
        </div>
        <div className="flex flex-col h-[50px] justify-between items-start flex-1">
          <button onClick={()=>dispatch(setPreviewedJob(true))} className='text-[12px] text-gray-100 font-semibold tracking-wider cursor-pointer hover:underline'>{title}</button>
          <button onClick={()=>dispatch(setPreviewedJob(true))} className="w-full h-full items-center justify-start flex overflow-hidden">
            <p className='text-[12px] text-gray-300'>{organization?.organizationName||''}</p><p className='font-bold text-sm m-1'>.</p>
            <p className='text-[12px] text-gray-400'>{workPlaceType}</p><p className='font-bold text-sm m-1'>.</p>
            <p className='text-[12px] text-gray-300'>{jobLocation}</p><p className='font-bold text-sm m-1'>.</p>
            <p className='text-[12px] text-gray-300'>{`$${salary.from}k - $${salary.to}k`}</p><p className='font-bold text-sm m-1'>.</p>
            <p className='text-[12px] text-gray-300'>{`2 days ago`}</p>
          </button>
        </div>
      </div>
      <div className="h-full w-[20%] flex justify-end items-center gap-4">
        <button className='w-[60px] h-[30px] border-[1px] border-gray-300 flex justify-center items-center rounded-sm gap-1 text-gray-300 hover:text-teal-500 hover:border-teal-500 cursor-pointer'>
          <Image src={saveLogo} alt='save job' className='w-[13px]'/>
          <p className='text-[10px] font-semibold '>Save</p>
        </button>
        <button onClick={()=>dispatch(applyJob(_id))} className='w-[60px] h-[30px] border-[1px] border-gray-300 flex justify-center items-center rounded-sm gap-1 text-gray-300 hover:text-blue-500 hover:border-blue-500 cursor-pointer'>
          <Image src={applyLogo} alt='apply job' className='w-[13px]'/>
          <p className='text-[10px] font-semibold '>Apply</p>
        </button>
      </div>
    </div>
  )
}

export default JobCard
