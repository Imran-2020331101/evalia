'use client'
import { ShoppingCart, Box, Headphones, CircleQuestionMark } from "lucide-react"

const ProfileSideBar = () => {
  return (
    <div className="w-full h-full flex flex-col justify-start items-start text-[13px]">
        <div className="flex flex-col text-gray-300">
            <h1 className="text-[14px] font-semibold mb-2 text-gray-200">Dashboard</h1>
            <button className="flex items-center cursor-pointer "> <ShoppingCart className="size-4 mr-2"/> Invoices</button>
            <button className="flex items-center cursor-pointer mt-1"> <Box className="size-4 mr-2"/> Plans & Packages</button>
        </div>
        <div className="flex flex-col text-gray-300 mt-4">
            <h1 className="text-[14px] font-semibold mb-2 text-gray-200">Help & Support</h1>
            <button className="flex items-center cursor-pointer "> <Headphones className="size-4 mr-2"/> Support</button>
            <button className="flex items-center cursor-pointer mt-1"> <CircleQuestionMark className="size-4 mr-2"/> Recruitment Guideline</button>
        </div>
    </div>
  )
}

export default ProfileSideBar
