/* ============================================================================
   ANALYTICS — privacy-light scroll-depth events (PHASE3-SPEC §11.4).
   OWNER: W3-CINEMA (the trackers; C0-LIB wrote the contract).

   A NO-OP in Phase 3. It would send only when
   `process.env.NEXT_PUBLIC_ANALYTICS === "vercel"` AND the @vercel/analytics
   script has put its `window.va` queue on the page, and neither happens in
   Phase 3 (D3-14; Aryan decides at hosting). This module never calls
   fetch / sendBeacon itself and loads nothing from any host: no cookies,
   no ids, no personal data, no third party. With the flag unset (every
   build today) `SEND` is the constant `false`, so the queue below is dead
   code and the first-load cost is the logger alone.

   In development, `?debug=analytics` logs each event to the console the
   moment it happens (production never logs).

   THE TRACKERS (components/director/analytics-trackers.ts, a lazy chunk
   loaded only when SEND is on or the debug flag is set): depth (25 / 50 /
   75 / 100 %), act (the first time each card reaches p .5), directors_cut
   (start / stop and the % reached), toy (name, action), egg_count (a
   bucket: 1–3 / 4–6 / 7–11 / 12) and sound_on. The header and the intro
   bridge call track("fast_lane") themselves; the chapter select calls
   track("chapter"). Events are queued and handed over after
   `intro:quiet-end`, batched on `visibilitychange` (hidden) and pagehide.
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

/** The one switch (inlined at build time; false in every Phase-3 build). */
const SEND = process.env.NEXT_PUBLIC_ANALYTICS === "vercel";

function debugOn(): boolean {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search)
    .getAll("debug")
    .flatMap((v) => v.split(","))
    .includes("analytics");
}

/** Events waiting for the batch (SEND only). */
const queue: [TrackEvent, TrackProps][] = [];

/** Hand the batch to the host's analytics queue, when there is one. */
function flush(): void {
  if (!SEND || !queue.length) return;
  const va = (window as Window & { va?: (kind: "event", data: { name: string; data?: TrackProps }) => void }).va;
  if (typeof va !== "function") return; // no script on the page: keep nothing, send nothing
  for (const [name, data] of queue.splice(0)) va("event", { name, data });
}

export function track(event: TrackEvent, props?: TrackProps): void {
  if (debugOn()) console.info("[analytics]", event, props ?? {});
  if (!SEND || typeof window === "undefined") return;
  queue.push([event, props ?? {}]);
  if (queue.length > 50) queue.splice(0, queue.length - 50);
}

/* The trackers and the batching load only where they can matter. In a
   production build without the flag this whole block is constant-false
   (both env reads are inlined) and is dropped with its dynamic import. */
if (typeof window !== "undefined" && (SEND || (process.env.NODE_ENV !== "production" && debugOn()))) {
  window.setTimeout(() => {
    void import("@/components/director/analytics-trackers").then(
      (m) => m.startTrackers(SEND ? flush : null),
      () => undefined,
    );
  }, 0);
}
