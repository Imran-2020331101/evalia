'use client'

import { currentFormData, setFormData } from "@/redux/features/auth"
import { toggleIsShowAuthRole } from "@/redux/features/utils"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DotLoader } from "react-spinners"
import { toast } from "sonner"

interface propType{
    userType:'recruiter' | 'candidate' | null,
    setUserType:React.Dispatch<React.SetStateAction<'recruiter' | 'candidate' | null>>,
    setIsNext:React.Dispatch<React.SetStateAction<boolean>>,
}

const RoleSelection = ({userType,setUserType, setIsNext}:propType) => {
    const [loading, setLoading]=useState(false)
    const formData = useAppSelector(currentFormData);
    const dispatch = useAppDispatch()
    const router = useRouter()

    const handleSignUp = async()=>{
        if(!userType) {
            toast.error("Please select a user type.")
            return;
        }
        try {
            setLoading(true)
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (data.success) {
                setIsNext(true)
                router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}&message=Registration successful! Please check your email for the OTP.`)
            } else {
                toast.error(data.message||'Registration failed. Please try again.')
                dispatch(toggleIsShowAuthRole());
            }
            } catch (error) {
                console.error('Registration error:', error)
                toast.error('Registration failed. Please try again.')
                dispatch(toggleIsShowAuthRole());
            } finally {
                setLoading(false)
            }
    }
  return (
        <div className="w-full h-full flex flex-col justify-center gap-[20px] items-center   relative">
            <div className={`${loading?'flex':'hidden'} absolute z-[200] top-0 bottom-0 left-0 right-0 bg-black/80 flex justify-center items-center`}>
                <DotLoader size={50} color="white" />
            </div>
            <div className="w-[70%] h-[70px] bg-gray-800 rounded-3xl flex justify-center items-center gap-4 ">
                <input
                onChange={()=>{setUserType('candidate'); dispatch(setFormData({name:"role",value:"USER"}))}}
                checked={userType==='candidate'?true:false}
                type="checkbox"
                className="appearance-none w-5 h-5 rounded-full border border-blue-500  bg-blue-500 checked:bg-blue-500 relative checked:after:content-[''] checked:after:absolute 
                    checked:after:top-[2px] checked:after:left-[6px] checked:after:w-[6px] checked:after:h-[12px] checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:rotate-45"
                />
                <label onClick={()=>{setUserType('candidate'); dispatch(setFormData({name:"role",value:"USER"}))}} className="cursor-pointer text-md font-semibold">Continue as Candidate</label>
            </div>
            <div className="w-[70%] h-[70px] bg-gray-800 rounded-3xl flex justify-center items-center gap-4">
                <input
                onChange={()=>{setUserType('recruiter');dispatch(setFormData({name:"role",value:"RECRUITER"}))}}
                checked={userType==='recruiter'?true:false}
                type="checkbox"
                className="appearance-none w-5 h-5 rounded-full border border-blue-500  bg-blue-500 checked:bg-blue-500 relative checked:after:content-[''] checked:after:absolute 
                    checked:after:top-[2px] checked:after:left-[6px] checked:after:w-[6px] checked:after:h-[12px] checked:after:border-white checked:after:border-r-2 checked:after:border-b-2 checked:after:rotate-45"
                />
                <label onClick={()=>{setUserType('recruiter'); dispatch(setFormData({name:"role",value:"RECRUITER"}))}} className="cursor-pointer text-md font-semibold">Continue as Recruiter</label>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[60px] flex px-4 items-start justify-end">
            <div className="flex items-center pb-1">
                <button onClick={handleSignUp} className="text-md cursor-pointer">Next</button>
                <ChevronRight size={35} strokeWidth={1}/>
            </div>
        </div>
        </div>
        

  )
}

export default RoleSelection
