'use client'

import Link from "next/link"
import { useParams , usePathname} from "next/navigation"
import { useEffect } from "react"

const MyJobSingleNavbar = () => {
  const {id} = useParams()
  const path = usePathname()
  const pathList = usePathname().split('/').filter(Boolean)
  const currentRoute = pathList[pathList.length-1];

  useEffect(()=>console.log(pathList,'pathlist'))
  return (
      <div className="w-full h-full flex justify-center items-center gap-[10px]">
        <Link prefetch href={`/workspace/jobs/${pathList[2]}/my-jobs/${pathList[4]}/applicants`} className={`px-1 py-1  cursor-pointer  hover:text-blue-400 transition-colors duration-300 ${currentRoute==='applicants'?'text-blue-400':'text-white '}`}>
          <p className="text-[12px] font-semibold tracking-wider ">Applicants</p>
        </Link>
        <div className="h-[30%] w-[1px] bg-gray-200"></div>
        <Link prefetch href={`/workspace/jobs/${pathList[2]}/my-jobs/${pathList[4]}/shortlist`}className={`px-1 py-1 cursor-pointer  hover:text-blue-400 transition-colors duration-300 ${currentRoute==='shortlist'?'text-blue-400 ':'text-white '}`}>
          <p className="text-[12px] font-semibold tracking-wider ">Shortlist</p>
        </Link>
        <div className="h-[30%] w-[1px] bg-gray-200"></div>
        <Link prefetch href={`/workspace/jobs/${pathList[2]}/my-jobs/${pathList[4]}/finalist`} className={`px-1 py-1   cursor-pointer hover:text-blue-400 transition-colors duration-300 ${currentRoute==='finalist'?'text-blue-400 ':'text-white'}`}>
          <p className="text-[12px] font-semibold tracking-wider ">Finalist</p>
        </Link>
      </div>
  )
}

export default MyJobSingleNavbar
