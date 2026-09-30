/* ============================================================================
   ANALYTICS — privacy-light scroll-depth events (PHASE3-SPEC §11.4).

   A NO-OP in Phase 3: it would send only when
   `process.env.NEXT_PUBLIC_ANALYTICS === "vercel"` AND `@vercel/analytics` is
   installed, and neither happens in Phase 3 (D3-14; Aryan decides at
   hosting). No cookies, no ids, no personal data, no third party. In
   development, `?debug=analytics` logs each event to the console.
   W3-CINEMA adds the trackers (depth, act, fast lane, chapter, director's
   cut, toys, egg-count buckets, sound on); they call `track()` only after
   `intro:quiet-end`.
   ========================================================================== */

export type TrackEvent =
  | "depth"
  | "act"
  | "fast_lane"
  | "chapter"
  | "directors_cut"
  | "toy"
  | "egg_count"
  | "sound_on";

export type TrackProps = Record<string, string | number | boolean>;

function debugOn(): boolean {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search)
    .getAll("debug")
    .flatMap((v) => v.split(","))
    .includes("analytics");
}

export function track(event: TrackEvent, props?: TrackProps): void {
  if (debugOn()) console.info("[analytics]", event, props ?? {});
}
