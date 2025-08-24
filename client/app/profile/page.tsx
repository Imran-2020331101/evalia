'use client'

import CandidateProfileContainer from "@/components/profile/candidate/CandidateProfileContainer"
import RecruiterProfileContainer from "@/components/profile/recruiter/RecruiterProfileContainer"
import Error from "@/components/utils/Error"
import { fetchUserData, user, userStatus } from "@/redux/features/auth"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { useEffect } from "react"
import { ScaleLoader } from "react-spinners"

const ProfilePage = () => {
  const currentUser = useAppSelector(user)
  const currentUserStatus = useAppSelector(userStatus)

  const dispatch = useAppDispatch();

  useEffect(()=>{
    if(!currentUser) dispatch(fetchUserData())
  },[])
  useEffect(()=>console.log(currentUserStatus, 'currentUserStatus'))
  if(currentUserStatus==='pending' || !currentUserStatus) return <div className="flex w-full h-full justify-center items-center">
    <ScaleLoader barCount={4} color="white"/>
  </div>
  if(currentUserStatus==='error') return <div className="flex w-full h-full justify-center items-center">
    <Error/>
  </div>

  return (
    <>
      {/* <CandidateProfileContainer user={currentUser}/> */}
      <RecruiterProfileContainer user={currentUser}/>
    </>
  )
}

export default ProfilePage
