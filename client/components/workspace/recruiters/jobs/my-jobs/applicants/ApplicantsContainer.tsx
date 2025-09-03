'use client'

import { useEffect, useState } from 'react';
import { SlidersHorizontal ,UserCheck, Target, MenuSquare} from 'lucide-react';

import CandidateCard from '../CandidateCard'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks';
import { markAsShortListedByAI, recruitersSelectedJob } from '@/redux/features/job';

const ApplicantsContainer = () => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [target, setTarget] = useState(1)

  const dispatch = useAppDispatch()

  const currentSelectedRecruiterJob = useAppSelector(recruitersSelectedJob);
  const {applications}=currentSelectedRecruiterJob || [];
    const handleSubmit =()=>{
      console.log('generate sortlist')
      dispatch(markAsShortListedByAI({jobId:currentSelectedRecruiterJob._id,k:target}));
  }
  useEffect(()=>console.log(currentSelectedRecruiterJob, 'job details inside applicants container'))
  return (
    <div className='w-full h-full flex flex-col pt-[10px] p-[30px] pb-[10px]'>
      <div className="w-full h-auto flex justify-end items-center shrink-0">
        <button onClick={()=>setIsShowModal((prev)=>!prev)} className=' mb-4 relative group'>
            <div className="absolute top-[110%] right-[40%] bg-gray-700 rounded-sm text-gray-100 px-3 py-1 group-hover:flex hidden text-xs">
              Menu
            </div>
            <MenuSquare size={22} className='cursor-pointer'/>
        </button>
      </div>
      <div className="w-full flex-1 shrink-0 flex flex-col justify-start items-center gap-[20px] relative">
        <div className={`${isShowModal?'scale-y-100 scale-x-100':'scale-y-0 scale-x-0'} absolute left-0 top-0 z-20 origin-top-right transition-transform duration-300 w-full h-full `}>
          <div className="w-full h-full bg-slate-900">
            <section className="w-full h-full flex justify-center items-start pt-[20%] bg-gray-900/50 ">
                <div className="w-[70%] h-auto flex flex-col justify-center items-center gap-1 ">
                  <h2 className="text-[14px] font-semibold flex items-center gap-2 text-gray-200">
                  <UserCheck className="text-blue-500 w-[19px]" />
                  {applications.length} applicants have applied for this job.
                  </h2>

                  <p className="text-gray-400 text-[12px]">
                    How many candidates would you like to shortlist for the next stage?
                  </p>
                  <p className="text-gray-400 text-[12px] mt-[-5px]">
                    You must pick from 1 to {applications.length}
                  </p>

                  <div className="flex w-[70%] h-full items-center space-x-2 mt-3">
                    <button
                      onClick={() => setTarget(Math.max(1, target - 1))}
                      className=" hover:text-white text-3xl cursor-pointer"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={applications.length}
                      value={target}
                      onChange={(e) => setTarget(Number(e.target.value))}
                      className="flex-1 text-[13px] text-center py-1 px-2 rounded bg-slate-900 text-white border border-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500
                                [&::-webkit-outer-spin-button]:appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                [appearance:textfield]"
                    />
                    <button
                      onClick={() => setTarget(Math.min(applications.length, target + 1))}
                      className="hover:text-white text-3xl cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={target < 1 || target > applications.length}
                    className=" cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 mt-4 transition-colors px-6 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-2"
                  >
                    <Target className="w-4 h-4" /> Generate Shortlist
                  </button>
                </div>
            </section>  
          </div>  
        </div>
        {
          applications?.map((item:any)=><CandidateCard key={item?._id} candidateEmail={item?.candidateEmail} reviewId={item?.reviewId} appliedAt={item?.appliedAt} applicantStatus={item?.status} applicantId={item?.candidateId}/>)
        }
      </div>
    </div>
  )
}

export default ApplicantsContainer
