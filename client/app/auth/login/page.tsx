import Image from 'next/image'
import google from '../../../public/google.png'
import Link from 'next/link'

const LoginPage = () => {
  return (
      <>
        <div className="w-full min-[1200px]:h-[35px] min-[1600px]:h-[40px] relative border-[1px] border-[#ac8e8e] rounded-lg">
          <label 
          className='absolute rounded-md top-[-12px] bg-[#3E3232] px-1 cursor-pointer left-3 min-[1200px]:text-[12px] min-[1600px]:text-[14px] font-semibold tracking-wider' htmlFor="email"
          >Email
          </label>
          <input 
          className='w-full h-full px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A87C7C]' id='email' type="text" 
          />
        </div>
        <div className="w-full min-[1200px]:h-[35px] min-[1600px]:h-[40px] relative border-[1px] border-[#ac8e8e] rounded-lg">
          <label 
          className='absolute rounded-md top-[-12px] bg-[#3E3232] px-1 cursor-pointer left-3 min-[1200px]:text-[12px] min-[1600px]:text-[14px] font-semibold tracking-wider' htmlFor="password"
          >Password
          </label>
          <input 
          className='w-full h-full px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A87C7C]' id='password' type="text" 
          />
        </div>
        <div className="w-full h-[30px] flex justify-end items-center">
          <button>
            <p className='text-sm min-[1200px]:text-[12px] min-[1600px]:text-[14px] mt-[-25px] underline cursor-pointer hover:text-[#c5b2b2]'>Forgot password?</p>
          </button>
        </div>
        <button className='w-full min-[1200px]:h-[40px] min-[1600px]:h-[45px] mt-[-20px] cursor-pointer bg-[#503C3C] text-[#c5b2b2] hover:bg-[#473535] hover:text-[#cec8c8] min-[1200px]:text-[14px] min-[1600px]:text-[16px] font-semibold'>
          Sing in
        </button>
        <div className="w-full h-[30px] flex justify-center items-center gap-[5px]">
          <div className="w-[35%] h-[1px] bg-[#ac8e8e]"></div>
          <p className='text-sm min-[1200px]:text-[14px] min-[1600px]:text-[16px]'>Or</p>
          <div className="w-[35%] h-[1px] bg-[#ac8e8e]"></div>
        </div>
        <div className="w-full h-[40px]  flex justify-center items-center mt-[-10px]">
          <button className='flex justify-center items-center gap-[10px] cursor-pointer'>
            <Image src={google} width={34} height={34} alt='google icon' className='w-[20px] h-[20px] object-cover'/>
            <p className='hover:underline min-[1200px]:text-[14px] min-[1600px]:text-[16px]'>Sign in with Google</p>
          </button>
        </div>
        <div className="w-full h-[30px] flex text-sm mt-[-20px] justify-center items-center">
          <p className='text-xs min-[1200px]:text-[12px] min-[1600px]:text-[14px]'>Don't have any account?</p>
          <Link href={'/auth/register'} className='underline cursor-pointer text-[#c5b2b2] min-[1200px]:text-[14px] min-[1600px]:text-[16px]'>{' Create a new one :)'}</Link>
        </div>
     </>
  )
}

export default LoginPage
