'use client'

import { getAllSavedCourses, savedCourses } from "@/redux/features/course"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import CourseCard from "../CourseCard";
import { useEffect } from "react";


const SavedContainer = () => {

  const dispatch = useAppDispatch()
  const currentSavedCourses = useAppSelector(savedCourses);
  useEffect(()=>{
    if(!currentSavedCourses?.length){
      dispatch(getAllSavedCourses())
    }
  },[currentSavedCourses?.length])
  return (
    <div className="w-full h-full flex justify-center items-center py-[20px]">
      <div className="w-[70%] h-full flex flex-col gap-4 overflow-y-scroll scrollbar-hidden">
        {
          currentSavedCourses?.map((item:any)=><CourseCard key={item.videoId} course={item}/>)
        }
      </div>
    </div>
  )
}

export default SavedContainer
