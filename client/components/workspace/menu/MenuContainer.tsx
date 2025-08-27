'use client'
import RecruitersWorkSpaceMenu from "./RecruitersWorkSpaceMenu"
import CandidatesWorkSpaceMenu from "./CandidatesWorkSpaceMenu"
import { useAppSelector } from "@/redux/lib/hooks"
import { user } from "@/redux/features/auth"

const MenuContainer = () => {
    const currentUser = useAppSelector(user)
    if(!currentUser) return null
  return (
    <section className="h-full w-[240px]">
        {
            currentUser?.user?.roles[0]==='RECRUITER'?<RecruitersWorkSpaceMenu/>:<CandidatesWorkSpaceMenu />
        }
    </section>
  )
}

export default MenuContainer
