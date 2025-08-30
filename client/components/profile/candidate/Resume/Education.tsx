'use client'
import { useState } from "react"
import { GraduationCap, Edit3, Trash2, Plus } from "lucide-react"

interface Education {
  degree: string
  institution: string
  year: string
  gpa?: string
}

const EducationSection = ({editEducation, setEducation}:{editEducation:Education[], setEducation:React.Dispatch<React.SetStateAction<Education[]>>}) => {
    const[isEditEducation, setIsEditEducation]=useState<boolean>(false)

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
  return (
    <>
      {!isEditEducation && editEducation?.length ? (
            <section>
            <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
                <GraduationCap size={18} /> Education <button onClick={handleEditEducation} className="cursor-pointer"><Edit3 className="size-5"/></button>
            </h2>
            {editEducation.map((edu, idx) => (
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
    </>
  )
}

export default EducationSection
