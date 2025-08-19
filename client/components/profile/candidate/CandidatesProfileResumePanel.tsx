'use client'
import { useState } from "react";
import { Briefcase, GraduationCap, Award, Code, Link as LinkIcon ,  X,  Edit3,  Plus, Trash2, Tag } from "lucide-react";

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


const CandidatesProfileResumePanel = () => {
    const {skills,experience,education,projects,certifications,awards}=dummyCandidateData

    //skills section 
    const [isEditSkills, setIsEditSkills] = useState<boolean>(false);
    const [editSkills, setSkills] = useState<Skills>(skills || {})
    const [newSkill, setNewSkill] = useState<{ type: keyof Skills; value: string }>({
        type: "technical",
        value: "",
    })

    const handleEditSkills = ()=>{
        setIsEditSkills(true)
    }
    const handleAdd = () => {
        if (!newSkill.value.trim()) return
        setSkills((prev) => ({
        ...prev,
        [newSkill.type]: [...(prev[newSkill.type] || []), newSkill.value.trim()],
        }))
        setNewSkill({ ...newSkill, value: "" })
    }

    const handleDelete = (type: keyof Skills, idx: number) => {
        setSkills((prev) => ({
        ...prev,
        [type]: prev[type]?.filter((_, i) => i !== idx),
        }))
    }

    const handleSkillsSave = () => {
        console.log(editSkills, 'edit skills')
        setIsEditSkills(false)
    }

    const categories: { key: keyof Skills; label: string; color: string }[] = [
        { key: "technical", label: "Technical", color: "bg-blue-800/40" },
        { key: "soft", label: "Soft Skills", color: "bg-blue-800/40" },
        { key: "languages", label: "Languages", color: "bg-blue-800/40" },
        { key: "tools", label: "Tools & Frameworks", color: "bg-blue-800/40" },
        { key: "other", label: "Other", color: "bg-gray-700" },
    ]


    // experience section 
    const [isEditExperience , setIsEditExperience] = useState<boolean>(false)
    const [editExperience, setExperience] = useState<Experience[]>(experience || [])

    const handleEditExperience = () =>{
        setIsEditExperience(true);
    }
    const handleAddExperience = () => {
        setExperience([
        ...editExperience,
        { job_title: "", company: "", duration: "", description: [], achievements: [] },
        ])
    }

    const handleRemoveExperience = (idx: number) => {
        setExperience(editExperience.filter((_, i) => i !== idx))
    }

    const handleChange = (idx: number, field: keyof Experience, value: string) => {
        const updated = [...editExperience]
        updated[idx] = { ...updated[idx], [field]: value }
        setExperience(updated)
    }

    const handleArrayChange = (
        idx: number,
        field: "description" | "achievements",
        value: string,
        subIdx?: number
    ) => {
        const updated = [...editExperience]
        if (subIdx !== undefined) {
        updated[idx][field]![subIdx] = value
        } else {
        updated[idx][field] = [...(updated[idx][field] || []), value]
        }
        setExperience(updated)
    }

    const handleRemoveArrayItem = (
        idx: number,
        field: "description" | "achievements",
        subIdx: number
    ) => {
        const updated = [...editExperience]
        updated[idx][field] = updated[idx][field]?.filter((_, i) => i !== subIdx)
        setExperience(updated)
    }

    const handleExperienceSave = () => {
        console.log(editExperience, 'edit experience')
        setIsEditExperience(false)
    }


    //Education 
    const[isEditEducation, setIsEditEducation]=useState<boolean>(false)
    const [editEducation, setEducation] = useState<Education[]>(education)

    const handleEditEducation = ()=>{
        setIsEditEducation(true);
    }
    const handleEditEducationChange = (index: number, field: keyof Education, value: string) => {
        const newEducation = [...editEducation]
        newEducation[index][field] = value
        setEducation(newEducation)
    }

    const addEducation = () => {
        setEducation([...editEducation, { degree: "", institution: "", year: "", gpa: "" }])
    }

    const removeEducation = (index: number) => {
        setEducation(editEducation.filter((_, i) => i !== index))
    }

    const handleEducationSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Submitted Education:", editEducation)
        setIsEditEducation(false)
    }


    // projects
    const [isEditProjects, setIsEditProjects]=useState<boolean>(false)
    const [editedProjects, setProjects] = useState<Project[]>(projects || [])

    const handleEditProjects = ()=>{
        setIsEditProjects(true)
    }
    const handleAddProject = () => {
        setProjects([
        ...editedProjects,
        { title: "", description: "", technologies: [], url: "" },
        ])
    }

    const handleRemoveProject = (idx: number) => {
        setProjects(editedProjects.filter((_, i) => i !== idx))
    }

    const handleEditedProjectChange = (idx: number, field: keyof Project, value: string) => {
        const updated = [...editedProjects]
        updated[idx] = { ...updated[idx], [field]: value }
        setProjects(updated)
    }

    const handleTechChange = (idx: number, value: string, subIdx?: number) => {
        const updated = [...editedProjects]
        const techs = updated[idx].technologies ? [...updated[idx].technologies!] : []

        if (subIdx !== undefined) {
        techs[subIdx] = value
        } else {
        techs.push(value)
        }

        updated[idx] = { ...updated[idx], technologies: techs }
        setProjects(updated)
    }

    const handleRemoveTech = (idx: number, subIdx: number) => {
        const updated = [...editedProjects]
        updated[idx].technologies = updated[idx].technologies?.filter((_, i) => i !== subIdx)
        setProjects(updated)
    }

    const handleEditedProjectSave = () => {
        // Basic cleanup: remove empty tech strings and trim fields
        const cleaned = editedProjects.map((p) => ({
        title: p.title.trim(),
        description: p.description.trim(),
        url: p.url?.trim() || undefined,
        technologies: p.technologies?.map((t) => t.trim()).filter(Boolean),
        }))
        setIsEditProjects(false)
        console.log(cleaned)
        // onSave(cleaned)
    }

    //certifications 

    const [isEditCertifications, setIsEditCertifications] = useState<boolean>(false)
    const [certs, setCerts] = useState<Certification[]>(certifications || [])

    const handleEditCertifications  = ()=>{
      setIsEditCertifications(true)
    }
    const handleAddEditedCertifications = () => {
      setCerts([...certs, { title: "", provider: "", date: "", link: "" }])
    }

    const handleRemoveEditedCertifications = (idx: number) => {
      setCerts(certs.filter((_, i) => i !== idx))
    }

    const handleChangeEditedCertifications = (idx: number, field: keyof Certification, value: string) => {
      const updated = [...certs]
      updated[idx] = { ...updated[idx], [field]: value }
      setCerts(updated)
    }

    const handleSaveEditedCertifications = () => {
      const cleaned = certs.map((c) => ({
        title: c.title.trim(),
        provider: c.provider.trim(),
        date: c.date.trim(),
        link: c.link?.trim() || undefined,
      }))
      console.log(cleaned)
      setIsEditCertifications(false)
    }



    // Awards 
     const [isEditAwards, setIsEditAwards]=useState<boolean>(false)
     const [editedAwards, setAwards] = useState<Award[]>(awards || [])


      const handleEditedAwards = ()=>{
        setIsEditAwards(true)
      }
      const handleAddEditedAwards = () => {
        setAwards([...editedAwards, { title: "", organization: "", year: "", description: "" }])
      }

      const handleRemoveEditedAwards = (idx: number) => {
        setAwards(editedAwards.filter((_, i) => i !== idx))
      }

      const handleChangeEditedAwards = (idx: number, field: keyof Award, value: string) => {
        const updated = [...editedAwards]
        updated[idx] = { ...updated[idx], [field]: value }
        setAwards(updated)
      }

      const handleSaveEditedAwards = () => {
        const cleaned = editedAwards.map((a) => ({
          title: a.title.trim(),
          organization: a.organization.trim(),
          year: a.year.trim(),
          description: a.description?.trim() || undefined
        }))
        console.log(cleaned)
        setIsEditAwards(false)
      }

  return (
    <div className={`w-full min-h-full overflow-y-scroll scroll-container pl-[7%] bg-slate-900 text-gray-100 p-6 space-y-8`}>
      
      {/* Skills */}
      {!isEditSkills && skills && Object.values(skills).some(arr => arr && arr.length > 0) && (
        <section>
          <div className="flex gap-2">
            <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2  w-full">
                <Code size={18} /> Skills <button onClick={handleEditSkills} className="cursor-pointer ">
                                                <Edit3 className="size-5 "/>
                                            </button>
            </h2>
            
          </div>
          <div className="space-y-3">
            {skills.technical?.length ? (
              <div>
                <p className="font-medium text-gray-300">Technical</p>
                <div className="flex flex-wrap gap-2">
                  {skills.technical.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {skills.soft?.length ? (
              <div>
                <p className="font-medium text-gray-300">Soft Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skills.soft.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {skills.languages?.length ? (
              <div>
                <p className="font-medium text-gray-300">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {skills.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{lang}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {skills.tools?.length ? (
              <div>
                <p className="font-medium text-gray-300">Tools & Frameworks</p>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((tool, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{tool}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {skills.other?.length ? (
              <div>
                <p className="font-medium text-gray-300">Other</p>
                <div className="flex flex-wrap gap-2">
                  {skills.other.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-700 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {
        isEditSkills && <section className="w-full h-auto">
            <div className="py-6 bg-gray-900 rounded-xl shadow-lg">
            <div className="flex justify-start w-full mb-4 border-b-[1px] border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Edit Skills</h2>
            </div>

            {/* Existing skills */}
            <div className="space-y-4 mb-6">
                {categories.map(({ key, label, color }) =>
                editSkills[key]?.length ? (
                    <div key={key}>
                    <p className="font-medium text-gray-300 mb-1">{label}</p>
                    <div className="flex flex-wrap gap-2">
                        {editSkills[key]!.map((skill, idx) => (
                        <span
                            key={idx}
                            className={`px-3 py-1 ${color} rounded-full text-sm flex items-center gap-2`}
                        >
                            {skill}
                            <button
                            onClick={() => handleDelete(key, idx)}
                            className="text-red-400 hover:text-red-600"
                            >
                            <X className="w-3 h-3" />
                            </button>
                        </span>
                        ))}
                    </div>
                    </div>
                ) : null
                )}
            </div>

            {/* Add new skill */}
            <div className="flex items-center gap-2 mb-6">
                <select
                className="border border-gray-600 rounded px-2 py-1 bg-gray-800 text-gray-200"
                value={newSkill.type}
                onChange={(e) => setNewSkill({ ...newSkill, type: e.target.value as keyof Skills })}
                >
                {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                    {c.label}
                    </option>
                ))}
                </select>

                <input
                type="text"
                placeholder="Enter new skill"
                className="flex-1 border border-gray-600 rounded px-3 py-1 bg-gray-800 text-gray-200"
                value={newSkill.value}
                onChange={(e) => setNewSkill({ ...newSkill, value: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />

                <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                <Plus className="w-4 h-4" /> Add
                </button>
            </div>

            <div className="flex justify-end">
                <button
                onClick={handleSkillsSave}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                Save Changes
                </button>
            </div>
            </div>
      </section>
      }

      {/* Experience */}
      { !isEditExperience && experience?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Briefcase size={18} /> Experience  <button onClick={handleEditExperience} className="cursor-pointer"><Edit3 className="size-5"/></button>
          </h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <p className="font-medium text-white">{exp.job_title}</p>
              <p className="text-sm text-blue-400">{exp.company}</p>
              <p className="text-xs text-gray-400">{exp.duration}</p>
              {exp.description?.length ? (
                <ul className="list-disc list-inside text-sm text-gray-300 mt-1 space-y-1">
                  {exp.description.map((desc, i) => <li key={i}>{desc}</li>)}
                </ul>
              ) : null}
              {exp.achievements?.length ? (
                <ul className="list-disc list-inside text-sm text-green-400 mt-1 space-y-1">
                  {exp.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}
      {
        isEditExperience && <section className="w-full h-auto">
            <div className="py-6 bg-gray-900 rounded-xl shadow-lg">
            <div className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase size={18} /> Edit Experience 
            </div>

            {editExperience.map((exp, idx) => (
                <div key={idx} className="border border-gray-700 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-300 font-medium">Experience {idx + 1}</p>
                    <button
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-red-400 hover:text-red-600"
                    >
                    <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Job Title */}
                <input
                    type="text"
                    placeholder="Job Title"
                    className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                    value={exp.job_title}
                    onChange={(e) => handleChange(idx, "job_title", e.target.value)}
                />

                {/* Company */}
                <input
                    type="text"
                    placeholder="Company"
                    className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                    value={exp.company}
                    onChange={(e) => handleChange(idx, "company", e.target.value)}
                />

                {/* Duration */}
                <input
                    type="text"
                    placeholder="Duration (e.g., Jan 2020 - Present)"
                    className="w-full mb-3 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                    value={exp.duration}
                    onChange={(e) => handleChange(idx, "duration", e.target.value)}
                />

                {/* Descriptions */}
                <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-1">Descriptions</p>
                    {exp.description?.map((desc:any, dIdx:any) => (
                    <div key={dIdx} className="flex items-center gap-2 mb-2">
                        <input
                        type="text"
                        className="flex-1 px-3 py-1 rounded bg-gray-800 border border-gray-600 text-gray-200"
                        value={desc}
                        onChange={(e) =>
                            handleArrayChange(idx, "description", e.target.value, dIdx)
                        }
                        />
                        <button
                        onClick={() => handleRemoveArrayItem(idx, "description", dIdx)}
                        className="text-red-400 hover:text-red-600"
                        >
                        <X className="w-4 h-4" />
                        </button>
                    </div>
                    ))}
                    <button
                    onClick={() => handleArrayChange(idx, "description", "")}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-600 text-sm"
                    >
                    <Plus className="w-4 h-4" /> Add Description
                    </button>
                </div>

                {/* Achievements */}
                <div>
                    <p className="text-sm text-gray-400 mb-1">Achievements</p>
                    {exp.achievements?.map((ach:any, aIdx:any) => (
                    <div key={aIdx} className="flex items-center gap-2 mb-2">
                        <input
                        type="text"
                        className="flex-1 px-3 py-1 rounded bg-gray-800 border border-gray-600 text-gray-200"
                        value={ach}
                        onChange={(e) =>
                            handleArrayChange(idx, "achievements", e.target.value, aIdx)
                        }
                        />
                        <button
                        onClick={() => handleRemoveArrayItem(idx, "achievements", aIdx)}
                        className="text-red-400 hover:text-red-600"
                        >
                        <X className="w-4 h-4" />
                        </button>
                    </div>
                    ))}
                    <button
                    onClick={() => handleArrayChange(idx, "achievements", "")}
                    className="flex items-center gap-1 text-green-400 hover:text-green-600 text-sm"
                    >
                    <Plus className="w-4 h-4" /> Add Achievement
                    </button>
                </div>
                </div>
            ))}

            <button
                onClick={handleAddExperience}
                className="w-full py-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" /> Add New Experience
            </button>

            <div className="flex justify-end">
                <button
                onClick={handleExperienceSave}
                className="py-2 w-full bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                Save Changes
                </button>
            </div>
            </div>
        </section>
      }
      {/* Education */}
      {!isEditEducation && education?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <GraduationCap size={18} /> Education <button onClick={handleEditEducation} className="cursor-pointer"><Edit3 className="size-5"/></button>
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <p className="font-medium text-white">{edu.degree}</p>
              <p className="text-sm text-green-400">{edu.institution}</p>
              <p className="text-xs text-gray-400">{edu.year} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</p>
            </div>
          ))}
        </section>
      ) : null}
      {
        isEditEducation && <section className="w-full h-auto">
            <form onSubmit={handleEducationSubmit} className="bg-gray-900 py-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4 flex items-center gap-2">
                <GraduationCap size={18} /> Education
            </h2>

            {editEducation.map((edu, idx) => (
                <div key={idx} className="border border-gray-700 p-4 rounded-xl mb-4 relative">
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <input
                    type="text"
                    placeholder="Degree (e.g., B.Sc in CSE)"
                    value={edu.degree}
                    onChange={(e) => handleEditEducationChange(idx, "degree", e.target.value)}
                    className="p-2 rounded bg-gray-800 text-white border border-gray-700 w-full"
                    />
                    <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => handleEditEducationChange(idx, "institution", e.target.value)}
                    className="p-2 rounded bg-gray-800 text-white border border-gray-700 w-full"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input
                    type="text"
                    placeholder="Year (e.g., 2024)"
                    value={edu.year}
                    onChange={(e) => handleEditEducationChange(idx, "year", e.target.value)}
                    className="p-2 rounded bg-gray-800 text-white border border-gray-700 w-full"
                    />
                    <input
                    type="text"
                    placeholder="GPA (optional)"
                    value={edu.gpa}
                    onChange={(e) => handleEditEducationChange(idx, "gpa", e.target.value)}
                    className="p-2 rounded bg-gray-800 text-white border border-gray-700 w-full"
                    />
                </div>

                {editEducation.length > 1 && (
                    <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                    >
                    <Trash2 size={16} />
                    </button>
                )}
                </div>
            ))}

            <div className="flex gap-4">
                <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                <Plus size={16} /> Add Education
                </button>
                <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                Save
                </button>
            </div>
            </form>
        </section>
      }

      {/* Projects */}
      {!isEditProjects && projects?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Code size={18} /> Projects <button onClick={handleEditProjects} className="cursor-pointer"><Edit3 className="size-5"/></button>
          </h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <p className="font-medium text-white">{proj.title}</p>
              <p className="text-sm text-gray-300">{proj.description}</p>
              {proj.technologies?.length ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {proj.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs">{tech}</span>
                  ))}
                </div>
              ) : null}
              {proj.url && (
                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 flex items-center gap-1 mt-1 hover:underline">
                  <LinkIcon size={12} /> View Project
                </a>
              )}
            </div>
          ))}
        </section>
      ) : null}
      {isEditProjects &&<section className="w-full h-auto">
            <div className="py-6 bg-gray-900 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Code size={18} /> Edit Projects
            </h2>

            {editedProjects.map((proj, idx) => (
                <div key={idx} className="border border-gray-700 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-300 font-medium">Project {idx + 1}</p>
                    <button
                    onClick={() => handleRemoveProject(idx)}
                    className="text-red-400 hover:text-red-600"
                    >
                    <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Title */}
                <input
                    type="text"
                    placeholder="Project Title"
                    className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                    value={proj.title}
                    onChange={(e) => handleEditedProjectChange(idx, "title", e.target.value)}
                />

                {/* Description */}
                <textarea
                    placeholder="Short description of the project"
                    rows={3}
                    className="w-full mb-3 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200 resize-y"
                    value={proj.description}
                    onChange={(e) => handleEditedProjectChange(idx, "description", e.target.value)}
                />

                {/* Technologies */}
                <div className="mb-3">
                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                    <Tag size={14} /> Technologies
                    </p>
                    {proj.technologies?.map((tech, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-2 mb-2">
                        <input
                        type="text"
                        className="flex-1 px-3 py-1 rounded bg-gray-800 border border-gray-600 text-gray-200"
                        value={tech}
                        onChange={(e) => handleTechChange(idx, e.target.value, tIdx)}
                        />
                        <button
                        onClick={() => handleRemoveTech(idx, tIdx)}
                        className="text-red-400 hover:text-red-600"
                        aria-label={`Remove technology ${tech}`}
                        >
                        <X className="w-4 h-4" />
                        </button>
                    </div>
                    ))}

                    <button
                    onClick={() => handleTechChange(idx, "")}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-600 text-sm"
                    >
                    <Plus className="w-4 h-4" /> Add Technology
                    </button>
                </div>

                {/* URL */}
                <div>
                    <p className="text-sm text-gray-400 mb-1">Project URL (optional)</p>
                    <div className="flex items-center gap-2">
                    <input
                        type="url"
                        placeholder="https://your-project.com"
                        className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                        value={proj.url || ""}
                        onChange={(e) => handleEditedProjectChange(idx, "url", e.target.value)}
                    />
                    {proj.url ? (
                        <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 flex items-center gap-1 hover:underline"
                        >
                        <LinkIcon size={12} /> Open
                        </a>
                    ) : null}
                    </div>
                </div>
                </div>
            ))}

            <button
                onClick={handleAddProject}
                className="w-full py-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" /> Add New Project
            </button>

            <div className="flex justify-end">
                <button
                onClick={handleEditedProjectSave}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                Save Changes
                </button>
            </div>
            </div>
        </section>
      }
      {/* Certifications */}
      {!isEditCertifications && certifications?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Award size={18} /> Certifications <button onClick={handleEditCertifications} className="cursor-pointer"><Edit3 className="size-5"/></button>
          </h2>
          {certifications.map((cert, idx) => (
            <div key={idx} className="mb-3">
              <p className="font-medium text-white">{cert.title}</p>
              <p className="text-sm text-gray-300">{cert.provider} • {cert.date}</p>
              {cert.link && (
                <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                  {cert.link}
                </a>
              )}
            </div>
          ))}
        </section>
      ) : null}
      {
        isEditCertifications && <section className="w-full h-auto">
          <div className="py-6 bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={18} /> Edit Certifications
          </h2>

          {certs.map((cert, idx) => (
            <div key={idx} className="border border-gray-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-300 font-medium">Certification {idx + 1}</p>
                <button onClick={() => handleRemoveEditedCertifications(idx)} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Certification Title"
                className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                value={cert.title}
                onChange={(e) => handleChangeEditedCertifications(idx, "title", e.target.value)}
              />

              <input
                type="text"
                placeholder="Provider (e.g., Coursera, Google)"
                className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                value={cert.provider}
                onChange={(e) => handleChangeEditedCertifications(idx, "provider", e.target.value)}
              />

              <input
                type="text"
                placeholder="Date (e.g., Jun 2024)"
                className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                value={cert.date}
                onChange={(e) => handleChangeEditedCertifications(idx, "date", e.target.value)}
              />

              <div>
                <p className="text-sm text-gray-400 mb-1">Verification Link (optional)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/certificate"
                    className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                    value={cert.link || ""}
                    onChange={(e) => handleChangeEditedCertifications(idx, "link", e.target.value)}
                  />
                  {cert.link ? (
                    <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
                      <LinkIcon size={12} /> Open
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          <button onClick={handleAddEditedCertifications} className="w-full py-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Add Certification
          </button>

          <div className="flex justify-end">
            <button onClick={handleSaveEditedCertifications} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
              Save Changes
            </button>
          </div>
        </div>
        </section>
      }
      {/* Awards */}
      {!isEditAwards && awards?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Award size={18} /> Awards & Honors <button onClick={handleEditedAwards} className="cursor-pointer"><Edit3 className="size-5"/></button>
          </h2>
          {awards.map((awd, idx) => (
            <div key={idx} className="mb-3">
              <p className="font-medium text-white">{awd.title}</p>
              <p className="text-sm text-gray-300">{awd.organization} • {awd.year}</p>
              {awd.description && <p className="text-xs text-gray-400">{awd.description}</p>}
            </div>
          ))}
        </section>
      ) : null}

      {
        isEditAwards && <section className="w-full h-auto">
          <div className="py-6 bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={18} /> Edit Awards & Honors
          </h2>

          {editedAwards.map((awd, idx) => (
            <div key={idx} className="border border-gray-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-300 font-medium">Award {idx + 1}</p>
                <button onClick={() => handleRemoveEditedAwards(idx)} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Award Title"
                className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                value={awd.title}
                onChange={(e) => handleChangeEditedAwards(idx, "title", e.target.value)}
              />

              <input
                type="text"
                placeholder="Organization"
                className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                value={awd.organization}
                onChange={(e) => handleChangeEditedAwards(idx, "organization", e.target.value)}
              />

              <input
                type="text"
                placeholder="Year (e.g., 2024)"
                className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200"
                value={awd.year}
                onChange={(e) => handleChangeEditedAwards(idx, "year", e.target.value)}
              />

              <textarea
                placeholder="Optional description or context"
                rows={2}
                className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-gray-200 resize-y"
                value={awd.description || ""}
                onChange={(e) => handleChangeEditedAwards(idx, "description", e.target.value)}
              />
            </div>
          ))}

          <button onClick={handleAddEditedAwards} className="w-full py-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Add Award
          </button>

          <div className="flex justify-end">
            <button onClick={handleSaveEditedAwards} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
              Save Changes
            </button>
          </div>
        </div>
        </section>
      }
    </div>
  );
}


export default CandidatesProfileResumePanel;