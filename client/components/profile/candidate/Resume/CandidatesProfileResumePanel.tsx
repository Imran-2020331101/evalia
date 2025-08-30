'use client'
import { useEffect, useState } from "react";
import { Briefcase, GraduationCap, Award, Code, Link as LinkIcon ,  X,  Edit3,  Plus, Trash2, Tag } from "lucide-react";
import Skills from "./Skills";
import Experience from "./Experience";
import Education  from "./Education";
import Projects from "./Projects";
import Certifications from "./Certifications";
import Awards from "./Awards";
import { useAppSelector } from "@/redux/lib/hooks";
import { analyzedUserResume } from "@/redux/features/auth";

import { ResumeResponse } from "@/Data/resume_response";

export const dummyCandidateData = {
  skills: {
    technical: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "REST APIs"],
    soft: ["Problem-Solving", "Team Leadership", "Time Management", "Communication"],
    languages: ["English", "Spanish", "German"],
    tools: ["Git", "Docker", "Jest", "Figma"],
    other: ["Agile Methodologies", "SCRUM"],
  },
  experience: [
    {
      job_title: "Senior Frontend Developer",
      company: "TechNova Solutions",
      duration: "Jan 2021 – Present",
      description: [
        "Led the migration of a legacy Angular app to Next.js.",
        "Collaborated with backend team to design RESTful APIs.",
        "Implemented reusable component library in TypeScript."
      ],
      achievements: [
        "Improved page load speed by 45%",
        "Mentored 4 junior developers"
      ]
    },
    {
      job_title: "Frontend Developer",
      company: "WebCraft Agency",
      duration: "Jun 2018 – Dec 2020",
      description: [
        "Built custom WordPress themes and React applications.",
        "Worked closely with designers to translate UI/UX wireframes into responsive web apps."
      ],
      achievements: [
        "Completed 30+ client projects on time",
        "Increased client retention by 20%"
      ]
    }
  ],
  education: [
    {
      degree: "B.Sc. in Computer Science",
      institution: "University of California, Berkeley",
      year: "2018",
      gpa: "3.9"
    }
  ],
  projects: [
    {
      title: "AI Resume Analyzer",
      description: "A web app that uses NLP to analyze resumes and suggest improvements.",
      technologies: ["Next.js", "Node.js", "OpenAI API"],
      url: "https://github.com/example/ai-resume-analyzer"
    },
    {
      title: "E-commerce Platform",
      description: "Built a scalable e-commerce solution with custom CMS.",
      technologies: ["React", "Redux", "Express", "MongoDB"]
    }
  ],
  certifications: [
    {
      title: "AWS Certified Solutions Architect – Associate",
      provider: "Amazon Web Services",
      date: "2023",
      link: "https://aws.amazon.com/certification/"
    },
    {
      title: "Scrum Master Certified (SMC)",
      provider: "Scrum Alliance",
      date: "2022",
      link: "https://www.scrumalliance.org/"
    }
  ],
  awards: [
    {
      title: "Employee of the Year",
      organization: "TechNova Solutions",
      year: "2022",
      description: "Recognized for outstanding project delivery and leadership."
    },
    {
      title: "Innovation Award",
      organization: "WebCraft Agency",
      year: "2019",
      description: "Awarded for creating a proprietary page builder tool."
    }
  ]
};


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


type CandidateProfileProps = {
  skills?: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
    tools?: string[];
    other?: string[];
  };
  experience?: Array<{
    job_title: string;
    company: string;
    duration: string;
    description?: string[];
    achievements?: string[];
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  certifications?: Array<{
    title: string;
    provider: string;
    date: string;
    link?: string;
  }>;
  awards?: Array<{
    title: string;
    organization: string;
    year: string;
    description?: string;
  }>;
};


const CandidatesProfileResumePanel = ({isPreview}:{isPreview:boolean}) => {
    const {skills,experience,education,projects,certifications,awards}=dummyCandidateData
    const [editExperience, setExperience] = useState<Experience[]>([])
    const [editEducation, setEducation] = useState<Education[]>([])
    const [editedProjects, setProjects] = useState<Project[]>([])
    const [certs, setCerts] = useState<Certification[]>([])
    const [editedAwards, setAwards] = useState<Award[]>([])
    const [editSkills, setSkills] = useState<Skills>({})

    const currentAnalyzedUserResume = useAppSelector(analyzedUserResume);
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
  },[currentAnalyzedUserResume])
  return (
    <div className={`w-full h-auto overflow-y-scroll scroll-container pl-[7%] bg-slate-900 text-gray-100 p-6 space-y-8`}>
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
      {currentAnalyzedUserResume && <div className="w-full flex gap-1">
          <button className="flex-1 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-md text-white flex justify-center">Add to my profile</button>
          <button className="flex-1 py-1 rounded-lg bg-gray-700 hover:bg-gray-800 text-md text-white flex justify-center">reset</button>
        </div>}
    </div>
  );
}


export default CandidatesProfileResumePanel;