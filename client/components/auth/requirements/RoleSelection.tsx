'use client'

import { ChevronLeft, ChevronRight } from "lucide-react"

interface propType{
    userType:'recruiter' | 'candidate' | null,
    setUserType:React.Dispatch<React.SetStateAction<'recruiter' | 'candidate' | null>>,
    setIsNext:React.Dispatch<React.SetStateAction<boolean>>,
}

const RoleSelection = ({userType,setUserType, setIsNext}:propType) => {

  return (
        <div className="w-full h-full flex flex-col justify-start pt-[40%] gap-[20px] items-center   relative">
            <div className="w-[70%] h-[70px] bg-gray-800 rounded-3xl flex justify-center items-center gap-4 ">
                <input
                onChange={()=>setUserType('candidate')}
                checked={userType==='candidate'?true:false}
                type="checkbox"
                className="appearance-none w-5 h-5 rounded-full border border-blue-500  bg-blue-500 checked:bg-blue-500 relative checked:after:content-[''] checked:after:absolute 
                    checked:after:top-[2px] checked:after:left-[6px] checked:after:w-[6px] checked:after:h-[12px] checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:rotate-45"
                />
                <label onClick={()=>setUserType('candidate')} className="cursor-pointer text-md font-semibold">Continue as Candidate</label>
            </div>
            <div className="w-[70%] h-[70px] bg-gray-800 rounded-3xl flex justify-center items-center gap-4">
                <input
                onChange={()=>setUserType('recruiter')}
                checked={userType==='recruiter'?true:false}
                type="checkbox"
                className="appearance-none w-5 h-5 rounded-full border border-blue-500  bg-blue-500 checked:bg-blue-500 relative checked:after:content-[''] checked:after:absolute 
                    checked:after:top-[2px] checked:after:left-[6px] checked:after:w-[6px] checked:after:h-[12px] checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:rotate-45"
                />
                <label onClick={()=>setUserType('recruiter')} className="cursor-pointer text-md font-semibold">Continue as Recruiter</label>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[60px] flex px-4 items-start justify-end">
            <div className="flex items-center pb-1">
                <button onClick={()=>{userType?setIsNext(true):null}} className="text-md cursor-pointer">Next</button>
                <ChevronRight size={35} strokeWidth={1}/>
            </div>
        </div>
        </div>
        

  )
}

export default RoleSelection
