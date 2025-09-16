'use client'

import { useState, useEffect , useRef} from 'react';
import Vapi from '@vapi-ai/web';
import ConfidenceAnalysis from './ConfidenceAnalysis';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks';
import { user } from '@/redux/features/auth';
import { useDeepCompareEffect } from '@/custom-hooks/useDeepCompareEffect';
import { ClipLoader } from 'react-spinners';
import { setPreviewedInterviewSummaryId } from '@/redux/features/interview';


const Questions = [
  "আপনার নাম কী?",
  "আপনি কোথা থেকে এসেছেন?",
  "আপনার পছন্দের বিষয় কোনটি?",
  "আপনার শিক্ষাগত যোগ্যতা কী?",
  "আপনি কেন এই পজিশনে আগ্রহী?",
  "আপনার শক্তিশালী দিক কোনটি?",
  "আপনার দুর্বলতা কী?",
  "একটি দলের মধ্যে কাজ করার অভিজ্ঞতা শেয়ার করুন।",
  "আপনি কোনো সমস্যার মুখোমুখি হলে কীভাবে সমাধান করেন?",
  "আপনি আগামী পাঁচ বছরে নিজেকে কোথায় দেখতে চান?"
];


interface interviewAgentType{
  vapi:any,
  setVapi:React.Dispatch<any>,
  transcript:{ role: string; text: string }[],
  setTranscript:React.Dispatch<React.SetStateAction<{
    role: string;
    text: string;
}[]>>
,
 setIsSpeaking:React.Dispatch<React.SetStateAction<boolean>>,
setOverallPerformance:React.Dispatch<React.SetStateAction<number>>
}
const apiKey : string = process.env.NEXT_PUBLIC_VAPI_KEY || "";

