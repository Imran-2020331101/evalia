'use client'
import RecruitersWorkSpaceMenu from "./RecruitersWorkSpaceMenu"
import CandidatesWorkSpaceMenu from "./CandidatesWorkSpaceMenu"
import { useAppSelector } from "@/redux/lib/hooks"
import { user } from "@/redux/features/auth"

const MenuContainer = () => {
    const currentUser = useAppSelector(user)
  return (
    <section className="h-full w-[240px]">
        {
            currentUser?.user?.roles[0]==='RECRUITER'?<RecruitersWorkSpaceMenu/>:currentUser?.user?.roles[0]==='USER'?<CandidatesWorkSpaceMenu />:null
        }
    </section>
  )
}

export default MenuContainer
