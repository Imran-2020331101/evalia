'use client'
import { Edit, Edit3, File, Save , Plus, ImagePlus, User} from "lucide-react"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import OrganizationCard from "./OrganizationCard"
import CreateOrganizationForm from "./CreateOrganizationForm"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { getAllOrganizations, organizations, setUserBasicInfoUpdateStatus, updateUserCoverPhoto, updateUserData, updateUserProfilePhoto, userBasicInfoUpdateStatus, userCoverPhotoUpdateStatus, userProfilePhotoUpdateStatus } from "@/redux/features/auth"
import axios from "axios"
import { ClipLoader } from "react-spinners"

interface propType {
  user:any
}

const RecruiterProfileContainer = ({user}:propType) => {
  const coverPhotoRef = useRef<null|HTMLInputElement>(null)
  const profilePhotoRef = useRef<null|HTMLInputElement>(null)

  const[isEditBasicInfo, setIsEditBasicInfo]=useState<boolean>(false);
  const[isEditAbout, setIsAboutEdit]=useState<boolean>(false);
  const [isCreateNewOrg, setIsCreateNewOrg] = useState<boolean>(false);

  const [form, setForm] = useState({
    name: user?.user?.name||'',
    bio: user?.user?.bio || '',
    location:user?.user?.location||'',
    aboutMe:user?.user?.aboutMe||''
  });

  const dispatch = useAppDispatch()

  const currentOrganizations = useAppSelector(organizations);
  const currentCoverPhotoStatus = useAppSelector(userCoverPhotoUpdateStatus)
  const currentProfilePhotoStatus = useAppSelector(userProfilePhotoUpdateStatus)
  const currentUserBasicInfoUpdateStatus = useAppSelector(userBasicInfoUpdateStatus)

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
  const handleCreateNewOrganization =()=>{

  }

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        // Small timeout ensures scroll happens after hydration/layout
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 0);
      }
    }
  }, []);
  useEffect(()=>{
    console.log(user,'currentUser')
    if(!currentOrganizations.length)dispatch(getAllOrganizations())
  },[])
  useEffect(()=>{
    if(currentUserBasicInfoUpdateStatus==='success') {
      setIsEditBasicInfo(false); setIsAboutEdit(false); dispatch(setUserBasicInfoUpdateStatus('idle'));
    }
  },[currentUserBasicInfoUpdateStatus])
  return (
    <div className="w-full h-full bg-gray-950/80 flex items-start justify-center pt-[10px]">
      <div className="w-[65%] ml-[5%] h-full flex p-[6px] gap-[13px]">
        {/* <div className="w-[30%] h-full bg-red-600"></div> */}
        <div className="w-full h-full flex flex-col gap-[10px] overflow-y-scroll scrollbar-hidden">
            <section className='w-full h-auto bg-slate-900 rounded-xl'>
                <div className="w-full h-[200px] relative rounded-t-xl">
                  {
                    currentCoverPhotoStatus==='pending'?<div className="absolute top-0 left-0 w-full h-full bg-gray-900/70 flex justify-center items-center">
                      <ClipLoader size={30} color="white"/>
                    </div>:null
                  }
                    {
                      user?.user?.coverPictureUrl?
                        <Image src={user.user.coverPictureUrl } alt="profile-photo" width={1000} height={500} className=" w-full h-full object-cover rounded-t-xl"/>
                      :
                      <div className="w-full h-full bg-slate-900 rounded-t-xl border-b border-gray-500 flex justify-center items-center">
                        <ImagePlus className=" w-[60px] h-[60px] text-gray-500"/>
                      </div>
                    }
                    <div className="absolute bottom-[-25%] left-[5%] w-[150px] h-[150px] rounded-full">
                        <input ref={profilePhotoRef} type="file" accept="image" hidden onChange={handleUploadProfilePhoto} />
                        <button className="cursor-pointer rounded-full relative w-full h-full" onClick={()=>profilePhotoRef.current?.click()} >
                          {
                            currentProfilePhotoStatus==='pending'?<div className="absolute top-0 left-0 w-full h-full rounded-full bg-gray-900/70 flex justify-center items-center">
                              <ClipLoader size={30} color="white"/>
                            </div>:null
                          }
                           {
                              user?.user?.profilePictureUrl?
                                <Image src={user.user.profilePictureUrl } alt="profile-photo" width={100} height={100} className=" w-full h-full rounded-full object-cover"/>
                              :
                              <div className="w-full h-full bg-slate-900 rounded-full border border-gray-500 flex justify-center items-center">
                                <User className=" w-[40px] h-[40px] text-gray-500"/>
                              </div>
                            }
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
                  {!isEditBasicInfo?<>
                    <p className="text-xl font-semibold text-gray-200 flex items-center gap-2">{user?.user?.name} <button onClick={()=>setIsEditBasicInfo(true)} className="cursor-pointer"><Edit3 size={15} color="white"/></button></p>
                    <div className="w-full min-h-[80px] flex justify-between items-start">
                    <div className="w-[60%] h-auto">
                        <p className="w-full max-h-[40px] text-[13px] flex justify-start items-start overflow-hidden text-gray-400">{user?.user?.bio?user.user.bio:'No bio found, make a short bio'}</p>
                        <p className="w-full max-h-[40px] text-[13px] flex justify-start  overflow-hidden text-gray-400 items-center"><span> {user?.user?.location?`${user.user.location}`:'No location found, set you location'}</span> <span className="text-2xl font-bold m-1 mt-[-8px]">.</span> <span>{user?.user?.email}</span></p>
                    </div>
                    </div>
                  </>
                  :<form
                      onSubmit={handleBasicInfoSubmit}
                      className="flex flex-col gap-4 w-full pr-[7%] pb-[7%] bg-slate-900 rounded-xl "
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
                    
                </div>
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
            <section className="w-full h-auto pl-[7%] bg-slate-900 rounded-xl flex flex-col pt-[8px] mb-[10px] pb-[8px] pr-[13px]">
              <h1 className="text-[15px] text-gray-300 font-semibold">Organizational Profiles : </h1>
              {
                currentOrganizations.map((item:any)=><OrganizationCard key={item.id} organization={item}/>)
              }
              {isCreateNewOrg && <CreateOrganizationForm setIsCreateNewOrg={setIsCreateNewOrg}/>}
              <button id="create-organization" type="button" onClick={()=>setIsCreateNewOrg(true)} className="w-full mt-4 py-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Create A New Organization
              </button>
            </section>
        </div>
      </div>
    </div>
  )
}

export default RecruiterProfileContainer
