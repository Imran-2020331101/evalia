import Image from 'next/image'
import { FilePenLine } from 'lucide-react'

const CourseCard = () => {
  return (
    <div className="w-full h-[70px] border-b border-gray-800 hover:border-blue-400 flex justify-between shrink-0">
      {/* Left Section */}
      <div className="h-full flex-1 flex justify-start items-center gap-4">
        {/* Thumbnail */}
        <div className="w-[50px] h-[45px] rounded-sm overflow-hidden">
          <Image
            src="https://i.pinimg.com/1200x/93/6b/cd/936bcd5d03c2dde6786e21f617790034.jpg"
            alt="course thumbnail"
            width={100}
            height={100}
            className="w-full h-full object-cover rounded-sm"
          />
        </div>

        {/* Course Info */}
        <div className="flex flex-col h-[50px] justify-between items-start flex-1">
          <button className="text-[12px] text-gray-100 font-semibold tracking-wider cursor-pointer hover:underline">
            Introduction to Data Science
          </button>
          <div className="w-full flex items-center justify-start overflow-hidden">
            <p className="text-[12px] text-gray-300">Coursera</p>
            <p className="font-bold text-sm mx-1">.</p>
            <p className="text-[12px] text-gray-400">Online</p>
            <p className="font-bold text-sm mx-1">.</p>
            <p className="text-[12px] text-gray-300">6 weeks</p>
            <p className="font-bold text-sm mx-1">.</p>
            <p className="text-[12px] text-gray-300">$49</p>
            <p className="font-bold text-sm mx-1">.</p>
            <p className="text-[12px] text-gray-300">Updated 2 days ago</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="h-full w-auto flex justify-end items-center gap-4">
        <button className="w-[60px] h-[30px] border border-gray-300 flex justify-center items-center rounded-sm gap-1 text-gray-300 hover:text-blue-500 hover:border-blue-500 cursor-pointer">
          <FilePenLine className="w-[13px]" />
          <p className="text-[10px] font-semibold">View</p>
        </button>
      </div>
    </div>
  )
}

export default CourseCard
