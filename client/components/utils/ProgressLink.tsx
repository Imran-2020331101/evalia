"use client";

import Link, { LinkProps } from "next/link";
import NProgress from "nprogress";
import { AnchorHTMLAttributes } from "react";

export default function ProgressLink({
  children,
  ...props
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        NProgress.start();
        if (props.onClick) props.onClick(e);
      }}
    >
      {children}
    </Link>
  );
}
