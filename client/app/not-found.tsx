import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-neutral-600 mb-3">404</h1>
        <h2 className="text-lg font-medium mb-6">This Page Isn't Available</h2>
        <p className="text-neutral-400 text-xs mb-6 max-w-sm">
          The link may be broken, or the page may have been removed.
        </p>
        <div className="flex gap-3 justify-center text-sm">
          <Link 
            href="/workspace"
            className="px-4 py-2 bg-[#503C3C] text-[#c5b2b2] hover:bg-[#473535] rounded text-sm transition-colors"
          >
            Go back to Workspace
          </Link>
          <Link 
            href="/profile/support"
            className="px-4 py-2 border border-neutral-600 hover:border-neutral-500 rounded text-sm transition-colors"
          >
            Visit Help Center
          </Link>
        </div>
      </div>
    </div>
  )
}
