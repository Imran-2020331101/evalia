"use client"; 
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { addNotification, selectNotifications } from "../../redux/features/notification";


export default function NotificationListener() {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  const SOCKET_URL = "http://localhost:6001";

  // useEffect(() => {

  //   const socket = io(SOCKET_URL, { 
  //     withCredentials: true, 
  //   });
    
  //   socket.on("connect", () => {
  //     console.log("Connected to notification service");
  //   });
    
  //   socket.on("notification", (notif) => {
  //     console.log("New notification received:", notif);
  //     dispatch(addNotification(notif));
  //   });
    
  //   socket.on("connect_error", (error) => {
  //     console.error("Socket connection error:", error);
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, [ dispatch]);

  return null; 
}
