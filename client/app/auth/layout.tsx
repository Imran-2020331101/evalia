'use client'

import ImageSlider from '@/components/auth/ImageSlider';
import RequirementContainer from '@/components/auth/requirements/RequirementContainer';
import { translateX } from '@/redux/features/utils';
import { useAppSelector } from '@/redux/lib/hooks';
import { Major_Mono_Display } from 'next/font/google';
import { useState } from 'react';

const majorMono = Major_Mono_Display({weight:"400", subsets:["latin"]})

const AuthLayout = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
  
  const translate = useAppSelector(translateX)
  const [userType, setUserType] = useState<'recruiter' | 'candidate' | null>(null)

  return (
    <div className='fixed top-0 left-0 right-0 bottom-0 z-[130] bg-gray-900 '>
      <div className="w-full h-full flex justify-center gap-[2%] items-center bg-gray-950/60">
        <div className="w-[78%] h-full pr-[10%] pl-[15%] py-[5%] ">
            <div className='w-full h-full gap-[20px] flex  '>
             
              <div className="w-[58%] h-full">
                <ImageSlider/>
              </div>
              <div className="w-[42%] h-full  flex overflow-hidden border-t-[1px] border-b-[1px] border-r-[1px] border-gray-700">
                <div style={{transform:`translateX(${translate}%)`}} className=" transition-transform duration-500 shrink-0 w-full h-full text-gray-400 flex justify-center items-center p-[10px]  rounded-r-lg">
                  <div className="w-full h-full bg-gray-900/80 rounded-2xl px-[25px] py-[20px] flex flex-col justify-center items-center gap-[25px]">
                      <p className={` ${majorMono.className}  font-semibold  text-white text-4xl`}>EVALIA</p>
                      {children}
                  </div>
                </div>
                  <RequirementContainer  translate={translate}  userType={userType} setUserType={setUserType} />
              </div>
            </div>
        </div>
        <div className="w-[20%] h-full bg-[#222831]">
            <div className="w-full h-full flex justify-center items-center">
            <div className="relative w-full h-full">
            <video
                className=" absolute top-0 left-0 w-full h-full object-cover object-right"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={'https://cdn.pixabay.com/video/2024/07/27/223442_large.mp4'} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
