'use client'
import { setPreviewedCandidate } from "@/redux/features/utils"
import { useAppDispatch } from "@/redux/lib/hooks"
import Image from "next/image"


const ApplicantsCard = () => {
    const dispatch = useAppDispatch()
    const handleViewProfile = ()=>{
        dispatch(setPreviewedCandidate(true))
    }
  return (
    <div className='w-full h-[60px] shrink-0 flex justify-start items-center px-2 gap-3 text-[12px] text-gray-200 border-b-[1px] border-gray-700 pb-2 hover:border-blue-500 transition-colors duration-300 '>
        <div className="w-[40px] h-[40px] rounded-full ">
            <Image width={40} height={40} alt="profile pic" src={'https://i.pinimg.com/736x/3b/9f/d4/3b9fd428da533d3a7c5711bf21cfba91.jpg'} className="w-full h-full object-cover rounded-full"/>
        </div>
        <div className="flex-1 h-[40px] flex flex-col gap-1">
            <p className='font-semibold'>Azwoad Islam Nishat</p>
            <div className="w-full flex-1 flex justify-start items-center gap-2 text-[11px] ">
                <p className={`text-teal-500`}>{'Accepted'}</p><p className='text-[13px] font-extrabold'>{` . `}</p>
                <p>{'Dhaka, Bangladesh'}</p><p className='text-[13px] font-extrabold'>{` . `}</p>
                <p>{`Applied at : ${`05-02-2025`}`}</p>
            </div>
        </div>
        <div className=" self-start mt-[-5px]  relative group">
            <p className="text-lg font-bold">...</p>
            <div className="absolute hidden group-hover:flex flex-col w-[200px] h-auto top-5 right-0 border border-gray-700 rounded-md z-10 bg-gray-900 backdrop-blur-2xl text-[10px] font-semibold">
                <button onClick={handleViewProfile} className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-blue-600 cursor-pointer">
                    View Profile
                </button>
                <button className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-teal-600 cursor-pointer">
                    Mark as Shortlisted
                </button>
                <button className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-teal-600 cursor-pointer">
                    Mark as Finalist
                </button>
                <button className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-red-600 cursor-pointer">
                    Reject
                </button>
            </div>
        </div>
    </div>
  )
}

export default ApplicantsCard
