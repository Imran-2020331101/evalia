'use client'

import { allNotifications, getAllNotifications } from "@/redux/features/notification"
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks"
import { useEffect } from "react"

const NotificationContainer = () => {
  const dispatch = useAppDispatch()
  const currentAllNotifications = useAppSelector(allNotifications)
  useEffect(()=>{
    if(!currentAllNotifications?.length) dispatch(getAllNotifications())
  },[])
  return (
    <div className="w-full h-full flex justify-center items-center">
        <div className="h-[98%] w-[60%] flex flex-col overflow-y-scroll scrollbar-hidden">

        </div>
    </div>
  )
}

export default NotificationContainer
