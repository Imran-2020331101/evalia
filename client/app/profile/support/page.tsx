import SupportContainer from '@/components/profile/support/SupportContainer'
import React from 'react'

const SupportPage = () => {
  return (
    <div className='w-full h-full p-[10px]'>
        <div className="w-full h-full  flex justify-center bg-gray-900/40 ">
            <div className="w-[70%] h-full overflow-y-scroll scrollbar-hidden">
                <SupportContainer/>
            </div>
        </div>
    </div>
  )
}

export default SupportPage
