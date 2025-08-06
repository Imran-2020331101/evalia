'use client'

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react";
import { useRouter } from 'next/navigation'

/**
 * the data type used in backend:
 * This is how the input should go to backend:
 * 
 file name = types/JobFormInput.ts 

export type ImportanceLevel = 'critical' | 'high' | 'moderate' | 'low' | 'optional';

export interface DomainItem {
  type: ImportanceLevel;
  category: string;
  description: string;
}

export interface Salary {
  from: number;
  to: number;
}

export interface CompanyInfo {
  name: string;
  website?: string;
  industry?: string;
}

export interface JobFormInput {
  title: string;
  jobDescription: string;
  jobLocation: string;
  salary: Salary;
  deadline: string | Date; // Accept both types depending on UI
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
  workPlaceType: 'On-site' | 'Remote' | 'Hybrid';
  employmentLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive' | 'Director';
  requirements: DomainItem[];
  responsibilities: DomainItem[];
  skills: DomainItem[];
  postedBy: string; // Likely the user ID or email
  company: CompanyInfo;
}

 */

const IMPORTANCE_OPTIONS = [
  { value: "critical", label: "🔴 Critical" },
  { value: "high", label: "🟠 High" },
  { value: "moderate", label: "🟡 Moderate" },
  { value: "low", label: "🔵 Low" },
  { value: "optional", label: "⚪ Optional" },
];

const JOB_TYPE = [
  { value: "Full-time", label: "🕐 Full-time" },
  { value: "Part-time", label: "🕞 Part-time" },
  { value: "Contract", label: "📃 Contract" },
  { value: "Internship", label: "🎓 Internship" },
  { value: "Freelance", label: "🧑‍💻 Freelance" }
]

const WORKPLACE_TYPE = [
  { value: "On-site", label: "🏢 On-site" },
  { value: "Remote", label: "🏠 Remote" },
  { value: "Hybrid", label: "🔀 Hybrid" }
]

const EMPLOYMENT_LEVEL = [
  { value: "Entry", label: "🧩 Entry Level" },
  { value: "Mid", label: "⚙️ Mid Level" },
  { value: "Senior", label: "🎯 Senior Level" },
  { value: "Executive", label: "💼 Executive" },
  { value: "Director", label: "📊 Director" }
]

interface domainType{
  type:string,
  category:string,
  description:string,
}

