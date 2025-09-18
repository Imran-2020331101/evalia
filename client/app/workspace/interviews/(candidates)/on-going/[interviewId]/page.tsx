'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import ConsentPage from '@/components/workspace/candidates/interviews/on-going/ConsentModal'
import { Didact_Gothic } from 'next/font/google'
import InterviewAgent from '@/components/workspace/candidates/interviews/on-going/InterviewAgent'
import {ScaleLoader} from 'react-spinners'
import { Gauge } from '@mui/x-charts/Gauge';
import { PhoneOff } from 'lucide-react'

const didact_gothic = Didact_Gothic({ weight: ['400'], subsets: ['latin'] })

const InterviewOngoingPage = () => {
    const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
    const [isStarted , setIsStarted] = useState<boolean>(true)
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [overallPerf, setOverallPerf] =useState<number>(1);
    const [vapi, setVapi] = useState<any>(null);


  return (
    <div className="w-full h-full flex gap-[10px]">
      <section className="h-full flex-6/8 relative rounded-2xl">
        {isStarted ? <ConsentPage setIsStarted={setIsStarted} /> : <InterviewAgent vapi={vapi} setVapi={setVapi} setOverallPerformance={setOverallPerf}  setIsSpeaking={setIsSpeaking} transcript={transcript} setTranscript={setTranscript}/>}
        {/* <MediaHandler/> */}
        
        <div className="absolute w-full h-full flex flex-col p-[10px] pb-2 justify-end">
          <div className="h-auto w-full flex justify-center items-center gap-6">
            <section className="w-[120px] h-[100px] backdrop-blur-xl rounded-lg flex flex-col items-center justify-center relative group">
              <div className="absolute group-hover:block hidden z-20 text-[12px] top-[105%] bg-slate-800 rounded-lg px-4 py-1  left-[70%] text-center">Confidence Level</div>
              <div className="w-[70px] h-[70px]">
                <Gauge
                  value={Math.floor(overallPerf)}
                  startAngle={0}
                  endAngle={360}
                  innerRadius="80%"
                  outerRadius="100%"
                />
              </div>
            </section>
            <section className=" w-[120px] h-[100px]  backdrop-blur-xl z-10  self-end flex justify-center items-center rounded-lg group">
              <div className=" w-[70px] h-[70px] rounded-full bg-gray-900 relative">
                <Image src={'https://i.pinimg.com/1200x/3a/52/9c/3a529c22f55e722ddb70bc072b9d9524.jpg'} width={80} height={80} alt='' className='w-full h-full object-cover rounded-full'/>
                <div className="flex justify-center items-center w-full h-full absolute top-0 left-0">
                  <div className="absolute group-hover:block hidden z-20 text-[12px] top-[130%] bg-slate-800 rounded-lg px-4 py-1  left-[70%] text-center">Monkey  <br/> Interviewer</div>
                  {isSpeaking&& <ScaleLoader  color='white' barCount={5} height={25}/>}
                </div>
              </div>
            </section>
            <section className=" w-[120px] h-[100px]  backdrop-blur-xl z-10  self-end flex justify-center items-center rounded-lg group">
              <button onClick={()=>vapi?.stop()} className=" flex justify-center items-center cursor-pointer w-[70px] h-[70px] rounded-full bg-gray-900 relative">
                <PhoneOff  className='text-red-500 size-5'/>
              </button>
            </section>
          </div>
        </div>
      </section>

      <section className="h-full flex-2/8  relative flex flex-col justify-between">
        <div className="w-full h-[30%] bg-gradient-to-bl from-indigo-600/20 via-gray-950/10 to-gray-950/5 rounded-t-2xl"></div>
        <div className="w-full h-[30%] bg-gradient-to-tr from-indigo-600/20 via-gray-950/10 to-gray-950/5 rounded-b-2xl"></div>

        <div className="w-full h-full absolute  border-[1px] border-gray-700 shadow-gray-900 shadow-lg rounded-2xl">
          <div className="w-full h-full relative">
            <div className="absolute top-0 left-0 w-full h-[50px]  rounded-t-2xl backdrop-blur-2xl flex justify-center items-center">
              <p className='text-[13px] font-semibold tracking-widest scale-125'>Live Transcript</p>
            </div>
            <div className={`${didact_gothic.className} tracking-wider w-full h-full flex flex-col justify-start gap-3 overflow-y-scroll scrollbar-hidden pt-[60px] p-[10px]`}>
              {transcript.map((item, index) => (
                <p key={index} className={`w-[80%] h-auto p-[10px] rounded-2xl ${item.role === 'user' ? 'bg-indigo-900/90 self-end' : 'bg-gray-900/90 self-start'} text-xs`}>
                  {item.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default InterviewOngoingPage
