import React from 'react'

const HamburgerMenu = () => {
  return (
    <div className='fixed z-[60] top-[100px] bottom-0 left-0 right-0  px-[50px] pb-[50px]'>
      <div className="w-full h-full relative bg-white/10 rounded-b-4xl rounded-tl-4xl">
        <div className="absolute top-[-68px] rounded-t-2xl right-0 w-[100px] h-[70px] bg-white/5">
            <div className="w-full h-full rounded-t-2xl backdrop-blur-2xl"></div>
        </div>
        <div className="w-full h-full backdrop-blur-2xl rounded-b-4xl rounded-tl-4xl"></div>
      </div>
    </div>
  )
}

export default HamburgerMenu
