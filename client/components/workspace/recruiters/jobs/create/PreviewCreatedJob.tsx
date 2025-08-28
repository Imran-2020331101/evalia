'use client'

import Image from "next/image"

import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import TitleParagraphSkeleton from "@/components/ui/TitleParagraphSkeleton"
import { useEffect, useState } from "react"
import { domainType, basicStateType, interviewQAStateType } from "@/types/create-job"
import { organizations } from "@/redux/features/auth"
import { selectedOrgId } from "@/redux/features/job"

interface propType{
  requirement:domainType[],
  responsibilities:domainType[],
  skills:domainType[],
  interviewQA:interviewQAStateType[]
  basicState:basicStateType
}

const PreviewCreatedJob = ({requirement, responsibilities, skills, basicState, interviewQA}:propType) => {
    const {title, jobDescription, jobLocation, salaryFrom, salaryTo, deadline, jobType, employmentLevelType, workPlaceType}= basicState
    const [isShowJobPreview, setIsShowJobPreview]=useState(true)

    const currentOrganizations = useAppSelector(organizations)
    const currentSelectedOrgId = useAppSelector(selectedOrgId)

    const organization = currentOrganizations.find((item)=>item.id===currentSelectedOrgId);
    return (
    <div className={` w-full h-full relative tracking-wider border-l-[1px] border-gray-700`}>
      <div className="absolute left-0 top-0 w-full h-[50px] backdrop-blur-md z-20 flex justify-center items-end pb-[8px] gap-2 text-[13px] font-bold">
        <button onClick={()=>setIsShowJobPreview(true)} className={`cursor-pointer hover:text-blue-500 ${isShowJobPreview?'text-blue-500':''}`}>Job Preview</button>
        <div className="w-[2px] h-[13px] bg-gray-400"></div>
        <button onClick={()=>setIsShowJobPreview(false)} className={`cursor-pointer hover:text-blue-500 ${!isShowJobPreview?'text-blue-500':''}`}>Interview Questions</button>
      </div>
      <div className="w-full h-full backdrop-blur-2xl z-10 flex justify-center overflow-hidden ">
        <section className={`w-full h-full bg-slate-900/40 flex-col justify-start py-[40px] px-[2%] pt-[70px]  overflow-y-scroll scrollbar-hidden relative ${isShowJobPreview?'flex':'hidden'}`}>
            <div className="w-full h-auto flex flex-col justify-start items-start ">
                <section className="w-[60%] h-auto flex justify-start items-start gap-4">
                    <div className="w-[80px] h-[70px] rounded-xl ">
                        <Image className="w-full h-full rounded-xl object-cover" width={150} height={120} src={organization?organization.organizationProfileImageUrl:''} alt="company logo" />
                    </div>
                    <div className="flex-1 h-auto flex flex-col items-start ">
                        <p className="font-semibold tracking-widest">{organization?organization.organizationName:''}</p>
                        <p className="w-full h-[40px] overflow-hidden text-[13px] text-gray-300">
                            {organization?organization.businessDescription:''}
                        </p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6">
                    {
                        title?<p className="font-semibold text-[20px]">{title}</p>
                        :<p>🏷️ Job title will appear here</p>
                    }
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-100">
                        <p className="text-[13px]">{`$${salaryFrom}k - $${salaryTo}k`}</p><p>{` | `}</p>
                        <p className="text-[13px]">{jobType}</p><p>{` | `}</p>
                        <p className="text-[13px]">{employmentLevelType}</p><p>{` | `}</p>
                        <p className="text-[13px]">{workPlaceType}</p>
                    </div>
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-300">
                        <p className="text-[13px]">{`Posted : ${'...'} `}</p><p>{` . `}</p>
                        <p className="text-[13px]">{`Application Deadline : `}<span className="text-red-500">{ deadline?deadline:''}</span></p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    {
                       jobDescription?
                        <>
                            <p className="font-semibold text-[14px] ">About the opportunity : </p>
                            <p className="text-[12px]">
                                {jobDescription}
                            </p>
                        </>
                       : <div className="w-full shrink-0 flex flex-col gap-2 m-3 text-gray-300">
                            <p className="text-[14px] italic">📝 Description will appear here</p>
                            <div className="pl-[5%] pr-[10%]">
                                <TitleParagraphSkeleton/>
                            </div>
                       </div>
                    }
                </section>
                {
                    requirement.length ? <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Requirements : </p>
                    {
                        requirement.map((item, index)=><div key={index} className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <button className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</button>
                        </div>
                        <p className="text-[12px]">
                            <span className="font-semibold">
                                {` ${item.category} : `}
                            </span>
                            {item.description}
                        </p>
                    </div>)
                    }
                </section> :<div className="w-full shrink-0 flex flex-col gap-2 m-3 text-gray-300">
                            <p className="text-[14px]  italic ">✅ Requirements will appear here</p>
                            <div className="pl-[5%] pr-[10%]">
                                <TitleParagraphSkeleton/>
                            </div>
                       </div>
                }
                
                {
                    responsibilities.length ? 
                    <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                        <p className="font-semibold text-[14px] ">Responsibilities : </p>
                        {
                            responsibilities.map((item,index)=><div key={index} className="w-full flex justify-start items-start">
                            <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                                <button className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</button>
                            </div>
                            <p className="text-[12px]">
                                <span className="font-semibold">
                                    {` ${item.category} : `}
                                </span>
                                {item.description}
                            </p>
                        </div>)
                        }
                    </section>
                    :<div className="w-full shrink-0 flex flex-col gap-2 m-3 text-gray-300">
                            <p className="text-[14px]  italic ">📌 Responsibilities will appear here</p>
                            <div className="pl-[5%] pr-[10%]">
                                <TitleParagraphSkeleton/>
                            </div>
                       </div>
                }
                {
                    skills.length?
                    <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                        <p className="font-semibold text-[14px] ">Preferred Skills : </p>
                        {
                            skills.map((item,index)=><div key={index} className="w-full flex justify-start items-start">
                            <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                                <button className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</button>
                            </div>
                            <p className="text-[12px]">
                                <span className="font-semibold">
                                    {` ${item.category} : `}
                                </span>
                                {item.description}
                            </p>
                        </div>)
                        }
                    </section>
                    :<div className="w-full shrink-0 flex flex-col gap-2 m-3 text-gray-300">
                            <p className="text-[14px]  italic ">🎯 Preferred Skills will appear here</p>
                            <div className="pl-[5%] pr-[10%]">
                                <TitleParagraphSkeleton/>
                            </div>
                       </div>
                }
            </div>
        </section>
        <section className={`w-full h-full bg-slate-900/40 flex-col justify-start py-[40px] px-[2%] pt-[80px]  overflow-y-scroll scrollbar-hidden ${!isShowJobPreview?'flex':'hidden'}`}>
                {
                    interviewQA.length?<div className="w-full h-full flex flex-col justify-start items-start gap-4">
                        <p className="text-sm font-semibold mb-3 text-gray-50">Interview Questions and Reference Answers </p>
                        {
                            interviewQA.map((item,index)=><div key={index} className="w-full h-auto flex text-[12px] gap-2 text-gray-300">
                                <div className="w-[20px] h-full flex justify-center items-start"><p className="text-3xl font-extrabold mt-[-14px]">.</p></div>
                                <div className="w-full h-auto flex-col justify-start items-start">
                                    <p className="mb-1"><span className="font-bold text-gray-100">Question : </span> {item.question}</p>
                                    {item.referenceAnswer?<p> <span className="font-semibold text-gray-100">Reference Answer : </span> {item.referenceAnswer}</p>:null}
                                    </div>
                            </div>)
                        }
                    </div>:<div className="w-full shrink-0 flex flex-col gap-2 m-3 text-gray-300">
                            <p className="text-[14px]  italic ">❓ Questions will appear here</p>
                            <div className="pl-[5%] pr-[10%]">
                                <TitleParagraphSkeleton/>
                            </div>
                       </div>
                }
        </section>
      </div>
    </div>
  )
}

export default PreviewCreatedJob
