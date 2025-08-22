import DynamicBreadcrumbs from "@/components/ui/dynamicBreadCrumb";
import Link from "next/link";
import { Major_Mono_Display } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import ProfileSideBar from "@/components/profile/ProfileSideBar";

const majorMono = Major_Mono_Display({ weight: '400', subsets: ['latin'] });

const ProfileLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 h-screen">
      <div className="flex w-full h-full bg-gray-950/90 min-h-0 gap-[10px]">
        {/* Sidebar */}
        <section className="h-full w-[200px] relative">
          {/* <CandidatesWorkSpaceMenu /> */}
          <div className="w-full h-full py-[70px] px-[10px] pl-[20px]">
            <ProfileSideBar/>
          </div>
          <div className="absolute top-3 left-3">
             <Link href={'/'} className={`${majorMono.className} text-2xl text-gray-200`}>EVALIA</Link>
          </div>
          <div className="absolute bottom-4  left-2 right-2 px-2 border border-gray-500 py-1 flex items-center gap-1 justify-center rounded-sm group">
             <Link href={'/workspace'} className={` text-lg text-gray-400 font-bold `}>Workspace</Link>
             <ArrowUpRight size={25} className="text-gray-400 group-hover:animate-pulse"/>
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
