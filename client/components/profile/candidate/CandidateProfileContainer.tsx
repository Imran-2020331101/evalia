'use client'
import CourseCard from "@/components/profile/candidate/suggested/CourseCard"
import JobCard from "@/components/profile/candidate/suggested/JobCard"
import CandidatesResumePanel from "@/components/utils/CandidatesResumePanel"
import { Edit, Edit3, File, Save, X } from "lucide-react"
import Image from "next/image"
import { useRef, useState , useEffect} from "react"
import CandidatesProfileResumePanel from "./CandidatesProfileResumePanel"
import UploadResume from "./UploadResume"


interface propType {
  user:any
}

const CandidateProfileContainer = ({user}:propType) => {
  const coverPhotoRef = useRef<null|HTMLInputElement>(null)
  const profilePhotoRef = useRef<null|HTMLInputElement>(null)
  const resumeContainerRef = useRef<null | HTMLDivElement>(null)
  const resumePreviewContainerRef = useRef<null | HTMLDivElement>(null)

  const[isEditAbout, setIsAboutEdit]=useState<boolean>(false);
  const [isUploadResume, setIsUploadResume] = useState<boolean>(false);
  const [isShowResume, setIsShowResume] = useState<boolean>(false);
  const [isEditBasicInfo, setIsEditBasicInfo]= useState<boolean>(false);

  const [coverPhoto, setCoverPhoto] = useState<File | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)

   const [form, setForm] = useState({
    name: "Matt Murdock",
    title: "Final-Year CS Undergrad | Full-Stack Web Developer",
    location: "Sylhet, Bangladesh",
    email: "matt1223@gmail.com",
  });

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Profile:", form);
  };

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
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resumeContainerRef.current && !resumeContainerRef.current.contains(event.target as Node)) {
         setIsUploadResume(false);
      }
      if (resumePreviewContainerRef.current && !resumePreviewContainerRef.current.contains(event.target as Node)) {
         setIsShowResume(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUploadResume, isShowResume]);
  return (
      <div className="w-full h-full bg-gray-950/80 flex items-start justify-center py-[10px] ">
      <div className="w-[85%] ml-[5%] h-full rounded-lg flex justify-center items-center p-[6px] gap-[13px]">
        <div className="w-[60%] h-full flex flex-col pb-[40px] gap-[14px] overflow-y-scroll scrollbar-hidden ">
            <section className='w-full h-auto bg-slate-900 rounded-xl'>
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
                {
                  !isEditBasicInfo?
                  <div className="flex-1 w-full pt-[7%] pl-[7%] flex flex-col">
                    <p className="text-xl font-semibold text-gray-200 flex items-center">Matt Murdock <button onClick={()=>setIsEditBasicInfo(true)}><Edit3 className="size-4 ml-2"/></button></p>
                    <div className="w-full min-h-[80px] flex justify-between items-start">
                      <div className="w-[60%] h-auto">
                          <p className="w-full max-h-[40px] text-[13px] flex justify-start items-start overflow-hidden text-gray-400">Final-Year CS Undergrad | Full-Stack Web Developer</p>
                          <p className="w-full max-h-[40px] text-[13px] flex justify-start  overflow-hidden text-gray-400 items-center"><span> {`📍 Sylhet, Bangladesh`}</span> <span className="text-2xl font-bold m-1 mt-[-8px]">.</span> <span>{`✉️ matt1223@gmail.com`}</span></p>
                      </div>
                      <div className="w-auto  h-full flex flex-col justify-start items-end gap-2 pr-[20px]">
                        {
                          isShowResume && <div className="fixed top-0 left-0 right-0 bottom-0 backdrop-blur-sm  flex justify-center items-center">
                              <div ref={resumePreviewContainerRef} className="w-[60%] h-[95%] bg-gray-200 rounded-lg overflow-y-scroll scroll-container">
                                <iframe src={'https://res.cloudinary.com/dz4jwmv4k/image/upload/v1755892984/Resume_ghoeng.pdf'} width="100%" height="auto" className="w-full h-full object-contain"></iframe>
                              </div>
                        </div>
                        }
                        <div className="flex gap-1 items-center">
                          <File className="text-green-700 size-6"/>
                          <button onClick={()=>setIsShowResume(true)} className="flex flex-col text-[11px] text-gray-400">
                            <p className="">Resume.pdf</p>
                            <p className="">200.20kb</p>
                          </button>
                        </div>
                        {
                          isUploadResume && <div  className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center backdrop-blur-sm">
                            <div className="absolute top-3 right-3">
                              <X className="size-7"/>
                            </div>
                          <div ref={resumeContainerRef} className="w-[40%] max-h-[95%] overflow-y-scroll scrollbar-hidden ">
                            <div className="w-full h-auto ">
                              <UploadResume/>
                            </div>
                          </div>
                        </div>
                        }
                        <button onClick={()=>setIsUploadResume(true)} className="text-[11px] px-4 py-1 rounded-lg cursor-pointer hover:text-gray-50 bg-gray-800 hover:bg-gray-600">
                          Upload a new CV
                        </button>
                      </div>
                    </div>
                  </div>
                  :
                   <form
                      onSubmit={handleBasicInfoSubmit}
                      className="w-full h-auto  p-6 rounded-2xl shadow-lg pl-[7%] space-y-4 mt-[60px]"
                    >
                      <div>
                        <label htmlFor="name" className="block text-gray-300 text-sm mb-1">
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleBasicInfoChange}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label htmlFor="title" className="block text-gray-300 text-sm mb-1">
                          Title / Position
                        </label>
                        <input
                          id="title"
                          name="title"
                          value={form.title}
                          onChange={handleBasicInfoChange}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-gray-300 text-sm mb-1">
                          Location
                        </label>
                        <input
                          id="location"
                          name="location"
                          value={form.location}
                          onChange={handleBasicInfoChange}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-gray-300 text-sm mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleBasicInfoChange}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={()=>setIsEditBasicInfo(false)}
                        type="button"
                        className="w-full py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold shadow-md transition"
                      >
                        Cancel
                      </button>
                    </form>
                }
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
            <section className="w-full min-h-[200px] bg-slate-900 rounded pb-[40px]">
              <CandidatesProfileResumePanel  />
            </section>
        </div>
        <div className="w-[40%] h-full   gap-[14px] ">
          <section className="w-full h-full bg-slate-900 rounded-xl flex flex-col overflow-y-scroll scrollbar-hidden p-[16px]">
              <section className="w-full h-1/2 shrink-0 flex flex-col gap-3">
                <p className="text-[14px] text-gray-300 font-semibold pb-2 border-b-[1px] border-gray-700">Suggested Jobs : </p>
                <div className="w-full flex-1 flex flex-col overflow-y-scroll scroll-container">
                  <JobCard/>
                  <JobCard/>
                  <JobCard/>
                  <JobCard/>
                  <JobCard/>
                  <JobCard/>
                </div>
              </section>
              <section className="w-full h-1/2 shrink-0 flex flex-col gap-3">
                <p className="text-[14px] text-gray-300 font-semibold pb-2 border-b-[1px] border-gray-700">Suggested Courses : </p>
                <div className="w-full flex-1 flex flex-col overflow-y-scroll scroll-container">
                  <CourseCard/>
                  <CourseCard/>
                  <CourseCard/>
                  <CourseCard/>
                  <CourseCard/>
                  <CourseCard/>
                  <CourseCard/>
                </div>
              </section>
          </section>
        </div>
        </div>
      </div>
  )
}

export default CandidateProfileContainer
