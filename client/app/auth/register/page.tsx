'use client'

import { useState } from 'react'
import GoogleAuth from '@/components/auth/GoogleAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Registration successful - redirect to OTP verification
        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}&message=Registration successful! Please check your email for the OTP.`)
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 w-[80%] text-gray-300 ">
        {error && (
          <div className="w-full p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="w-full min-[1200px]:h-[35px] min-[1600px]:h-[40px] relative border-[1px] border-gray-700 rounded-lg">
          <label 
            className='absolute rounded-md top-[-12px] bg-slate-900 px-1 cursor-pointer left-3 min-[1200px]:text-[12px] min-[1600px]:text-[14px] font-semibold tracking-wider' 
            htmlFor="name"
          >
            Name
          </label>
          <input 
            className='w-full h-full px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-transparent text-white' 
            id='name' 
            name='name'
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="w-full min-[1200px]:h-[35px] min-[1600px]:h-[40px] relative border-[1px] border-gray-700 rounded-lg">
          <label 
            className='absolute rounded-md top-[-12px] bg-gray-900 px-1 cursor-pointer left-3 min-[1200px]:text-[12px] min-[1600px]:text-[14px] font-semibold tracking-wider' 
            htmlFor="email"
          >
            Email
          </label>
          <input 
            className='w-full h-full px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-transparent text-white' 
            id='email' 
            name='email'
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="w-full min-[1200px]:h-[35px] min-[1600px]:h-[40px] relative border-[1px] border-gray-700 rounded-lg">
          <label 
            className='absolute rounded-md top-[-12px] bg-gray-900 px-1 cursor-pointer left-3 min-[1200px]:text-[12px] min-[1600px]:text-[14px] font-semibold tracking-wider' 
            htmlFor="password"
          >
            Password
          </label>
          <input 
            className='w-full h-full px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 bg-transparent text-white' 
            id='password' 
            name='password'
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className='w-full min-[1200px]:h-[40px] min-[1600px]:h-[45px] cursor-pointer bg-gray-800  hover:bg-gray-700 hover:text-[#cec8c8] min-[1200px]:text-[14px] min-[1600px]:text-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <div className="w-full h-[30px] flex justify-center items-center gap-[5px]">
        <div className="w-[35%] h-[1px] bg-gray-700"></div>
        <p className='text-sm min-[1200px]:text-[14px] min-[1600px]:text-[16px]'>Or</p>
        <div className="w-[35%] h-[1px] bg-gray-700"></div>
      </div>

      <div className="w-full h-[40px] flex justify-center items-center mt-[-10px]">
        <GoogleAuth/>
      </div>

      <div className="w-full h-[30px] flex text-sm mt-[-20px] justify-center items-center">
        <p className='text-xs min-[1200px]:text-[12px] min-[1600px]:text-[14px]'>Already have an account?</p>
        <Link href={'/auth/login'} className='underline cursor-pointer text-gray-50 min-[1200px]:text-[14px] min-[1600px]:text-[16px]'>{' Sign in :)'}</Link>
      </div>
    </>
  )
}

export default RegisterPage
