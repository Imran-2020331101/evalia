'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Draggable, InertiaPlugin } from 'gsap/all';
import { Syncopate } from 'next/font/google';

gsap.registerPlugin(Draggable, InertiaPlugin);

const syncopate = Syncopate({
  weight: ['400', '700'],
  subsets: ['latin'],
});

const courses = [
  'https://i.pinimg.com/1200x/93/55/52/9355528b367486a099cecb331d5e73dc.jpg',
  'https://i.pinimg.com/736x/71/26/82/71268220d39bd76be9aa3af632cc24a8.jpg',
  'https://i.pinimg.com/736x/78/de/4f/78de4fad31b25388da097d576ad431f0.jpg',
  'https://i.pinimg.com/736x/db/5b/9e/db5b9e3021c7a831e8a7ebe7f464969b.jpg',
  'https://i.pinimg.com/736x/20/51/a5/2051a5a907e6d61109608d61cbcb29c3.jpg',
];

const CourseSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<any>(null);

  const setupDraggable = () => {
    const container = containerRef.current;
    const track = trackRef.current;
    const firstSlide = track?.children[0] as HTMLDivElement;

    if (!container || !track || !firstSlide) return;

    const containerWidth = container.offsetWidth;
    const firstSlideWidth = firstSlide.getBoundingClientRect().width;

    // center first slide
    const centerOffset = (containerWidth - firstSlideWidth) / 2;
    gsap.set(track, { x: centerOffset });

    // cleanup previous instance
    if (draggableRef.current) {
      draggableRef.current[0].kill();
    }

    const maxDrag = containerWidth - track.scrollWidth;

    draggableRef.current = Draggable.create(track, {
      type: 'x',
      inertia: true,
      bounds: {
        minX: maxDrag,
        maxX: centerOffset,
      },
      edgeResistance: 0.85,
      throwResistance: 2000,
      cursor: 'grab',
      activeCursor: 'grabbing',
    });
  };

  useEffect(() => {
    setupDraggable();
    window.addEventListener('resize', setupDraggable);
    return () => window.removeEventListener('resize', setupDraggable);
  }, []);

  return (
    <div className="w-full min-h-[120vh] flex justify-center items-center bg-gray-950/90 pt-[5vh] shrink-0">
      <div
        ref={containerRef}
        className="overflow-hidden w-full h-[90vh] rounded-md"
      >
        <div
          ref={trackRef}
          className="flex gap-4 px-10 py-10 h-full"
          style={{ touchAction: 'pan-y', willChange: 'transform' }}
        >
          {courses.map((src, index) => (
            <div
              key={index}
              className="w-[450px] relative h-full overflow-hidden shadow-lg flex-shrink-0 bg-white"
            >
              <img
                src={src}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover absolute"
              />
              <div className="absolute bg-black/10 w-full h-full z-10 flex justify-start items-end ">
                <div className="w-full h-[200px] flex justify-start items-end p-4 bg-gradient-to-tr from-indigo-600/30  via-black/10 to-black/10">
                  <p className={`text-2xl ${syncopate.className} `}>{`course ${index+1}`}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseSection;