const CreateJobForm = () => {

  // Redirect code added after successfull job creation: you need to uncomment it
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [jobDescription, setJobDescription]=useState('');
  const [jobLocation, setJobLocation]=useState('');
  const [salaryFrom, setSalaryFrom] = useState('0');
  const [salaryTo, setSalaryTo] = useState('0');
  const [deadline,setDeadline] =useState('');

  const [jobType, setJobType] = useState(JOB_TYPE[0].value)
  const [isOpenJobType, setIsOpenJobType] = useState(false)
 
  const [workPlaceType, setWorkPlaceType] = useState(WORKPLACE_TYPE[0].value)
  const [isOpenWorkPlaceType, setIsOpenWorkPlaceType] = useState(false)
  
  const [employmentLevelType, setEmploymentLevelType] = useState(EMPLOYMENT_LEVEL[0].value)
  const [isOpenEmploymentLevelType, setIsOpenEmploymentLevelType] = useState(false)

  const [requirement, setRequirement]=useState<domainType[]>([]);
  const [isOpenRequirement, setIsOpenRequirement] = useState(false)
  const [selectedRequirementType, setSelectedRequirementType]=useState('optional')
  const [requirementCategory, setRequirementCategory]=useState<string>('')
  const [requirementDescription, setRequirementDescription]=useState<string>('')
  
  const [responsibilities, setResponsibilities]=useState<domainType[]>([]);
  const [isOpenResponsibilities, setIsOpenResponsibilities] = useState(false)
  const [selectedResponsibilitiesType, setSelectedResponsibilitiesType]=useState('optional')
  const [responsibilitiesCategory, setResponsibilitiesCategory]=useState<string>('')
  const [responsibilitiesDescription, setResponsibilitiesDescription]=useState<string>('')
  
  const [skills, setSkills]=useState<domainType[]>([]);
  const [isOpenSkills, setIsOpenSkills] = useState(false)
  const [selectedSkillsType, setSelectedSkillsType]=useState('optional')
  const [skillsCategory, setSkillsCategory]=useState<string>('')
  const [skillsDescription, setSkillsDescription]=useState<string>('')


  const handleAddRequirement = ()=>{
    setRequirement([...requirement,{type:selectedRequirementType,category:requirementCategory,description:requirementDescription}]);
    setSelectedRequirementType('optional');
    setRequirementCategory('')
    setRequirementDescription('')
  }

  const handleAddResponsibilities =()=>{
    setResponsibilities([...responsibilities,{type:selectedResponsibilitiesType,category:responsibilitiesCategory,description:responsibilitiesDescription}]);
    setSelectedResponsibilitiesType('optional');
    setResponsibilitiesCategory('')
    setResponsibilitiesDescription('')
  }

  const handleAddSkills = ()=>{
    setSkills([...skills,{type:selectedSkillsType,category:skillsCategory,description:skillsDescription}]);
    setSelectedSkillsType('optional');
    setSkillsCategory('')
    setSkillsDescription('')
  }

  //This state should be use to show the loading UI
  //If felt unneccesary you can delete it @Azwoad
  const [isSaving, setIsSaving] = useState(false);

  /**
   * I assumed the name of the variable that will represent the job details is "jobData"
   * Replace jobData with the object you will create.
   * Currently there is no variable named jobData so it would show error.
   */
  // const handleCreateJob = async ()=>{
  //   if (!jobData) return

  //   setIsSaving(true)

  //   try {
  //     const response = await fetch('http://localhost:7000/api/jobs/create', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(jobData),
  //       credentials: 'include',
  //     })

  //     if (!response.ok) {
  //       throw new Error('Failed to save resume')
  //     }

   
  //     // Clear session storage and redirect after successful save
  //     setTimeout(() => {
  //       sessionStorage.removeItem('resumeData')
  //       router.push('/dashboard') // or wherever you want to redirect after save
  //     }, 2000)
  //   } catch (error) {
  //     console.error('Save failed:', error)
  //   } finally {
  //     setIsSaving(false)
  //   }
  // }

  useEffect(()=>console.log(requirement,'requirement'),[requirement])
  useEffect(()=>console.log(responsibilities,'responsibility'),[responsibilities])
  useEffect(()=>console.log(skills,'skills'),[skills])
  useEffect(()=>console.log(jobLocation, workPlaceType, jobType, employmentLevelType))

   return (
    <div className='w-full h-full flex justify-center items-center py-[20px]'>
      <div className="w-[60%] h-full flex flex-col justify-start items-start py-[40px] overflow-y-auto scrollbar-hidden text-gray-300 bg-slate-800/20 rounded-lg px-[20px] text-[12px] gap-[40px]">
        <section className="relative w-full h-[60px] shrink-0">
          <label htmlFor="job-title" className='absolute top-[-20%] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Job title : </label>
          <textarea 
          onChange={(e)=>setTitle(e.target.value)}
          value={title}
          name="job-title" 
          id="job-title" 
          className='w-full h-full rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-gray-800 focus:border-[1px] border-gray-500 outline-none'>
          </textarea>
        </section>
        <section className="relative w-full h-[200px] shrink-0">
          <label htmlFor="job-description" className='absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Job description : </label>
          <textarea 
          onChange={(e)=>setJobDescription(e.target.value)}
          value={jobDescription}
          name="job-description" 
          id="job-description" 
          className='w-full h-full rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-gray-800 focus:border-[1px] border-gray-500 outline-none'>
          </textarea>
        </section>
        <section className=" w-full h-auto shrink-0 flex flex-wrap gap-y-[30px] justify-between items-start bg-slate-800/20 relative  rounded-sm px-[45px] py-[30px]">
          <p className=' absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Basic information : </p>
          
          <div className="w-[45%] shrink-0 h-[60px] self-end flex flex-col justify-start items-start gap-2">
              <label htmlFor="Skills-type" className="font-semibold">Select job type :</label>
              <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                  <button onClick={()=>setIsOpenJobType((prev)=>!prev)} className="w-full h-full flex justify-center items-center gap-2">
                    <p className="uppercase tracking-wider">{jobType}</p>
                    <ChevronDown className="w-[18px]"/>
                  </button>
                {
                  isOpenJobType?
                  JOB_TYPE.map((item,index)=><li 
                  key={index}
                  className={` left-0 z-10 w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                  style={{ top: `${index * 30+index*3 + 60}px` }}
                  onClick={()=>{setJobType(item.value); setIsOpenJobType(false)}}>{item.label}
                  </li>)
                :
                  null
                }
              </ul>
          </div>
          <div className="w-[45%] h-[60px] flex justify-between shrink-0 relative ">
            <p className=' absolute top-[-24px] left-[-10px] underline px-2 py-1 font-bold rounded-2xl text-gray-500'>Salary (in thousands...)</p>
            <div className="w-[45%] h-full flex flex-col justify-start items-start gap-1 shrink-0">
              <label htmlFor="salary-from" className='font-semibold'>From : </label>
              <textarea 
              onChange={(e)=>setSalaryFrom(e.target.value)}
              value={salaryFrom}
              name="salary-from" 
              id="salary-from" 
              className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
            <div className="w-[45%] h-full flex flex-col justify-start items-start gap-1 shrink-0">
              <label htmlFor="salary-to" className='font-semibold'>To : </label>
              <textarea 
              onChange={(e)=>setSalaryTo(e.target.value)}
              value={salaryTo}
              name="salary-to" 
              id="salary-to" 
              className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
          </div>         
          <div className="w-[45%] shrink-0 h-[60px] self-end flex flex-col justify-start items-start gap-2">
            <label htmlFor="employment-level" className="font-semibold">Select employment level :</label>
            <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                <button onClick={()=>setIsOpenEmploymentLevelType((prev)=>!prev)} className="w-full h-full flex justify-center items-center gap-2">
                  <p className="uppercase tracking-wider">{employmentLevelType}</p>
                  <ChevronDown className="w-[18px]"/>
                </button>
              {
                isOpenEmploymentLevelType?
                EMPLOYMENT_LEVEL.map((item,index)=><li 
                key={index}
                className={` left-0 z-10 w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                style={{ top: `${index * 30+index*3 + 60}px` }}
                onClick={()=>{setEmploymentLevelType(item.value); setIsOpenEmploymentLevelType(false)}}>{item.label}
                </li>)
              :
                null
              }
            </ul>
          </div>
          <div className="w-[45%] h-[60px] flex flex-col justify-start items-start gap-1 shrink-0">
            <label htmlFor="job-location" className='font-semibold'>Location : </label>
            <textarea 
            onChange={(e)=>setJobLocation(e.target.value)}
            value={jobLocation}
            name="job-location" 
            id="job-location" 
            className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
            </textarea>
          </div>
          <div className="w-[45%] shrink-0 h-[60px] self-end flex flex-col justify-start items-start gap-2">
            <label htmlFor="employment-level" className="font-semibold">Select workplace :</label>
            <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                <button onClick={()=>setIsOpenWorkPlaceType((prev)=>!prev)} className="w-full h-full flex justify-center items-center gap-2">
                  <p className="uppercase tracking-wider">{workPlaceType}</p>
                  <ChevronDown className="w-[18px]"/>
                </button>
              {
                isOpenWorkPlaceType?
                WORKPLACE_TYPE.map((item,index)=><li 
                key={index}
                className={` left-0 z-10 w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                style={{ top: `${index * 30+index*3 + 60}px` }}
                onClick={()=>{setWorkPlaceType(item.value); setIsOpenWorkPlaceType(false)}}>{item.label}
                </li>)
              :
                null
              }
            </ul>
          </div>
          <div className="w-[45%] h-[60px] flex flex-col justify-start items-start gap-1 shrink-0">
            <label htmlFor="job-deadline" className='font-semibold'>Deadline <span className="text-gray-400">(dd-mm-yy)</span> : </label>
            <textarea 
            onChange={(e)=>setDeadline(e.target.value)}
            value={deadline}
            name="job-deadline" 
            id="job-deadline" 
            className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
            </textarea>
          </div>
        </section>
        <section className=" w-full h-auto shrink-0 flex flex-col justify-start items-start bg-slate-800/20 relative rounded-sm py-[30px]">
          <p className=' absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Requirements : </p>
          <div className=" pl-[50px] pr-[20px] w-full h-[70px] flex justify-between shrink-0">
            <div className="w-[50%] h-[70px] flex flex-col justify-start items-start gap-1">
              <label htmlFor="requirement-category" className='font-semibold'>Category : </label>
              <textarea 
              onChange={(e)=>setRequirementCategory(e.target.value)}
              value={requirementCategory}
              name="requirement-category" 
              id="requirement-category" 
              className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
            <div className="w-[40%] h-full self-end flex flex-col justify-start items-start gap-2">
              <label htmlFor="req-type" className="font-semibold">Select a requirement type :</label>
              <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                  <button onClick={()=>setIsOpenRequirement((prev)=>!prev)} className="w-full h-full flex justify-center items-center gap-2">
                    <p className="uppercase tracking-wider">{selectedRequirementType}</p>
                    <ChevronDown className="w-[18px]"/>
                  </button>
                {
                  isOpenRequirement?
                  IMPORTANCE_OPTIONS.map((item,index)=><li 
                  key={index}
                  className={` left-0  w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                  style={{ top: `${index * 30+index*3+60}px` }}
                  onClick={()=>{setSelectedRequirementType(item.value); setIsOpenRequirement(false)}}>{item.label}
                  </li>)
                :
                  null                  
                }
              </ul>
            </div>
          </div>
          <div className="w-full h-auto pl-[45px] pr-[20px] mt-6 shrink-0">
            <div className="w-full h-[250px]  flex flex-col justify-start items-start gap-1">
              <label htmlFor="requirement-description" className='font-semibold'>Description : </label>
              <textarea 
              onChange={(e)=>setRequirementDescription(e.target.value)}
              value={requirementDescription}
              name="requirement-description" 
              id="requirement-description" 
              className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/20 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
          </div>
          <div className="w-full h-[50px] rounded-2xl pl-[45px] pr-[20px] mt-8">
            <button onClick={handleAddRequirement} className="w-full h-full border hover:border-[#cbcddb] text-[#63666e] border-[#63666e] hover:text-[#cbcddb] font-bold transition-colors duration-500 cursor-pointer">Add Requirement & Continue with Another...</button>
          </div>
        </section>
        <section className=" w-full h-auto shrink-0 flex flex-col justify-start items-start bg-slate-800/20 relative  rounded-sm py-[30px]">
          <p className=' absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Responsibilities : </p>
          <div className=" pl-[50px] pr-[20px] w-full h-[70px] flex justify-between shrink-0">
            <div className="w-[50%] h-[70px] flex flex-col justify-start items-start gap-1">
              <label htmlFor="Responsibilities-category" className='font-semibold'>Category : </label>
              <textarea 
              onChange={(e)=>setResponsibilitiesCategory(e.target.value)}
              value={responsibilitiesCategory}
              name="Responsibilities-category" 
              id="Responsibilities-category" 
              className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
            <div className="w-[40%] h-full self-end flex flex-col justify-start items-start gap-2">
              <label htmlFor="Responsibilities-type" className="font-semibold">Select a responsibility type :</label>
              <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                  <button onClick={()=>setIsOpenResponsibilities((prev)=>!prev)} className="w-full h-full flex justify-center items-center gap-2">
                    <p className="uppercase tracking-wider">{selectedResponsibilitiesType}</p>
                    <ChevronDown className="w-[18px]"/>
                  </button>
                {
                  isOpenResponsibilities?
                  IMPORTANCE_OPTIONS.map((item,index)=><li 
                  key={index}
                  className={` left-0  w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                  style={{ top: `${index * 30+index*3 + 60}px` }}
                  onClick={()=>{setSelectedResponsibilitiesType(item.value); setIsOpenResponsibilities(false)}}>{item.label}
                  </li>)
                :
                  null
                }
              </ul>
            </div>
          </div>
          <div className="w-full h-auto pl-[45px] pr-[20px] mt-6 shrink-0">
            <div className="w-full h-[250px]  flex flex-col justify-start items-start gap-1">
              <label htmlFor="Responsibilities-description" className='font-semibold'>Description : </label>
              <textarea 
              onChange={(e)=>setResponsibilitiesDescription(e.target.value)}
              value={responsibilitiesDescription}
              name="Responsibilities-description" 
              id="Responsibilities-description" 
              className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
          </div>
          <div className="w-full h-[50px] rounded-2xl pl-[45px] pr-[20px] mt-8">
            <button onClick={handleAddResponsibilities} className="w-full h-full hover:border-[#cbcddb] text-[#63666e] border border-[#63666e] hover:text-[#cbcddb] font-bold transition-colors duration-500 cursor-pointer">Add Requirement & Continue with Another...</button>
          </div>
        </section>
        <section className=" w-full h-auto shrink-0 flex flex-col justify-start items-start bg-slate-800/20 relative  rounded-sm py-[30px]">
          <p className=' absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Skills : </p>
          <div className=" pl-[50px] pr-[20px] w-full h-[70px] flex justify-between shrink-0">
            <div className="w-[50%] h-[70px] flex flex-col justify-start items-start gap-1">
              <label htmlFor="Skills-category" className='font-semibold'>Category : </label>
              <textarea 
              onChange={(e)=>setSkillsCategory(e.target.value)}
              value={skillsCategory}
              name="Skills-category" 
              id="Skills-category" 
              className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
            <div className="w-[40%] h-full self-end flex flex-col justify-start items-start gap-2">
              <label htmlFor="Skills-type" className="font-semibold">Select a skill type :</label>
              <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                  <button onClick={()=>setIsOpenSkills((prev)=>!prev)} className="w-full h-full flex justify-center items-center gap-2">
                    <p className="uppercase tracking-wider">{selectedSkillsType}</p>
                    <ChevronDown className="w-[18px]"/>
                  </button>
                {
                  isOpenSkills?
                  IMPORTANCE_OPTIONS.map((item,index)=><li 
                  key={index}
                  className={` left-0  w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                  style={{ top: `${index * 30+index*3 + 60}px` }}
                  onClick={()=>{setSelectedSkillsType(item.value); setIsOpenSkills(false)}}>{item.label}
                  </li>)
                :
                  null
                }
              </ul>
            </div>
          </div>
          <div className="w-full h-auto pl-[45px] pr-[20px] mt-6 shrink-0">
            <div className="w-full h-[250px]  flex flex-col justify-start items-start gap-1">
              <label htmlFor="Skills-description" className='font-semibold'>Description : </label>
              <textarea 
              onChange={(e)=>setSkillsDescription(e.target.value)}
              value={skillsDescription}
              name="Skills-description" 
              id="Skills-description" 
              className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
          </div>
          <div className="w-full h-[50px] rounded-2xl pl-[45px] pr-[20px] mt-8">
            <button onClick={handleAddSkills} className="w-full h-full  border hover:border-[#cbcddb] text-[#63666e] border-[#63666e] hover:text-[#cbcddb] font-bold transition-colors duration-500 cursor-pointer">Add Requirement & Continue with Another...</button>
          </div>
        </section>
        <div className="w-full h-[50px] rounded-2xl shrink-0 mt-8">
            <button className=" w-full h-full flex items-center justify-center p-0.5 overflow-hidden text-lg font-semibold tracking-widest cursor-pointer text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
              <span className=" w-full h-full transition-all flex items-center justify-center ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                Create A Job
              </span>
            </button>
        </div>
      </div>
    </div>
  )
}

export default CreateJobForm
