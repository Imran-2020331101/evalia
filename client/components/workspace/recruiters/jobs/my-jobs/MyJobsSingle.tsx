'use client'
import Image from "next/image"
import { useEffect , useState} from "react"
import { DotLoader } from "react-spinners"
import { useAppSelector } from "@/redux/lib/hooks"
import { myJobs } from "@/redux/features/job"

const MyJobsSingle = ({jobId}:{jobId:string}) => {
    const [localStatus, setLocalStatus]=useState<'pending'|'success'|'error'>('pending')

    const myCurrentJobs = useAppSelector(myJobs)
    const job:any = myCurrentJobs.find((item:any)=>item.jobId===jobId)

    if (!job && localStatus==='pending') {
        return (
        <div className="w-full h-full flex items-center justify-center">
            <DotLoader size={40} color="white"/>
        </div>
        );
    }
 
  const {title,jobDescription,employmentLevel,deadline,interviewQA,jobLocation,jobType,requirements,responsibilities,skills,status,workPlaceType,salary, createdAt}=job
  useEffect(()=>console.log(myCurrentJobs, jobId, 'testing,.'), [])
  return (
    <div className={` w-full h-full relative tracking-wider `}>
      <div className="w-full h-full backdrop-blur-2xl z-10 flex justify-center overflow-hidden ">
        <section className="w-full h-full bg-slate-900/40 flex flex-col justify-start py-[40px] px-[2%]  overflow-y-scroll scrollbar-hidden relative ">
            <div className="w-full h-auto flex flex-col justify-start items-start ">
                <section className="w-[60%] h-auto flex justify-start items-start gap-4">
                    <div className="w-[80px] h-[70px] rounded-xl ">
                        <Image className="w-full h-full rounded-xl object-cover" width={150} height={120} src={'https://i.pinimg.com/1200x/59/7f/11/597f11b631d7d94492f1adb95110cc44.jpg'} alt="company logo" />
                    </div>
                    <div className="flex-1 h-auto flex flex-col items-start ">
                        <p className="font-semibold tracking-widest">Google</p>
                        <p className="w-full h-[40px] overflow-hidden text-[13px] text-gray-300">
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ex iusto quos temporibus quia consequatur,
                             laudantium inventore? Aliquam, voluptatibus in nisi ex doloremque id blanditiis iusto placeat ut sapiente, inventore minus.
                        </p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6">
                    <p className="font-semibold text-[20px]">{title}</p>
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-100">
                        <p className="text-[13px]">{`${salary.from}$ - ${salary.to}$`}</p><p>{` | `}</p>
                        <p className="text-[13px]">{workPlaceType}</p><p>{` | `}</p>
                        <p className="text-[13px]">{employmentLevel}</p><p>{` | `}</p>
                        <p className="text-[13px]">{jobType}</p><p>{` | `}</p>
                        <p className="text-[13px]">{deadline}</p>
                    </div>
                    <div className="w-full overflow-hidden flex justify-start items-center gap-2 text-gray-300">
                        <p className="text-[13px]">{`Posted : ${'2 days ago'} `}</p><p>{` . `}</p>
                        <p className="text-[13px]">{`Application Deadline : `}<span className="text-red-500">{'10-08-2025'}</span></p>
                    </div>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">About the opportunity : </p>
                    <p className="text-[12px]">
                        {jobDescription}
                    </p>
                </section>
                <section className="w-full h-auto flex flex-col justify-start items-start mt-6 text-gray-100 gap-2">
                    <p className="font-semibold text-[14px] ">Requirements : </p>
                    {
                        requirements.map((item:any,index:number)=><div key={index} className="w-full flex justify-start items-start">
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
                        responsibilities.map((item:any,index:number)=><div key={index} className="w-full flex justify-start items-start">
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
                        skills.map((item:any,index:number)=><div key={index} className="w-full flex justify-start items-start">
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

export default MyJobsSingle
