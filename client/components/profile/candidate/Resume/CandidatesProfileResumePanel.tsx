'use client'
import { useEffect, useState } from "react";
import { Briefcase, GraduationCap, Award, Code, Link as LinkIcon ,  X,  Edit3,  Plus, Trash2, Tag, Save } from "lucide-react";
import Skills from "./Skills";
import Experience from "./Experience";
import Education  from "./Education";
import Projects from "./Projects";
import Certifications from "./Certifications";
import Awards from "./Awards";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { analyzedUserResume, saveAnalyzedResume, saveUserResumeStatus, updateUserData, user, userBasicInfoUpdateStatus } from "@/redux/features/auth";

import { ResumeResponse } from "@/Data/resume_response";
import { ClipLoader } from "react-spinners";

interface Skills  {
  technical?: string[]
  soft?: string[]
  languages?: string[]
  tools?: string[]
  other?: string[]
}

interface Experience  {
  job_title: string
  company: string
  duration: string
  description?: string[]
  achievements?: string[]
}

interface Education {
  degree: string
  institution: string
  year: string
  gpa?: string
}

interface Project {
  title: string
  description: string
  technologies?: string[]
  url?: string
}

type Certification = {
  title: string
  provider: string
  date: string
  link?: string
}

type Award = {
  title: string
  organization: string
  year: string
  description?: string
}

const CandidatesProfileResumePanel = ({isPreview}:{isPreview:boolean}) => {
    const [editExperience, setExperience] = useState<Experience[]>([])
    const [editEducation, setEducation] = useState<Education[]>([])
    const [editedProjects, setProjects] = useState<Project[]>([])
    const [certs, setCerts] = useState<Certification[]>([])
    const [editedAwards, setAwards] = useState<Award[]>([])
    const [editSkills, setSkills] = useState<Skills>({})

    const dispatch = useAppDispatch()

    const currentUserDataUpdateStatus = useAppSelector(userBasicInfoUpdateStatus)
    const currentAnalyzedUserResume = useAppSelector(analyzedUserResume);
    const currentSaveUserResumeStatus = useAppSelector(saveUserResumeStatus);
    const currentUser = useAppSelector(user)


    const handleSaveChanges = ()=>{
      const resumeData = {...currentUser.resumeData, experience:editExperience, education:editEducation, skills:editSkills, projects:editedProjects,awards:editedAwards,certifications:certs};
      console.log(resumeData, 'resumeData')
      dispatch(saveAnalyzedResume(resumeData))
    }


    const handleSaveResumeToProfile =()=>{
      const resumeData = {...currentAnalyzedUserResume, experience:editExperience, education:editEducation, skills:editSkills, projects:editedProjects,awards:editedAwards,certifications:certs};
      console.log(resumeData, 'resumeData')
      dispatch(saveAnalyzedResume(resumeData))
    }
  useEffect(()=>{
    if(currentAnalyzedUserResume && isPreview){
      console.log(currentAnalyzedUserResume, 'cuurent analyzed resume inside useEffect')
      setExperience(currentAnalyzedUserResume?.experience)
      setEducation(currentAnalyzedUserResume?.education)
      setSkills(currentAnalyzedUserResume?.skills)
      setProjects(currentAnalyzedUserResume?.projects)
      setAwards(currentAnalyzedUserResume?.awards)
      setCerts(currentAnalyzedUserResume?.certifications);
      return;
    }
    else{
      setExperience(currentUser?.resumeData?.experience)
      setEducation(currentUser?.resumeData?.education)
      setSkills(currentUser?.resumeData?.skills)
      setProjects(currentUser?.resumeData?.projects)
      setAwards(currentUser?.resumeData?.awards)
      setCerts(currentUser?.resumeData?.certifications)
    }
  },[currentAnalyzedUserResume])
  return (
    <div className={`w-full h-auto overflow-y-scroll scroll-container relative pl-[7%] bg-slate-900 text-gray-100 p-6 space-y-8`}>
      {
        !isPreview?
        <div className=" flex gap-1 absolute top-2 right-2 ">
          <button onClick={handleSaveChanges} disabled={currentUserDataUpdateStatus==='pending'?true:false} className="flex justify-center">
            {
              currentUserDataUpdateStatus==='pending'?
                <div className="flex items-center gap-2">
                  <ClipLoader size={17} color="white"/> Saving..
                </div>
              :<div>
                <div className="relative group">
                  <p className="px-3 w-[100px] text-center py-1 text-xs bg-gray-700 text-gray-300 rounded-sm   top-[110%] right-0 absolute hidden group-hover:flex">Save Changes</p>
                  <Save size={20} className="text-gray-400"/> 
                </div>
              </div>
            }
          </button>
        </div>
        
        :null
      }
      {/* Experience */}
      <Experience editExperience={editExperience} setExperience={setExperience}  />
      {/* Education */}
      <Education editEducation={editEducation} setEducation={setEducation} />
      {/* Projects */}
      <Projects editedProjects={editedProjects} setProjects={setProjects}/>
      {/* Certifications */}
      <Certifications certs={certs} setCerts={setCerts}/>
      {/* Awards */}
      <Awards editedAwards={editedAwards} setAwards={setAwards}/>
      {/* Skills */}
      <Skills editSkills={editSkills} setSkills={setSkills}/>
      {currentAnalyzedUserResume ? <div className="w-full flex gap-1">
          <button onClick={handleSaveResumeToProfile} disabled={currentSaveUserResumeStatus==='pending'?true:false} className="flex-1 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-md text-white flex justify-center">
            {
              currentSaveUserResumeStatus==='pending'?
                <div className="flex items-center gap-2">
                  <ClipLoader size={17} color="white"/> Saving to your profile ..
                </div>
              :'Add to my profile'
            }
          </button>
          <button className="flex-1 py-1 rounded-lg bg-gray-700 hover:bg-gray-800 text-md text-white flex justify-center">reset</button>
        </div>:null}
    </div>
  );
}


export default CandidatesProfileResumePanel;