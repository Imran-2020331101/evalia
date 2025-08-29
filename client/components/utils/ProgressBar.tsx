// app/components/ProgressBar.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from 'nprogress'
import "nprogress/nprogress.css";

// Configure NProgress globally
NProgress.configure({ showSpinner: false, speed: 400 });

export default function ProgressBar() {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    // Skip the very first render (initial load)
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // Start progress when pathname changes
    NProgress.start();

    // Complete after a short delay (simulate latency)
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname]);

  return null;
}
