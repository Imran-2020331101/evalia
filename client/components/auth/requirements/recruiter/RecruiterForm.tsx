'use client'
import { useState, ChangeEvent, FormEvent } from 'react'

interface RecruiterFormData {
  companyName: string
  companyAddress: string
  businessDescription: string
  industryType: string
  websiteUrl: string
  logo: File | null
  contactName: string
  contactDesignation: string
  contactEmail: string
  contactMobile: string
}

const RecruiterForm = () => {
  const [formData, setFormData] = useState<RecruiterFormData>({
    companyName: '',
    companyAddress: '',
    businessDescription: '',
    industryType: '',
    websiteUrl: '',
    logo: null,
    contactName: '',
    contactDesignation: '',
    contactEmail: '',
    contactMobile: ''
  })

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log(formData)
  }

  return (
    <div className="max-w-md mx-auto rounded-2xl shadow-lg p-6 text-gray-400">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-300 mb-4 border-b pb-2">
            Tell Us About Your Company
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Company Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Industry Type <span className="text-red-500">*</span>
              </label>
              <select
                name="industryType"
                value={formData.industryType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select industry</option>
                <option value="IT">Information Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Website URL
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Upload Company Logo
              </label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Business Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-300 mb-4 border-b pb-2">
            Provide Contact Person Information
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Contact Person's Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Contact Person's Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactDesignation"
                value={formData.contactDesignation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Contact Person's Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Contact Person's Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contactMobile"
                value={formData.contactMobile}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Confirmation */}
        <section className="pt-4">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
          >
            Submit Information
          </button>
        </section>
      </form>
    </div>
  )
}

export default RecruiterForm
