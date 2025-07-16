import MediaHandler from '@/components/interview/MediaHandler'
import React from 'react'

const interviewPage = () => {
  return (
    <div className='w-full h-full flex border-[1px] border-[#A87C7C]'>
      <div className="h-full flex-6/8 bg-[#3B3030]">
        <MediaHandler/>
      </div>
      <div className="h-full flex-2/8  bg-gradient-to-br from-[#3E3232] via-[#503C3C] to-[#7E6363]"></div>
    </div>
  )
}

export default interviewPage
