'use client'
import { useState } from "react"
import { Code, Plus, LinkIcon, X, Tag, Edit3 } from "lucide-react"

interface Project {
  title: string
  description: string
  technologies?: string[]
  url?: string
}

const ProjectsSection = ({editedProjects,setProjects}:{editedProjects:Project[], setProjects:React.Dispatch<React.SetStateAction<Project[]>>}) => {
    const [isEditProjects, setIsEditProjects]=useState<boolean>(false)
    // const [editedProjects, setProjects] = useState<Project[]>(projects || [])

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
  return (
    <>
      {!isEditProjects && editedProjects?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Code size={18} /> Projects <button onClick={handleEditProjects} className="cursor-pointer"><Edit3 className="size-5"/></button>
          </h2>
          {editedProjects.map((proj, idx) => (
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
    </>
  )
}

export default ProjectsSection
