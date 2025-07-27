'use client'
import React from 'react'
import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

type ConsentPageProps = {
  setIsStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ConsentPage({setIsStarted}:ConsentPageProps) {
  const [consentGiven, setConsentGiven] = useState<null|Boolean>(null)

    const handleAccept = ()=>{
        setIsStarted(false)
    }
    const handleDecline = ()=>{
        
    }
  return (
    <div className="fixed z-[80] top-0 left-0 right-0 bottom-0 backdrop-blur-2xl flex justify-center items-center">
        <div className=" w-[50%] h-[80%] p-6 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        <h1 className="text-2xl font-bold mb-4">Consent Required</h1>
        <p className="text-sm text-slate-200 mb-4">
          Welcome to <span className="text-blue-300 font-semibold">DemoCorp</span>. We collect limited user data such as name, email, and interaction behavior
          to enhance your experience. Please review and accept our data usage policy.
        </p>
        <ul className="list-disc list-inside text-sm mb-4 space-y-1 text-slate-300">
          <li>Data used for personalization</li>
          <li>Stored securely with encryption</li>
          <li>No third-party sharing</li>
        </ul>

        <div className="flex justify-between gap-4 mt-6">
          <button
            className="w-full px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
            onClick={handleAccept}
          >
            Accept
          </button>
          <button
            className="w-full px-4 py-2 rounded-md border border-red-500 text-red-300 hover:bg-red-800/20"
            onClick={handleDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )

  if (consentGiven !== null) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md text-center">
          {consentGiven ? (
            <>
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <h2 className="text-xl font-semibold">Thank you!</h2>
              <p className="text-sm mt-1">You’ve accepted our data usage policy.</p>
            </>
          ) : (
            <>
              <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <h2 className="text-xl font-semibold">Consent Declined</h2>
              <p className="text-sm mt-1">Some features may be limited.</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-slate-900 text-white px-4">
      <div className="max-w-md w-full p-6 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        <h1 className="text-2xl font-bold mb-4">Consent Required</h1>
        <p className="text-sm text-slate-200 mb-4">
          Welcome to <span className="text-blue-300 font-semibold">DemoCorp</span>. We collect limited user data such as name, email, and interaction behavior
          to enhance your experience. Please review and accept our data usage policy.
        </p>
        <ul className="list-disc list-inside text-sm mb-4 space-y-1 text-slate-300">
          <li>Data used for personalization</li>
          <li>Stored securely with encryption</li>
          <li>No third-party sharing</li>
        </ul>

        <div className="flex justify-between gap-4 mt-6">
          <button
            className="w-full px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
            onClick={() => setConsentGiven(true)}
          >
            Accept
          </button>
          <button
            className="w-full px-4 py-2 rounded-md border border-red-500 text-red-300 hover:bg-red-800/20"
            onClick={() => setConsentGiven(false)}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
