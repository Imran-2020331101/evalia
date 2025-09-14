'use client'

import React, { useState } from 'react'
import { Play, User, Calendar, ExternalLink, Bookmark } from 'lucide-react'
// import type { CourseSchema } from './CourseCard'

type Props = {
  course?: any
  className?: string
}

export default function CourseCardCompact({ course, className = '' }: Props) {
  const thumb =
    course.thumbnails?.medium?.url || course.thumbnails?.high?.url || course.thumbnails?.default?.url || ''

  const videoUrl = `https://www.youtube.com/watch?v=${course.videoId}`
  const channelUrl = course.channelId ? `https://www.youtube.com/channel/${course.channelId}` : undefined

  const [saved, setSaved] = useState<boolean>(false)

  function toggleSave() {
    setSaved((s) => !s)
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

  return (
    <article
      className={`bg-gray-900/70 border border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col gap-2 p-3 ${className}`}
      aria-label={`Course: ${course.title}`}
    >
      {/* Thumbnail */}
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-full h-32 rounded-lg overflow-hidden"
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
            <Play size={28} />
          </div>
        )}

        {/* overlay play icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
            <Play size={14} />
          </div>
        </div>
      </a>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="group">
          <h3 className="text-sm font-medium text-slate-100 line-clamp-2 group-hover:text-indigo-400">
            {course.title}
          </h3>
        </a>

        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
          {course.description || 'No description available.'}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <a
              href={channelUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-indigo-400"
              aria-label={`Open channel ${course.channelTitle || 'channel'}`}
            >
              <User size={12} />
              <span className="truncate max-w-[6rem]">{course.channelTitle || 'Unknown'}</span>
              {channelUrl && <ExternalLink size={11} className="ml-0.5" />}
            </a>
            <span className="flex items-center gap-0.5">
              <Calendar size={11} />
              <time className="text-[11px] text-slate-500" dateTime={course.publishedAt || ''}>
                {formatDate(course.publishedAt)}
              </time>
            </span>
          </div>

          <button
            type="button"
            onClick={toggleSave}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-colors ${
              saved ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            <Bookmark size={11} /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </article>
  )
}
