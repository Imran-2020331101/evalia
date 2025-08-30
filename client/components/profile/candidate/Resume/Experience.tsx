'use client'
import { useState } from "react"
import { Plus, X,  Briefcase, Edit3} from "lucide-react"

interface Experience  {
  job_title: string
  company: string
  duration: string
  description?: string[]
  achievements?: string[]
}

const ExperienceSection = ({editExperience, setExperience}:{editExperience:Experience[], setExperience:React.Dispatch<React.SetStateAction<Experience[]>>}) => {
  const [isEditExperience , setIsEditExperience] = useState<boolean>(false)
    //   const [editExperience, setExperience] = useState<Experience[]>(experience || [])
  
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
  
  return (
    <>
     { !isEditExperience  ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Briefcase size={18} /> Experience  <button onClick={handleEditExperience} className="cursor-pointer"><Edit3 className="size-5"/></button>
          </h2>
          {editExperience.map((exp, idx) => (
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
    </>
  )
}

export default ExperienceSection
