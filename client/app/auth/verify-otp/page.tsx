'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch } from '@/redux/lib/hooks'
import { toggleIsShowAuthRole } from '@/redux/features/utils'

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const message = searchParams.get('message')

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Initialize countdown on component mount
  useEffect(() => {
    setCountdown(60) // 60 seconds countdown
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4) // Only numbers, max 4 digits
    setOtp(value)
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    if (otp.length !== 4) {
      setError('OTP must be 4 digits')
      return
    }

    if (!email) {
      setError('Email not found. Please try registering again.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Email verified successfully! Let's go through some steps...`)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(data.message || 'Invalid OTP. Please try again.')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email not found. Please try registering again.')
      return
    }

    setResendLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('OTP has been resent to your email!')
        setCountdown(60) // Reset countdown
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 z-[150] flex justify-center items-center backdrop-blur-2xl">
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#3E3232] text-white p-6">
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-400">Email not found. Please try registering again.</p>
          </div>
          <Link 
            href="/auth/register" 
            className="text-[#c5b2b2] hover:text-white underline"
          >
            Go back to Registration
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed z-[150] top-0 left-0 right-0 bottom-0 flex justify-center items-center backdrop-blur-2xl">
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950/70 text-white p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-gray-400 text-sm">
            We've sent a 4-digit OTP to:
          </p>
          <p className="text-gray-500 font-medium">{email}</p>
        </div>

        {message && (
          <div className="w-full p-3 bg-green-900/30 border border-green-500 rounded-lg text-green-400 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          {error && (
            <div className="w-full p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="w-full p-3 bg-green-900/30 border border-green-500 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}
          
          <div className="w-full relative">
            <label 
              className='block text-sm font-medium text-gray-300 mb-2' 
              htmlFor="otp"
            >
              Enter 4-digit OTP
            </label>
            <input 
              className='w-full h-12 px-4 text-center text-2xl tracking-widest rounded-lg border border-gray-700 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-gray-600' 
              id='otp' 
              name='otp'
              type="text"
              placeholder="0000"
              value={otp}
              onChange={handleChange}
              disabled={loading}
              maxLength={4}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || success !== ''}
            className='w-full h-12 cursor-pointer bg-slate-800 text-gray-400 hover:bg-slate-900 hover:text-gray-400 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg'
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-400">Didn't receive the OTP?</p>
          
          <button
            onClick={handleResendOTP}
            disabled={countdown > 0 || resendLoading}
            className={`text-sm font-medium transition-colors ${
              countdown > 0 || resendLoading
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-[#c5b2b2] hover:text-white cursor-pointer'
            }`}
          >
            {resendLoading 
              ? 'Resending...' 
              : countdown > 0 
                ? `Resend OTP in ${countdown}s`
                : 'Resend OTP'
            }
          </button>

          <div className="pt-4">
            <Link 
              href="/auth/register" 
              className="text-sm text-gray-400 hover:text-[#c5b2b2] underline"
            >
              Back to Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default VerifyOTPPage
