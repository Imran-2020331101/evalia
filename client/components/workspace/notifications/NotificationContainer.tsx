'use client'

import { allNotifications, getAllNotifications } from "@/redux/features/notification"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { useEffect } from "react"
import NotificationCard from "./NotificationCard"

const NotificationContainer = () => {
  const dispatch = useAppDispatch()
  const currentAllNotifications = useAppSelector(allNotifications) || []
  useEffect(()=>{
    if(!currentAllNotifications?.length)
     dispatch(getAllNotifications())
  },[currentAllNotifications.length])
  return (
    <div className="w-full h-full flex justify-center items-center">
        <div className="h-[96%] w-[60%] flex flex-col overflow-y-scroll scrollbar-hidden gap-3">
            <NotificationCard notification={{}}/>
            <NotificationCard notification={{}}/>
            <NotificationCard notification={{}}/>
            <NotificationCard notification={{}}/>
            <NotificationCard notification={{}}/>
            <NotificationCard notification={{}}/>
            <NotificationCard notification={{}}/>
            <NotificationCard notification={{}}/>
            <NotificationCard notification={{}}/>
            <NotificationCard notification={{}}/>
        </div>
    </div>
  )
}

export default NotificationContainer
