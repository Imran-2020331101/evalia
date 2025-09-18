'use client'
import { setPreviewedInterviewSummaryId } from "@/redux/features/interview"
import { markAsFinalist, markAsShortListed, markShortlistedStatus, recruitersSelectedJob, rejectCandidate, rejectCandidateStatus } from "@/redux/features/job"
import { setCompatibilityReviewId, setPreviewedCandidate } from "@/redux/features/utils"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import axios from "axios"
import { Loader, User } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ClipLoader } from "react-spinners"
import { format } from "timeago.js"

interface propType{candidateEmail:any,applicantId:any, applicantStatus:any, appliedAt:any, reviewId:any, selected?:any, toggleSelectSingle?:any}

const CandidateCard = ({applicantId, applicantStatus, appliedAt, reviewId, candidateEmail, selected, toggleSelectSingle}:propType) => {
    const [applicant, setApplicant]= useState<any>(null);
    const [interviewDetails, setInterviewDetails]= useState<any>(null);
    const [isChecked, setIsChecked]=useState<boolean>(false);
    const candidateStatus = applicantStatus==='PENDING'?'text-blue-500':applicantStatus==='SHORTLISTED'?`text-indigo-400`:`text-teal-500`;
    const dispatch = useAppDispatch()

    const currentSelectedRecruiterJob = useAppSelector(recruitersSelectedJob);
    const currentRejectCandidateStatus = useAppSelector(rejectCandidateStatus);
    const currentMarkShortlistStatus = useAppSelector(markShortlistedStatus)

    const handleViewProfile = ()=>{
        dispatch(setCompatibilityReviewId(reviewId));
        dispatch(setPreviewedCandidate(applicant))
    }
    const handleMarkShortlist = ()=>{
        // console.log(currentSelectedRecruiterJob,candidateEmail )
        // dispatch(markAsShortListed({jobId:currentSelectedRecruiterJob._id,candidateEmail}));
    }
    const handleRemoveFromShortlist = ()=>{

    }
    const handleSelectChange =()=>{
        toggleSelectSingle(applicantId);
        // setIsChecked((prev)=>!prev);
    }

    const handleMarkSingleFinalist = ()=>{
              const data = {
                "candidateIds":[applicantId]
              }
              const jobId = currentSelectedRecruiterJob._id;
              console.log(data, 'submitted data')
        
              dispatch(markAsFinalist({data, jobId}));
          
    }
    const handleRejectCandidate = ()=>{
        const data = {
                "candidateIds":[applicantId]
              }
        const jobId = currentSelectedRecruiterJob._id;
        const status = applicantStatus;
        dispatch(rejectCandidate({data,jobId,status}));
    }
    useEffect(()=>{
        // if(currentRejectCandidateStatus==='success')
    },[currentRejectCandidateStatus])
    useEffect(()=>{
        const isSelected = selected?.find((item:string)=>item===applicantId);
        if(isSelected) setIsChecked(true)
        else setIsChecked(false)
    },[selected?.length])
    useEffect(()=>{
        const userId=applicantId;
        const fetchApplicantsData = async()=>{
            try {
                const response = await axios.get(`http://localhost:8080/api/user/${userId}/single`, {withCredentials:true});
                console.log(response.data, 'applicants fetched');
                setApplicant(response.data.data);

            } catch (error) {
                console.log(error);
            }
        }
         fetchApplicantsData();
    },[])
    useEffect(()=>{
        const fetchInterviewSummary = async()=>{
            const jobId = currentSelectedRecruiterJob?._id;
            const candidateId = applicantId;
            try {
                const interviewResponse = await axios.get(`http://localhost:8080/api/interviews/job/${jobId}/candidate/${candidateId}`,{withCredentials:true});
                setInterviewDetails(interviewResponse.data.data);
                console.log(interviewResponse.data,'interviewResponse data');
            } catch (error:any) {
                console.log(error, 'error fetching interview summary')
            }
        }
        if(currentSelectedRecruiterJob?._id && applicantId) {
             fetchInterviewSummary();
        }
       
    },[currentSelectedRecruiterJob?._id, applicantId])
    // useEffect(()=>{
    //     console.log('reviewId', reviewId)
    //     if(reviewId) dispatch(setCompatibilityReviewId(reviewId))
    // },[reviewId])
    if(!applicant) return null;
  return (
    <div className='w-full h-[60px] shrink-0 flex justify-start items-center px-2 gap-3 text-[12px] text-gray-200 border-b-[1px] border-gray-700 pb-2 hover:border-blue-500 transition-colors duration-300 '>
        {
            applicantStatus==='PENDING' && <input checked={isChecked} onChange={handleSelectChange} type="checkbox" className="self-start mt-2 size-3" />
        }
        {
            applicantStatus==='SHORTLISTED' && <input checked={isChecked} onChange={handleSelectChange} type="checkbox" className="self-start mt-2 size-3" />
        }
        <div className="w-[40px] h-[40px]  rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
            {applicant?.user?.profilePictureUrl ? (
                <Image
                width={40}
                height={40}
                alt="profile pic"
                src={applicant?.user?.profilePictureUrl}
                className="w-full h-full object-cover"
                />
            ) : (
                <User className="text-gray-300 w-6 h-6" />
            )}
        </div>
        <button onClick={handleViewProfile} className="flex-1 h-[40px] flex flex-col items-start gap-1">
            <p className='font-semibold'>{applicant?.user?.name||''}</p>
            <div className="w-full flex-1 flex justify-start items-center gap-2 text-[11px] ">
                <p className={candidateStatus}>{applicantStatus||''}</p><p className='text-[13px] font-extrabold'>{` . `}</p>
                <p>{applicant?.user?.location}</p><p className='text-[13px] font-extrabold'>{` . `}</p>
                {
                    appliedAt?<p>{`Applied : ${format(appliedAt)}`}</p>:null
                }
            </div>
        </button>
        <div className=" self-start mt-[-5px]  relative group">
            <p className="text-lg font-bold">...</p>
            <div className="absolute hidden group-hover:flex flex-col w-[200px] h-auto top-5 right-0 border border-gray-700 rounded-md z-10 bg-gray-900 backdrop-blur-2xl text-[10px] font-semibold">
                <button onClick={handleViewProfile} className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-blue-600 cursor-pointer">
                    View Profile
                </button>
                {/* <button disabled={currentMarkShortlistStatus==='pending'?true:false} onClick={applicantStatus==='PENDING'?handleMarkShortlist:handleRemoveFromShortlist} className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-teal-600 cursor-pointer">
                    {
                        currentMarkShortlistStatus==='pending'?<ClipLoader size={14} color="white" />:applicantStatus==='PENDING'?'Mark as Shortlisted':'Remove From ShortList'
                    }
                </button> */}
                {
                    applicantStatus==='PENDING' && <>
                        <button onClick={handleMarkSingleFinalist} className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-teal-600 cursor-pointer">
                            Mark as Finalist
                        </button>
                        <button disabled={currentRejectCandidateStatus==='pending'?true:false} onClick={handleRejectCandidate} className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-red-600 cursor-pointer">
                            {
                                currentRejectCandidateStatus==='pending'?
                                <div className=" flex gap-1 items-center">
                                    <Loader className="animate-spin size-4" />
                                    Reject
                                </div>:'Reject'
                            }
                        </button>
                    </>
                }
                {
                    applicantStatus==='SHORTLISTED' && <>
                        {
                            interviewDetails?.interviewStatus==='COMPLETED'?<button onClick={()=>dispatch(setPreviewedInterviewSummaryId(interviewDetails?.id))} className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-teal-600 cursor-pointer">
                                View Interview Summary
                            </button>:null
                        }
                        <button className=" flex justify-center items-center w-full h-[30px] border-b-[1px] border-gray-700 hover:border-red-600 cursor-pointer">
                            Reject
                        </button>
                    </>
                }
            </div>
        </div>
    </div>
  )
}

export default CandidateCard
