"use client";

import { useEffect, useState } from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { deleteOrganization, orgUpdateStatus, updateOrganization } from "@/redux/features/auth";

interface propType{
  organization:{
    id:string,
    ownerEmail: string,
    organizationName: string,
    organizationNameBangla:string,
    organizationProfileImageUrl: string,
    yearOfEstablishment: string,
    numberOfEmployees: string,
    organizationAddress: string,
    organizationAddressBangla: string,
    industryType: string,
    businessDescription: string,
    businessLicenseNo: string,
    rlNo: string|null,
    websiteUrl: string,
    enableDisabilityFacilities: boolean,
    acceptPrivacyPolicy: boolean,
    verified: boolean,
    createdAt: string,
    updatedAt: string,
}
}
const OrganizationCard =({organization}:propType) =>{
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id:"",
    organizationName: "",
    organizationNameBangla: "",
    yearOfEstablishment: "",
    industryType: "",
    organizationAddress: "",
    organizationAddressBangla: "",
    websiteUrl: "",
    businessDescription:
      "",
    organizationProfileImageUrl: "",
  });

  const currentUpdateStatus = useAppSelector(orgUpdateStatus)

  const dispatch = useAppDispatch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // setIsEditing(false);
    // 🔥 Here you would call API to save changes
    dispatch(updateOrganization({organizationId:formData.id,data:formData}))

    console.log("Updated data:", formData);
  };

  const handleDelete = () => {
    // 🔥 Call delete API here
    console.log("Company deleted");
    dispatch(deleteOrganization(formData.id))
  };
  useEffect(()=>{
    const {id,yearOfEstablishment,organizationName, organizationAddress, organizationNameBangla, organizationAddressBangla, organizationProfileImageUrl,industryType, businessDescription,websiteUrl}=organization
    setFormData({
      id,
      organizationName,
      organizationAddress,
      organizationAddressBangla,
      organizationNameBangla,
      organizationProfileImageUrl,
      industryType,
      businessDescription,
      websiteUrl,
      yearOfEstablishment,
    })
  },[])
  useEffect(()=>{
    if(currentUpdateStatus==='success')setIsEditing(false)
  },[currentUpdateStatus])
  return (
    <section className="w-full h-auto bg-slate-900 mt-3 flex gap-4 p-2 rounded-xl shadow-md shadow-gray-800 relative ">
      {/* Company Logo */}
      <div className="w-[150px] h-[150px] flex-shrink-0 rounded-lg overflow-hidden border border-gray-700">
        <Image
          src={formData.organizationProfileImageUrl?formData.organizationProfileImageUrl:'https://i.pinimg.com/1200x/21/de/f4/21def4a3643f9b41cd0218e18b71ae0e.jpg'}
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
              {formData.organizationName}
              <span className="text-xs text-gray-400">({formData.organizationNameBangla})</span>
              <span className="text-xs text-gray-400">, {formData.yearOfEstablishment}</span>
            </h2>

            <div className="mt-1 text-sm text-gray-400">{formData.industryType}</div>

            <div className="mt-1 text-sm flex items-center gap-2">
              <span>{formData.organizationAddress}</span>
              <span className="text-xs text-gray-500">({formData.organizationAddressBangla})</span>
            </div>

            <div className="mt-1 text-sm">
              <a
                href={formData.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {formData.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            </div>

            <p className="mt-2 text-xs text-gray-400 leading-relaxed">{formData.businessDescription}</p>
          </>
        ) : (
          <>
            {/* Edit Form */}
            <form className="flex flex-col gap-2 mt-1">
              <div className="flex gap-2">
                <input
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Company Name"
                />
                <input
                  name="organizationNameBangla"
                  value={formData.organizationNameBangla}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Company Name (Bengali)"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  name="yearOfEstablishment"
                  value={formData.yearOfEstablishment}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Established Year"
                />
                <input
                  name="industryType"
                  value={formData.industryType}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Organization Type"
                />
              </div>

              <div className="flex gap-2">
                <input
                  name="organizationAddress"
                  value={formData.organizationAddress}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Company Address"
                />
                <input
                  name="organizationAddressBangla"
                  value={formData.organizationAddressBangla}
                  onChange={handleChange}
                  className="flex-1 p-1 rounded bg-gray-800 text-white text-sm"
                  placeholder="Company Address (Bengali)"
                />
              </div>

              <input
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                className="w-full p-1 rounded bg-gray-800 text-white text-sm"
                placeholder="Website URL"
              />

              <textarea
                name="businessDescription"
                value={formData.businessDescription}
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