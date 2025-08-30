'use client'
import CourseCard from "@/components/profile/candidate/suggested/CourseCard"
import JobCard from "@/components/profile/candidate/suggested/JobCard"
import CandidatesResumePanel from "@/components/utils/CandidatesResumePanel"
import { Edit, Edit3, File, Save, X } from "lucide-react"
import { ClipLoader } from "react-spinners"
import Image from "next/image"
import { useRef, useState , useEffect} from "react"
import CandidatesProfileResumePanel from "./Resume/CandidatesProfileResumePanel"
import UploadResume from "./UploadResume"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { userCoverPhotoUpdateStatus, userProfilePhotoUpdateStatus, userBasicInfoUpdateStatus , updateUserCoverPhoto, updateUserProfilePhoto, updateUserData, setUserBasicInfoUpdateStatus, analyzedUserResume} from "@/redux/features/auth"
import AnalyzeResumeSection from "./Resume/AnalyzeResumeSection"

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
  
  const [form, setForm] = useState({
    name: user?.user?.name||'',
    bio: user?.user?.bio || '',
    location:user?.user?.location||'',
    aboutMe:user?.user?.aboutMe||''
  });
  
    const dispatch = useAppDispatch()
  
    const currentCoverPhotoStatus = useAppSelector(userCoverPhotoUpdateStatus)
    const currentProfilePhotoStatus = useAppSelector(userProfilePhotoUpdateStatus)
    const currentUserBasicInfoUpdateStatus = useAppSelector(userBasicInfoUpdateStatus)
    const currentAnalyzedUserResume = useAppSelector(analyzedUserResume)

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateUserData(form))
    console.log("Updated Profile:", form);
  };

  const handleUploadCoverPhoto = async(e:React.ChangeEvent<HTMLInputElement>)=>{
      const file = e.target.files?.[0]??null;
      if(!file) return;
      const newFormData = new FormData();
      newFormData.append("file", file);
      dispatch(updateUserCoverPhoto(newFormData))
      
      // cover photo upload logic goes here 
    }
    const handleUploadProfilePhoto = (e:React.ChangeEvent<HTMLInputElement>)=>{
      const file = e.target.files?.[0]??null;
      if(!file) return;
      const newFormData = new FormData();
      newFormData.append("file", file);
      dispatch(updateUserProfilePhoto(newFormData))
      
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
  useEffect(()=>{
      if(currentUserBasicInfoUpdateStatus==='success') {
        setIsEditBasicInfo(false); setIsAboutEdit(false); dispatch(setUserBasicInfoUpdateStatus('idle'));
      }
    },[currentUserBasicInfoUpdateStatus])
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
                  {
                    currentCoverPhotoStatus==='pending'?<div className="absolute top-0 left-0 w-full h-full bg-gray-900/70 flex justify-center items-center">
                      <ClipLoader size={30} color="white"/>
                    </div>:null
                  }
                    <Image src={user?.user?.coverPictureUrl} alt="cover-photo" width={700} height={300} className="w-full h-full rounded-t-xl object-cover"/>
                    <div className="absolute bottom-[-25%] left-[5%] w-[150px] h-[150px] rounded-full">
                        <input ref={profilePhotoRef} type="file" accept="image" hidden onChange={handleUploadProfilePhoto} />
                        <button className="cursor-pointer rounded-full relative w-full h-full" onClick={()=>profilePhotoRef.current?.click()} >
                          {
                            currentProfilePhotoStatus==='pending'?<div className="absolute top-0 left-0 w-full h-full rounded-full bg-gray-900/70 flex justify-center items-center">
                              <ClipLoader size={30} color="white"/>
                            </div>:null
                          }
                            <Image src={user?.user?.profilePictureUrl || 'https://i.pinimg.com/736x/ce/f7/42/cef74289dbaa3b4199ccf640714cc17e.jpg'} alt="profile-photo" width={100} height={100} className=" w-full h-full rounded-full object-cover"/>
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
                    <p className="text-xl font-semibold text-gray-200 flex items-center">{user?.user?.name} <button onClick={()=>setIsEditBasicInfo(true)}><Edit3 className="size-4 ml-2"/></button></p>
                    <div className="w-full min-h-[80px] flex justify-between items-start">
                      <div className="w-[60%] h-auto">
                          <p className="w-full max-h-[40px] text-[13px] flex justify-start items-start overflow-hidden text-gray-400">{user?.user?.bio?user.user.bio:'No bio found, make a short bio'}</p>
                          <p className="w-full max-h-[40px] text-[13px] flex justify-start  overflow-hidden text-gray-400 items-center"><span> {user?.user?.location?`📍${user.user.location}`:'No location found, set you location'}</span> <span className="text-2xl font-bold m-1 mt-[-8px]">.</span> <span>{user?.user?.email}</span></p>
                      </div>
                      <div className="w-auto  h-full flex flex-col justify-start items-end gap-2 pr-[20px]">
                        {
                          isShowResume && <div className="fixed top-0 left-0 right-0 bottom-0 backdrop-blur-sm  flex justify-center items-center">
                              <div ref={resumePreviewContainerRef} className="w-[60%] h-[95%] bg-gray-200 rounded-lg overflow-y-scroll scroll-container">
                                <iframe src={user?.user?.resumeUrl || ''} width="100%" height="auto" className="w-full h-full object-contain"></iframe>
                              </div>
                        </div>
                        }
                        {
                          user?.user?.resumeUrl && <div className="flex gap-1 items-center">
                          <File className="text-green-700 size-6"/>
                          <button onClick={()=>setIsShowResume(true)} className="flex flex-col text-[11px] text-gray-400">
                            <p className="">Resume.pdf</p>
                            {/* <p className="">200.20kb</p> */}
                          </button>
                        </div>
                        }
                        {
                          isUploadResume && <div  className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center backdrop-blur-sm">
                            <div className="absolute top-3 right-3">
                              <X className="size-7"/>
                            </div>
                          <div ref={resumeContainerRef} className="w-[40%] max-h-[95%] overflow-y-scroll scrollbar-hidden ">
                            <div className="w-full h-auto ">
                              <UploadResume setIsUploadResume={setIsUploadResume}/>
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
                      className="flex flex-col gap-4 w-full px-[7%] pt-[8%] pb-[3%] bg-slate-900 rounded-xl "
                    >
                      {/* Full Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm text-gray-400 mb-1">
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleBasicInfoChange}
                          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. John Doe"
                        />
                      </div>

                      {/* Title */}
                      <div>
                        <label htmlFor="bio" className="block text-sm text-gray-400 mb-1">
                          Title / Position
                        </label>
                        <input
                          id="bio"
                          name="bio"
                          value={form.bio}
                          onChange={handleBasicInfoChange}
                          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Software Engineer"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <label htmlFor="location" className="block text-sm text-gray-400 mb-1">
                          Location
                        </label>
                        <input
                          id="location"
                          name="location"
                          value={form.location}
                          onChange={handleBasicInfoChange}
                          className="w-full p-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Dhaka, Bangladesh"
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 mt-4">
                        <button
                          disabled={currentUserBasicInfoUpdateStatus==='pending'?true:false}
                          type="submit"
                          className="flex-1 py-2 flex justify-center items-center gap-2 rounded-md cursor-pointer bg-green-700 hover:bg-green-600 text-white font-medium"
                        >
                          {currentUserBasicInfoUpdateStatus==='pending'?<ClipLoader size={17} color="white"/> :'Save Changes'}
                        </button>
                        <button
                          onClick={() => setIsEditBasicInfo(false)}
                          type="button"
                          className="flex-1 py-2 flex justify-center items-center gap-2 rounded-md cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>

                }
            </section>
            {
              isEditAbout?
              <section className="w-full min-h-[200px] bg-slate-900 rounded-xl p-[14px] pl-[7%] pt-[25px]">
                  <div className="w-full h-full relative">
                      <textarea value={form.aboutMe} onChange={handleBasicInfoChange} name="aboutMe" id="about" className="focus:border-2 focus:border-gray-600 w-full h-full rounded-xl border border-gray-800 outline-none focus:right-1 focus:ring-gray-400 scroll-container p-[14px] text-[13px] text-gray-300">
                      </textarea>
                      <label htmlFor="about" className="absolute left-1 top-[-14px] px-4 py-1 rounded-lg bg-slate-900 text-gray-300 text-[15px] font-semibold ">
                          <div className="flex gap-2">
                            <p>Edit About</p>
                            <button onClick={handleBasicInfoSubmit}>
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
                <p className="text-[13px] text-gray-300">{user?.user?.aboutMe?user.user.aboutMe:'You haven’t added an About section yet. Use this space to introduce yourself, share your background, interests, or anything you’d like others to know about you.'}
                  </p>
            </section>
            }
            <section className="w-full h-auto bg-slate-900 rounded-xl pb-[40px] ">
              {
                user?.user?.resumeData?<CandidatesProfileResumePanel isPreview={false}/>:currentAnalyzedUserResume?<CandidatesProfileResumePanel isPreview={true}/>: <AnalyzeResumeSection user={user} setIsUploadResume={setIsUploadResume}/>
              }
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
