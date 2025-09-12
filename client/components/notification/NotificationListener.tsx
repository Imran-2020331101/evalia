"use client"; 
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../../redux/features/notification";
import { isSignedIn, user } from "@/redux/features/auth";
import { useAppDispatch } from "@/redux/lib/hooks";
import { toast } from "sonner";


export default function NotificationListener() {
  const [isMounted, setIsMounted]=useState<boolean>(false);
  const dispatch = useAppDispatch()
  // const notifications = useSelector(selectNotifications);
  const currentUser = useSelector(user)

  const SOCKET_URL = "http://localhost:6001";

  useEffect(() => {

    const socket = io(SOCKET_URL, { 
      withCredentials: true, 
    });
    
    socket.on("connect", () => {
      console.log("Connected to notification service");
    });
    
    socket.on("notification", (notif) => {
      console.log("New notification received:", notif);
      toast.success(`${notif.title}`);
      dispatch(addNotification(notif));
    });
    
    socket.on("interview",(notif)=>{
      toast.success(`${notif.title}`);
      console.log("new interview notification",notif);
    })


    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?.user?.email]);

  return null; 
}
