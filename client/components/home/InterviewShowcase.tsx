'use client'

import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/all"
import CourseSection from "./CourseSection"
import { useRef, useState } from "react"
import Image from "next/image"
import play from '../../public/play.png'
import pause from '../../public/pause.png'

gsap.registerPlugin(ScrollTrigger)

const InterviewShowcase = () => {

  const videoRef = useRef<HTMLVideoElement>(null)
  const  [isPlay, setIsPlay] = useState(false);

  const handleTogglePlay = ()=>{
    
      if(isPlay){
        setIsPlay(false)
        videoRef.current?.pause()
      }else{
        setIsPlay(true)
        videoRef.current?.play()
      }
  }

  useGSAP(() => {
    gsap.timeline({
      scrollTrigger:{
        trigger:'#video-wrapper',
        start:'top 80%',
        end :'bottom top',
        scroller: '.scroll-container',
        toggleActions: 'play reverse play reverse',
        // markers:true,
        // scrub:true,
      }
    }).fromTo('#video-wrapper',{
      opacity:0,
      scaleY:1,
      scaleX:0.2,
      yPercent:20,
    },{
      yPercent:0,
      opacity:1,
      scaleX:1,
      duration:2.2,
      ease:'power3.out'
    })
  }, []);
  return (
    <div className="w-full min-h-screen bg-gray-950/90 relative flex flex-col rounded-b-3xl shrink-0">
      <div className="absolute left-0 right-0 top-0 h-[30%]"></div>
      <div className="absolute left-0 right-0 bottom-0 h-[70%] bg-gradient-to-b from-gray-950 via-gray-800 to-slate-600/90 rounded-b-3xl"></div>
      <section  id="video-container" className="absolute top-0 left-0 right-0 bottom-0 z-10 flex justify-center items-start ">
        <div id="video-wrapper" className=" w-[85%] h-[80%] rounded-4xl bg-gray-900">
          <div className="relative w-full group h-full rounded-4xl">
            <video
              className=" absolute top-0 left-0 w-full h-full object-cover rounded-4xl"
              ref={videoRef}
              loop
              muted
              playsInline
              controls={false}
            >
              <source src={'https://www.pexels.com/download/video/9783698/'} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className={` ${isPlay?'hidden':'flex'} group-hover:flex absolute top-0 left-0 right-0 w-full h-full rounded-4xl bg-gray-950/30  items-center`}>
              <div className=" w-full h-full flex flex-col justify-center items-center">
                <button
                  onClick={handleTogglePlay}
                  className=" px-4 py-2  rounded-lg "
                >
                  {!isPlay ?
                   <Image className="w-[100px] cursor-pointer h-auto" alt={'Pause ⏸'} src={play}/>  
                   : 
                   <Image className="w-[100px] cursor-pointer h-auto" alt={'Play ▶️'} src={pause}/>
                   }
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default InterviewShowcase
