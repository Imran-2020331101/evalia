'use client'
import { useState } from "react"
import { X,Award, Edit3, Plus } from "lucide-react"

type Award = {
  title: string
  organization: string
  year: string
  description?: string
}

const AwardsSection = ({editedAwards, setAwards}:{editedAwards:Award[], setAwards:React.Dispatch<React.SetStateAction<Award[]>>}) => {
    const [isEditAwards, setIsEditAwards]=useState<boolean>(false)

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
    <>
      {!isEditAwards? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Award size={18} /> Awards & Honors <button onClick={handleEditedAwards} className="cursor-pointer"><Edit3 className="size-5"/></button>
          </h2>
          {editedAwards?.map((awd, idx) => (
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

          {editedAwards?.map((awd, idx) => (
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
    </>
  )
}

export default AwardsSection
