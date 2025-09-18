'use client'

import DynamicBreadcrumbs from "@/components/ui/dynamicBreadCrumb";
import { Major_Mono_Display } from "next/font/google";
import { ArrowUpRight, LogOut, User } from "lucide-react";
import ProfileSideBar from "@/components/profile/ProfileSideBar";
import { useAppSelector } from "@/redux/lib/hooks";
import { user } from "@/redux/features/auth";
import ProgressLink from "@/components/utils/ProgressLink";
import { useProgressRouter } from "@/custom-hooks/useProgressRouter";

const majorMono = Major_Mono_Display({ weight: '400', subsets: ['latin'] });

const ProfileLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {

  const router = useProgressRouter()

  const currentUser = useAppSelector(user)

  const handleLogout = async()=>{
    await fetch('/api/auth/logout', { method: 'POST' });
    console.log('logged out')
    router.push('/auth/login')
    
  }

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 h-screen">
      <div className="flex w-full h-full bg-gray-950/90 min-h-0 gap-[10px]">
        {/* Sidebar */}
        <section className="h-full w-[200px] relative">
          {/* <CandidatesWorkSpaceMenu /> */}
          <div className="w-full h-full py-[70px] px-[10px] pl-[20px]">
            <ProfileSideBar/>
          </div>
          <div className="absolute top-3 left-3 right-0 flex justify-between items-center">
             <ProgressLink href={'/'} className={`${majorMono.className} text-2xl text-gray-200`}>EVALIA</ProgressLink>
             {
              currentUser?
              <button onClick={handleLogout} className="relative group cursor-pointer ">
                <div className="group-hover:flex hidden top-[110%] left-[60%] absolute bg-gray-800 px-3 py-1 text-gray-200 text-xs font-bold rounded-sm">
                  Logout
                </div>
                <LogOut className="size-5"/>
             </button>
              :
               null
             }
          </div>
          <div className="absolute bottom-4  left-2 right-2 ">
             <div className="w-full h-auto  px-2 border border-gray-500 py-1 flex items-center gap-1 justify-center rounded-sm group">
              <ProgressLink href={'/workspace'} className={` text-lg text-gray-400 font-bold `}>Workspace</ProgressLink>
              <ArrowUpRight size={25} className="text-gray-400 group-hover:animate-pulse"/>
             </div>
          </div>
        </section>

        {/* Main content */}
        <section className="flex-1 h-full mr-[20px] py-[15px]  bg-gray-950/90  min-h-0">
          <div className="h-full w-full flex flex-col border border-gray-800">
            {/* Breadcrumb Header */}
            <div className="h-[40px] shrink-0 border-b  border-gray-800  flex justify-center items-center">
              <DynamicBreadcrumbs />
            </div>

            {/* Scrollable Content with padding */}
            <div className="flex-1 overflow-hidden">
              <div className="w-full h-full overflow-y-auto rounded-md">
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileLayout;
