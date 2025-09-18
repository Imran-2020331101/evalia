'use client'
import { useState, useEffect , useRef } from "react"
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { usePathname } from "next/navigation";

const PORT = 'http://localhost:4000'

interface propType {
    setOverallPerformance:React.Dispatch<React.SetStateAction<number>>
    isEndEvaluation:boolean
}

const ConfidenceAnalysis = ({setOverallPerformance,isEndEvaluation}:propType) => {
    const localVideoRef = useRef<HTMLVideoElement|null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap>|null>(null)
    const streamRef = useRef<MediaStream|null>(null)   // ✅ store stream here
    const intervalRef = useRef<NodeJS.Timeout|null>(null) // ✅ store interval id

    
    const pathname = usePathname();
    const interviewSplit = pathname.split('/');
    const interviewId = interviewSplit[interviewSplit.length-1];

    const prevEyeRef = useRef(1);
    const prevFaceRef = useRef(1);
    const prevBlinkRef = useRef(1);
    const overAllPerfRef = useRef(0);

    const updatePerformance = (metrics: any) => {
        const { faceCount, eyeContact, blinkRate , aggregateScore} = metrics;
        // console.log(metrics, 'metrics');
        const score = Math.floor(parseFloat(metrics.smoothedScore) *100);
        console.log(score, metrics.smoothedScore)
        setOverallPerformance(score);
    };

    useEffect(()=>{
        socketRef.current = io(PORT,{query:{interviewId}});
        socketRef.current.emit('join-room',interviewId);

        navigator.mediaDevices.getUserMedia({video:true, audio:true})
        .then(stream =>{
            streamRef.current = stream; // ✅ save reference
            if (localVideoRef.current && canvasRef.current) {
                localVideoRef.current.srcObject = stream
                const ctx = canvasRef.current?.getContext('2d')

                const sendFrames = ()=>{
                    if(ctx && localVideoRef.current && canvasRef.current){
                        ctx.drawImage(localVideoRef.current,0,0,canvasRef.current?.width, canvasRef.current?.height)
                    }
                    const formData = canvasRef.current?.toDataURL("image/jpeg",0.5);
                    socketRef.current?.emit('video-frames',{
                        interviewId,
                        frame:formData
                    })
                }

                intervalRef.current = setInterval(sendFrames,2000) // ✅ save interval id
            }
        })
        .catch(err => console.error("Error accessing media devices.", err))

        socketRef.current.on("metrics", (data) => {
            updatePerformance(data)
        });

        // cleanup on unmount
        return () => {
            if(socketRef.current) socketRef.current.disconnect();
            if(intervalRef.current) clearInterval(intervalRef.current);
            if(streamRef.current){
                streamRef.current.getTracks().forEach(track => track.stop()); // ✅ stop cam/mic
            }
        }
    },[interviewId])

    useEffect(()=>{
        if(isEndEvaluation){
            socketRef.current?.emit('disconnection',interviewId)
            if(socketRef.current) socketRef.current.disconnect();
            if(intervalRef.current) clearInterval(intervalRef.current);
            if(streamRef.current){
                streamRef.current.getTracks().forEach(track => track.stop()); // ✅ release
                streamRef.current = null;
            }
        }
    },[isEndEvaluation])

    return (
        <div className='w-full h-full'>
            <video 
              ref={localVideoRef} 
              playsInline 
              muted 
              autoPlay 
              width="320" 
              height="240" 
              className="w-full h-full object-cover rounded-2xl"
            />
            <canvas ref={canvasRef} width="320" height="240" className=" hidden" />
        </div>
    )
}

export default ConfidenceAnalysis
