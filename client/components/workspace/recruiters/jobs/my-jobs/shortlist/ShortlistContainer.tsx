'use client'

import { useEffect, useState } from 'react';
import { SlidersHorizontal ,UserCheck, Target, MenuSquare, ArrowUpRight} from 'lucide-react';

import CandidateCard from '../CandidateCard'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks';
import { markFinalistStatus, recruitersSelectedJob, setShortListedCandidate, shortListedCandidate } from '@/redux/features/job';
import { useDeepCompareEffect } from '@/custom-hooks/useDeepCompareEffect';
import { ClipLoader } from 'react-spinners';

const ShortListContainer = () => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [shortListedCandidates, setShortListedCandidates]=useState<any>(null)
  const [selectedToBeFinalist, setSelectedToBeFinalist]=useState<any>([]);
  const [isMounted, setIsMounted]=useState<boolean>(false);
  const [target, setTarget] = useState(1)

  const dispatch = useAppDispatch()

  const toggleSelectAll = ()=>{
      if(selectedToBeFinalist.length === shortListedCandidates.length) {setSelectedToBeFinalist([]); return;}
      const applicantIds = shortListedCandidates.map((item:any)=>item.candidateId)
      setSelectedToBeFinalist(applicantIds);
          console.log(selectedToBeFinalist, 'selected candidates')
  
    }
    const toggleSelectSingle = (candidateId:string)=>{
      const candidate = selectedToBeFinalist.find((item:any)=>item===candidateId);
      if(!candidate){
         setSelectedToBeFinalist([...selectedToBeFinalist, candidateId]);
         return;
      }
      const newSelectedCandidate = selectedToBeFinalist.filter((item:any)=>item!==candidateId);
      setSelectedToBeFinalist(newSelectedCandidate);
      console.log(selectedToBeFinalist, 'selected candidates')
    }
    const handleGenerateFinalist =()=>{
      const data = {
        "candidateIds":selectedToBeFinalist
      }
      const jobId = currentSelectedRecruiterJob._id;
      console.log(data, 'submitted data')

      // markAsFinalist route is needed

      // dispatch(markAsShortListed({jobId,data}));
     }
  
    // const handleSubmit =()=>{
    //     console.log('generate sortlist')
    //     dispatch(markAsShortListedByAI({jobId:currentSelectedRecruiterJob._id,k:target}));
    // }
  
  const currentMarkFinalistStatus = useAppSelector(markFinalistStatus)
  const currentSelectedRecruiterJob = useAppSelector(recruitersSelectedJob);
  const {applications}=currentSelectedRecruiterJob || [];
  const currentShortListedCandidates = useAppSelector(shortListedCandidate)
    const handleSubmit =()=>{

      // const shortListed = applications.filter((item:any)=>item.status==='SHORTLISTED')
  }
  useDeepCompareEffect(()=>{
    const shortListed = currentSelectedRecruiterJob?.applications.filter((item:any)=>item.status==='SHORTLISTED')
    setShortListedCandidates(shortListed||[]);
    setIsMounted(true);
    return ()=>setIsMounted(false);
  },[currentSelectedRecruiterJob?.applications])
  useEffect(()=>console.log(currentSelectedRecruiterJob, 'job details inside Shortlisted container'))
  if(!isMounted) return null
  return (
    <div className='w-full h-full flex flex-col pt-[10px] p-[30px] pb-[10px]'>
      <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <input checked={selectedToBeFinalist.length===shortListedCandidates.length?true:false} onChange={toggleSelectAll} id='select-all' type="checkbox" className='size-3'/>
            <label htmlFor="select-all" className='text-sm font-semibold -tracking-normal cursor-pointer'>Select all</label>
          </div>
          
          <button onClick={handleGenerateFinalist} disabled={selectedToBeFinalist.length?false:true} className={` text-xs tracking-normal ${selectedToBeFinalist.length?'hover:bg-blue-600 hover:text-white bg-blue-700 cursor-pointer':'bg-gray-400 cursor-not-allowed'} px-2 py-[2px] rounded-md font-bold flex gap-1 items-center`}> <ArrowUpRight size={14} color='white'/>
           Create Finalist
          </button>
        </div>
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
                  {shortListedCandidates.length} applicants have been shortlisted for this job.
                  </h2>

                  <p className="text-gray-400 text-[12px]">
                    How many candidates would you like to have finalist for the next stage?
                  </p>
                  <p className="text-gray-400 text-[12px] mt-[-5px]">
                    You must pick from 1 to {shortListedCandidates.length}
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
                      max={shortListedCandidates.length}
                      value={target}
                      onChange={(e) => setTarget(Number(e.target.value))}
                      className="flex-1 text-[13px] text-center py-1 px-2 rounded bg-slate-900 text-white border border-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500
                                [&::-webkit-outer-spin-button]:appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                [appearance:textfield]"
                    />
                    <button
                      onClick={() => setTarget(Math.min(shortListedCandidates.length, target + 1))}
                      className="hover:text-white text-3xl cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={target < 1 || target > shortListedCandidates.length || currentMarkFinalistStatus==='pending'}
                    className=" cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 mt-4 transition-colors px-6 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-2"
                  >
                    {
                      currentMarkFinalistStatus==='pending'?<><ClipLoader size={14} color='white' /> Generate Finalist</>:<><Target className="w-4 h-4" /> Generate Finalist</>
                    }
                  </button>
                </div>
            </section> 
          </div>  
        </div>
        {
          shortListedCandidates?.map((item:any)=><CandidateCard key={item?._id} toggleSelectSingle={toggleSelectSingle} selected={selectedToBeFinalist} candidateEmail={item?.candidateEmail} reviewId={item?.reviewId} appliedAt={item?.appliedAt} applicantStatus={item?.status} applicantId={item?.candidateId}/>)
        }
      </div>
    </div>
  )
}

export default ShortListContainer
