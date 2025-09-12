'use client'

import React,{ useEffect, useState } from "react"
import { ChevronDown } from "lucide-react";
import { JOB_TYPE, WORKPLACE_TYPE, IMPORTANCE_OPTIONS,EMPLOYMENT_LEVEL } from "@/Data/create-job";
import { toast } from "sonner";
import { domainType, interviewQAStateType, basicStateType } from "@/types/create-job";
import { createJob, createJobStatus, selectedOrg, selectedOrgId, setCreateJobStatus } from "@/redux/features/job";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { useRouter } from "next/navigation";
interface propType{
  requirement:domainType[],
  responsibilities:domainType[],
  skills:domainType[],
  interviewQA:interviewQAStateType[],
  basicState:basicStateType,
  setBasicState: React.Dispatch<React.SetStateAction<basicStateType>>,
  setRequirement: React.Dispatch<React.SetStateAction<domainType[]>>,
  setResponsibilities: React.Dispatch<React.SetStateAction<domainType[]>>,
  setSkills: React.Dispatch<React.SetStateAction<domainType[]>>,
  setInterviewQA: React.Dispatch<React.SetStateAction<interviewQAStateType[]>>,
}

const CreateJobForm = ({requirement, responsibilities, skills, basicState, setRequirement, setResponsibilities, setSkills, setBasicState, setInterviewQA, interviewQA}:propType) => {

  const dispatch = useAppDispatch()
  const router = useRouter()
  const currentCreateJobStatus = useAppSelector(createJobStatus)
  const currentSelectedOrgId:string = useAppSelector(selectedOrgId) as string
  const currentSelectedOrg = useAppSelector(selectedOrg);

  const [tabIndex, setTabIndex] = useState(1)
  const [isChecked, setIsChecked] = useState(false)

  const [requirementState, setRequirementState] = useState({
    isOpen: false,
    selectedType: 'optional',
    category: "",
    description: "",
  });

  const [responsibilityState, setResponsibilityState] = useState({
    isOpen: false,
    selectedType: 'optional',
    category: "",
    description: "",
  });

  const [skillState, setSkillState] = useState({
    isOpen: false,
    selectedType: 'optional',
    category: "",
    description: "",
  });
  
  const [interviewQAState, setInterviewQAState] = useState<interviewQAStateType>({
    question:'',
    referenceAnswer:''
  })


const [generatedQuestions, setGeneratedQuestions] = useState<interviewQAStateType[]>([])

  const [selected, setSelected] = useState<interviewQAStateType[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [loadingGenQuestions, setLoadingGenQuestions] = useState<'idle'|'pending'|'success'|'error'>('idle')

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected([])
    } else {
      setSelected(generatedQuestions)
    }
    setSelectAll(!selectAll)
  }

  const toggleSelection = (question: interviewQAStateType) => {
    if (selected.find((q) => q.question === question.question)) {
      setSelected(selected.filter((q) => q.question !== question.question))
    } else {
      setSelected([...selected, question])
    }
  }

  const handleAdd = () => {
    setInterviewQA([...interviewQA, ...selected])
    setGeneratedQuestions([])
    console.log("Added questions:", selected)
  }


  const updateRequirement = (field: string, value: string | boolean) => setRequirementState((prev) => ({ ...prev, [field]: value }));
  const updateResponsibility = (field: string, value: string | boolean) => setResponsibilityState((prev) => ({ ...prev, [field]: value }));
  const updateSkill = (field: string, value: string | boolean) => setSkillState((prev) => ({ ...prev, [field]: value }));
  const updateBasics = (field: string, value: string | boolean) => setBasicState((prev) => ({ ...prev, [field]: value }));
  const updateInterviewQA = (field:string, value:string) => setInterviewQAState((prev)=>({...prev, [field]:value}));

  const handleAddRequirement = ()=>{
    const {selectedType, description, category} = requirementState 
    if(!category) {
      toast.error('Please provide a category')
      return 
    }
    if(!description){
      toast.error('Please write description')
      return
    }
    setRequirement([...requirement,{type:selectedType,category,description}]);
    setRequirementState({
      isOpen: false,
      selectedType: 'optional',
      category: "",
      description: "",
    })
    toast.success('requirement is successfully added')
  }

  const handleAddResponsibilities =()=>{
    const {selectedType, description, category} = responsibilityState 
    if(!category) {
      toast.error('Please provide a category')
      return 
    }
    if(!description){
      toast.error('Please write description')
      return
    }
    setResponsibilities([...responsibilities,{type:selectedType,category,description}]);
    setResponsibilityState({
      isOpen: false,
      selectedType: 'optional',
      category: "",
      description: "",
    })
    toast.success('responsibility is successfully added')
  }

  const handleAddSkills = ()=>{
    const {selectedType, description, category} = skillState 
    if(!category) {
      toast.error('Please provide a category')
      return 
    }
    if(!description){
      toast.error('Please write description')
      return
    }
    setSkills([...skills,{type:selectedType,category,description}]);
    setSkillState({
      isOpen: false,
      selectedType: 'optional',
      category: "",
      description: "",
    })
    toast.success('skill is successfully added')
  }
  const validateJobBasic = ()=>{
    const {title,jobDescription,jobLocation,salaryFrom,salaryTo, deadline,jobType,workPlaceType,employmentLevelType}=basicState;
    if(!title) {
      toast.error('Please provide a title')
      return false;
    }
    if(!jobDescription){
      toast.error('Please write jobDescription')
      return false;
    }
    if(!jobLocation) {
      toast.error('Please provide a jobLocation')
      return false; 
    }
    if(!salaryFrom){
      toast.error('Please write salaryFrom')
      return false;
    }
    if(!salaryTo) {
      toast.error('Please provide a salaryTo')
      return false; 
    }
    if(!deadline){
      toast.error('Please write deadline')
      return false;
    }
    if(!jobType) {
      toast.error('Please provide a jobType')
      return false; 
    }
    if(!workPlaceType){
      toast.error('Please write workPlaceType')
      return false;
    }if(!employmentLevelType) {
      toast.error('Please provide a employmentLevelType')
      return false; 
    }
    return true;
  }
  const handleAddInterviewQA = ()=>{
    const {question, referenceAnswer}=interviewQAState;
    if(!question) {
      toast.error('Please provide a question')
      return 
    }
    setInterviewQA([...interviewQA, {...interviewQAState}])
    setInterviewQAState({
      question:'',
      referenceAnswer:''
    })
    toast.success('Question is successfully added')
  }

 const handleFetchQuestions = async (data: any) => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/job/generate/interview-questions",
      data,
      {withCredentials: true}
    );
    console.log(response.data);
    setLoadingGenQuestions("idle");

    let questions;

    if (typeof response.data.data === "string") {
      // backend sent JSON string → parse it
      questions = await JSON.parse(response.data.data);
    } else {
      // backend already sent parsed object
      questions = response.data.data;
    }

    return questions || []; // always return an array fallback

  } catch (error: any) {
    toast.error("Something went wrong!");
    setLoadingGenQuestions("idle");
    console.log(error, "question generation error");
    return []; // fallback ensures consistent return type
  }
};

