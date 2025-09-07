'use client'

import { useEffect, useState } from 'react';
import { SlidersHorizontal ,UserCheck, Target, MenuSquare, FileQuestion, ArrowUpRight} from 'lucide-react';

import CandidateCard from '../CandidateCard'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks';
import { markAsShortListedByAI, markShortlistedStatus, recruitersSelectedJob } from '@/redux/features/job';
import { ClipLoader } from 'react-spinners';

const ApplicantsContainer = () => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [isMounted, setIsMounted]=useState<boolean>(false);
  const [isGenShortlist, setIsGenShortlist]=useState<boolean>(false);
  const [applicants, setApplicants]=useState<any>([]);
  const [selectedToBeSortListed, setSelectedToBeShortListed]=useState<any>([]);
  const [target, setTarget] = useState(1)

  const dispatch = useAppDispatch()

  const currentSelectedRecruiterJob = useAppSelector(recruitersSelectedJob);
  const currentMarkAsShortlistedStatus = useAppSelector(markShortlistedStatus);

  const {applications}=currentSelectedRecruiterJob || [];
  const toggleSelectAll = ()=>{
    if(selectedToBeSortListed.length === applicants.length) {setSelectedToBeShortListed([]); return;}
    const applicantIds = applicants.map((item:any)=>item.candidateId)
    setSelectedToBeShortListed(applicantIds);
        console.log(selectedToBeSortListed, 'selected candidates')

  }
  const toggleSelectSingle = (candidateId:string)=>{
    const candidate = selectedToBeSortListed.find((item:any)=>item===candidateId);
    if(!candidate){
       setSelectedToBeShortListed([...selectedToBeSortListed, candidateId]);
       return;
    }
    const newSelectedCandidate = selectedToBeSortListed.filter((item:any)=>item!==candidateId);
    setSelectedToBeShortListed(newSelectedCandidate);
    console.log(selectedToBeSortListed, 'selected candidates')
  }
  const handleSubmit =()=>{
      console.log('generate sortlist')
      dispatch(markAsShortListedByAI({jobId:currentSelectedRecruiterJob._id,k:target}));
  }
  useEffect(()=>{
        const currentApplicants = applications.filter((item:any)=>item.status==='PENDING')
        setApplicants(currentApplicants);
        setIsMounted(true);
        return ()=>setIsMounted(false);
    }, [applications?.length])
  useEffect(()=>console.log(currentSelectedRecruiterJob, 'job details inside applicants container'))
  if(!isMounted) return null;
  return (
    <>
      {
        !applicants.length?
         <section className="flex flex-col items-center justify-center py-16 px-4 text-center h-full">
            {/* Icon */}
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <FileQuestion className="h-6 w-6 text-gray-500" />
            </div>

            {/* Heading */}
            <h2 className="text-lg font-semibold text-gray-400">
              No Pending Applications
            </h2>

            {/* Subtext */}
            <p className="mt-2 max-w-md text-xs text-gray-500">
              This job doesn’t have any pending applications at the moment. 
              Once candidates apply, you’ll be able to review them here.
            </p>
          </section>
        :
        <div className='w-full h-full flex flex-col pt-[10px] p-[30px] pb-[10px]'>
      <div className="w-full h-auto flex justify-between items-center shrink-0">
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <input checked={selectedToBeSortListed.length===applicants.length?true:false} onChange={toggleSelectAll} id='select-all' type="checkbox" className='size-3'/>
            <label htmlFor="select-all" className='text-sm font-semibold -tracking-normal cursor-pointer'>Select all</label>
          </div>
          
          <button onClick={()=>setIsGenShortlist(true)} disabled={selectedToBeSortListed.length?false:true} className={` text-xs tracking-normal ${selectedToBeSortListed.length?'hover:bg-blue-600 hover:text-white bg-blue-700 cursor-pointer':'bg-gray-400 cursor-not-allowed'} px-2 py-[2px] rounded-md font-bold flex gap-1 items-center`}> <ArrowUpRight size={14} color='white'/>
           Create Shortlist
          </button>
        </div>
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
                  {applicants.length} applicants have applied for this job.
                  </h2>

                  <p className="text-gray-400 text-[12px]">
                    How many candidates would you like to shortlist for the next stage?
                  </p>
                  <p className="text-gray-400 text-[12px] mt-[-5px]">
                    You must pick from 1 to {applicants.length}
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
                      max={applicants.length}
                      value={target}
                      onChange={(e) => setTarget(Number(e.target.value))}
                      className="flex-1 text-[13px] text-center py-1 px-2 rounded bg-slate-900 text-white border border-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500
                                [&::-webkit-outer-spin-button]:appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                [appearance:textfield]"
                    />
                    <button
                      onClick={() => setTarget(Math.min(applicants.length, target + 1))}
                      className="hover:text-white text-3xl cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={target < 1 || target > applicants.length || currentMarkAsShortlistedStatus==='pending'}
                    className=" cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 mt-4 transition-colors px-6 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-2"
                  >
                    {
                      currentMarkAsShortlistedStatus==='pending'?<><ClipLoader size={14} color='white' /> Generate Shortlist</>:<><Target className="w-4 h-4" /> Generate Shortlist</>
                    }
                  </button>
                </div>
            </section>  
          </div>  
        </div>
        <div className="w-full flex-1 flex flex-col gap-2 ">
          {
            applicants?.map((item:any)=><CandidateCard key={item?._id} toggleSelectSingle={toggleSelectSingle} selected={selectedToBeSortListed} candidateEmail={item?.candidateEmail} reviewId={item?.reviewId} appliedAt={item?.appliedAt} applicantStatus={item?.status} applicantId={item?.candidateId}/>)
          }
        </div>
      </div>
    </div>
      }
    </>
  )
}

export default ApplicantsContainer
