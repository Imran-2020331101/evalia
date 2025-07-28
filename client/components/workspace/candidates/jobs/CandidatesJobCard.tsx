import Image from 'next/image'

import elipseLogo from '../../../../public/elipse.svg'
import viewLogo from '../../../../public/eye.svg'
import applyLogo from '../../../../public/paper-plane.svg'

const CandidatesJobCard = () => {
  return (
    <div className='w-[500px] h-[200px] hover:shadow-md shadow-gray-700 bg-gray-900 border-[1px] border-gray-700 flex flex-col rounded-lg pl-6 relative group'>
      <div className="w-full h-[40%] flex justify-start items-end gap-[15px]">
        <div className="w-[50px] h-[50px] rounded-full bg-gray-800">
          <Image src={'https://i.pinimg.com/1200x/8d/a6/53/8da653249e1c53772bb3be9b8729c90d.jpg'} width={100} height={100} alt='img' className='w-full h-full rounded-full object-cover' />
        </div>
        <div className="flex flex-col h-full w-auto justify-end items-start gap-1">
          <p className='text-[14px] text-gray-200'>Company name</p>
          <p className='text-[12px] text-gray-300'>location</p>
        </div>
      </div>
      <div className="w-full h-[40%] flex flex-col justify-center items-start gap-1">
        <p className='text-[14px] text-gray-200 w-[70%] h-[20px] overflow-hidden'>Job title here Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique, est.
           Placeat quisquam consectetur, eos a nobis consequatur eligendi veritatis cupiditate voluptatum voluptate ut esse reprehenderit, doloribus voluptas, eveniet voluptatibus quibusdam!</p>
        <p className='text-[12px] text-gray-300 w-[90%] h-[34px] overflow-hidden'>Job description here Lorem ipsum dolor sit amet consectetur adipisicing elit.
           Dicta, cupiditate accusamus facilis dolorem culpa, inventore maiores sit fugiat voluptates ad dolor eveniet praesentium! Impedit saepe, magni nobis velit sequi dolores?</p>
      </div>
      <div className="w-full h-[20%] text-[12px] text-gray-300 pb-3 flex justify-start items-end">
        <p>10 days ago...</p>
      </div>
      <div className="absolute w-full h-full top-0 left-0 right-0 bottom-0 rounded-lg bg-gradient-to-tr  hidden group-hover:flex justify-end items-start ">
          <div className="flex w-auto h-[30px] items-center justify-center gap-2 mr-2">
            <div className=' relative group/nested'>
              <Image src={elipseLogo} alt='elipse' className='w-[25px]' />
              <div className="absolute top-[100%] right-[20%] w-[100px] h-[70px] bg-gray-600 rounded-b-lg rounded-tl-lg text-gray-100 font-bold z-10 group-hover/nested:flex flex-col hidden">
                <button className="w-full h-[35px] cursor-pointer gap-2 hover:text-white border-b-[1px] border-gray-900 flex justify-center items-center hover:tracking-widest transition-transform duration-500">
                  <Image src={viewLogo} alt='view' className='w-[14px]'/>
                  <p className='text-[10px] '>View</p>
                </button>
                <button className="w-full h-[35px] gap-2 cursor-pointer hover:text-white flex justify-center items-center hover:tracking-widest transition-transform duration-500">
                  <Image src={applyLogo} alt='apply' className='w-[14px]'/>
                  <p className='text-[10px] '>Apply</p>
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

export default CandidatesJobCard
