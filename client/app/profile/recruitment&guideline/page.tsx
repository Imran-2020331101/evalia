import RecruitmentAndGuidelineContainer from '@/components/profile/recruitment&guideline/RecruitmentAndGuidelineContainer'
const RecruitmentAndGuidelinePage = () => {
  return (
    <div className='w-full h-full p-[10px]'>
        <div className="w-full h-full  flex justify-center bg-gray-900/40 ">
            <div className="w-[70%] h-full overflow-y-scroll scrollbar-hidden">
                <RecruitmentAndGuidelineContainer/>
            </div>
        </div>
    </div>
  )
}

export default RecruitmentAndGuidelinePage
