'use client'
import Link from "next/link"
import { Search } from "lucide-react"
import CandidateCard from "./CandidateCard"
import { useState } from "react"
import axios from "axios"
import { ClipLoader } from "react-spinners"

const SearchCandidateContainer = () => {
  const [jobDesc, setJobDesc]=useState('');
  const [loading, setLoading]=useState(false);
  const [candidates, setCandidates]=useState<any>([]);

  const handleFindCandidate = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const k:number=10;
        try {
            setLoading(true)
            const response = await axios.post(` http://localhost:8080/api/resume/shortlist/${k}`,{job_description:jobDesc},{withCredentials:true});
            console.log(response.data, 'matched candidates');
            setCandidates(response.data.data);
        } catch (error:any) {
            console.log(error);
        }
        finally{
            setLoading(false)
        }
        }

  return (
    <div className="w-full h-full flex">
      <section className="w-[40%] h-full flex justify-end">
         <section className="w-full h-full flex flex-col pl-[5%] py-8 pt-[20%]">
            {/* Header row */}
            
                <div className="size-12 flex justify-center items-center "><Search className="w-8 h-8" /></div>

                <h1 className="text-xl font-semibold text-gray-100">Search candidates by job description</h1>
                <p className="mt-1 text-sm text-gray-400 max-w-xl">
                    Paste your job description and let AI extract, classify, and prioritize key requirements for better candidate matching.
                </p>

                <ul className="mt-3 ml-0 space-y-1 text-xs text-gray-300">
                    <li>• Extracts skills, experience, education, and project needs</li>
                    <li>• Categorizes roles into industry-specific collections</li>
                    <li>• Distinguishes must-have vs. nice-to-have qualifications</li>
                    <li>• Detects experience level (junior, mid, senior)</li>
                    <li>• Converts requirements into semantic embeddings</li>
                    <li>• Enables multi-dimensional search across skills, roles, projects, and education</li>
                </ul>

            </section>
      </section>
      <div className="w-[1px] h-[70%] bg-gray-700 self-center mx-3"></div>
      <section className="flex-1 h-full ">
        <div className="w-full h-full flex flex-col justify-start items-center pt-[12%] gap-3 pb-[20px]">
            <div className="w-[70%] h-[60px] rounded-sm border border-gray-600 flex items-center px-2">
                <form onSubmit={handleFindCandidate} className="w-full h-auto justify-center items-center rounded-md shrink-0  flex">
                    <textarea placeholder="Write your job description here..." onChange={(e)=>setJobDesc(e.target.value)} value={jobDesc} className="flex-1 outline-none" />
                    <button type="submit" className="ml-1 cursor-pointer">{loading?<ClipLoader size={18} color="white"/>:<Search className="size-5 text-gray-50"/>}</button>
                </form>
            </div>
            <div className="flex-1 w-[75%] shrink-0 p-[20px] flex flex-col gap-3 overflow-y-scroll scrollbar-hidden">
                {
                    candidates.map((item:any,index:number)=><CandidateCard key={index} candidate={item}/>)
                }
            </div>
        </div>
      </section>
    </div>
  )
}

export default SearchCandidateContainer
