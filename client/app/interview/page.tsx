'use client'

import React, { useEffect, useState } from 'react'
import ConsentPage from '@/components/interview/ConsentModal'
import { Didact_Gothic } from 'next/font/google'
import MediaHandler from '@/components/interview/MediaHandler'
import InterviewAgent from '@/components/interview/InterviewAgent'


const didact_gothic = Didact_Gothic({ weight: ['400'], subsets: ['latin'] })

const InterviewPage = () => {
    const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([{role:'user',text:'user text'}, {role:'assistant', text:'assistant text'}]);
    const [isStarted , setIsStarted] = useState<boolean>(true)

  return (
    <div className="w-full h-full flex border-[1px] border-gray-900 shadow-gray-900 shadow-lg">
      <section className="h-full flex-6/8 relative">
        {isStarted ? <ConsentPage setIsStarted={setIsStarted} /> : <InterviewAgent setTranscript={setTranscript}/>}
        {/* <MediaHandler/> */}
        
        <div className="absolute w-full h-full flex p-[20px] justify-end">
          <div className="self-end w-[100px] h-[100px] rounded-full bg-teal-600 z-10"></div>
        </div>
      </section>

      <section className="h-full flex-2/8 border-l-[1px] border-gray-800 relative flex flex-col justify-between">
        <div className="w-full h-[30%] bg-gradient-to-bl from-indigo-600/20 via-gray-950/10 to-gray-950/5"></div>
        <div className="w-full h-[30%] bg-gradient-to-tr from-indigo-600/20 via-gray-950/10 to-gray-950/5"></div>

        <div className="w-full h-full absolute p-[10px]">
          <div className={`${didact_gothic.className} tracking-wider w-full h-full flex flex-col justify-start gap-3 overflow-y-scroll scrollbar-hidden`}>
            {transcript.map((item, index) => (
              <p key={index} className={`w-[80%] h-auto p-[10px] rounded-2xl ${item.role === 'user' ? 'bg-indigo-900/90 self-end' : 'bg-gray-900/90 self-start'} text-xs`}>
                {item.text}
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default InterviewPage
