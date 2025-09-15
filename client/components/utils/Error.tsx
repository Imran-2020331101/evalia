'use client'

import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function Error() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center  px-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <AlertTriangle className="h-12 w-12 text-red-800" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-400">Something went wrong</h1>
        <p className="mt-2 text-gray-400">
          We couldn’t process your request. Please try again later.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-5 py-2 text-gray-300  transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
