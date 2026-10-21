'use client'

import { DEMO } from '@/lib/demo/config'
import { installDemoApi } from '@/lib/demo/mockApi'

// Runs at module load (before any child effect) so the first API calls are already mocked.
installDemoApi()

export default function DemoBootstrap() {
  if (!DEMO) return null
  return (
    <div className="fixed bottom-2 left-2 z-[400] rounded-md bg-indigo-700/90 px-2 py-1 text-[10px] font-semibold tracking-wide text-white pointer-events-none">
      LIVE DEMO · sample data
    </div>
  )
}
