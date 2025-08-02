'use client'

import { useState } from 'react';
import { SlidersHorizontal ,UserCheck, Target} from 'lucide-react';

import ApplicantsCard from './ApplicantsCard'

const ApplicantsContainer = () => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [target, setTarget] = useState(5)

    const handleSubmit =()=>{

  }
  return (
    <div className='w-full h-full flex flex-col pt-[10px] p-[30px] pb-[10px]'>
      <div className="w-full h-auto flex justify-end items-center shrink-0">
        <button onClick={()=>setIsShowModal((prev)=>!prev)} className=' mb-4 '>
            <SlidersHorizontal className='w-[18px] cursor-pointer'/>
        </button>
      </div>
      <div className="w-full flex-1 shrink-0 flex flex-col justify-start items-center gap-[20px] relative">
        <div className={`${isShowModal?'scale-y-100 scale-x-100':'scale-y-0 scale-x-0'} absolute left-0 top-0 z-20 origin-top-right transition-transform duration-300 w-full h-full `}>
          <div className="w-full h-full bg-slate-900">
            <section className="w-full h-full flex justify-center items-start pt-[20%] bg-gray-900/50 ">
                <div className="w-[70%] h-auto flex flex-col justify-center items-center gap-1 ">
                  <h2 className="text-[14px] font-semibold flex items-center gap-2 text-gray-200">
                  <UserCheck className="text-blue-500 w-[19px]" />
                  {35} applicants have applied for this job.
                  </h2>

                  <p className="text-gray-400 text-[12px]">
                    How many candidates would you like to shortlist for the next stage?
                  </p>
                  <p className="text-gray-400 text-[12px] mt-[-5px]">
                    You must pick from 1 to {35}
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
                      max={35}
                      value={target}
                      onChange={(e) => setTarget(Number(e.target.value))}
                      className="flex-1 text-[13px] text-center py-1 px-2 rounded bg-slate-900 text-white border border-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{
                        appearance: 'textfield',
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none',
                      }}
                    />
                    <button
                      onClick={() => setTarget(Math.min(35, target + 1))}
                      className="hover:text-white text-3xl cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={target < 1 || target > 35}
                    className=" cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 mt-4 transition-colors px-6 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-2"
                  >
                    <Target className="w-4 h-4" /> Generate Shortlist
                  </button>
                </div>
            </section>  
          </div>  
        </div>
        <ApplicantsCard/>
        <ApplicantsCard/>
        <ApplicantsCard/>
      </div>
    </div>
  )
}

export default ApplicantsContainer
