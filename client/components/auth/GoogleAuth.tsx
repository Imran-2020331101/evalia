'use client'
import Image from "next/image"
import google from '../../public/google.png'

const GoogleSignUp = () => {

  const handleGoogleSignUp = async()=>{
    
    }
  return (
    <button onClick={handleGoogleSignUp} className='flex justify-center items-center gap-[10px] cursor-pointer'>
        <Image src={google} width={34} height={34} alt='google icon' className='w-[20px] h-[20px] object-cover'/>
        <p className='hover:underline min-[1200px]:text-[14px] min-[1600px]:text-[16px]'>Sign up with Google</p>
    </button>
  )
}

export default GoogleSignUp
