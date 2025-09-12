'use client'
import { Bookmark } from "lucide-react"
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
           {
            currentAllNotifications.length?
            currentAllNotifications?.map((item:any, index:number)=> <NotificationCard key={index} notification={item}/>)
            :<section className="flex flex-col w-full h-full items-center justify-center text-center px-4">
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-full bg-gray-100 mb-4">
                    <Bookmark className="w-8 h-8 text-gray-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-300">
                    No Notifications Yet
                  </h2>
                  <p className="mt-2 text-gray-400 max-w-md">
                   You don’t have any notifications right now. New updates and alerts will appear here when they arrive.
                  </p>
                </div>
              </section>
           }
        </div>
    </div>
  )
}

export default NotificationContainer
