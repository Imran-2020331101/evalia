'use client'
import { Syncopate } from "next/font/google";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger)

const syncopate = Syncopate({
  weight: ['400', '700'],
  subsets: ['latin'],
});
const InterviewSectionHero = () => {

    useGSAP(()=>{
        gsap.timeline({
            scrollTrigger:{
                trigger:'#interviewHeroGradient',
                scroller:'.scroll-container',
                start:'top 50%',
                end:'top top'
            }
        }).fromTo('#interviewHeroGradient',
            {
                opacity:0,
                yPercent:30,
            },{
                opacity:1,
                duration:1.2,
                yPercent:0,
                ease:'expo.out',
            })
    },[])
  return (
    <div className='w-full min-h-[120vh] relative bg-gray-950/90 flex flex-col justify-center items-center gap-[10px] pt-[150px] shrink-0'>
        
        <div id="interviewHeroGradient" className=" w-[100px] h-[100px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] xl:w-[600px] xl:h-[600px] 2xl:w-[800px] 2xl:h-[800px] absolute bottom-[12%]  rounded-full  bg-[radial-gradient(circle,_#6EACDA,_#00000000,_#00000000,_#00000000)] ">
        </div>
        <div className="w-[200px] h-[200px] md:w-[400px] md:h-[400px] lg:w-[600px] lg:h-[600px] xl:w-[620px] xl:h-[620px] 2xl:w-[800px] 2xl:h-[800px] absolute bottom-[-15%]  rounded-full border-t-[1px] border-gray-800 ">
        </div>
        <p className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl z-30 ${syncopate.className}`}>
        Meet Monke
        </p>
        <p className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl z-30 ${syncopate.className}`}>
        — Your Interviewer Who Speaks Bengali
        </p>
        <p className={`text-sm sm:text-base md:text-lg lg:text-xl z-30 text-neutral-300`}>
        He understands your words, your tone, and your talent
        </p>
        <p className={`text-sm sm:text-base md:text-lg lg:text-xl mt-[-5px] z-30 text-neutral-300`}>
        just like a trusted friend would
        </p>

    </div>
  )
}

export default InterviewSectionHero