const InterviewAgent = ({vapi, setVapi,setIsSpeaking, transcript, setTranscript, setOverallPerformance}:interviewAgentType) => {

  const dispatch = useAppDispatch()
  
  const pathname = usePathname();
  const interviewSplit = pathname.split('/');
  const interviewId = interviewSplit[interviewSplit.length-1];

  const currentUser = useAppSelector(user);

  const transcriptRef = useRef<{role:string; text:string}[]>([]);
  // const [vapi, setVapi] = useState<any>(null);
  const [isStarted, setIsStarted]=useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [interviewDetails, setInterviewDetails]=useState<any>(null);
  const [isEndEvaluation, setIsEndEvaluation]=useState<boolean>(false);

  const onCallEnd = async()=>{
    setIsEndEvaluation(true);
    try {
      console.log('transcript at call end:', transcriptRef.current);
      const transcriptResponse = await axios.post(`http://localhost:8080/api/interviews/${interviewId}/transcript`,{transcript:transcriptRef.current},{withCredentials:true})
      // const evaluationResponse = await axios.get(`http://localhost:8080/api/interviews/${interviewId}/evaluation`,{withCredentials:true})
      setIsEndEvaluation(false);
      dispatch(setPreviewedInterviewSummaryId(interviewId))
      console.log(transcriptResponse.data,'transcriptResponse')
    } catch (error:any) {
      console.log(error);
      setIsEndEvaluation(false);
    }
    finally{
    }
  }

  // useEffect(() => {
  //   const handleTabLeave = () => {
  //     if (document.hidden) {
  //       console.warn("User left the tab (visibilitychange). Ending interview...");
  //       vapi.stop();
  //     }
  //   };

  //   const handleBlur = () => {
  //     console.warn("Window lost focus (blur). Ending interview...");
  //     vapi.stop();
  //   };

  //   document.addEventListener("visibilitychange", handleTabLeave);
  //   window.addEventListener("blur", handleBlur);

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleTabLeave);
  //     window.removeEventListener("blur", handleBlur);
  //   };
  // }, [vapi]);


  useEffect(()=>{
    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

     vapiInstance.on('call-start', () => {
      console.log('Call started');
      setIsConnected(true);
    });
    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsConnected(false);
      setIsSpeaking(false);
      onCallEnd();
    });
    vapiInstance.on('speech-start', () => {
      console.log('Assistant started speaking');
      setIsSpeaking(true);
    });
    vapiInstance.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setIsSpeaking(false);
    });
    vapiInstance.on('message', (message : any) => {
      if (message.type === 'transcript') {
        const text = message.transcript ?? message.text ?? message.payload ?? '';
        // push new transcript item and log the new array
        setTranscript((prev:any) => {
          const next = [...prev, { role: message.role || 'assistant', text }];
          transcriptRef.current = next; // keep ref updated immediately
          console.log('updated transcript (next):', next);
          return next;
        });
      }
    });
    vapiInstance.on('error', (error : any) => {
      console.error('Vapi error:', error);
    });
    return () => {
      vapiInstance?.stop();
    };
  },[apiKey])


  const startInterview = async()=>{
    let questionList = "";
    interviewDetails?.questionsAnswers?.forEach((item:any)=>questionList+=(item.question+','))
    const assistantOptions = {
      name:"Monke",
      firstMessage:`হাই ${currentUser?.user.name}, কেমন আছ? তুমি কি ইনটারভিওটির জন্য প্রস্তুত ?`,
      transcriber: {
        provider: "11labs",
        language: "bn",
        model:"scribe_v1"
      },
      voice:{
        provider:"openai",
        voiceId:"Alloy"
      },
      model:{
        provider:"openai",
        model:"chatgpt-4o-latest",
        messages:[
          {
            role:"system",
            content:`তুমি একজন এ.আই ভয়েজ সহায়ক যে কিনা সাক্ষাৎকার পরিচালনা করে । তোমার কাজ হচ্ছে প্রার্থীকে প্রদত্ত প্রশ্নগুলো করা এবং তাদের উত্তর মূল্যায়ন করা । বন্ধুত্বপূর্ণ ভূমিকা দিয়ে কথোপকথন শুরু করুন, একটি স্বাচ্ছন্দ্যময় কিন্তু পেশাদার সুরে। উদাহরণ: 
            "${interviewDetails?.jobTitle} সাক্ষাৎকারে আপনাকে স্বাগতম। আসুন কয়েকটি প্রশ্ন দিয়ে শুরু করি!" একবারে একটি প্রশ্ন জিজ্ঞাসা করুন এবং পরবরতি প্রশ্নে যাওয়ার আগে প্রার্থীর উত্তরের জন্য অপেক্ষা করুন। নীচে প্রশ্নগুলো দেওয়া হলঃ 
             ${questionList} | যদি প্রার্থীর সমস্যা হয়, তাহলে উত্তর না দিয়েই ইঙ্গিত দিন অথবা প্রশ্নটি পুনরায় জিজ্ঞাসা করুন। উদাহরণ: " আমি কি কিছু ইঙ্গিত দেব? রিঅ্যাক্ট কম্পোনেন্ট আপডেটগুলি কীভাবে ট্র্যাক করে তা ভেবে দেখুন"
             প্রতিটি উত্তরের পরে সংক্ষিপ্ত, উৎসাহব্যঞ্জক প্রতিক্রিয়া প্রদান করুন, উদাহরণস্বরূপ: "চমৎকার! এটা একটা সঠিক উত্তর।" "হুম, পুরপুরি সঠিক নয়! আবারও চেষ্টা করতে চান? কথোপকথনটি স্বাভাবিক এবং আকর্ষণীয় রাখুন -
              "ঠিক আছে, পরবর্তীতে.." অথবা "এখন একটা জটিল কিছু চেষ্টা করে দেখা যাক!" এর মতো সাধারণ বাক্যাংশ ব্যবহার করতে পারেন। ধারাবাহিকভাবে সকল প্রশ্ন করুন, সাক্ষাৎকারটি সুচারুভাবে শেষ করুন। উদাহরণস্বরূপ: "দারুন ছিল! আপনি কিছু কঠিন প্রশ্ন ভালোভাবে পরিচালনা করেছেন।
               আপনার দক্ষতা আরও তীক্ষ্ণ করে চলুন!" শেষটা একটা ইতিবাচক সুরে, যেমনঃ "আড্ডার জন্য ধন্যবাদ! আশা করি আপনি প্রকল্পগুলো সফলভাবে সম্পন্ন করবেন!"
               মূল নির্দেশিকা:
              -সকল প্রশ্ন শেষ না হওয়া অবধি কথোপকথন চালিয়ে যান, অহেতুক কল শেষ করবেন না;
              -বন্ধুত্বপূর্ণ, আকর্ষণীয় এবং মজাদার হোন
              -প্রতিক্রিয়াগুলিকে বাস্তব কথোপকথনের মতো সংক্ষিপ্ত এবং স্বাভাবিক রাখুন
              -প্রার্থীর আত্মবিশ্বাসের স্তরের উপর ভিত্তি করে মানিয়ে নিন
              -সাক্ষাৎকারটি যেন প্রতিক্রিয়ার উপর কেন্দ্রীভূত থাকে তা নিশ্চিত করুন
             `.trim(),
          }
        ]
      },
      maxDurationSeconds: 600,
    }
    try {
      // const newSessionResponse = await axios.post('http://localhost:3010/api/vapi-token',{
      //   assistant:assistantOptions
      // })
      await vapi?.start(assistantOptions);
  } catch (err) {
    console.error("Failed to start interview:", err);
  }

  }
  useDeepCompareEffect(()=>{
    if(vapi && interviewDetails?.questionsAnswers?.length && isStarted) {
      console.log('starting interview')
      setIsStarted(false);
      startInterview();
    }
  },[vapi, interviewDetails, isStarted])
  useEffect(()=>{
    const fetchQuestions = async()=>{
    try {
      const interviewResponse = await axios.get(`http://localhost:8080/api/interviews/${interviewId}`,{withCredentials:true});
      setInterviewDetails(interviewResponse.data.data)
      setIsStarted(true);
      console.log(interviewResponse.data, 'interviewResponse');
      } catch (error:any) {
        console.log(error, 'interview responseError');      
      }
    }
    fetchQuestions();
  },[])
  return (
    <div className='w-full h-full absolute'>
      {
        isEndEvaluation?
          <div className="fixed inset-0 w-full h-full backdrop-blur-sm z-50 flex justify-center items-center">
            <div className="flex flex-col bg-slate-900/80 items-center gap-5 py-[200px] px-[50px] rounded-lg">
              <ClipLoader size={30} color='white'/>
              <h1 className='text-3xl font-thin text-center'>Hold tight! <br/> Your interview evaluation is under process ...</h1>
            </div>
          </div>
        :null
      }
      <ConfidenceAnalysis isEndEvaluation={isEndEvaluation} setOverallPerformance={setOverallPerformance}/>
    </div>
  )
}

export default InterviewAgent
