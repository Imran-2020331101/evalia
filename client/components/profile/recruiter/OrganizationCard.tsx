"use client";

import { useState } from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import Image from "next/image";

const OrganizationCard =() =>{
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "Github",
    nameBn: "গিটহাব",
    year: 2010,
    type: "Information Technology",
    address: "Sylhet, Bangladesh",
    addressBn: "সিলেট, বাংলাদেশ",
    website: "https://github.com/",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore, vitae vel nostrum numquam est accusantium alias?",
    logo: "https://i.pinimg.com/1200x/6b/9e/50/6b9e507694695e7f16eb14c4bdfe8dba.jpg",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // 🔥 Here you would call API to save changes
    console.log("Updated data:", formData);
  };

  const handleDelete = () => {
    // 🔥 Call delete API here
    console.log("Company deleted");
  };

  return (
    <section className="w-full h-auto bg-slate-900 mt-3 flex gap-4 p-2 rounded-xl shadow-md shadow-gray-800 relative ">
      {/* Company Logo */}
      <div className="w-[150px] h-[150px] flex-shrink-0 rounded-lg overflow-hidden border border-gray-700">
        <Image
          src={formData.logo}
          alt="Company Logo"
          width={150}
          height={150}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 text-gray-300 text-sm">
        {!isEditing ? (
          <>
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 cursor-pointer rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                <Edit className="size-5" />
              </button>
            </div>

            {/* Display Mode */}
            <h2 className="text-[15px] font-semibold text-gray-200 flex items-center gap-2">
              {formData.name}
              <span className="text-xs text-gray-400">({formData.nameBn})</span>
              <span className="text-xs text-gray-400">, {formData.year}</span>
            </h2>

            <div className="mt-1 text-sm text-gray-400">{formData.type}</div>

            <div className="mt-1 text-sm flex items-center gap-2">
              <span>{formData.address}</span>
              <span className="text-xs text-gray-500">({formData.addressBn})</span>
            </div>

            <div className="mt-1 text-sm">
              <a
                href={formData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {formData.website.replace(/^https?:\/\//, "")}
              </a>
            </div>

            <p className="mt-2 text-xs text-gray-400 leading-relaxed">{formData.description}</p>
          </>
        ) : (
          <>
            {/* Edit Form */}
            <form className="flex flex-col gap-2 mt-1">
              <div className="flex gap-2">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Company Name"
                />
                <input
                  name="nameBn"
                  value={formData.nameBn}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Company Name (Bengali)"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Established Year"
                />
                <input
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Organization Type"
                />
              </div>

              <div className="flex gap-2">
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Company Address"
                />
                <input
                  name="addressBn"
                  value={formData.addressBn}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Company Address (Bengali)"
                />
              </div>

              <input
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full p-1 rounded bg-gray-800 text-white text-sm"
                placeholder="Website URL"
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-1 rounded bg-gray-800 text-white text-sm"
                rows={3}
                placeholder="Business Description"
              />
            </form>
            <div className=" flex flex-col gap-2 mt-4">
              <button
                onClick={handleSave}
                className="w-full py-2 gap-2 flex justify-center items-center rounded-md cursor-pointer bg-green-700 hover:bg-green-600 text-white"
              >
                <Save className="size-4" /> Save
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-2 gap-2 flex justify-center items-center rounded-md cursor-pointer bg-red-800 hover:bg-red-700 text-gray-200"
              >
                <Trash2 className="size-4" /> Delete
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="w-full py-2 gap-2 flex justify-center items-center rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600 text-white"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default OrganizationCard 