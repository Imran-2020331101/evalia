'use client'

import { useEffect, useState } from 'react'
import RoleSelection from './RoleSelection'
import CandidateRequirementContainer from './candidate/CandidateRequirementContainer'
import RecruiterRequirementContainer from './recruiter/RecruiterRequirementContainer'

interface propType{
    translate:number,
    userType:'recruiter' | 'candidate' | null,
    setUserType:React.Dispatch<React.SetStateAction<'recruiter' | 'candidate' | null>>,
}

const RequirementContainer = ({translate, userType, setUserType}:propType) => {
    const [isNext, setIsNext] = useState<boolean>(false);
    useEffect(()=>console.log(isNext, userType))
  return (
    <div style={{transform:`translateX(${translate}%)`}} className={`min-w-full h-full top-0 right-0 z-10 transition-transform duration-500  p-[10px]`}>
        <div className="w-full h-full bg-slate-900 flex">
            
            {
                isNext?
                <>
                    {
                        userType==='candidate'?<CandidateRequirementContainer/> : userType==='recruiter'?<RecruiterRequirementContainer/>:null
                    }
                </>
                :<RoleSelection userType={userType} setUserType={setUserType} setIsNext={setIsNext} />
            }
        </div>
    </div>
  )
}

export default RequirementContainer
