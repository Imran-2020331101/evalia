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

const CourseSectionHero = () => {
  useGSAP(()=>{
    gsap.timeline({
      scrollTrigger:{
        trigger:'#courseHeroGradient',
        scroller:'.scroll-container',
        start:'top center',
        end:'top top'
      }
    }).fromTo('#courseHeroGradient',{opacity:0},{opacity:1, duration:1.4})
  },[])
  return (
    <div className='w-full min-h-[80vh] flex flex-col relative shrink-0'>
      <div className="absolute left-0 right-0 top-0 h-[70%] bg-gradient-to-t from-gray-950 via-gray-800 to-slate-600/90 rounded-b-3xl rounded-t-4xl"></div>
      <div className="absolute left-0 right-0 bottom-0 h-[30%] bg-gray-950/90"></div>
      <section className='absolute z-10 w-full h-full flex justify-center items-center '>
        <div className="w-auto px-5 h-[60%] relative rounded-tr-4xl rounded-bl-4xl flex flex-col gap-[10px] items-center justify-center">
          <div id="courseHeroGradient" className="absolute w-[400px] h-[400px]  left-[35%] bottom-[-10%] rounded-full bg-gradient-to-tr from-indigo-600/20  via-gray-950/10 to-gray-950/5"></div>
          <p className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl z-30 ${syncopate.className}`}>
            Learn What Matters
            </p>
            <p className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl z-30 ${syncopate.className}`}>
            — Straight from Your Own Interests
            </p>
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl z-30 text-neutral-300`}>
            Every mistake is a roadmap. 
            </p>
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl mt-[-10px] z-30 text-neutral-300`}>
            Let’s follow it.
            </p>
        </div>
      </section>
    </div>
  )
}

export default CourseSectionHero
