'use client'

import { Major_Mono_Display } from "next/font/google"
import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Grid2X2,ChevronDown, ChevronUp, Dot, Frown, Bell, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { selectedOrg, selectedOrgId, setSelectedOrg, setSelectedOrgId } from "@/redux/features/job";
import { organizations, user } from "@/redux/features/auth";
import { useDeepCompareEffect } from "@/custom-hooks/useDeepCompareEffect";
import { allNotifications } from "@/redux/features/notification";
import ProgressLink from "@/components/utils/ProgressLink";

const majorMono = Major_Mono_Display({ weight: '400', subsets: ['latin'] });


const RecruitersWorkSpaceMenu = () => {
    const [organizationToOpen, setOrganizationToOpen]=useState<string|null>(null)
    const [unreadNotificationCount, setUnreadNotificationCount]=useState<number>(0)
    const currentOrganizations = useAppSelector(organizations)
    const currentUser = useAppSelector(user)

    const currentNotifications = useAppSelector(allNotifications);

    const dispatch = useAppDispatch()
    const currentSelectedOrgId = useAppSelector(selectedOrgId)
    const currentSelectedOrg = useAppSelector(selectedOrg)
  useDeepCompareEffect(()=>{
    let count =0 ;
    currentNotifications?.map((item:any)=>{if(!item.isRead)count+=1;})
    if(count!==unreadNotificationCount) setUnreadNotificationCount(count);
  },[currentNotifications])
  useEffect(()=>{
    if(!currentSelectedOrgId && currentOrganizations.length) {dispatch(setSelectedOrgId(currentOrganizations[0].id)); dispatch(setSelectedOrg(currentOrganizations[0]));}
  },[currentOrganizations.length])
  return (
    <div className='w-full h-full flex flex-col relative justify-between px-[10px] py-[6%]'>
      <div className="flex justify-between items-end px-4 absolute top-4 left-0 w-full">
        <ProgressLink href={'/'} className={`${majorMono.className} text-2xl `}>EVALIA</ProgressLink>
        <ProgressLink href={'/workspace/notifications'} className="relative inline-block ">
            {/* Bell Icon */}
            <Bell className="text-gray-100 size-6" />

            {/* Badge */}
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {unreadNotificationCount}
              </span>
            )}
          </ProgressLink>
      </div>
      <div className="w-full h-auto flex flex-col justify-start pt-[70px] pl-[] gap-2 text-gray-400">
        <ProgressLink href={'/workspace/search-candidate'} className="text-md font-semibold flex gap-1 text-gray-200 items-center ml-[5px]"> <Search className="size-4 text-gray-200"/> Search candidate </ProgressLink>
        {
          currentOrganizations.length?
          <>
            {
              currentOrganizations.map((item:any)=><div  key={item.id} className="w-full h-auto flex flex-col gap-2 ">
                <button onClick={()=>{dispatch(setSelectedOrgId(item.id));dispatch(setSelectedOrg(item))}} className="text-sm text-gray-200 flex font-semibold  group"><Dot className="group-hover:text-blue-500 size-6"/> {item.organizationName} </button>
                {
                  currentSelectedOrgId===item.id?
                    <div className="w-full flex flex-col gap-1 ml-[20px]">
                      <ProgressLink prefetch href={`/workspace/jobs/${item.organizationName}/my-jobs`} className="flex justify-start items-center gap-2 group ">
                        <Grid2X2 className="size-4 group-hover:text-gray-100 ml-1"/>
                        <p className="text-[14px]  cursor-pointer">My Jobs</p>
                      </ProgressLink>
                      <ProgressLink prefetch href={`/workspace/jobs/${item.organizationName}/create`} className="flex justify-start items-center gap-2 group ">
                        <Plus className="size-5 group-hover:text-gray-100 "/>
                        <p className="text-sm  cursor-pointer">Create</p>
                      </ProgressLink>
                    </div>
                  :null
                }
              </div>)
            }
          </>
          :<div className="w-full flex flex-col gap-4">
            <p className="text-sm text-gray-500">You currently have <br/> no organization :(</p>
            <ProgressLink href={'/profile#create-organization'} className="py-1 text-sm flex justify-center w-[50%] rounded-sm bg-gray-400 text-gray-950 hover:text-black hover:bg-gray-300 cursor-pointer font-bold tracking-wider">
                Create 
            </ProgressLink>
          </div>
        }
      </div>
      <div className="w-full h-auto flex justify-start items-end ">
        <ProgressLink href={'/profile'} className="flex items-center gap-2 cursor-pointer">
          <p className="px-2 py-1 rounded-sm bg-gray-600 text-sm uppercase">{currentUser?.user?.name.slice(0,2)}</p>
          <p className="text-gray-300 lowercase">{currentUser?.user?.name.split(' ')[0]}</p>
        </ProgressLink>
      </div>
    </div>
  )
}

export default RecruitersWorkSpaceMenu
