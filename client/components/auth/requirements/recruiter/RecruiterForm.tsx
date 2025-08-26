
"use client";

import { useEffect, useRef, useState } from "react";
import { SquarePlus, Save, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import { createOrganization, orgCreationStatus, setOrgCreationStatus } from "@/redux/features/auth";
import { ClipLoader } from "react-spinners";
import { toggleIsShowAuthRole } from "@/redux/features/utils"

interface propType{
    setIsCreateNewOrg:React.Dispatch<React.SetStateAction<boolean>>
}

const CreateOrganizationForm = () => {
  const orgLogoRef = useRef<HTMLInputElement|null>(null)
  const [orgLogo, setOrgLogo] = useState<File|null>(null)
  const [errors, setErrors] = useState<{[key:string]:string}>({})

  const dispatch = useAppDispatch()

  const currentOrgCreationStatus = useAppSelector(orgCreationStatus)

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationNameBangla: "",
    yearOfEstablishment: "",
    industryType: "",
    organizationAddress: "",
    organizationAddressBangla: "",
    websiteUrl: "",
    businessDescription: "",
    organizationProfileImageUrl:"",
    numberOfEmployees:"",
    businessLicenseNo:"",
    acceptPrivacyPolicy:false
  });


  const validateForm = () => {
    let newErrors: {[key:string]:string} = {};

    if(!formData.organizationName.trim()) newErrors.organizationName = "Organization name is required";
    if(!formData.yearOfEstablishment.trim()) newErrors.yearOfEstablishment = "Year of establishment is required";
    if(!formData.organizationAddress.trim()) newErrors.organizationAddress = "Organization address is required";
    if(!formData.industryType.trim()) newErrors.industryType = "Industry type is required";
    if(!formData.businessDescription.trim()) newErrors.businessDescription = "Business description is required";
    if(!formData.acceptPrivacyPolicy) newErrors.acceptPrivacyPolicy = "You must accept the privacy policy";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    // 🔥 API call to create new organization
    if(!validateForm()) return;
    console.log("Creating Organization:", formData);
    dispatch(createOrganization(formData))
  };

  const handleCancel = () => {
    setFormData({
      organizationName: "",
      organizationNameBangla: "",
      yearOfEstablishment: "",
      industryType: "",
      organizationAddress: "",
      organizationAddressBangla: "",
      websiteUrl: "",
      businessDescription: "",
      organizationProfileImageUrl:"",
      numberOfEmployees:"",
      businessLicenseNo:"",
      acceptPrivacyPolicy:false,
    });
    dispatch(toggleIsShowAuthRole())
  };

  const handleUploadOrgLogo = (e:React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0] ?? null;
    setOrgLogo(file);
    // setFormData((prev)=>({...prev,}))
    
    // profile photo upload logic goes here 
  }

  useEffect(()=>{
    if(currentOrgCreationStatus==='success'){
        dispatch(setOrgCreationStatus('idle'))
        dispatch(toggleIsShowAuthRole())
    }
  },[currentOrgCreationStatus])

  return (
    <div className="w-full h-full flex justify-center items-center ">
        <section className="w-full max-h-[90%] overflow-y-scroll scrollbar-hidden max-w-3xl mx-auto bg-slate-900 mt-6 p-6 rounded-xl shadow-lg shadow-gray-800">
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
                required
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Github"
                />
                {errors.organizationName && <p className="text-red-500 text-xs mt-1">{errors.organizationName}</p>}
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Company Name (Bengali)
                </label>
                <input
                name="organizationNameBangla"
                value={formData.organizationNameBangla}
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
                required
                name="yearOfEstablishment"
                value={formData.yearOfEstablishment}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 2010"
                />
                 {errors.yearOfEstablishment && <p className="text-red-500 text-xs mt-1">{errors.yearOfEstablishment}</p>}
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Organization Type
                </label>
                <input
                required
                name="industryType"
                value={formData.industryType}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Information Technology"
                />
                 {errors.industryType && <p className="text-red-500 text-xs mt-1">{errors.industryType}</p>}
            </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Company Address
                </label>
                <input
                required
                name="organizationAddress"
                value={formData.organizationAddress}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Sylhet, Bangladesh"
                />
                {errors.organizationAddress && <p className="text-red-500 text-xs mt-1">{errors.organizationAddress}</p>}
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Company Address (Bengali)
                </label>
                <input
                name="organizationAddressBangla"
                value={formData.organizationAddressBangla}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. সিলেট, বাংলাদেশ"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                No of employees :
                </label>
                <input
                name="numberOfEmployees"
                value={formData.numberOfEmployees}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 100"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                Business license no. 
                </label>
                <input
                name="businessLicenseNo"
                value={formData.businessLicenseNo}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 157***"
                />
            </div>
            </div>

            {/* Website */}
            <div>
            <label className="block text-sm text-gray-400 mb-1">Website URL</label>
            <input
                ref={orgLogoRef}
                name="websiteUrl"
                value={formData.websiteUrl}
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
                required
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Write a short business businessDescription..."
            />
            {errors.businessDescription && <p className="text-red-500 text-xs mt-1">{errors.businessDescription}</p>}
            </div>
            <label className="flex items-start space-x-2 text-sm text-gray-700">
                <input
                    checked={formData.acceptPrivacyPolicy}
                    onChange={()=>setFormData((prev) => ({ ...prev, acceptPrivacyPolicy: !prev.acceptPrivacyPolicy }))}
                    name="acceptPrivacyPolicy"
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                    I agree to the{" "}
                    <a
                    href="/terms"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    >
                    Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                    href="/privacy"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    >
                    Privacy Policy
                    </a>.
                </span>
            </label>
            {errors.acceptPrivacyPolicy && <p className="text-red-500 text-xs">{errors.acceptPrivacyPolicy}</p>}

        </form>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
            <button
            disabled={currentOrgCreationStatus==='pending'?true:false}
            onClick={handleCreate}
            className="flex-1 py-2 flex justify-center items-center gap-2 rounded-md cursor-pointer bg-green-700 hover:bg-green-600 text-white"
            >
            {
                currentOrgCreationStatus==='pending'?<ClipLoader color="white" size={24}/>:<><Save className="w-4 h-4" /> Create</>
            }
            
            </button>
            <button
            onClick={handleCancel}
            className="flex-1 py-2 flex justify-center items-center gap-2 rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600 text-white"
            >
            <X className="w-4 h-4" /> Skip for now !
            </button>
        </div>
        </section>
    </div>
  );
};

export default CreateOrganizationForm;
