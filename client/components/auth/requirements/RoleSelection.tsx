'use client'

import { currentFormData, setFormData } from "@/redux/features/auth"
import { toggleIsShowAuthRole } from "@/redux/features/utils"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { DotLoader } from "react-spinners"
import { toast } from "sonner"
import { gsap } from "gsap"

interface propType {
  userType: 'recruiter' | 'candidate' | null,
  setUserType: React.Dispatch<React.SetStateAction<'recruiter' | 'candidate' | null>>,
  setIsNext: React.Dispatch<React.SetStateAction<boolean>>,
}

const RoleSelection = ({ userType, setUserType, setIsNext }: propType) => {
  const [loading, setLoading] = useState(false)
  const formData = useAppSelector(currentFormData)
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Refs for GSAP animation
  const candidateRef = useRef<HTMLDivElement | null>(null)
  const recruiterRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const candidate = candidateRef.current
    const recruiter = recruiterRef.current

    if (candidate) {
      candidate.addEventListener("mouseenter", () => {
        gsap.to(candidate, { scale: 1.03, duration: 0.2, ease: "power2.out" })
      })
      candidate.addEventListener("mouseleave", () => {
        gsap.to(candidate, { scale: 1, duration: 0.2, ease: "power2.inOut" })
      })
      candidate.addEventListener("mousedown", () => {
        gsap.to(candidate, { scale: 0.97, duration: 0.1 })
      })
      candidate.addEventListener("mouseup", () => {
        gsap.to(candidate, { scale: 1.03, duration: 0.2 })
      })
    }

    if (recruiter) {
      recruiter.addEventListener("mouseenter", () => {
        gsap.to(recruiter, { scale: 1.03, duration: 0.2, ease: "power2.out" })
      })
      recruiter.addEventListener("mouseleave", () => {
        gsap.to(recruiter, { scale: 1, duration: 0.2, ease: "power2.inOut" })
      })
      recruiter.addEventListener("mousedown", () => {
        gsap.to(recruiter, { scale: 0.97, duration: 0.1 })
      })
      recruiter.addEventListener("mouseup", () => {
        gsap.to(recruiter, { scale: 1.03, duration: 0.2 })
      })
    }

    return () => {
      candidate?.replaceWith(candidate.cloneNode(true))
      recruiter?.replaceWith(recruiter.cloneNode(true))
    }
  }, [])

  const handleSignUp = async () => {
    if (!userType) {
      toast.error("Please select a user type.")
      return
    }
    try {
      setLoading(true)
      console.log(formData, 'formData')
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setIsNext(true)
        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}&message=Registration successful! Please check your email for the OTP.`)
      } else {
        toast.error(data.message || 'Registration failed. Please try again.')
        dispatch(toggleIsShowAuthRole())
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
      dispatch(toggleIsShowAuthRole())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col justify-start pt-[10%] gap-6 items-center relative">
      {/* Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 backdrop-blur-sm flex justify-center items-center rounded-xl">
          <DotLoader size={50} color="white" />
        </div>
      )}

      {/* Heading */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white">Choose Your Role</h2>
        <p className="text-gray-400 text-sm">Select how you want to continue</p>
      </div>

      {/* Candidate Option */}
      <div
        ref={candidateRef}
        className={`w-[70%] h-[70px] rounded-xl flex justify-between items-center px-6 cursor-pointer shadow-md transition-all
          ${userType === 'candidate'
            ? 'bg-blue-600 text-white shadow-blue-500/40'
            : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
          }`}
        onClick={() => { setUserType('candidate'); dispatch(setFormData({ name: "role", value: "USER" })) }}
      >
        <span className="font-medium">Continue as Candidate</span>
        <input
          type="radio"
          checked={userType === 'candidate'}
          onChange={() => { }}
          className="hidden"
        />
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all 
          ${userType === 'candidate' ? 'border-white bg-white' : 'border-gray-400'}`}>
          {userType === 'candidate' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
        </div>
      </div>

      {/* Recruiter Option */}
      <div
        ref={recruiterRef}
        className={`w-[70%] h-[70px] rounded-xl flex justify-between items-center px-6 cursor-pointer shadow-md transition-all
          ${userType === 'recruiter'
            ? 'bg-blue-600 text-white shadow-blue-500/40'
            : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
          }`}
        onClick={() => { setUserType('recruiter'); dispatch(setFormData({ name: "role", value: "RECRUITER" })) }}
      >
        <span className="font-medium">Continue as Recruiter</span>
        <input
          type="radio"
          checked={userType === 'recruiter'}
          onChange={() => { }}
          className="hidden"
        />
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all 
          ${userType === 'recruiter' ? 'border-white bg-white' : 'border-gray-400'}`}>
          {userType === 'recruiter' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
        </div>
      </div>
      

      {/* Next Button */}
      <div className="absolute bottom-8 left-0  w-full flex justify-end px-6">
        <button
          onClick={handleSignUp}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-800 transition-all text-white font-medium  justify-center mt-[30px] rounded-xl shadow-md shadow-blue-500/30"
        >
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default RoleSelection
