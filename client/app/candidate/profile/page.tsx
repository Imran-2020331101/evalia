'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

export default function CandidateProfileIndexPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard since this page requires a userId parameter
    console.log('🔄 [REDIRECT] No userId provided, redirecting to dashboard')
    router.push('/recruiter/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Missing User ID</h2>
        <p className="text-gray-400 mb-4">
          A candidate ID is required to view this profile. Redirecting to dashboard...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
      </div>
    </div>
  )
}
