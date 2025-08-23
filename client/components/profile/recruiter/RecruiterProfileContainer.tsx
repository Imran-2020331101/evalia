'use client'
import { Edit, Edit3, File, Save , Plus} from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"
import OrganizationCard from "./OrganizationCard"
import CreateOrganizationForm from "./CreateOrganizationForm"

interface propType {
  user:any
}

const RecruiterProfileContainer = ({user}:propType) => {
  const coverPhotoRef = useRef<null|HTMLInputElement>(null)
  const profilePhotoRef = useRef<null|HTMLInputElement>(null)

  const[isEditAbout, setIsAboutEdit]=useState<boolean>(false);
  const [isCreateNewOrg, setIsCreateNewOrg] = useState<boolean>(false);

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
  const handleCreateNewOrganization =()=>{

  }
  return (
    <div className="w-full h-full bg-gray-950/80 flex items-start justify-center pt-[10px]">
      <div className="w-[65%] ml-[5%] h-full flex p-[6px] gap-[13px]">
        {/* <div className="w-[30%] h-full bg-red-600"></div> */}
        <div className="w-full h-full flex flex-col gap-[10px] overflow-y-scroll scrollbar-hidden">
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
                    </div>
                </div>
            </section>
            {
              isEditAbout?
              <section className="w-full min-h-[200px] bg-slate-900 rounded-xl p-[14px] pl-[7%] pt-[25px]">
                  <div className="w-full h-full relative">
                      <textarea name="" id="about" className="focus:border-2 focus:border-gray-600 w-full h-full rounded-xl border border-gray-800 outline-none focus:right-1 focus:ring-gray-400 scroll-container p-[14px] text-[13px] text-gray-300">
                      </textarea>
                      <label htmlFor="about" className="absolute left-1 top-[-14px] px-4 py-1 rounded-lg bg-slate-900 text-gray-300 text-[15px] font-semibold ">
                          <div className="flex gap-2">
                            <p>Edit About</p>
                            <button onClick={handleSaveEditedAbout}>
                              <Save className="size-4 cursor-pointer"/>
                            </button>
                          </div>
                      </label>
                  </div>
              </section>
              :
              <section className="w-full min-h-[200px] bg-slate-900 rounded-xl flex flex-col p-[14px] gap-[10px] pl-[7%]">
                <div className="flex gap-2 items-center">
                  <p className="text-gray-200 font-semibold tracking-wider">About</p>
                  <button onClick={handleEditAbout} className="cursor-pointer">
                    <Edit3 className="size-4"/>
                  </button>
                </div>
                <p className="text-[13px] text-gray-300">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vitae eos, nesciunt, sunt at ullam reiciendis numquam eius dolor quasi tenetur, 
                  perspiciatis aperiam deserunt perferendis iure voluptas recusandae exercitationem voluptate doloribus.
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vitae eos, nesciunt, sunt at ullam reiciendis numquam eius dolor quasi tenetur, 
                  perspiciatis aperiam deserunt perferendis iure voluptas recusandae exercitationem voluptate doloribus.
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vitae eos, nesciunt, sunt at ullam reiciendis numquam eius dolor quasi tenetur, 
                  perspiciatis aperiam deserunt perferendis iure voluptas recusandae exercitationem voluptate doloribus.
                  </p>
            </section>
            }
            <section className="w-full h-auto pl-[7%] bg-slate-900 rounded-xl flex flex-col pt-[8px] mb-[10px] pb-[8px] pr-[13px]">
              <h1 className="text-[15px] text-gray-300 font-semibold">Organization Profiles : </h1>
              <OrganizationCard/>
              {isCreateNewOrg && <CreateOrganizationForm setIsCreateNewOrg={setIsCreateNewOrg}/>}
              <button type="button" onClick={()=>setIsCreateNewOrg(true)} className="w-full mt-4 py-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Create A New Organization
              </button>
            </section>
        </div>
      </div>
    </div>
  )
}

export default RecruiterProfileContainer
