"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { loader as loaderTiming } from "@/lib/motion";

/**
 * The visible text status of a REAL route load (loaders.BAR §4, L14, L20):
 * a polite `role="status"` region mounted at once (so assistive tech has
 * registered it before anything is said), its text shown after the loader's
 * show delay (never a flash on a fast load), and — only when the route's
 * world has one — ONE later update after the idle stop: the stall line
 * (LD-3I: "Aal izz well", through FilmQuote, handed in as `stall`). A stall
 * line is never shown for an error: this component only lives inside a
 * Suspense fallback, which unmounts the moment the route resolves or fails.
 */
export function RouteStatus({
  status,
  stall,
  className,
}: {
  status: string;
  stall?: ReactNode;
  className?: string;
}) {
  const [phase, setPhase] = useState<"quiet" | "status" | "stall">("quiet");
  useEffect(() => {
    const show = window.setTimeout(() => setPhase("status"), loaderTiming.showDelayMs);
    const late = stall
      ? window.setTimeout(() => setPhase("stall"), loaderTiming.showDelayMs + loaderTiming.idleStopMs)
      : 0;
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(late);
    };
  }, [stall]);

  return (
    <div role="status" className={className}>
      {phase === "status" ? status : null}
      {phase === "stall" ? stall : null}
    </div>
  );
}
