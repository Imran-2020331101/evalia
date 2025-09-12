'use client'
import { useState, useEffect } from "react"
import UploadResume from "./UploadResume"

const CandidateRequirementContainer = () => {
    const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(()=>setVisible((prev)=>!prev),50)
    return () => clearTimeout(timeout)
  }, [])
  useEffect(()=>console.log(visible, 'visible'))
  return (
    <div style={{transform: `scaleX(${visible ? 1 : 0})`,opacity: visible ? 1 : 0.6,transformOrigin: 'right',transition: 'transform 0.5s ease, opacity 0.3s ease',}} 
    className={`w-screen  h-full overflow-y-scroll scroll-container `}>
      <UploadResume onSignUp={true}/>
    </div>
  )
}

export default CandidateRequirementContainer
