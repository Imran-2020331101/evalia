'use client'

import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import CourseCard from "../CourseCard"
import { useEffect } from "react";
import { allCourses, getAllCourses } from "@/redux/features/course";

const sampleCourses = [
  {
    videoId: "bYFYF2GnMy8",
    title: "React Hooks Tutorial - 12 - Fetching data with useEffect Part 1",
    description: "Learn how to fetch data in React using the useEffect hook in this part of the tutorial series by Codevolution.",
    channelId: "UCuX_Da8kv4A5F7QcCfqv8NA",  // approximate channel id
    channelTitle: "Codevolution",
    thumbnails: {
      default: { url: "https://i.ytimg.com/vi/bYFYF2GnMy8/default.jpg" },
      medium: { url: "https://i.ytimg.com/vi/bYFYF2GnMy8/mqdefault.jpg" },
      high: { url: "https://i.ytimg.com/vi/bYFYF2GnMy8/hqdefault.jpg" }
    },
    publishedAt: "2019-06-17T00:00:00Z"
  },
  {
    videoId: "Ke90Tje7VS0",
    title: "React JS Tutorial - Get up & running with React JS",
    description: "A complete beginner’s tutorial to start working with React by Programming with Mosh.",
    channelId: "UCWv7vMbMWH4-V0ZXdmDpPBA",
    channelTitle: "Programming with Mosh",
    thumbnails: {
      default: { url: "https://i.ytimg.com/vi/Ke90Tje7VS0/default.jpg" },
      medium: { url: "https://i.ytimg.com/vi/Ke90Tje7VS0/mqdefault.jpg" },
      high: { url: "https://i.ytimg.com/vi/Ke90Tje7VS0/hqdefault.jpg" }
    },
    publishedAt: "2018-07-16T00:00:00Z"
  },
  {
    videoId: "qdCHEUaFhBk",
    title: "Full React Tutorial #17 - Fetching Data with useEffect",
    description: "Net Ninja’s tutorial on using useEffect to fetch data in a React app.",
    channelId: "UCW5YeuERMmlnqo4oq8vwUpg",
    channelTitle: "The Net Ninja",
    thumbnails: {
      default: { url: "https://i.ytimg.com/vi/qdCHEUaFhBk/default.jpg" },
      medium: { url: "https://i.ytimg.com/vi/qdCHEUaFhBk/mqdefault.jpg" },
      high: { url: "https://i.ytimg.com/vi/qdCHEUaFhBk/hqdefault.jpg" }
    },
    publishedAt: "2021-01-08T00:00:00Z"
  }
];


const ExploreContainer = () => {
  const dispatch = useAppDispatch();
  const currentAllCourses = useAppSelector(allCourses)
  useEffect(()=>{
    if(!currentAllCourses?.length) dispatch(getAllCourses());
  },[currentAllCourses?.length])
  return (
    <div className="w-full h-full flex justify-center items-center py-[20px]">
      <div className="w-[70%] h-full flex flex-col gap-4">
        {
            currentAllCourses?.map((item:any)=><CourseCard key={item.videoId} course={item}/>)
        }
      </div>
    </div>
  )
}

export default ExploreContainer