const handleGenerateQuestions = async () => {
  const { jobDescription } = basicState;

  if (!jobDescription) {
    toast.error("Please write jobDescription");
    return;
  }

  const data = { jobDescription, requirements:requirement, responsibilities, skills };

  setLoadingGenQuestions("pending");

  const questions = await handleFetchQuestions(data);

  if (questions.length > 0) {
    setGeneratedQuestions(questions);
  } else {
    toast.error("No questions were generated. Try again!");
  }
};


  const handleCreateJob = async()=>{
    const companyInfo={
      id:currentSelectedOrgId
    } // will be fetched later from the recruiter profile ; no need to worry for now !
    const {title,jobDescription,jobLocation,salaryFrom,salaryTo, deadline,jobType,workPlaceType,employmentLevelType}=basicState;
    if(!validateJobBasic()) return;
    const basic = {title,jobDescription,jobLocation,salaryFrom,salaryTo, deadline,jobType,workPlaceType,employmentLevelType};
    const data = {
      companyInfo,
      basic,
      requirements:requirement,
      responsibilities:[...responsibilities],
      skills,
      interviewQA
    }
    console.log(data, 'job data before creation')
    await dispatch(createJob({organizationId:currentSelectedOrgId,data}))
  }

  useEffect(()=>console.log(requirement,'requirement'),[requirement])
  useEffect(()=>console.log(responsibilities,'responsibility'),[responsibilities])
  useEffect(()=>console.log(skills,'skills'),[skills])
  useEffect(()=>console.log(basicState, 'basics'))
  useEffect(()=>{
    if(currentCreateJobStatus==='error') {toast.error('something went wrong! please try again later..'); dispatch(setCreateJobStatus('idle'))}
    else if (currentCreateJobStatus==='success') {toast.success('Job successfully created !'); dispatch(setCreateJobStatus('idle')); router.push(`/workspace/jobs/${currentSelectedOrg?.organizationName}/my-jobs`)}    
  },[currentCreateJobStatus])
   return (
    <div className='w-full h-full  flex justify-center items-center '>
      <div className="w-full h-full flex flex-col justify-start items-start py-[40px] overflow-y-auto scrollbar-hidden text-gray-300 bg-slate-800/20 rounded-lg px-[20px] text-[12px] gap-[40px]">
        <section className="relative w-full h-[60px] shrink-0">
          <label htmlFor="job-title" className='absolute top-[-20%] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Job title : </label>
          <textarea 
          onChange={(e)=>updateBasics('title',e.target.value)}
          value={basicState.title}
          name="job-title" 
          id="job-title" 
          className='w-full h-full rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-gray-800 focus:border-[1px] border-gray-500 outline-none'>
          </textarea>
        </section>
        <section className="relative w-full h-[200px] shrink-0">
          <label htmlFor="job-description" className='absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Job description : </label>
          <textarea 
          onChange={(e)=>updateBasics('jobDescription',e.target.value)}
          value={basicState.jobDescription}
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
                  <button onClick={()=>updateBasics('isOpenJobType',!basicState.isOpenJobType)} className="w-full h-full flex justify-center items-center gap-2">
                    <p className="uppercase tracking-wider">{basicState.jobType}</p>
                    <ChevronDown className="w-[18px]"/>
                  </button>
                {
                  basicState.isOpenJobType?
                  JOB_TYPE.map((item,index)=><li 
                  key={index}
                  className={` left-0 z-10 w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                  style={{ top: `${index * 30+index*3 + 60}px` }}
                  onClick={()=>{updateBasics('jobType',item.value); updateBasics('isOpenJobType',!basicState.isOpenJobType)}}>{item.label}
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
              onChange={(e)=>updateBasics('salaryFrom',e.target.value)}
              value={basicState.salaryFrom}
              name="salary-from" 
              id="salary-from" 
              className='w-full h-[40px] shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
            <div className="w-[45%] h-full flex flex-col justify-start items-start gap-1 shrink-0">
              <label htmlFor="salary-to" className='font-semibold'>To : </label>
              <textarea 
              onChange={(e)=>updateBasics('salaryTo',e.target.value)}
              value={basicState.salaryTo}
              name="salary-to" 
              id="salary-to" 
              className='w-full h-[40px] shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
              </textarea>
            </div>
          </div>         
          <div className="w-[45%] shrink-0 h-[60px] self-end flex flex-col justify-start items-start gap-2">
            <label htmlFor="employment-level" className="font-semibold">Select employment level :</label>
            <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                <button onClick={()=>updateBasics('isOpenEmploymentLevelType',!basicState.isOpenEmploymentLevelType)} className="w-full h-full flex justify-center items-center gap-2">
                  <p className="uppercase tracking-wider">{basicState.employmentLevelType}</p>
                  <ChevronDown className="w-[18px]"/>
                </button>
              {
                basicState.isOpenEmploymentLevelType?
                EMPLOYMENT_LEVEL.map((item,index)=><li 
                key={index}
                className={` left-0 z-10 w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                style={{ top: `${index * 30+index*3 + 60}px` }}
                onClick={()=>{updateBasics('employmentLevelType',item.value); updateBasics('isOpenEmploymentLevelType',!basicState.isOpenEmploymentLevelType)}}>{item.label}
                </li>)
              :
                null
              }
            </ul>
          </div>
          <div className="w-[45%] h-[60px] flex flex-col justify-start items-start gap-1 shrink-0">
            <label htmlFor="job-location" className='font-semibold'>Location : </label>
            <textarea 
            onChange={(e)=>updateBasics('jobLocation',e.target.value)}
            value={basicState.jobLocation}
            name="job-location" 
            id="job-location" 
            className='w-full h-[40px] shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
            </textarea>
          </div>
          <div className="w-[45%] shrink-0 h-[60px] self-end flex flex-col justify-start items-start gap-2">
            <label htmlFor="employment-level" className="font-semibold">Select workplace :</label>
            <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                <button onClick={()=>updateBasics('isOpenWorkPlaceType',!basicState.isOpenWorkPlaceType)} className="w-full h-full flex justify-center items-center gap-2">
                  <p className="uppercase tracking-wider">{basicState.workPlaceType}</p>
                  <ChevronDown className="w-[18px]"/>
                </button>
              {
                basicState.isOpenWorkPlaceType?
                WORKPLACE_TYPE.map((item,index)=><li 
                key={index}
                className={` left-0 z-10 w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                style={{ top: `${index * 30+index*3 + 60}px` }}
                onClick={()=>{updateBasics('workPlaceType',item.value); updateBasics('isOpenWorkPlaceType',!basicState.isOpenWorkPlaceType)}}>{item.label}
                </li>)
              :
                null
              }
            </ul>
          </div>
          <div className="w-[45%] h-[60px] flex flex-col justify-start items-start gap-1 shrink-0">
            <label htmlFor="job-deadline" className="font-semibold">
              Deadline :
            </label>

            <input
              type="date"
              id="job-deadline"
              name="job-deadline"
              value={basicState.deadline}
              onChange={(e) => updateBasics("deadline", e.target.value)}
              className="w-full flex-1 shrink-0 rounded-sm p-2 bg-slate-800/30 shadow-md shadow-slate-800 
                        focus:border-[1px] border-gray-500 outline-none text-white text-[13px]"
            />
          </div>

        </section>
        <section className="w-full h-[60px] flex justify-center items-center gap-[20px] shrink-0">
              <button onClick={()=>setTabIndex(1)} className={`px-[20px] py-[8px] rounded-lg ${tabIndex===1?'bg-blue-400 text-white':'hover:text-blue-400'} border-gray-700 cursor-pointer font-semibold  border hover:border-blue-500`}>Requirements</button>
              <button onClick={()=>setTabIndex(3)} className={`px-[20px] py-[8px] rounded-lg ${tabIndex===3?'bg-blue-400 text-white':'hover:text-blue-400'} border-gray-700 cursor-pointer font-semibold  border hover:border-blue-500`}>Skills</button>
              <button onClick={()=>setTabIndex(2)} className={`px-[20px] py-[8px] rounded-lg ${tabIndex===2?'bg-blue-400 text-white':'hover:text-blue-400'} border-gray-700 cursor-pointer font-semibold  border hover:border-blue-500`}>Responsibilities</button>
        </section>
       {
        tabIndex ===1 ?
           <section className=" w-full h-auto shrink-0 flex flex-col justify-start items-start bg-slate-800/20 relative rounded-sm py-[30px]">
              <p className=' absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Requirements : </p>
              <div className=" pl-[50px] pr-[20px] w-full h-[70px] flex justify-between shrink-0">
                <div className="w-[50%] h-[70px] flex flex-col justify-start items-start gap-1">
                  <label htmlFor="requirement-category" className='font-semibold'>Category : </label>
                  <textarea 
                  onChange={(e)=>updateRequirement('category',e.target.value)}
                  value={requirementState.category}
                  name="requirement-category" 
                  id="requirement-category" 
                  className='w-full h-[45px] shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
                  </textarea>
                </div>
                <div className="w-[40%] h-full self-end flex flex-col justify-start items-start gap-2">
                  <label htmlFor="req-type" className="font-semibold">Select a requirement type :</label>
                  <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                      <button onClick={()=>updateRequirement('isOpen',!requirementState.isOpen)} className="w-full h-full flex justify-center items-center gap-2">
                        <p className="uppercase tracking-wider">{requirementState.selectedType}</p>
                        <ChevronDown className="w-[18px]"/>
                      </button>
                    {
                      requirementState.isOpen?
                      IMPORTANCE_OPTIONS.map((item,index)=><li 
                      key={index}
                      className={` left-0  w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                      style={{ top: `${index * 30+index*3+60}px` }}
                      onClick={()=>{updateRequirement('selectedType',item.value); updateRequirement('isOpen',!requirementState.isOpen)}}>{item.label}
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
                  onChange={(e)=>updateRequirement('description',e.target.value)}
                  value={requirementState.description}
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
        :null
       }
       {
        tabIndex===2?
            <section className=" w-full h-auto shrink-0 flex flex-col justify-start items-start bg-slate-800/20 relative  rounded-sm py-[30px]">
              <p className=' absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Responsibilities : </p>
              <div className=" pl-[50px] pr-[20px] w-full h-[70px] flex justify-between shrink-0">
                <div className="w-[50%] h-[70px] flex flex-col justify-start items-start gap-1">
                  <label htmlFor="Responsibilities-category" className='font-semibold'>Category : </label>
                  <textarea 
                  onChange={(e)=>updateResponsibility('category',e.target.value)}
                  value={responsibilityState.category}
                  name="Responsibilities-category" 
                  id="Responsibilities-category" 
                  className='w-full h-[45px] shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
                  </textarea>
                </div>
                <div className="w-[40%] h-full self-end flex flex-col justify-start items-start gap-2">
                  <label htmlFor="Responsibilities-type" className="font-semibold">Select a responsibility type :</label>
                  <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                      <button onClick={()=>updateResponsibility('isOpen',!responsibilityState.isOpen)} className="w-full h-full flex justify-center items-center gap-2">
                        <p className="uppercase tracking-wider">{responsibilityState.selectedType}</p>
                        <ChevronDown className="w-[18px]"/>
                      </button>
                    {
                      responsibilityState.isOpen?
                      IMPORTANCE_OPTIONS.map((item,index)=><li 
                      key={index}
                      className={` left-0  w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                      style={{ top: `${index * 30+index*3 + 60}px` }}
                      onClick={()=>{updateResponsibility('selectedType',item.value); updateResponsibility('isOpen',!responsibilityState.isOpen)}}>{item.label}
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
                    onChange={(e)=>updateResponsibility('description',e.target.value)}
                    value={responsibilityState.description}
                    className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
                  </textarea>
                </div>
              </div>
              <div className="w-full h-[50px] rounded-2xl pl-[45px] pr-[20px] mt-8">
                <button onClick={handleAddResponsibilities} className="w-full h-full hover:border-[#cbcddb] text-[#63666e] border border-[#63666e] hover:text-[#cbcddb] font-bold transition-colors duration-500 cursor-pointer">Add Responsibility & Continue with Another...</button>
              </div>
            </section>
        :null
       }
       {
        tabIndex===3?
            <section className=" w-full h-auto shrink-0 flex flex-col justify-start items-start bg-slate-800/20 relative  rounded-sm py-[30px]">
                <p className=' absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Skills : </p>
                <div className=" pl-[50px] pr-[20px] w-full h-[70px] flex justify-between shrink-0">
                  <div className="w-[50%] h-[70px] flex flex-col justify-start items-start gap-1">
                    <label htmlFor="Skills-category" className='font-semibold'>Category : </label>
                    <textarea 
                    onChange={(e)=>updateSkill('category',e.target.value)}
                    value={skillState.category}
                    name="Skills-category" 
                    id="Skills-category" 
                    className='w-full h-[45px] shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
                    </textarea>
                  </div>
                  <div className="w-[40%] h-full self-end flex flex-col justify-start items-start gap-2">
                    <label htmlFor="Skills-type" className="font-semibold">Select a skill type :</label>
                    <ul  className="w-full flex-1 shrink-0 relative bg-slate-800/30 shadow-md scroll-container shadow-slate-800 outline-none items-center gap-1 focus:border border-gray-400 rounded-sm">
                        <button onClick={()=>updateSkill('isOpen',!skillState.isOpen)} className="w-full h-full flex justify-center items-center gap-2">
                          <p className="uppercase tracking-wider">{skillState.selectedType}</p>
                          <ChevronDown className="w-[18px]"/>
                        </button>
                      {
                        skillState.isOpen?
                        IMPORTANCE_OPTIONS.map((item,index)=><li 
                        key={index}
                        className={` left-0  w-full h-[30px] bg-slate-300 text-gray-950 absolute pl-[20px] rounded-sm cursor-pointer hover:bg-white flex items-center`}
                        style={{ top: `${index * 30+index*3 + 60}px` }}
                        onClick={()=>{updateSkill('selectedType',item.value); updateSkill('isOpen',!skillState.isOpen)}}>{item.label}
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
                    onChange={(e)=>updateSkill('description',e.target.value)}
                    value={skillState.description}
                    name="Skills-description" 
                    id="Skills-description" 
                    className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
                    </textarea>
                  </div>
                </div>
                <div className="w-full h-[50px] rounded-2xl pl-[45px] pr-[20px] mt-8">
                  <button onClick={handleAddSkills} className="w-full h-full  border hover:border-[#cbcddb] text-[#63666e] border-[#63666e] hover:text-[#cbcddb] font-bold transition-colors duration-500 cursor-pointer">Add Skill & Continue with Another...</button>
                </div>
              </section>
        :null
       }
       <div className="w-full h-[50px] flex justify-start items-end gap-2">
        <input  onChange={()=>setIsChecked((prev)=>!prev)} checked={isChecked} type="checkbox"  />
        <label onClick={()=>setIsChecked((prev)=>!prev)}  className="text-white underline cursor-pointer">Check this if you want the AI Powered interview for your job position?</label>
       </div>
       {
        isChecked?
          <>
           {
            !generatedQuestions.length?
              <section className="w-full h-auto py-[50px] flex flex-col items-center justify-center text-center px-6 bg-slate-800/20 rounded-2xl">
                <div className="max-w-3xl">
                  <h1 className="text-2xl font-semibold text-gray-300 mb-4">
                    AI-Generated Interview Questions
                  </h1>

                  <ul className="text-xs text-gray-400 leading-relaxed mb-6 space-y-2 list-disc list-inside text-left mx-auto max-w-md">
                    <li>Generate tailored interview questions based on the job description</li>
                    <li>Include required skills and competencies</li>
                    <li>Cover responsibilities and role expectations</li>
                    <li>Build structured and professional assessments with ease</li>
                  </ul>

                  <div className="flex justify-center gap-4">
                    <button disabled={loadingGenQuestions==='pending'?true:false} onClick={handleGenerateQuestions} className="w-full py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600 transition">
                      {
                        loadingGenQuestions==='pending'?<><ClipLoader size={14} color="white"/> Generate Questions</>:'Generate Questions'
                      }
                    </button>
                  </div>
                </div>
              </section>
            :
            <section className="w-full pl-[45px] pr-[20px] mx-auto py-[50px] bg-slate-800/20">
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">Generated Questions</h2>

              {/* Select All */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="selectAll" className="text-sm text-gray-300">
                  Select All
                </label>
              </div>

              {/* Questions List */}
              <ul className="space-y-3 border border-gray-700 rounded-lg p-4">
                {generatedQuestions?.map((q, idx) => (
                  <li key={idx} className="flex flex-col">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!!selected.find((sel) => sel.question === q.question)}
                        onChange={() => toggleSelection(q)}
                        className="mr-3 h-4 w-4"
                      />
                      <span className="text-sm text-gray-300">{q.question}</span>
                    </div>
                    <span className="text-xs text-gray-400 italic ml-7 mt-1">
                      Ref: {q.referenceAnswer || null}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Buttons */}
              <div className="flex justify-center gap-2 mt-6">
                <button
                  disabled={loadingGenQuestions==='pending'?true:false}
                  onClick={handleGenerateQuestions}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition bg-gray-700 text-white hover:bg-gray-600"
                >
                  {
                        loadingGenQuestions==='pending'?<><ClipLoader size={14} color="white"/> Regenerate Questions</>:'Regenerate Questions'
                      }
                </button>
                <button
                  onClick={handleAdd}
                  disabled={selected.length === 0}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    selected.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  Add Selected
                </button>
              </div>
            </section>
           }
          <section className="w-full flex justify-center items-center px-[10%]">
            <div className="flex-1 h-[1px] bg-gray-700"></div>
            <p className="text-xl m-3">Or</p>
            <div className="flex-1 h-[1px] bg-gray-700"></div>
          </section>
          <section className=" w-full h-auto shrink-0 flex flex-col justify-start items-start bg-slate-800/20 relative  rounded-sm py-[30px]">
                <p className=' absolute top-[-14px] left-4 px-2 py-1 font-bold bg-gray-800/80 rounded-2xl'>Interview Q&A : </p>
                <div className="w-full h-auto flex flex-col gap-4 pl-[45px] pr-[20px] mt-6 shrink-0">
                  <div className="w-full h-[100px]  flex flex-col justify-start items-start gap-1">
                    <label htmlFor="question" className='font-semibold'>Question : </label>
                    <textarea 
                    onChange={(e)=>updateInterviewQA('question',e.target.value)}
                    value={interviewQAState.question}
                    name="question" 
                    id="question" 
                    className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
                    </textarea>
                  </div>
                  <div className="w-full h-[100px]  flex flex-col justify-start items-start gap-1">
                    <label htmlFor="answer" className='font-semibold'>Reference answer (optional): </label>
                    <textarea 
                    onChange={(e)=>updateInterviewQA('referenceAnswer', e.target.value)}
                    value={interviewQAState.referenceAnswer}
                    name="answer" 
                    id="answer" 
                    className='w-full flex-1 shrink-0 rounded-sm p-2 pt-3 bg-slate-800/30 shadow-md scroll-container shadow-slate-800 focus:border-[1px] border-gray-500 outline-none'>
                    </textarea>
                  </div>
                </div>
                <div className="w-full h-[50px] rounded-2xl pl-[45px] pr-[20px] mt-8">
                  <button onClick={handleAddInterviewQA} className="w-full h-full  border hover:border-[#cbcddb] text-[#63666e] border-[#63666e] hover:text-[#cbcddb] font-bold transition-colors duration-500 cursor-pointer">Add a Question & Continue with Another...</button>
                </div>
          </section>
          </>
        :null
       }
        <div className="w-full h-[50px] rounded-2xl shrink-0 mt-8">
            <button disabled={currentCreateJobStatus==='pending'?true:false} onClick={handleCreateJob} className={` w-full h-full flex items-center justify-center p-0.5 overflow-hidden text-lg font-semibold tracking-widest cursor-pointer text-gray-900 rounded-lg group ${currentCreateJobStatus==='pending'?'bg-transparent':'bg-gradient-to-br'}  from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800`}>
              <span className={` w-full h-full transition-all flex items-center justify-center ease-in duration-75 ${currentCreateJobStatus==='pending'?'bg-gray-600 text-gray-300 rounded-lg':'bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent'}`}>
                Create A Job
              </span>
            </button>
        </div>
      </div>
    </div>
  )
}

export default CreateJobForm
