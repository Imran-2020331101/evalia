'use client'
import Image from 'next/image'

import { Trash2, FilePenLine } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks';
import { organizations } from '@/redux/features/auth';
import { useState } from 'react';
import { deleteJob } from '@/redux/features/job';

const JobCard = ({job}:any) => {
  const {_id, company, title, jobLocation, jobType, status, workPlaceType, salary, createdAt}=job;

  const [isDelete , setIsDelete]=useState(false);

  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const currentOrganizations = useAppSelector(organizations)

  const organization = currentOrganizations.find(item=>item.id===company.OrganizationId)

  const handleNavToSingleJob = ()=>{
    router.push(`my-jobs/${_id}`)
  }
  const handleDeleteJob = ()=>{
    setIsDelete(true);
    dispatch(deleteJob(_id));
  }
  return (
    <div className="w-full h-[70px] border-b-[1px] border-gray-800 hover:border-blue-400  flex justify-between shrink-0">
      <div className="h-full w-[65%] flex justify-start items-center gap-4">
        <div className="w-[50px] h-[45px]  rounded-sm">
          <Image  src={organization.organizationProfileImageUrl||''}
           alt='company logo' width={100} height={100} className='w-full h-full object-cover rounded-sm'/>
        </div>
        <div className="flex flex-col h-[50px] justify-between items-start flex-1">
          <button onClick={handleNavToSingleJob} className='text-[12px] text-gray-100 font-semibold tracking-wider cursor-pointer hover:underline'>{title}</button>
          <div className="w-full h-full items-center justify-start flex overflow-hidden">
            <p className='text-[12px] text-gray-300'>{organization.organizationName}</p><p className='font-bold text-sm m-1'>.</p>
            <p className='text-[12px] text-gray-400'>{workPlaceType}</p><p className='font-bold text-sm m-1'>.</p>
            <p className='text-[12px] text-gray-300'>{jobLocation}</p><p className='font-bold text-sm m-1'>.</p>
            <p className='text-[12px] text-gray-300'>{`$${salary.from}k - $${salary.to}k`}</p><p className='font-bold text-sm m-1'>.</p>
            <p className='text-[12px] text-gray-300'>{`2 days ago`}</p>
          </div>
        </div>
      </div>
      <div className="h-full w-[20%] flex justify-end items-center gap-4">
        <button onClick={handleNavToSingleJob} className='w-[60px] h-[30px] border-[1px] border-gray-300 flex justify-center items-center rounded-sm gap-1 text-gray-300 hover:text-blue-500 hover:border-blue-500 cursor-pointer'>
          <FilePenLine  className='w-[13px]'/>
          <p className='text-[10px] font-semibold '>View</p>
        </button>
        <button disabled={isDelete?true:false} onClick={handleDeleteJob} className={`${isDelete?'bg-gray-500 text-gray-50':''}w-[60px] h-[30px] border-[1px] border-gray-300 flex justify-center items-center rounded-sm gap-1 text-gray-300 hover:text-red-500 hover:border-red-500 cursor-pointer`}>
          <Trash2 className='w-[13px]'/>
          <p className='text-[10px] font-semibold '>Delete</p>
        </button>
      </div>
    </div>
  )
}

export default JobCard
