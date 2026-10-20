"use client";

import type { HTMLAttributes } from "react";
import { markHydrated } from "@/lib/hydrated";

/* ============================================================================
   STAGE WINDOW HOST (Oct 20, fix5) — the empty column the live stage portals
   a split window's layer into (components/stage/stage-window.tsx renders it).
   Same markup as before (an empty div with `data-stage-window-host`); the only
   difference is its ref: React runs it in the commit that hydrates the
   section's Suspense boundary, so `elHydrated(host)` (lib/hydrated.ts) tells
   the stage when this ONE window may take its layer without waiting for the
   whole page (a layer put in before its boundary hydrated made React throw
   #418 on a slow CPU). Receives only plain data attributes from the server.
   ========================================================================== */

export function StageWindowHost(props: HTMLAttributes<HTMLDivElement>) {
  return <div data-stage-window-host="" className="stage-window-host" ref={markHydrated} {...props} />;
}
