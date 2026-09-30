"use client";

/* ============================================================================
   PAGE HYDRATED (spec §4.2) — OWNER: B1-INTRO.
   The LAST Suspense child of app/page.tsx: once it hydrates, the whole page
   has. It will set window.__pageHydrated and emit "page:hydrated"
   (lib/events.ts).
   W1.0 stub: renders nothing and does nothing.
   ========================================================================== */

export function PageHydrated(): null {
  return null;
}
