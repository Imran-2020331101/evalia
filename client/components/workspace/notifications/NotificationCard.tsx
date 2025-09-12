'use client'

import { Bell, CheckCircle2, Info, AlertTriangle, Link as LinkIcon, TimerIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NotificationCardProps {
  notification: any
}

const typeIcons: Record<string, React.JSX.Element> = {
  success: <CheckCircle2 className="text-green-500 size-5" />,
  info: <Info className="text-blue-500 size-5" />,
  warning: <AlertTriangle className="text-yellow-500 size-5" />,
  interview_scheduled:<TimerIcon className="text-blue-500 size-5"/>,
  default: <Bell className="text-gray-400 size-5" />,
}



const NotificationCard = ({ notification }: NotificationCardProps) => {
  const icon = typeIcons[notification.type] || typeIcons.default
  const typeLink :Record<string, string|null> = {
    success:'',
    info: '',
    warning:'',
    interview_scheduled:`/workspace/interviews/on-going/${notification?.data?.interviewId}`,
    default: null,
  }
  const link = typeLink[notification.type] || typeLink.default
  return (
    <div
      className={cn(
        "w-full rounded-2xl border bg-gray-900/60 shadow-md transition hover:shadow-lg  border-transparent",
        !notification.isRead && " border-l-4 border-blue-500"
      )}
    >
      <div className="p-4 flex gap-3 items-start">
        {/* Icon */}
        <div className="flex-shrink-0">{icon}</div>

        {/* Text content */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-300">{notification.title}</h3>
          <p className="text-sm text-gray-400">{notification.message}</p>
          
          {/* Timestamp */}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col self-end">
          {/* Optional link */}
          {link && (
            <Link
              href={link}
              className="mt-2 inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
            >
              <LinkIcon className="size-4" />
              View details
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}

export default NotificationCard
