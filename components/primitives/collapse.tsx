"use client";

import type { ReactNode } from "react";
import { requestScrollRefresh } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

/* ============================================================================
   COLLAPSE (spec §11.5, D3-9; plan §3.6) — OWNER: W2-WORDS.
   Native <details>, closed in the server HTML; toggling it changes the page
   height, so it asks for a scroll refresh (ScrollTrigger / Lenis
   measurements). Hook for styles: [data-collapse] (NOT the class
   `collapse`: in Tailwind v4 that is the `visibility: collapse` utility).
   W1.0: the real small version, used by no host yet.
   ========================================================================== */

export type CollapseProps = {
  summary: ReactNode;
  id?: string;
  className?: string;
  children?: ReactNode;
};

export function Collapse({ summary, id, className, children }: CollapseProps) {
  return (
    <details id={id} className={cn(className)} data-collapse="" onToggle={() => requestScrollRefresh()}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
