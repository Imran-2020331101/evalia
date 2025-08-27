'use client'

import { Major_Mono_Display } from "next/font/google"
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Grid2X2,ChevronDown, ChevronUp, Dot, Frown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { selectedOrgId, setSelectedOrgId } from "@/redux/features/job";
import { organizations, user } from "@/redux/features/auth";

const majorMono = Major_Mono_Display({ weight: '400', subsets: ['latin'] });


const RecruitersWorkSpaceMenu = () => {
    const [organizationToOpen, setOrganizationToOpen]=useState<string|null>(null)
    const currentOrganizations = useAppSelector(organizations)
    const currentUser = useAppSelector(user)

    const dispatch = useAppDispatch()
    const currentSelectedOrgId = useAppSelector(selectedOrgId)
  return (
    <div className='w-full h-full flex flex-col justify-between px-[10px] py-[6%]'>
      <Link href={'/'} className={`${majorMono.className} text-2xl fixed top-2 left-3`}>EVALIA</Link>
      <div className="w-full h-auto flex flex-col justify-start pt-[50px] pl-[20px] gap-2 text-gray-400">
        {
          currentOrganizations.length?
          <>
            <h1 className="text-gray-300 font-semibold tracking-wider">Organizations : </h1>
            {
              currentOrganizations.map((item:any)=><div  key={item.id} className="w-full h-auto flex flex-col gap-2 ml-[5px]">
                <button onClick={()=>dispatch(setSelectedOrgId(item.id))} className="text-sm flex font-semibold  group"><Dot className="group-hover:text-blue-500 size-6"/> {item.organizationName} </button>
                {
                  currentSelectedOrgId===item.id?
                    <div className="w-full flex flex-col gap-1 ml-[20px]">
                      <Link prefetch href={`/workspace/jobs/${item.organizationName}/my-jobs`} className="flex justify-start items-center gap-2 group ">
                        <Grid2X2 className="size-4 group-hover:text-gray-100 ml-1"/>
                        <p className="text-[14px]  cursor-pointer">My Jobs</p>
                      </Link>
                      <Link prefetch href={`/workspace/jobs/${item.organizationName}/create`} className="flex justify-start items-center gap-2 group ">
                        <Plus className="size-5 group-hover:text-gray-100 "/>
                        <p className="text-sm  cursor-pointer">Create</p>
                      </Link>
                    </div>
                  :null
                }
              </div>)
            }
          </>
          :<div className="w-full flex flex-col gap-4">
            <p className="text-sm text-gray-500">You currently have <br/> no organization :(</p>
            <Link href={'/profile#create-organization'} className="py-1 text-sm flex justify-center w-[50%] rounded-sm bg-gray-400 text-gray-950 hover:text-black hover:bg-gray-300 cursor-pointer font-bold tracking-wider">
                Create 
            </Link>
          </div>
        }
      </div>
      <div className="w-full h-auto flex justify-start items-end ">
        <Link href={'/profile'} className="flex items-center gap-2 cursor-pointer">
          <p className="px-2 py-1 rounded-sm bg-gray-600 text-sm">AJ</p>
          <p className="text-gray-300 lowercase">{currentUser?.user?.name}</p>
        </Link>
      </div>
    </div>
  )
}

export default RecruitersWorkSpaceMenu
