'use client'
import Link from "next/link"
import { Search } from "lucide-react"
import CandidateCard from "./CandidateCard"
import { useState } from "react"
import axios from "axios"

const SearchCandidateContainer = () => {
  const [jobDesc, setJobDesc]=useState('');
  const [candidates, setCandidates]=useState<any>([]);

  const handleFindCandidate = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const response = await axios.post('',null,{withCredentials:true});
            console.log(response.data, 'matched candidates');
            setCandidates(response.data.data);
        } catch (error:any) {
            console.log(error);
        }
        console.log(jobDesc)
        }

  return (
    <div className="w-full h-full flex">
      <section className="w-[40%] h-full flex justify-end">
         <section className="w-full h-full flex flex-col pl-[5%] py-8 pt-[20%]">
            {/* Header row */}
            
                <div className="size-12 flex justify-center items-center "><Search className="w-8 h-8" /></div>

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
            </section>
      </section>
      <div className="w-[1px] h-[70%] bg-gray-700 self-center mx-3"></div>
      <section className="flex-1 h-full ">
        <div className="w-full h-full flex flex-col justify-start items-center pt-[15%]">
            <div className="w-[70%] h-[40px] rounded-sm border border-gray-600 flex items-center px-2">
                <form onSubmit={handleFindCandidate} className="w-full h-auto justify-center items-center rounded-md shrink-0  flex">
                    <input placeholder="Enter your job description here..." onChange={(e)=>setJobDesc(e.target.value)} value={jobDesc} type="text" className="flex-1 outline-none" />
                    <button type="submit"><Search className="size-5 text-gray-50"/></button>
                </form>
            </div>
            <div className="flex-1 w-[75%] shrink-0 p-[20px] flex flex-col gap-3">
                {
                    candidates.map((item:any)=><CandidateCard candidate={item}/>)
                }
            </div>
        </div>
      </section>
    </div>
  )
}

export default SearchCandidateContainer
