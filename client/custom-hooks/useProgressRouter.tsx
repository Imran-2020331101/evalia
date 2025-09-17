// hooks/useProgressRouter.ts
"use client";

import { useRouter } from "next/navigation";
import NProgress from "nprogress";

export function useProgressRouter() {
  const router = useRouter();

  // Infer the parameter type of router.push / router.replace from the router instance
  type PushParams = Parameters<typeof router.push>;
  type Href = PushParams[0];

  const push = async (href: Href) => {
    NProgress.start();
    try {
      // router.push may or may not return a Promise depending on Next version,
      // so wrap it to be safe (works with both promise and void).
      await Promise.resolve(router.push(href));
    } finally {
      NProgress.done();
    }
  };

  const replace = async (href: Href) => {
    NProgress.start();
    try {
      await Promise.resolve(router.replace(href));
    } finally {
      NProgress.done();
    }
  };

  return { push, replace };
}
