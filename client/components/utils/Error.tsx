"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const Error=()=> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<SVGSVGElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const router = useRouter()

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });

    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1 })
      .fromTo(iconRef.current, { scale: 0 }, { scale: 1, rotate: 360 }, "-=0.3")
      .fromTo(textRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.2")
      .fromTo(buttonRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, "-=0.3");
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center h-full w-full text-white px-6"
    >
      <AlertTriangle
        ref={iconRef}
        className="w-20 h-20 text-red-500 mb-6 drop-shadow-lg"
      />
      <div ref={textRef} className="text-center">
        <h1 className="text-6xl font-extrabold mb-2">Oops!</h1>
        <p className="text-xl text-gray-400 mb-4">
          Something went wrong. Please try again later.
        </p>
      </div>
      <button
        ref={buttonRef}
        onClick={() => router.push('/')}
        className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 transition-colors font-semibold text-lg shadow-lg"
      >
        Go Back Home
      </button>
    </div>
  );
}

export default Error;