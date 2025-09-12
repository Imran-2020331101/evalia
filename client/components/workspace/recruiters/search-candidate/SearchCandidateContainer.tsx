'use client'
import Link from "next/link"
import { Search } from "lucide-react"

const SearchCandidateContainer = () => {
  return (
    <div className="w-full h-full flex">
      <section className="w-[40%] h-full flex justify-end">
         <section className="w-full h-full flex flex-col pl-[5%] py-8">
            {/* Header row */}
            <div className="size-8 flex justify-center items-center rounded-md shrink-0 bg-gray-900/40 flex">
                <Search className="w-5 h-5" />
            </div>


                <h1 className="text-xl font-semibold text-gray-100">Search candidates by job description</h1>
                <p className="mt-1 text-sm text-gray-400 max-w-xl">
                    Quickly find the best matches by searching skills, responsibilities, and role requirements directly from job descriptions.
                </p>

                {/* bullets */}
                <ul className="mt-3 ml-0 space-y-1 text-xs  text-gray-300">
                    <li>• Matches candidates by skill keywords and role responsibilities</li>
                    <li>• Prioritizes recent experience and relevant projects</li>
                    <li>• Supports boolean-style and natural-language queries for flexible search</li>
                </ul>

                {/* small CTA / optional link */}
                <div className="mt-4">
                    <Link href="/workspace/candidates/search" className="text-[11px] uppercase tracking-wider text-blue-400">
                    Open candidate search
                    </Link>
                </div>
            </section>
      </section>
      <section className="flex-1 h-full">

      </section>
    </div>
  )
}

export default SearchCandidateContainer
