'use client'

import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import CourseCard from "../CourseCard"
import { useEffect } from "react";
import { allCourses, allCourseStatus, getAllCourses, getAllSavedCourses, savedCourses } from "@/redux/features/course";
import { ScaleLoader } from "react-spinners";
import { BrushCleaning } from "lucide-react";
import Loading from "@/components/utils/Loading";
import Error from "@/components/utils/Error";

const ExploreContainer = () => {
  const dispatch = useAppDispatch();
  const currentAllCourses = useAppSelector(allCourses)
  const currentSavedCourses = useAppSelector(savedCourses);
  const currentAllCoursesStatus = useAppSelector(allCourseStatus);

  useEffect(()=>{
    if(!currentAllCourses?.length) dispatch(getAllCourses());
    if(!currentSavedCourses?.length) {
      dispatch(getAllSavedCourses())
    }
  },[currentAllCourses?.length])
  if(currentAllCoursesStatus==='pending') return (
    <Loading/>
  )
  if(currentAllCoursesStatus==='error') return (
    <Error/>
  )
  if(!currentAllCourses?.length) return (
    <section className="flex flex-col w-full h-full items-center justify-center text-center px-4">
      <div className="flex flex-col items-center">
        <div className="p-4 rounded-full bg-gray-100 mb-4">
          <BrushCleaning className="w-8 h-8 text-gray-500" />
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
            currentAllCourses?.map((item:any)=><CourseCard key={item.videoId} course={item}/>)
        }
      </div>
    </div>
  )
}

export default ExploreContainer
