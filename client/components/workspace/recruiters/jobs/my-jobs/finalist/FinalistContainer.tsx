'use client'

import { useEffect, useState } from 'react';

import CandidateCard from '../CandidateCard'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks';
import { recruitersSelectedJob,} from '@/redux/features/job';
import { useDeepCompareEffect } from '@/custom-hooks/useDeepCompareEffect';
import { ClipLoader } from 'react-spinners';

const FinalistContainer = () => {
  const [finalistCandidates, setFinalistCandidates]=useState<any>(null)
  const [isMounted, setIsMounted]=useState<boolean>(false);

  const currentSelectedRecruiterJob = useAppSelector(recruitersSelectedJob);

  useDeepCompareEffect(()=>{
    const filteredFinalist = currentSelectedRecruiterJob?.applications.filter((item:any)=>item.status==='HIRED')
    setFinalistCandidates(filteredFinalist||[]);
    setIsMounted(true);
    return ()=>setIsMounted(false);
  },[currentSelectedRecruiterJob?.applications])
  useEffect(()=>console.log(currentSelectedRecruiterJob, 'job details inside finalist container'))
  if(!isMounted) return null
  return (
    <div className='w-full h-full flex flex-col pt-[10px] p-[30px] pb-[10px]'>
      <div className="w-full flex-1 shrink-0 flex flex-col justify-start items-center gap-[20px] relative">
        {
          finalistCandidates?.map((item:any)=><CandidateCard key={item?._id}  candidateEmail={item?.candidateEmail} reviewId={item?.reviewId} appliedAt={item?.appliedAt} applicantStatus={item?.status} applicantId={item?.candidateId}/>)
        }
      </div>
    </div>
  )
}

export default FinalistContainer
