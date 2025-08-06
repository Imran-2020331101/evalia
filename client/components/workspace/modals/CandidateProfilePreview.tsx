'use client'
import Image from "next/image"
import bg from '../../../public/gradient_bg.jpg'
import {  Mail, MapPin, SlidersVertical, X } from "lucide-react"

import linkedIn from '../../../public/linkedin.svg'
import github from '../../../public/github.svg'
import lego from '../../../public/lego.png'

import { useRef, useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { previewedCandidate, setPreviewedCandidate } from "@/redux/features/utils"
import CandidatesResumePanel from "./utils/CandidatesResumePanel"

const CandidateProfilePreview = () => {
    const modalRef = useRef<HTMLDivElement>(null)
    const [isShowModal , setIsShowModal] = useState(false)
    const [isReportGenerated, setIsReportGenerated] = useState(false)

    const dispatch = useAppDispatch()

    const currentPreviewedCandidate = useAppSelector(previewedCandidate)


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
            modalRef.current &&
            !modalRef.current.contains(event.target as Node)
            ) {
                dispatch(setPreviewedCandidate(null))
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
  return (
    <div className={`z-[130] top-0 left-0 right-0 bottom-0 backdrop-blur-2xl ${currentPreviewedCandidate?'fixed':'hidden'} `}>
      <div className="absolute z-10 top-2 right-2">
        <X size={25} className=""/>
      </div>
      <div className="w-full h-full flex justify-center items-center">
        <div ref={modalRef} className="w-[70%] h-[90%] flex border border-slate-800 rounded-md">
            <section className='w-1/2 h-full shrink-0  relative'>
                <div className="w-full h-full ">
                    <Image width={500} height={800} className="w-full h-full object-cover rounded-md" src={bg} alt=''/>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gray-900/90 flex flex-col justify-start items-center pt-[15%] gap-2">
                    <div className="w-[150px] h-[150px] rounded-full bg-slate-900">
                        <Image width={150} height={150} className="w-full h-full object-cover rounded-full" src={'https://i.pinimg.com/1200x/9a/c9/f5/9ac9f517aae16ceb09dc261dcdeb3c94.jpg'} alt=""/>
                    </div>
                    <p className="text-lg font-semibold tracking-widest scale-120 mt-2">Walter White (heisenberg)</p>
                    <div className="flex text-sm items-center gap-3 text-gray-200">
                        <div className="flex items-center gap-1">
                            <MapPin size={20} className="text-blue-400"/> 
                            <p>Sylhet, Bangladesh</p>
                        </div>
                        <p>|</p>
                        <div className="flex items-center gap-1">
                            <Mail size={20} className="text-blue-400"/> 
                            <p>walterwhite139@gmail.com</p>
                        </div>
                    </div>
                    <div className="w-[65%] h-auto mt-2">
                        <p className="text-center text-[12px] text-gray-200">Driven and methodical chemical process specialist with over 15 years of experience in teaching advanced
                             chemistry and managing complex lab operations. Known for precise analytical thinking, innovative problem solving, and an exceptional understanding 
                             of chemical synthesis and reaction control. Former high school educator with a master’s in chemistry, now seeking roles in R&D, industrial production, 
                             or laboratory operations where deep domain expertise and calm under pressure are valued.</p>
                    </div>
                </div>
                <div className="absolute bottom-0 w-full h-[120px]  z-10 flex justify-center items-center gap-6">
                    <button className="p-1 cursor-pointer rounded-full border border-blue-500">
                        <Image  className="w-[25px] h-auto object-contain" src={linkedIn} alt=""/>
                    </button>
                    <button className="p-1 cursor-pointer rounded-full border border-blue-500">
                        <Image  className="w-[25px] h-auto object-contain" src={github} alt=""/>
                    </button>
                </div>
            </section>
            <section className='w-1/2 h-full shrink-0 bg-slate-900 border-l-[1px] border-slate-700 relative flex flex-col'>
                <section className="absolute top-2 right-2 z-10">
                    <button onClick={()=>setIsShowModal((prev)=>!prev)} className="cursor-pointer text-gray-200 hover:text-white ">
                        <SlidersVertical size={20} />
                    </button>
                </section>
                <CandidatesResumePanel/>
                <section className={`absolute top-0 right-0 w-full h-full transition-transform duration-300 origin-top-right bg-slate-900 flex flex-col py-[20px] px-[30px] pt-[10%] overflow-y-scroll scroll-container ${isShowModal?'scale-100':'scale-0'}`}>
                    { isReportGenerated?
                     <>
                        <h2 className="text-xl font-semibold text-white mb-4">
                        Application Compatibility Review
                        </h2>

                        {/* Summary */}
                        <div className="mb-6 ">
                            <p className="text-sm text-gray-300">
                                An assessment of how the candidate’s profile aligns with the position’s
                                required competencies and qualifications.
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-800/30 text-green-400 text-xs rounded-full">
                                Overall Match: 78%
                            </span>
                            <span className="px-3 py-1 bg-yellow-800/30 text-yellow-400 text-xs rounded-full">
                                Good Fit
                            </span>
                            </div>
                        </div>

                        {/* Strengths */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold  mb-2">Strengths</h3>
                            <ul className="space-y-2 ml-4">
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✔</span>
                                <div>
                                <p className="text-sm text-white font-medium">Skills Match</p>
                                <p className="text-xs text-gray-400">
                                    Proficient in React, JavaScript, and TailwindCSS – matches core job requirements.
                                </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✔</span>
                                <div>
                                <p className="text-sm text-white font-medium">Education</p>
                                <p className="text-xs text-gray-400">
                                    Holds a B.Sc. in Computer Science, meeting the degree requirement.
                                </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-400 mt-1">✔</span>
                                <div>
                                <p className="text-sm text-white font-medium">Experience</p>
                                <p className="text-xs text-gray-400">
                                    4+ years in frontend development with portfolio projects relevant to the role.
                                </p>
                                </div>
                            </li>
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div>
                            <h3 className="text-lg font-semibold  mb-2">Weaknesses</h3>
                            <ul className="space-y-2  ml-6">
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">✘</span>
                                <div>
                                <p className="text-sm text-white font-medium">Backend Skills</p>
                                <p className="text-xs text-gray-400">
                                    Limited experience in Node.js and APIs, which are part of the job's tech stack.
                                </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">✘</span>
                                <div>
                                <p className="text-sm text-white font-medium">Cloud & DevOps</p>
                                <p className="text-xs text-gray-400">
                                    No AWS or Docker exposure, both listed as desired skills in the job post.
                                </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">✘</span>
                                <div>
                                <p className="text-sm text-white font-medium">Advanced Frameworks</p>
                                <p className="text-xs text-gray-400">
                                    No working knowledge of Next.js, which the employer prefers.
                                </p>
                                </div>
                            </li>
                            </ul>
                        </div>
                     </>:
                     <div className="w-full h-full flex flex-col justify-start items-center pt-[5%]">
                        <div className="mb-6">
                            <Image src={lego} alt="" className="w-[130px] h-auto"/>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-semibold text-white mb-3">
                            Application Compatibility Review
                        </h2>

                        {/* Why it’s useful */}
                        <p className="text-[13px] text-center text-gray-300 max-w-md mb-4">
                            Evaluate how closely a candidate’s profile aligns with the job’s
                            requirements. This summary highlights strengths, identifies potential gaps,
                            and helps you make faster, data-driven hiring decisions.
                        </p>

                        {/* How we do it */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-md p-4 max-w-md text-left text-sm text-gray-300 mb-6">
                            <p className="font-semibold text-white mb-2">How We Generate This Report</p>
                            <ul className="list-disc text-[12px] list-inside space-y-1 pl">
                            <li>Compare candidate’s CV data with job requirements.</li>
                            <li>Analyze skills, education, and experience matches.</li>
                            <li>Highlight strengths and areas for improvement.</li>
                            <li>Provide a role-specific suitability score.</li>
                            </ul>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => setIsReportGenerated(true)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer text-white text-sm font-semibold shadow"
                        >
                            Generate Compatibility Review
                        </button>
                     </div>}
                </section>
            </section>
        </div>
      </div>
    </div>
  )
}

export default CandidateProfilePreview
