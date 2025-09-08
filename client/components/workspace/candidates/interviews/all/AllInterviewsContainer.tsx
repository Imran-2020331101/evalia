'use client'
import React, { useEffect, useState } from 'react'
import InterviewContainer from '../InterviewContainer'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks';
import { allInterviews, getallInterviews } from '@/redux/features/interview';

const AllInterviewsContainer = () => {
  const [interviews, setInterviews]=useState<any>(null);
  const currentAllInterviews = useAppSelector(allInterviews);

  const dispatch = useAppDispatch();

  useEffect(()=>{
    if(!currentAllInterviews.length) dispatch(getallInterviews());
  },[])
  useEffect(()=>{
    setInterviews(currentAllInterviews);
  },[currentAllInterviews.length])
  if(!interviews) return null;
  return (
    <>
      <InterviewContainer interviews={interviews}/>
    </>
  )
}

export default AllInterviewsContainer
