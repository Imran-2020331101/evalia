"use client"; 
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../../redux/notificationSlice";

const API_BASE = process.env.NEXT_PUBLIC_NOTIFICATION_WS!;

export default function NotificationListener() {
  const dispatch = useDispatch();
  const userId = useSelector((state: any) => state.auth.user?.id);

  useEffect(() => {
    if (!userId) return;

    const socket = io(API_BASE, { query: { userId } });
    socket.on("notification", (notif) => {
      dispatch(addNotification(notif));
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, dispatch]);

  return null; 
}
