'use client'
import { useState } from "react"
import { Award, LinkIcon, Edit3 , Plus, X } from "lucide-react"

type Certification = {
  title: string
  provider: string
  date: string
  link?: string
}

const CertificationsSection = ({certs, setCerts}:{certs:Certification[], setCerts:React.Dispatch<React.SetStateAction<Certification[]>>}) => {
    const [isEditCertifications, setIsEditCertifications] = useState<boolean>(false)

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
  return (
    <>
      {!isEditCertifications && certs?.length ? (
        <section>
          <h2 className="text-lg font-semibold border-b border-gray-700 pb-1 mb-3 flex items-center gap-2">
            <Award size={18} /> Certifications <button onClick={handleEditCertifications} className="cursor-pointer"><Edit3 className="size-5"/></button>
          </h2>
          {certs.map((cert, idx) => (
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
    </>
  )
}

export default CertificationsSection
