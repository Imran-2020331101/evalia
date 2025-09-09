"use client"; 
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import {  } from "../../redux/features/notification";
import { isSignedIn, user } from "@/redux/features/auth";


export default function NotificationListener() {
  const dispatch = useDispatch();
  // const notifications = useSelector(selectNotifications);
  const currentUser = useSelector(user)

  const SOCKET_URL = "http://localhost:6001";

  useEffect(() => {
    if(!currentUser) return ;

    const socket = io(SOCKET_URL, { 
      withCredentials: true, 
    });
    
    socket.on("connect", () => {
      console.log("Connected to notification service");
    });
    
    socket.on("notification", (notif) => {
      console.log("New notification received:", notif);
      // dispatch(addNotification(notif));
    });
    
    socket.on("interview",(notif)=>{
      console.log("new interview notification",notif);
    })


    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  return null; 
}
