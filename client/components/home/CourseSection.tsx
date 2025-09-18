// app/components/CourseSection.tsx
"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable, InertiaPlugin } from "gsap/all";
import { Syncopate } from "next/font/google";
import CourseCard from "./CourseCard";
// import CourseCard, { CourseSchema } from "./CourseCard"; // adjust path if needed

gsap.registerPlugin(Draggable, InertiaPlugin);

const syncopate = Syncopate({
  weight: ["400", "700"],
  subsets: ["latin"],
});


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

export const sampleCourses: CourseSchema[] = [
  {
    videoId: 'aircAruvnKk',
    title: 'But what is a neural network? | Deep learning, chapter 1',
    description: "Grant Sanderson (3Blue1Brown) gives a visual, intuition-first explanation of neural networks and how they learn.",
    channelTitle: '3Blue1Brown',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/aircAruvnKk/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/aircAruvnKk/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/aircAruvnKk/hqdefault.jpg' },
    },
  },
  {
    videoId: '0VH1Lim8gL8',
    title: 'MIT 6.S191 Lecture 1 — Introduction to Deep Learning',
    description: 'Intro lecture from MIT’s “Introduction to Deep Learning” (6.S191) — great classroom-style overview of models and applications.',
    channelTitle: 'MIT',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/0VH1Lim8gL8/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/0VH1Lim8gL8/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/0VH1Lim8gL8/hqdefault.jpg' },
    },
  },
  {
    videoId: 'yp9rwI_LZX8',
    title: 'CS231n Lecture 1 — Introduction and Historical Context',
    description: 'Stanford CS231n lecture: an excellent deep-dive introduction to convolutional neural networks and the history of computer vision.',
    channelTitle: 'Stanford University / CS231n',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/yp9rwI_LZX8/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/yp9rwI_LZX8/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/yp9rwI_LZX8/hqdefault.jpg' },
    },
  },
  {
    videoId: 'vyOUX-uB_PQ',
    title: "This AI Learns Faster Than Anything We've Seen! (Two Minute Papers)",
    description: "Two Minute Papers covers fast-moving AI research in short, accessible episodes — great for staying inspired.",
    channelTitle: 'Two Minute Papers',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/vyOUX-uB_PQ/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/vyOUX-uB_PQ/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/vyOUX-uB_PQ/hqdefault.jpg' },
    },
  },
  {
    videoId: 'lLBbsif2Xt4',
    title: 'Geoffrey Hinton, the “Godfather of AI” (Interview / excerpt)',
    description: 'A useful interview/clip with Geoffrey Hinton on the progress and risks of modern AI — good for high-level context and ethics.',
    channelTitle: 'Lex Fridman / Clips',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/lLBbsif2Xt4/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/lLBbsif2Xt4/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/lLBbsif2Xt4/hqdefault.jpg' },
    },
  },
  {
    videoId: 'Ilg3gGewQ5U',
    title: 'Backpropagation, intuitively | Deep Learning Chapter 3 (3Blue1Brown)',
    description: 'A gentle, visual explanation of backpropagation and gradient descent — great for intuition before jumping into math/code.',
    channelTitle: '3Blue1Brown',
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/Ilg3gGewQ5U/default.jpg' },
      medium: { url: 'https://i.ytimg.com/vi/Ilg3gGewQ5U/mqdefault.jpg' },
      high: { url: 'https://i.ytimg.com/vi/Ilg3gGewQ5U/hqdefault.jpg' },
    },
  },
];


const CourseSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggableRef = useRef<any>(null);

  const setupDraggable = () => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // Ensure layout has been painted so we get correct widths
    // (helps on first render)
    requestAnimationFrame(() => {
      const firstSlide = track.children[0] as HTMLElement | undefined;
      if (!firstSlide) return;

      const containerWidth = container.offsetWidth;
      const firstSlideWidth = firstSlide.getBoundingClientRect().width;

      // center first slide horizontally inside container
      const centerOffset = (containerWidth - firstSlideWidth) / 2;

      // set initial x to center first slide
      gsap.set(track, { x: centerOffset });

      // Kill previous draggable(s)
      if (draggableRef.current) {
        try {
          // Draggable.create returns an array of instances
          if (Array.isArray(draggableRef.current)) {
            draggableRef.current.forEach((d: any) => d.kill());
          } else if (Array.isArray(draggableRef.current[0])) {
            // in some code paths it was stored as array inside array
            draggableRef.current[0].forEach((d: any) => d.kill());
          } else {
            // fallback
            draggableRef.current.kill?.();
          }
        } catch (e) {
          // ignore
        }
        draggableRef.current = null;
      }

      // If track is narrower than container, no dragging needed
      const trackScrollWidth = track.scrollWidth;
      if (trackScrollWidth <= containerWidth) {
        // center the track and exit
        gsap.set(track, { x: (containerWidth - trackScrollWidth) / 2 });
        return;
      }

      // max negative drag (when track fully left)
      const maxDrag = containerWidth - trackScrollWidth;

      // create draggable
      const instances = Draggable.create(track, {
        type: "x",
        inertia: true,
        bounds: { minX: maxDrag, maxX: centerOffset },
        edgeResistance: 0.85,
        throwResistance: 2000,
        cursor: "grab",
        activeCursor: "grabbing",
        onPress() {
          // optional: subtle scale / shadow when pressing
          gsap.to(this.target, { scale: 1, overwrite: true });
        },
        onRelease() {
          // nothing special now
        },
      });

      draggableRef.current = instances;
    });
  };

  useEffect(() => {
    setupDraggable();
    window.addEventListener("resize", setupDraggable);
    // in case fonts/images load later, re-run a couple times
    const reRun = setTimeout(setupDraggable, 300);
    const reRun2 = setTimeout(setupDraggable, 1000);
    return () => {
      window.removeEventListener("resize", setupDraggable);
      clearTimeout(reRun);
      clearTimeout(reRun2);
      // cleanup instances on unmount
      if (draggableRef.current) {
        try {
          if (Array.isArray(draggableRef.current)) {
            draggableRef.current.forEach((d: any) => d.kill());
          } else {
            draggableRef.current.kill?.();
          }
        } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once; if your course list changes dynamically, include it here

  return (
    <section className="w-full min-h-[120vh] flex justify-center items-center bg-gray-950/90 pt-[5vh] shrink-0">
      <div
        ref={containerRef}
        className="overflow-hidden w-full h-[90vh] rounded-md"
        aria-label="Courses carousel container"
      >
        <div
          ref={trackRef}
          className="flex gap-4 px-10 py-10 h-full items-stretch"
          style={{ touchAction: "pan-y", willChange: "transform", alignItems: "stretch" }}
        >
          {sampleCourses.map((course, index) => (
            <div
              key={course.videoId || index}
              className="w-[450px] relative h-full overflow-hidden shadow-lg flex-shrink-0"
            >
              {/* keep the same look: Card occupies full slide */}
              <CourseCard course={course} className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
