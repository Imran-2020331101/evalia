import React from 'react'
import ImageSlider from '@/components/auth/ImageSlider';
import { Major_Mono_Display } from 'next/font/google';

const majorMono = Major_Mono_Display({weight:"400", subsets:["latin"]})


const AuthLayout = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
    <div className='w-full h-full flex justify-center gap-[2%] items-center bg-gray-950/90 '>
        <div className="w-[78%] h-full pr-[10%] pl-[15%] py-[5%]">
            <div className='w-full h-full gap-[20px] flex '>
              <div className="w-[58%] h-full">
                <ImageSlider/>
                {/* <Image width={600} height={800} src={'https://i.pinimg.com/736x/28/3b/45/283b45f465ff4f511a927ea5a9d0779f.jpg'} alt='' className='w-full h-full object-cover'/> */}
              </div>
              <div className="w-[42%] h-full">
                <div className="w-full h-full text-[#a79393] flex justify-center items-center p-[10px] border-t-[1px] border-b-[1px] border-r-[1px] border-[#ac8e8e] rounded-r-lg">
                  <div className="w-full h-full bg-[#352121]/30 rounded-2xl px-[25px] py-[20px] flex flex-col justify-center items-center gap-[25px]">
                      <p className={` ${majorMono.className}  font-semibold  text-4xl`}>EVALIA</p>
                      {children}
                  </div>
                </div>
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
                <source src={'https://videos.pexels.com/video-files/4622990/4622990-uhd_1440_2560_30fps.mp4'} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            </div>
            </div>
        </div>
    </div>
  )
}

export default AuthLayout
