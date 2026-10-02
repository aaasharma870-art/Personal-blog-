/* ============================================================================
   ANALYTICS TRACKERS (PHASE3-SPEC §11.4) — OWNER: W3-CINEMA.
   The lazy half of lib/analytics.ts: loaded only when analytics would send
   (NEXT_PUBLIC_ANALYTICS="vercel") or, in development, under
   `?debug=analytics`. Every listener is passive and reads only what the
   page already knows (scroll position, the page bus); nothing is stored,
   nothing identifies the visitor.

   Events (each once per page view unless noted):
     depth          25 / 50 / 75 / 100 % of the scrollable height
     act            the first time each act card reaches p .5 (pinned: half
                    its travel; unpinned: its centre crossing the viewport's)
     directors_cut  { action: "start" } / { action: "stop", reason, pct }
                    (every run)
     toy            { name, action } (every toy event)
     egg_count      the found-count bucket "1-3" | "4-6" | "7-11" | "12",
                    when the bucket changes
     sound_on       the visitor turns sound on (every time)
   Nothing is tracked before `intro:quiet-end` (the ladder's quiet window).
   ========================================================================== */

import { track } from "@/lib/analytics";
import { on } from "@/lib/events";

const DEPTHS = [25, 50, 75, 100] as const;

function bucketOf(n: number): string | null {
  if (n >= 12) return "12";
  if (n >= 7) return "7-11";
  if (n >= 4) return "4-6";
  if (n >= 1) return "1-3";
  return null;
}

let started = false;

/** Start the trackers once; `flush` (when sending) runs on hidden / pagehide. */
export function startTrackers(flush: (() => void) | null): void {
  if (started || typeof window === "undefined") return;
  started = true;
  void import("@/lib/ladder")
    .then((m) => m.whenQuietEnd())
    .then(() => install(flush), () => install(flush));
}

function install(flush: (() => void) | null): void {
  /* — depth + act: one rAF-coalesced read per scroll ——————————————— */
  const depthDone = new Set<number>();
  const actDone = new Set<string>();
  let raf = 0;
  const read = () => {
    raf = 0;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const pct = (window.scrollY / max) * 100;
    for (const d of DEPTHS) {
      if (pct + 0.5 >= d && !depthDone.has(d)) {
        depthDone.add(d);
        track("depth", { pct: d });
      }
    }
    const vh = window.innerHeight;
    for (const card of document.querySelectorAll<HTMLElement>("[data-act-card]")) {
      if (!card.id || actDone.has(card.id)) continue;
      const pin = card.querySelector<HTMLElement>(":scope > [data-act-card-pin]") ?? card;
      const r = pin.getBoundingClientRect();
      const travel = r.height - vh;
      const p = travel > 1 ? -r.top / travel : (vh / 2 - r.top) / Math.max(1, r.height);
      if (p >= 0.5 && r.bottom > 0) {
        actDone.add(card.id);
        track("act", { act: card.id });
      }
    }
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(read);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* — the page bus ——————————————————————————————————————————————————— */
  on("dc:start", () => track("directors_cut", { action: "start" }));
  on("dc:stop", (d) => track("directors_cut", { action: "stop", reason: d.reason, pct: Math.round(d.pct) }));
  on("toy", (d) => track("toy", { name: d.toy, action: d.action }));
  let bucket: string | null = null;
  on("hunt:found", (d) => {
    const b = bucketOf(d.count);
    if (b && b !== bucket) {
      bucket = b;
      track("egg_count", { bucket: b });
    }
  });
  on("sound:change", (d) => {
    if (d.on) track("sound_on");
  });

  /* — batching (only when sending) ———————————————————————————————————— */
  if (flush) {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    window.addEventListener("pagehide", flush);
  }
}
