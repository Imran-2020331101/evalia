'use client'
import { useEffect } from 'react'
import MyJobsContainer from '@/components/workspace/recruiters/jobs/my-jobs/MyJobsContainer'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { getJobsByOrganization, selectedOrgId } from '@/redux/features/job'

const MyJobsPage = () => {
  const dispatch = useAppDispatch()
  
  const currentSelectedOrgId = useAppSelector(selectedOrgId)

  useEffect(()=>{
    if(!currentSelectedOrgId) return;
    dispatch(getJobsByOrganization(currentSelectedOrgId))
  },[currentSelectedOrgId])
  return (
    <div className='w-full h-full'>
      <MyJobsContainer/>
    </div>
  )
}

export default MyJobsPage
