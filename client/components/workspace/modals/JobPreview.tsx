'use client'

import Image from "next/image"
import { Didact_Gothic, Major_Mono_Display } from "next/font/google"
import { useEffect, useState } from "react"
import { format } from "timeago.js";

import rightLogo from '../../../public/go-right.svg'
import leftLogo from '../../../public/go-left.svg'
import saveLogo from '../../../public/book-mark.svg'
import applyLogo from '../../../public/paper-plane.svg'
import exitLogo from '../../../public/x-solid.svg'
import evaliaLogo from '../../../public/evalia-short.png'
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { previewedJob, setPreviewedJob } from "@/redux/features/utils"

const didact_gothic = Didact_Gothic({ weight: ['400'], subsets: ['latin'] })

const JobPreview = () => {
    const dispatch = useAppDispatch()
    const [isShowApplyButton, setIsShowApplyButton] = useState(false);

    const currentPreviewedJob = useAppSelector(previewedJob)
    const {_id, company, title, jobLocation,employmentLevel, jobType, status, workPlaceType, salary, createdAt, requirements, responsibilities, skills,jobDescription, deadline}=currentPreviewedJob || {};

    const formattedDeadline = ()=>{
        if(deadline){
            const date = new Date(deadline)
            const formatted = date.toLocaleDateString(); 
            return formatted;
        }
    }

  return (
    <div className={` ${didact_gothic.className} ${currentPreviewedJob?'fixed':'hidden'} tracking-wider top-0 left-0 right-0 bottom-0 z-[120] `}>
        <button className="fixed top-4 left-2 z-10 cursor-pointer">
            <Image src={evaliaLogo} alt="logo" className=" w-[45px]"/>
        </button>
        <button onClick={()=>dispatch(setPreviewedJob(null))} className="fixed top-3 right-3 z-10 cursor-pointer">
            <Image src={exitLogo} alt="exit" className="w-[18px]"/>
        </button>
      <div className="w-full h-full backdrop-blur-2xl z-10 flex justify-center overflow-hidden ">
        <section className="w-[60%] h-full bg-slate-900/40 flex flex-col justify-start py-[40px] px-[2%]  overflow-y-scroll scrollbar-hidden relative ">
            <div className="absolute w-[250px] h-[80px] rounded-l-full top-[40px] right-0">
                <div className={`w-full h-full rounded-l-full bg-slate-800 flex items-center justify-start pl-2 gap-2 transition-transform duration-500 ${isShowApplyButton?'translate-x-0':' translate-x-[210px]'}`}>
                    <button onClick={()=>setIsShowApplyButton((prev)=>!prev)} className="p-2 rounded-full cursor-pointer">
                        <Image src={isShowApplyButton?rightLogo:leftLogo} alt="direction" className="w-[25px] object-cover"/>
                    </button>
                    <button className="px-2 py-2 rounded-sm border border-gray-300 hover:border-blue-500 text-white font-semibold bg-gray-900 flex justify-center items-center cursor-pointer gap-1">
                       <Image src={saveLogo} alt="save" className="w-[14px]"/>
                       <p className="text-[12px]">Save</p>
                    </button>
                    <button className="px-2 py-2 ml-2 rounded-sm font-bold bg-indigo-700 hover:bg-indigo-600 text-white flex justify-center items-center cursor-pointer gap-1">
                       <Image src={applyLogo} alt="apply" className="w-[14px]"/>
                       <p className="text-[12px]">Apply</p>
                    </button>
                </div>
            </div>
            <div className="w-full h-auto flex flex-col justify-start items-start ">
                <section className="w-[60%] h-auto flex justify-start items-start gap-4">
                    <div className="w-[80px] h-[70px] rounded-xl ">
                        <Image className="w-full h-full rounded-xl object-cover" width={150} height={120} src={company?.organizationProfileImageUrl||'https://i.pinimg.com/736x/cf/41/82/cf4182b20a5c74ceac60149066a52841.jpg'} alt="company logo" />
                    </div>
                    <div className="flex-1 h-auto flex flex-col items-start ">
                        <p className="font-semibold tracking-widest">{company?.organizationName||''}</p>
                        <p className="w-full h-[40px] overflow-hidden text-[13px] text-gray-300">
                            {company?.businessDescription||''}
                        </p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6">
                    <p className="font-semibold text-[20px]">{title||''}</p>
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-100">
                        <p className="text-[13px]">{`$${salary?.from}k - $${salary?.to}k`}</p><p>{` | `}</p>
                        <p className="text-[13px]">{workPlaceType || ''}</p><p>{` | `}</p>
                        <p className="text-[13px]">{employmentLevel||''}</p><p>{` | `}</p>
                        <p className="text-[13px]">{jobType || ''}</p>
                    </div>
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-300">
                        <p className="text-[13px]">{`Posted : ${deadline?format(createdAt):''} `}</p><p>{` . `}</p>
                        <p className="text-[13px]">{`Application Deadline : `}<span className="text-red-500">{formattedDeadline()}</span></p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">About the opportunity : </p>
                    <p className="text-[12px]">
                        {jobDescription || ''}
                    </p>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Requirements : </p>
                    {
                        requirements?.map((item:any, index:number)=><div key={index} className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
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
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Responsibilities : </p>
                    {
                        responsibilities?.map((item:any, index:number)=><div key={index} className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
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
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Preferred Skills : </p>
                    {
                        skills?.map((item:any, index:number)=><div key={index} className="w-full flex justify-start items-start">
                        <div className="w-[40px] shrink-0 h-full flex justify-center items-start relative">
                            <p className="absolute top-[-20px] left-4 text-4xl font-extrabold">.</p>
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
            </div>
        </section>
      </div>
    </div>
  )
}

export default JobPreview
