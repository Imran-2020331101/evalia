'use client'
import Image from 'next/image'
import workspace from '../../public/workspace.png'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/all'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { fetchUserData, getAllOrganizations, organizations, user } from '@/redux/features/auth'
import { appliedJobs, getAllAppliedJobs, getAllSavedJobs, savedJobs } from '@/redux/features/job'
import { allNotifications, getAllNotifications } from '@/redux/features/notification'
import { useRouter } from 'next/navigation'

gsap.registerPlugin(SplitText)

const workSpacePage = () => {

  const dispatch = useAppDispatch()
  const router = useRouter()

  const currentUser = useAppSelector(user)
  const currentOrganizations = useAppSelector(organizations)
  const currentAppliedJobs = useAppSelector(appliedJobs)
  const currentSavedJobs = useAppSelector(savedJobs);
  const currentAllNotifications = useAppSelector(allNotifications) || []

  useGSAP(()=>{
    const logo = document.getElementById('logo');
    const description = document.getElementById('description')
    if(!logo || !description) return;
    const descriptionSplit = new SplitText('#description', { type: 'lines' });
    gsap.fromTo('#logo',{opacity:0, yPercent:50},{yPercent:0, opacity:1, duration:1.8, ease:'expo.out'})
    gsap.fromTo(descriptionSplit.lines,{opacity:0, xPercent:-20}, {xPercent:0, opacity:1, duration:1.8, ease:'expo.out',stagger:0.3, delay:0.4})
  },[])

  useEffect(()=>{
    if(!currentUser) dispatch(fetchUserData())
    if(!currentOrganizations?.length) dispatch(getAllOrganizations())
    if(!currentAppliedJobs?.length) dispatch(getAllAppliedJobs())
    if(!currentSavedJobs?.length) dispatch(getAllSavedJobs())
    if(!currentAllNotifications?.length)dispatch(getAllNotifications())
  },[])


  
  return (
    <div className='w-full h-full flex flex-col justify-center items-center gap-3'>
        <Image id='logo' src={workspace} alt="workspace" className='w-[130px] h-auto' />
        <p id='description' className='w-[30%] h-auto text-center text-gray-400 text-[13px]'>
           One platform. Infinite possibilities. Launch interviews, collaborate on documents, manage tasks, and power your productivity — all from a single place.
        </p>
    </div>
  )
}

export default workSpacePage
