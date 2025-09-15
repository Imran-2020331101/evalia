'use client'

import { getAllSaveCourseStatus, getAllSavedCourses, savedCourses } from "@/redux/features/course"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import CourseCard from "../CourseCard";
import { useEffect } from "react";
import Loading from "@/components/utils/Loading";
import Error from "@/components/utils/Error";
import { Save } from "lucide-react";


const SavedContainer = () => {

  const dispatch = useAppDispatch()
  const currentSavedCourses = useAppSelector(savedCourses);
  const currentSavedCoursesStatus = useAppSelector(getAllSaveCourseStatus);
  useEffect(()=>{
    if(!currentSavedCourses?.length){
      dispatch(getAllSavedCourses())
    }
  },[currentSavedCourses?.length])
  if(currentSavedCoursesStatus==='pending') return (
    <Loading/>
  )
  if(currentSavedCoursesStatus==='error') return (
    <Error/>
  )
  if(!currentSavedCourses?.length) return (
    <section className="flex flex-col w-full h-full items-center justify-center text-center px-4">
      <div className="flex flex-col items-center">
        <div className="p-4 rounded-full bg-gray-100 mb-4">
          <Save className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-300">
          No Courses Available
        </h2>
        <p className="mt-2 text-gray-400 max-w-md">
          Currently, there are no courses available to explore. Please check back later.
        </p>
      </div>
    </section>
  )
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
