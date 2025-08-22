"use client";

import { useRef, useState } from "react";
import { SquarePlus, Save, X } from "lucide-react";

interface propType{
    setIsCreateNewOrg:React.Dispatch<React.SetStateAction<boolean>>
}

const CreateOrganizationForm = ({setIsCreateNewOrg}:propType) => {
  const orgLogoRef = useRef<HTMLInputElement|null>(null)
  const [orgLogo, setOrgLogo] = useState<File|null>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    year: "",
    type: "",
    address: "",
    addressBn: "",
    website: "",
    description: "",
    logo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    // 🔥 API call to create new organization
    console.log("Creating Organization:", formData);
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      nameBn: "",
      year: "",
      type: "",
      address: "",
      addressBn: "",
      website: "",
      description: "",
      logo: "",
    });
    setIsCreateNewOrg(false)
  };

  const handleUploadOrgLogo = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0] ?? null;
    setOrgLogo(file);
    
    // profile photo upload logic goes here 
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[200] flex justify-center items-center backdrop-blur-2xl">
        <section className="w-full max-w-3xl mx-auto bg-slate-900 mt-6 p-6 rounded-xl shadow-md shadow-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
           <SquarePlus className="size-5 mr-2"/> Create New Organization
        </h2>

        <form className="flex flex-col gap-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Company Name
                </label>
                <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Github"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Company Name (Bengali)
                </label>
                <input
                name="nameBn"
                value={formData.nameBn}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. গিটহাব"
                />
            </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Established Year
                </label>
                <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 2010"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Organization Type
                </label>
                <input
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Information Technology"
                />
            </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Company Address
                </label>
                <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Sylhet, Bangladesh"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Company Address (Bengali)
                </label>
                <input
                name="addressBn"
                value={formData.addressBn}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. সিলেট, বাংলাদেশ"
                />
            </div>
            </div>

            {/* Website */}
            <div>
            <label className="block text-sm text-gray-400 mb-1">Website URL</label>
            <input
                ref={orgLogoRef}
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
            />
            </div>

            {/* Logo */}
            <div>
            <label className="block text-sm text-gray-400 mb-1">
                Org. logo
            </label>
            <input
                ref={orgLogoRef}
                name="logo"
                type="file"
                accept="image/*"
                hidden
                onChange={handleUploadOrgLogo}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={()=>orgLogoRef.current?.click()} className="text-[12px] text-gray-400 bg-gray-800 border border-gray-700 items-center p-2 rounded-md w-full flex justify-start">
                {
                    orgLogo?`Selected : ${orgLogo.name}`:'Please upload a organization logo '
                }
            </button>
            </div>

            {/* Description */}
            <div>
            <label className="block text-sm text-gray-400 mb-1">
                Business Description
            </label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Write a short business description..."
            />
            </div>
        </form>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
            <button
            onClick={handleCreate}
            className="flex-1 py-2 flex justify-center items-center gap-2 rounded-md cursor-pointer bg-green-700 hover:bg-green-600 text-white"
            >
            <Save className="w-4 h-4" /> Create
            </button>
            <button
            onClick={handleCancel}
            className="flex-1 py-2 flex justify-center items-center gap-2 rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600 text-white"
            >
            <X className="w-4 h-4" /> Cancel
            </button>
        </div>
        </section>
    </div>
  );
};

export default CreateOrganizationForm;
