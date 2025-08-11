'use client'
import { useState, useEffect , useRef } from "react"
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";


const PORT = 'http://localhost:5000'

interface propType {
    setOverallPerformance:React.Dispatch<React.SetStateAction<number>>
}

const ConfidenceAnalysis = ({setOverallPerformance}:propType) => {
    const localVideoRef = useRef<HTMLVideoElement|null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap>|null>(null)

    const interviewId = 1; //will be fetched later

    const prevEyeRef = useRef(1);
    const prevFaceRef = useRef(1);
    const prevBlinkRef = useRef(1);

    const updatePerformance = (metrics: any) => {
    const { faceCount, eyeContact, blinkRate } = metrics;

    let faceInstant = (faceCount === 1) ? 1 : Math.max(0, 1 - Math.abs(faceCount - 1) * 0.5);
    let eyeInstant = Math.min(Math.max(eyeContact, 0), 1);
    const maxBlink = 30;
    let blinkInstant = Math.max(0, 1 - blinkRate / maxBlink);

    const alpha = 0.2;
    prevFaceRef.current = prevFaceRef.current * (1 - alpha) + faceInstant * alpha;
    prevEyeRef.current = prevEyeRef.current * (1 - alpha) + eyeInstant * alpha;
    prevBlinkRef.current = prevBlinkRef.current * (1 - alpha) + blinkInstant * alpha;

    const overallPerf =
        prevFaceRef.current * 0.4 +
        prevEyeRef.current * 0.4 +
        prevBlinkRef.current * 0.2;

    setOverallPerformance(overallPerf);
    };



    useEffect(()=>{
        socketRef.current = io(PORT,{query:{interviewId}});
        socketRef.current.emit('join-room',interviewId);
        navigator.mediaDevices.getUserMedia({video:true, audio:true})
        .then(stream =>{
            if (localVideoRef.current && canvasRef.current) {
                localVideoRef.current.srcObject = stream
                const ctx = canvasRef.current?.getContext('2d')
                const senFrames = ()=>{
                    if(ctx && localVideoRef.current && canvasRef.current){
                        ctx.drawImage(localVideoRef.current,0,0,canvasRef.current?.width, canvasRef.current?.height)
                    }
                    const formData = canvasRef.current?.toDataURL("image/jpeg",0.5);
                    socketRef.current?.emit('video-frames',{
                        interviewId,
                        frame:formData
                    })
                }
                setInterval(senFrames,2000)
            }
        })
        .catch(err => console.error("Error accessing media devices.", err))

        socketRef.current.on("metrics", (data) => {
            updatePerformance(data)
            console.log("Performance metrics:", data);
        });

        return () => {
            if(socketRef.current) socketRef.current.disconnect();
        }
    },[interviewId])
  return (
    <div className='w-full h-full'>
      <video ref={localVideoRef} playsInline muted autoPlay width="320" height="240" className="w-full h-full object-cover rounded-2xl"/>
      <canvas ref={canvasRef} width="320" height="240" className=" hidden" />
    </div>
  )
}

export default ConfidenceAnalysis
