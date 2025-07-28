'use client'

import Image from 'next/image'

import completedLogo from '../../../../public/completed-green.svg'
import pendingLogo from '../../../../public/pending-blue.svg'
import expiredLogo from '../../../../public/ban-red.svg'

interface interviewCardType {
  item:{
    id:number,
    jobTitle:string,
    status:string
  },
  detailsCardId:number|null,
  setDetailsCardId:React.Dispatch<React.SetStateAction<number | null>>
}

const InterviewCard = ({item, detailsCardId, setDetailsCardId}:interviewCardType) => {

  const {id, status, jobTitle} = item;

  return (
    <div className='w-full h-[50px] shrink-0 hover:bg-gray-900 transition-colors duration-300 py-1 flex flex-col text-sm'>
        <section className="w-full flex-1 flex justify-start items-start pl-2 gap-4 relative">
            <div className={`absolute top-[100%] left-[30px] w-[100px] h-[90px] bg-gray-900 z-10 border-[1px] border-gray-800 rounded-sm ${detailsCardId===id?'flex flex-col':'hidden'}`}>
                <button className="w-full h-[30px] border-b-[1px] cursor-pointer border-gray-700 hover:border-blue-400 hover:text-blue-400 flex justify-center items-center text-[10px] font-bold tracking-widest">
                  <p>View</p>
                </button>
                <button className="w-full h-[30px] border-b-[1px] cursor-pointer border-gray-700 flex hover:border-red-400 hover:text-red-500 justify-center items-center text-[10px] font-bold tracking-widest">
                  <p className='text-red-400'>Delete</p>
                </button>
            </div>
            <button onClick={()=>setDetailsCardId(detailsCardId===id?null:id)} className="font-extrabold text-gray-400 hover:text-gray-200 cursor-pointer">...</button>
            <div className="text-[13px] self-center text-gray-200">{jobTitle}</div>
        </section>
        <section className="w-full flex-1 flex justify-between items-end pl-8 pr-4">
            <div className="flex h-full w-auto items-center gap-2">
              <Image src={status==='pending'?pendingLogo:status==='expired'?expiredLogo:completedLogo} alt={jobTitle} className='w-[14px] h-auto'/>
              <p className={` ${status==='pending'?'text-blue-400':status==='expired'?'text-red-400':'text-green-300'} uppercase text-[10px] `}>{status}</p>
            </div>
            <div className="w-auto h-full flex items-center gap-2 self-center">
              <div className="w-[16px] h-[16px] rounded-full bg-blue-700">
                <Image width={100} height={100} src={'https://i.pinimg.com/1200x/79/23/32/7923323aba1edcaac0f75ad7f9fda4f3.jpg'} alt='company logo' className='w-full h-full object-cover rounded-full'/>
              </div>
              <p className="text-gray-300 text-[12px]">Company Name</p>
            </div>
        </section>
    </div>
  )
}

export default InterviewCard 
