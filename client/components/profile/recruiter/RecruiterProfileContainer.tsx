'use client'
import { Edit, Edit3, File, Save } from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"

const RecruiterProfileContainer = () => {
  const coverPhotoRef = useRef<null|HTMLInputElement>(null)
  const profilePhotoRef = useRef<null|HTMLInputElement>(null)

  const[isEditAbout, setIsAboutEdit]=useState<boolean>(false);

  const [coverPhoto, setCoverPhoto] = useState<File | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const handleUploadCoverPhoto = (e:React.ChangeEvent<HTMLInputElement>)=>{
    setCoverPhoto(e.target.files?.[0]??null)
    
    // cover photo upload logic goes here 
  }
  const handleUploadProfilePhoto = (e:React.ChangeEvent<HTMLInputElement>)=>{
    setProfilePhoto(e.target.files?.[0]??null)
    
    // profile photo upload logic goes here 
  }
  const handleEditAbout = ()=>{
    // logic goes here 
    setIsAboutEdit((prev)=>!prev)
  }
  const handleSaveEditedAbout = ()=>{
    // logic goes here 
    setIsAboutEdit((prev)=>!prev)
  }
  return (
    <div className="w-full h-full bg-gray-950/80 flex items-start justify-center pt-[80px] pb-[20px]">
      <div className="w-[75%] ml-[5%] h-full border border-gray-800 flex">
        <div className="w-[60%] h-full flex flex-col">
            <section className='w-full min-h-[400px] bg-slate-900 rounded-xl'>
                <div className="w-full h-[200px] relative rounded-t-xl">
                    <Image src={'https://i.pinimg.com/1200x/e6/16/86/e61686f29fc38ad2d539d776fb8adc76.jpg'} alt="cover-photo" width={700} height={300} className="w-full h-full rounded-t-xl object-cover"/>
                    <div className="absolute bottom-[-25%] left-[5%] w-[150px] h-[150px] rounded-full">
                        <input ref={profilePhotoRef} type="file" accept="image" hidden onChange={handleUploadProfilePhoto} />
                        <button className="cursor-pointer" onClick={()=>profilePhotoRef.current?.click()}>
                            <Image src={'https://i.pinimg.com/736x/e4/49/9e/e4499e440ed5c74c105eda233305fcdf.jpg'} alt="profile-photo" width={200} height={200} className="w-full h-full rounded-full object-cover"/>
                        </button>
                    </div>
                    <div className="absolute top-3 right-4 ">
                        <input ref={coverPhotoRef} type="file" accept="image" hidden onChange={handleUploadCoverPhoto} />
                        <button onClick={()=>coverPhotoRef.current?.click()} className="cursor-pointer relative group">
                        <p className="absolute top-[100%] right-[50%] group-hover:flex w-[200px] hidden px-4 py-1 rounded-lg bg-gray-800 text-[12px] text-gray-200 justify-center">Change / Add Cover Photo</p>
                        <Edit/>
                        </button>
                    </div>
                </div>
                <div className="flex-1 w-full pt-[7%] pl-[7%] flex flex-col">
                    <p className="text-xl font-semibold text-gray-200">Matt Murdock</p>
                    <div className="w-full min-h-[80px] flex justify-between items-start">
                    <div className="w-[60%] h-auto">
                        <p className="w-full max-h-[40px] text-[13px] flex justify-start items-start overflow-hidden text-gray-400">Final-Year CS Undergrad | Full-Stack Web Developer</p>
                        <p className="w-full max-h-[40px] text-[13px] flex justify-start  overflow-hidden text-gray-400 items-center"><span> {`📍 Sylhet, Bangladesh`}</span> <span className="text-2xl font-bold m-1 mt-[-8px]">.</span> <span>{`✉️ matt1223@gmail.com`}</span></p>
                    </div>
                    <div className="w-auto  h-full flex flex-col justify-start items-end gap-2 pr-[20px]">
                        <div className="flex gap-1 items-center">
                        <File className="text-green-700 size-6"/>
                        <div className="flex flex-col text-[11px] text-gray-400">
                            <p className="">Resume.pdf</p>
                            <p className="">200.20kb</p>
                        </div>
                        </div>
                        <button className="text-[11px] px-4 py-1 rounded-lg cursor-pointer hover:text-gray-50 bg-gray-800 hover:bg-gray-600">
                        Upload a new CV
                        </button>
                    </div>
                    </div>
                </div>
            </section>
        </div>
        <div className="w-[40%] h-full bg-red-600"></div>
      </div>
    </div>
  )
}

export default RecruiterProfileContainer
