'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch } from '@/redux/lib/hooks'
import { toggleIsShowAuthRole } from '@/redux/features/utils'

const CallbackPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      try {
        // Store the JWT token (you can use localStorage, sessionStorage, or cookies)
        localStorage.setItem('authToken', token)
        
        // You can also decode the token to get user info if needed
        // const payload = JSON.parse(atob(token.split('.')[1]))
        
        setStatus('success')
        
        // Redirect to dashboard or main app after successful authentication
        setTimeout(() => {
          dispatch(toggleIsShowAuthRole())
          router.push('/auth/login')
          // router.push('/dashboard') // Change this to your main app route
        }, 2000)
        
      } catch (error) {
        console.error('Error processing authentication:', error)
        setStatus('error')
      }
    } else {
      console.error('No token received from OAuth2 provider')
      setStatus('error')
    }
  }, [searchParams, router])

  if (status === 'loading') {
    return (
      <div className="fixed z-[150] top-0 bottom-0 left-0 right-0 flex justify-center items-center backdrop-blur-2xl">
        <div className=" w-full h-full flex flex-col items-center justify-center min-h-screen bg-gray-950/70">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
          <p className="mt-4 text-gray-400">Processing authentication...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="fixed z-[150] top-0 bottom-0 left-0 right-0 flex justify-center items-center backdrop-blur-2xl">
        <div className="w-full h-full flex flex-col items-center justify-center min-h-screen bg-gray-950/70">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <p className="text-gray-400 text-xl">Authentication successful!</p>
          <p className="text-gray-400 text-sm mt-2">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed z-[150] top-0 bottom-0 left-0 right-0 flex justify-center items-center backdrop-blur-2xl">
      <div className="w-full h-full flex flex-col items-center justify-center min-h-screen bg-gray-950/70">
        <div className="text-red-500 text-6xl mb-4">✗</div>
        <p className="text-gray-400 text-xl">Authentication failed!</p>
        <button 
          onClick={() => router.push('/auth/login')}
          className="mt-4 px-6 py-2 bg-gray-950/70 text-gray-400 rounded hover:bg-slate-900/80"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export default CallbackPage
