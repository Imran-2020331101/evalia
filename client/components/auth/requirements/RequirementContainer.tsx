'use client'

import { useEffect, useState } from 'react'
import RoleSelection from './RoleSelection'
import CandidateRequirementContainer from './candidate/CandidateRequirementContainer'
import RecruiterRequirementContainer from './recruiter/RecruiterRequirementContainer'

interface propType{
    userType:'recruiter' | 'candidate' | null,
    setUserType:React.Dispatch<React.SetStateAction<'recruiter' | 'candidate' | null>>,
}

const RequirementContainer = ({userType, setUserType}:propType) => {
    const [isNext, setIsNext] = useState<boolean>(false);
    return (
    <div  className={`min-w-full h-full transition-transform duration-500  p-[10px]`}>
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
