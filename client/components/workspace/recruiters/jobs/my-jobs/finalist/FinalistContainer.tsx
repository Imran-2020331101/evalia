'use client'

import { useEffect, useState } from 'react';

import CandidateCard from '../CandidateCard'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks';
import { recruitersSelectedJob,} from '@/redux/features/job';
import { useDeepCompareEffect } from '@/custom-hooks/useDeepCompareEffect';
import { ClipLoader } from 'react-spinners';
import { FileQuestion } from 'lucide-react';

const FinalistContainer = () => {
  const [finalistCandidates, setFinalistCandidates]=useState<any>(null)
  const [isMounted, setIsMounted]=useState<boolean>(false);

  const currentSelectedRecruiterJob = useAppSelector(recruitersSelectedJob);

  useDeepCompareEffect(()=>{
    const filteredFinalist = currentSelectedRecruiterJob?.applications.filter((item:any)=>item.status==='ACCEPTED')
    setFinalistCandidates(filteredFinalist||[]);
    setIsMounted(true);
    return ()=>setIsMounted(false);
  },[currentSelectedRecruiterJob?.applications])
  useEffect(()=>console.log(currentSelectedRecruiterJob, 'job details inside finalist container'))
  if(!isMounted) return null
  if(!finalistCandidates.length) return (
    <section className="flex flex-col items-center justify-center py-16 px-4 text-center h-full">
            {/* Icon */}
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <FileQuestion className="h-6 w-6 text-gray-500" />
            </div>

            {/* Heading */}
            <h2 className="text-lg font-semibold text-gray-400">
              No Finalist yet
            </h2>

            {/* Subtext */}
            <p className="mt-2 max-w-md text-xs text-gray-500">
              This job doesn’t have any finalist at the moment. 
              Once candidates being finalized, you’ll be able to review them here.
            </p>
          </section>
  )
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
