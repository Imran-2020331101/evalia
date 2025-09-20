"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Play, User, Calendar, ExternalLink, Bookmark } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/lib/hooks";
import {
  saveCourse,
  savedCourses,
  setUnsaveCourseStatus,
  unsaveCourse,
  unsaveCourseStatus,
} from "@/redux/features/course";

export interface CourseSchema {
  videoId: string;
  title: string;
  description?: string;
  channelId?: string;
  channelTitle?: string;
  thumbnails?: {
    default?: { url?: string };
    medium?: { url?: string };
    high?: { url?: string };
  };
  publishedAt?: string;
}

type Props = {
  course: CourseSchema;
  className?: string;
};

export default function CourseCard({ course, className = "" }: Props) {
  const thumb =
    course.thumbnails?.high?.url ||
    course.thumbnails?.medium?.url ||
    course.thumbnails?.default?.url ||
    "";

  const videoUrl = `https://www.youtube.com/watch?v=${course.videoId}`;
  const channelUrl = course.channelId
    ? `https://www.youtube.com/channel/${course.channelId}`
    : undefined;

  const [saved, setSaved] = useState<boolean>(false);
  const [isUnsave, setIsUnsave] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const currentSavedCourses = useAppSelector(savedCourses);
  const currentUnsaveCourseStatus = useAppSelector(unsaveCourseStatus);

  function handleSave(e?: React.MouseEvent) {
    // prevent parent link navigation if button is inside a link
    e?.stopPropagation();
    e?.preventDefault();

    if (saved) {
      setIsUnsave(true);
      dispatch(unsaveCourse({ videoId: course.videoId }));
      return;
    }

    dispatch(saveCourse({ data: course }));
  }

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  // initialize saved state from redux store
  useEffect(() => {
    if (!currentSavedCourses) return;
    for (const item of currentSavedCourses as any[]) {
      if (item?.videoId === course?.videoId) {
        setSaved(true);
        break;
      }
    }
    // only depend on length to detect changes (mirrors your previous logic)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSavedCourses?.length]);

  // respond to unsave status
  useEffect(() => {
    if (currentUnsaveCourseStatus === "success" && isUnsave) {
      setSaved(false);
      dispatch(setUnsaveCourseStatus("idle"));
      setIsUnsave(false);
    }
    if (currentUnsaveCourseStatus === "error") {
      setIsUnsave(false);
    }
  }, [currentUnsaveCourseStatus, dispatch, isUnsave]);

  return (
    <article
      className={`relative overflow-hidden rounded-2xl shadow-lg border border-gray-800 bg-black/30 transition-transform transform will-change-transform hover:scale-[1.015] hover:shadow-2xl ${className}`}
      aria-label={`Course: ${course.title}`}
    >
      {/* Background thumbnail (absolute) */}
      {thumb ? (
        <Image
          src={thumb}
          alt={course.title}
          width={800}
          height={1200}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700 pointer-events-none" />
      )}

      {/* translucent layer for subtle contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />

      {/* Top-right controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {/* <button
          onClick={handleSave}
          type="button"
          aria-pressed={saved}
          title={saved ? "Unsave course" : "Save course"}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium backdrop-blur-sm transition-colors ${
            saved
              ? "bg-indigo-600 text-white"
              : "bg-black/5 text-slate-200 hover:bg-black/15"
          }`}
        >
          <Bookmark size={14} />
          <span>{saved ? "Saved" : "Save"}</span>
        </button> */}
      </div>

      {/* Clickable content — open video in new tab */}
      <div
        // href={videoUrl}
        // target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 block w-full h-full"
        aria-label={`Open video: ${course.title}`}
      >
        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 shadow-md">
            <Play size={18} className="text-white/90" />
          </div>
        </div>

        {/* Bottom info panel */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <h3 className="text-sm font-semibold text-white truncate leading-tight">
            {course.title}
          </h3>

          <p className="mt-1 text-xs text-white/70 line-clamp-2 max-h-[3rem]">
            {course.description || "No description available."}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-white/70 min-w-0">
              <a
                href={channelUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 truncate hover:text-indigo-300"
                aria-label={`Open channel ${course.channelTitle || "channel"}`}
              >
                <User size={14} />
                <span className="truncate max-w-[10rem]">{course.channelTitle || "Unknown channel"}</span>
                {channelUrl && <ExternalLink size={12} className="ml-1" />}
              </a>

              <span className="flex items-center gap-1 ml-2">
                <Calendar size={12} />
                <time className="text-xs text-white/60" dateTime={course.publishedAt || ""}>
                  {formatDate(course.publishedAt)}
                </time>
              </span>
            </div>

            {/* small CTA: open on youtube */}
            <div className="flex items-center gap-2">
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 text-xs text-white/90 hover:bg-white/12 transition"
                title="Open on YouTube"
              >
                <Play size={12} />
                <span>Watch</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
