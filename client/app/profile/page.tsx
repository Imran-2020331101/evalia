'use client'

import CandidateProfileContainer from "@/components/profile/candidate/CandidateProfileContainer"
import RecruiterProfileContainer from "@/components/profile/recruiter/RecruiterProfileContainer"
import Error from "@/components/utils/Error"
import { fetchUserData, user, userStatus } from "@/redux/features/auth"
import { appliedJobs, getAllAppliedJobs, getAllJobsStatus } from "@/redux/features/job"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { useEffect } from "react"
import { ScaleLoader } from "react-spinners"

const ProfilePage = () => {
  const currentUser:any = useAppSelector(user)
  const currentUserStatus = useAppSelector(userStatus)

  const dispatch = useAppDispatch();

  const currentAppliedJobs = useAppSelector(appliedJobs) || []
  const currentExploreAllJobsStatus = useAppSelector(getAllJobsStatus)

  useEffect(()=>{
    if(!currentAppliedJobs.length || currentExploreAllJobsStatus==='error' && currentUser) {
      dispatch(getAllAppliedJobs())
    }
  },[currentUser])

  useEffect(()=>{
    if(!currentUser) dispatch(fetchUserData())
  },[])

  if(currentUserStatus==='pending' || !currentUserStatus) return <div className="flex w-full h-full justify-center items-center">
    <ScaleLoader barCount={4} color="white"/>
  </div>
  if(currentUserStatus==='error') return <div className="flex w-full h-full justify-center items-center">
    <Error/>
  </div>
  if(!currentUser) return null
  return (
    <>
    {
      currentUser?.user?.roles[0]==='RECRUITER'?
        <RecruiterProfileContainer user={currentUser}/>
      :
       <CandidateProfileContainer/> 
    }
      
    </>
  )
}

export default ProfilePage
