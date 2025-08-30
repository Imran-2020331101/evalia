'use client'

import { useAppDispatch } from "@/redux/lib/hooks"
import UploadResume from "../UploadResume"
import { PlusSquare, Upload , SquareMousePointer, Hammer} from "lucide-react"
import { analyzeResume } from "@/redux/features/auth"

const AnalyzeResumeSection = ({user, setIsUploadResume}:{user:any, setIsUploadResume:React. Dispatch<React.SetStateAction<boolean>>}) => {
  const dispatch = useAppDispatch()
  return (
    <div className="w-full h-auto flex">
      {
        !user?.user?.resumeUrl?
            <div className="flex flex-col w-full h-auto px-[7%] pt-[7%]">
                <h1 className="text-lg font-semibold text-slate-300 mb-6 flex items-center gap-2">
                    <PlusSquare size={20} color="white"/> Build Your Profile from a Resume
                </h1>


                <ul className="list-disc list-inside space-y-2 text-[14px] text-slate-400 mb-8">
                    <li>Upload your resume (PDF/DOC/DOCX).</li>
                    <li>We parse the document to analyze its content.</li>
                    <li>Key details—contact, education, experience, skills—are extracted.</li>
                    <li>Data is mapped into predefined profile fields.</li>
                    <li>Your complete profile is generated for quick review.</li>
                </ul>
                <button
                type="button"
                onClick={()=>setIsUploadResume(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-600 px-5 py-2 text-sm font-medium shadow-sm hover:bg-blue-700"
                >
                <Upload className="h-4 w-4" />
                Upload Resume
                </button>
            </div>
        :
        <div className="flex flex-col w-full h-auto px-[7%] pt-[7%]">
            <h1 className="text-lg font-semibold text-slate-300 mb-6 flex items-center gap-2">
                <SquareMousePointer size={20} color="white"/> Create Your Professional Profile in One Click
            </h1>


            <ul className="list-disc list-inside space-y-2 text-[14px] text-slate-400 mb-8">
                <li>Press the Analyze & Build Profile button to begin.</li>
                <li>The system scans and processes the resume content.</li>
                <li>Important information like contact details, education, work history, and skills are identified.</li>
                <li>Extracted data is organized into structured profile fields.</li>
                <li>Your polished professional profile is created and ready to view.</li>
            </ul>
            <button
            type="button"
            onClick={()=>dispatch(analyzeResume())}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-600 px-5 py-2 text-sm font-medium shadow-sm hover:bg-blue-700"
            >
            <Hammer className="h-4 w-4" />
                Build Your Profile
            </button>
        </div>
      }
    </div>
  )
}

export default AnalyzeResumeSection
