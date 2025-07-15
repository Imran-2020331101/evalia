'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const CallbackPage = () => {
  const router = useRouter()
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
          router.push('/dashboard') // Change this to your main app route
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#3E3232]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A87C7C]"></div>
        <p className="mt-4 text-[#c5b2b2]">Processing authentication...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#3E3232]">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <p className="text-[#c5b2b2] text-xl">Authentication successful!</p>
        <p className="text-[#c5b2b2] text-sm mt-2">Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#3E3232]">
      <div className="text-red-500 text-6xl mb-4">✗</div>
      <p className="text-[#c5b2b2] text-xl">Authentication failed!</p>
      <button 
        onClick={() => router.push('/auth/login')}
        className="mt-4 px-6 py-2 bg-[#503C3C] text-[#c5b2b2] rounded hover:bg-[#473535]"
      >
        Try Again
      </button>
    </div>
  )
}

export default CallbackPage
