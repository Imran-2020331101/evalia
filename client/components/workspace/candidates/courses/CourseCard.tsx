'use client'

import React, { useEffect, useState } from 'react'
import { Play, User, Calendar, ExternalLink, Bookmark } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/lib/hooks'
import { saveCourse, savedCourses } from '@/redux/features/course'

export interface CourseSchema {
  videoId: string
  title: string
  description?: string
  channelId?: string
  channelTitle?: string
  thumbnails?: {
    default?: { url?: string }
    medium?: { url?: string }
    high?: { url?: string }
  }
  publishedAt?: string
}

type Props = {
  course: CourseSchema
  className?: string
}

export default function CourseCard({ course, className = '' }: Props) {
  const thumb =
    course.thumbnails?.medium?.url || course.thumbnails?.high?.url || course.thumbnails?.default?.url || ''

  const videoUrl = `https://www.youtube.com/watch?v=${course.videoId}`
  const channelUrl = course.channelId ? `https://www.youtube.com/channel/${course.channelId}` : undefined

  const [saved, setSaved] = useState<boolean>(false) // hardcoded initial state
  const dispatch = useAppDispatch();

  const currentSavedCourses = useAppSelector(savedCourses);

  function handleSave() {
    // implement saving logic here
    // setSaved((s) => !s)
    dispatch(saveCourse({data:course}))
    
  }

  const formatDate = (iso?: string) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return iso
    }
  }
  useEffect(()=>{
    currentSavedCourses?.forEach((item:any)=>{
     if( item?.videoId===course?.videoId){
      setSaved(true);
     }
    })
  },[currentSavedCourses?.length])

  return (
    <article
      className={`bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md flex flex-col md:flex-row gap-4 p-4 shrink-0 ${className}`}
      aria-label={`Course: ${course.title}`}
    >
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-full md:w-40 h-40 md:h-28 rounded-lg overflow-hidden flex-shrink-0"
      >
        {thumb ? (
          <img
            src={thumb}
            alt={`${course.title} thumbnail`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
            <Play size={34} />
          </div>
        )}

        {/* play overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <Play size={16} />
          </div>
        </div>
      </a>

      <div className="flex-1 min-w-0 flex flex-col">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="group">
          <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-indigo-400">
            {course.title}
          </h3>
        </a>

        <p className="mt-1 text-xs text-slate-400 line-clamp-3 overflow-hidden max-h-12">
          {course.description || 'No description available.'}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <a
              href={channelUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-indigo-400"
              aria-label={`Open channel ${course.channelTitle || 'channel'}`}
            >
              <User size={14} />
              <span className="truncate max-w-[10rem]">{course.channelTitle || 'Unknown channel'}</span>
              {channelUrl && <ExternalLink size={12} className="ml-1" />}
            </a>

            <span className="flex items-center gap-1">
              <Calendar size={12} />
              <time className="text-xs text-slate-500" dateTime={course.publishedAt || ''}>
                {formatDate(course.publishedAt)}
              </time>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saved?true:false}
              onClick={handleSave}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-colors ${
                saved ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              <Bookmark size={12} /> {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
