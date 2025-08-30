'use client'
import { useState } from "react";
import { Edit3,Code, X, Plus } from "lucide-react";

interface Skills {

    technical?: string[];
    soft?: string[];
    languages?: string[];
    tools?: string[];
    other?: string[];

}

const SkillsSection = ({editSkills,setSkills}:{editSkills:Skills, setSkills:React.Dispatch<React.SetStateAction<Skills>>}) => {
    const [isEditSkills, setIsEditSkills] = useState<boolean>(false);
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
  return (
    <>
      {!isEditSkills && editSkills && Object.values(editSkills).some(arr => arr && arr.length > 0) && (
        <section>
          <div className="flex gap-2">
            <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2  w-full">
                <Code size={18} /> Skills <button onClick={handleEditSkills} className="cursor-pointer ">
                                                <Edit3 className="size-5 "/>
                                            </button>
            </h2>
            
          </div>
          <div className="space-y-3">
            {editSkills.technical?.length ? (
              <div>
                <p className="font-medium text-gray-300">Technical</p>
                <div className="flex flex-wrap gap-2">
                  {editSkills.technical.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {editSkills.soft?.length ? (
              <div>
                <p className="font-medium text-gray-300">Soft Skills</p>
                <div className="flex flex-wrap gap-2">
                  {editSkills.soft.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {editSkills.languages?.length ? (
              <div>
                <p className="font-medium text-gray-300">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {editSkills.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{lang}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {editSkills.tools?.length ? (
              <div>
                <p className="font-medium text-gray-300">Tools & Frameworks</p>
                <div className="flex flex-wrap gap-2">
                  {editSkills.tools.map((tool, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-800/40 rounded-full text-sm">{tool}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {editSkills.other?.length ? (
              <div>
                <p className="font-medium text-gray-300">Other</p>
                <div className="flex flex-wrap gap-2">
                  {editSkills.other.map((skill, idx) => (
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
    </>
  )
}

export default SkillsSection
