'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import InterviewCard from './InterviewCard'

import filterLogo from '../../../../public/filter.svg'
import dayLogo from '../../../../public/sun.svg'
import nameLogo from '../../../../public/list.svg'
import rightArrowLogo from '../../../../public/right-arrow.svg'
import sortUpLogo from '../../../../public/sort-up.svg'
import sortDownLogo from '../../../../public/sort-down.svg'

const InterviewContainer = () => {
  const [detailsCardId, setDetailsCardId] = useState<null | number>(null)
  const [isShowFilter, setIsShowFilter] = useState(false)

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="w-full h-[40px] shrink-0  flex justify-start pl-[20px] items-center relative">
        <button onClick={()=>setIsShowFilter((prev)=>!prev)} className=' cursor-pointer flex gap-2 w-auto h-full items-center'>
          <Image src={filterLogo} alt='filter logo' className='w-[15px] h-auto'/>
          <p className='text-[12px] text-gray-300'>Filter</p>
        </button>
        {
          isShowFilter && <div className="absolute top-[100%] left-[40px] w-[120px] h-[80px] bg-gray-900 border border-gray-700 z-20 flex flex-col">
                            <div className="w-full h-[40px] border-b-[1px] border-gray-700 text-[12px] font-semibold text-gray-300 flex justify-between px-2 items-center relative group">
                              <div className=" w-auto h-full flex items-center gap-1">
                                <Image src={dayLogo} alt='day logo' className='w-[12px] h-auto'/>
                                <p className='group-hover:text-gray-200'>Day</p>
                              </div>
                              <Image src={rightArrowLogo} alt='go right' className='w-[18px] h-auto'/>
                              <div className="absolute w-[120px] h-[60px] group-hover:flex flex-col hidden border-[1px] border-gray-700 left-[100%] bg-gray-900 top-[50%]">
                                <button className="h-[30px] hover:text-gray-200 w-full border-b-[1px] border-b-gray-700 flex justify-center items-center gap-2">
                                    <p >Ascending</p>
                                    <Image src={sortUpLogo} alt='ascending' className='w-[12px] self-end'/>
                                </button>
                                <button className="h-[30px] hover:text-gray-200 w-full flex justify-center items-center gap-2">
                                    <p>Descending</p>
                                    <Image src={sortDownLogo} alt='descending' className='w-[12px] self-center'/>
                                </button>
                              </div>
                            </div>
                            <div className="w-full h-[40px] text-[12px] font-semibold text-gray-300 flex justify-between px-2 items-center relative group">
                              <div className=" w-auto h-full flex items-center gap-1">
                                <Image src={nameLogo} alt='name logo' className='w-[12px] h-auto'/>
                                <p className='group-hover:text-gray-200'>Name</p>
                              </div>
                              <Image src={rightArrowLogo} alt='go right' className='w-[18px] h-auto'/>
                              <div className="absolute w-[120px] h-[60px] group-hover:flex flex-col hidden border-[1px] border-gray-700 left-[100%] bg-gray-900 top-[50%]">
                                <button className="h-[30px] hover:text-gray-200 w-full border-b-[1px] border-b-gray-700 flex justify-center items-center gap-2">
                                    <p >Ascending</p>
                                    <Image src={sortUpLogo} alt='ascending' className='w-[12px] self-end'/>
                                </button>
                                <button className="h-[30px] hover:text-gray-200 w-full flex justify-center items-center gap-2">
                                    <p>Descending</p>
                                    <Image src={sortDownLogo} alt='descending' className='w-[12px] self-center'/>
                                </button>
                              </div>
                            </div>
                          </div>
        }
      </div>
      <div className='w-[60%] flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-hidden'>
        {
          Array.from({ length: 50 }, (_, index) => (
            <InterviewCard
              key={index}
              detailsCardId={detailsCardId}
              setDetailsCardId={setDetailsCardId}
              item={{
                id: index,
                jobTitle: `Job Title No : ${index}`,
                status: index%3===0?'expired':index & 1 ? 'completed' : 'pending'
              }}
            />
          ))
        }
      </div>
    </div>
  )
}

export default InterviewContainer
