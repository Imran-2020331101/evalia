'use client'

import Image from 'next/image'
import google from '../../../public/google.png'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })
   
      const data = await response.json();

      if (response.ok && data.success) {
        console.log(data, 'user data')
        router.push('/workspace')
      } else {
        setError(data.message || 'Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <form onSubmit={handleSubmit} className='space-y-6'>
        {error && (
          <div className="w-full p-3 mb-4 text-red-400 bg-red-900/20 border border-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="w-full min-[1200px]:h-[35px] min-[1600px]:h-[40px] relative border-[1px] border-gray-700 rounded-lg">
          <label 
          className='absolute rounded-md top-[-12px] bg-gray-900 px-1 cursor-pointer left-3 min-[1200px]:text-[12px] min-[1600px]:text-[14px] font-semibold tracking-wider' htmlFor="email"
          >Email
          </label>
          <input 
          className='w-full h-full px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600' 
          id='email' 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          />
        </div>
        <div className="w-full min-[1200px]:h-[35px] min-[1600px]:h-[40px] relative border-[1px] border-gray-700 rounded-lg">
          <label 
          className='absolute rounded-md top-[-12px] bg-gray-900 px-1 cursor-pointer left-3 min-[1200px]:text-[12px] min-[1600px]:text-[14px] font-semibold tracking-wider' htmlFor="password"
          >Password
          </label>
          <input 
          className='w-full h-full px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600' 
          id='password' 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          />
        </div>
        <div className="w-full h-[30px] flex justify-end items-center">
          <button type="button">
            <p className='text-sm min-[1200px]:text-[12px] min-[1600px]:text-[14px] mt-[-25px] underline cursor-pointer hover:text-gray-50'>Forgot password?</p>
          </button>
        </div>
        <button 
          type="submit"
          className='w-full min-[1200px]:h-[40px] min-[1600px]:h-[45px] mt-[-20px] cursor-pointer bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-[#cec8c8] min-[1200px]:text-[14px] min-[1600px]:text-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isLoading}
          >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        <div className="w-full h-[30px] flex justify-center items-center gap-[5px]">
          <div className="w-[35%] h-[1px] bg-gray-700"></div>
          <p className='text-sm min-[1200px]:text-[14px] min-[1600px]:text-[16px]'>Or</p>
          <div className="w-[35%] h-[1px] bg-gray-700"></div>
        </div>
        <div className="w-full h-[40px]  flex justify-center items-center mt-[-10px]">
          <button type="button" className='flex justify-center items-center gap-[10px] cursor-pointer'>
            <Image src={google} width={34} height={34} alt='google icon' className='w-[20px] h-[20px] object-cover'/>
            <a href='http://localhost:8080/oauth2/authorization/google' className='hover:underline min-[1200px]:text-[14px] min-[1600px]:text-[16px]'>
                Sign in with Google
            </a>
          </button>
        </div>
        <div>
            <a 
              href='http://localhost:8080/oauth2/authorization/github'
              className='hover:underline min-[1200px]:text-[14px] min-[1600px]:text-[16px]'
            >
              Sign in with Github
            </a>
        </div>
        <div className="w-full h-[30px] flex text-sm mt-[-20px] justify-center items-center">
          <p className='text-xs min-[1200px]:text-[12px] min-[1600px]:text-[14px]'>Don't have any account?</p>
          <Link prefetch href={'/auth/register'} className='underline cursor-pointer text-gray-200 min-[1200px]:text-[14px] min-[1600px]:text-[16px]'>
            {' Create a new one :)'}
          </Link>
        </div>
      </form>
  )
}

export default LoginPage
