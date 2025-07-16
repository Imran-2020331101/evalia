'use client'
import { useEffect, useRef, useState } from 'react';

const MediaHandler = () => {
    const [status, setStatus] = useState('⏳ Waiting...');
    const [isRecording, setIsRecording] = useState(false);

    const audioChunksRef = useRef<Blob[]>([]);
    const videoChunksRef = useRef<Blob[]>([]);

    const audioRecorderRef = useRef<MediaRecorder | null>(null);
    const videoRecorderRef = useRef<MediaRecorder | null>(null);

    const audioStreamRef = useRef<MediaStream | null>(null);
    const videoStreamRef = useRef<MediaStream | null>(null);

    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isSpeakingRef = useRef(false);

    const resetTimers = () => {
        clearTimeout(silenceTimerRef.current!);
        clearTimeout(idleTimerRef.current!);
    };

    const stopRecording = () => {
        resetTimers();
        if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);

        isSpeakingRef.current=false;
        setIsRecording(false);
        setStatus('📤 Sending...');

        audioRecorderRef.current?.stop();
        videoRecorderRef.current?.stop();

        // audioStreamRef.current?.getTracks().forEach((track) => track.stop());
        // videoStreamRef.current?.getTracks().forEach((track) => track.stop());
    };

    const startRecording = async () => {
        setStatus('🎥 Initializing...');

        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
        });

        audioStreamRef.current = audioStream;
        videoStreamRef.current = videoStream;

        if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = videoStream;
        videoPreviewRef.current.play();
        }

        audioChunksRef.current = [];
        videoChunksRef.current = [];

        const audioRecorder = new MediaRecorder(audioStream);
        audioRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        audioRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleSendAudio(blob);
        };
        audioRecorder.start();
        audioRecorderRef.current = audioRecorder;

        const videoRecorder = new MediaRecorder(videoStream);
        videoRecorder.ondataavailable = (e) => videoChunksRef.current.push(e.data);
        videoRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        handleSendVideo(blob);
        };
        videoRecorder.start();
        videoRecorderRef.current = videoRecorder;

        setIsRecording(true);
        setStatus('🎤 Listening...');

        startCustomVAD(audioStream);
    };

    const startCustomVAD = (stream: MediaStream) => {
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        const micSource = audioCtx.createMediaStreamSource(stream);
        micSource.connect(analyser);

        const dataArray = new Uint8Array(analyser.fftSize);
        const silenceThreshold = 5; // Adjust if needed
        let silenceDuration = 0;

        // Start 5s idle timer
        idleTimerRef.current = setTimeout(() => {
            setStatus('❌ No speech in 5s...');
            stopRecording();
        }, 5000);

        vadIntervalRef.current = setInterval(() => {
            analyser.getByteTimeDomainData(dataArray);
            const volume = getVolume(dataArray);

            if (volume > silenceThreshold) {
            if (!isSpeakingRef.current) {
                isSpeakingRef.current = true;
                setStatus('🗣️ Voice detected...');
            }

            // 🔁 Reset all timers on speech
            silenceDuration = 0;
            clearTimeout(idleTimerRef.current!);
            clearTimeout(silenceTimerRef.current!);

            } else {
            // If previously speaking, check for silence timeout
            if (isSpeakingRef.current) {
                silenceDuration++;
                if (silenceDuration >= 30) {
                setStatus('🤫 Silence detected (3s)...');
                stopRecording();
                }
            }
            }
        }, 100); // Check every 100ms
        };


    const getVolume = (data: Uint8Array): number => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
        const value = data[i] - 128; // normalize
        sum += value * value;
        }
        return Math.sqrt(sum / data.length);
    };

    const handleSendAudio = (audioBlob: Blob) => {
        console.log('🔊 Sending audio blob:', audioBlob);
        // uploadAudio(audioBlob); // call your Whisper/STT backend here
    };

    const handleSendVideo = (videoBlob: Blob) => {
        console.log('📹 Sending video blob:', videoBlob);
        // uploadVideo(videoBlob); // call your face/emotion backend here
    };

  return (
    <div className='w-full h-full'>
        <div className="relative w-full h-full">
            <video
            ref={videoPreviewRef}
            className="absolute top-0 left-0 right-0 bottom-0 w-full h-full"
            muted
            autoPlay
            />
            {
                !isRecording && <div className="absolute top-0 left-0 right-0 bottom-0  flex justify-center items-center">
                                    <button
                                        onClick={startRecording}
                                        disabled={isRecording}
                                        className="px-4 py-2 bg-green-600 text-white rounded"
                                    >
                                        ▶️ Start Interview
                                    </button>
                                </div>
            }
        </div>
      
    </div>
  )
}

export default MediaHandler
