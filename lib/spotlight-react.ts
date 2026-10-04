"use client";

/* ============================================================================
   useScrollStar — a client host registers its element as a SCROLL star
   (lib/spotlight.ts: THE WINDOW). Desktop-fine with motion on only (the
   facade is a no-op elsewhere): it registers when both turn true, and
   unregisters when either turns false, on unmount or when `on` goes false.
   A gated host passes `onOwn` and holds its visual until it is told
   `true` (it waits out a time star's hold).

     const ref = useRef<SVGSVGElement>(null);
     useScrollStar(ref, "B44-ink", { weight: 1, own: "top 85%, bottom 35%" });
     <svg ref={ref} {...beatAttrs("B44-ink", { weight: 1 })}>…</svg>

   Markup-only hosts need no hook: `beatAttrs(id, { weight, scroll })`
   (lib/beats.ts) and the desktop words binder registers them.
   ========================================================================== */

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { BeatWeight } from "./beats";
import { DESKTOP_FINE, motionOffNow, onMotionOffChange } from "./flags";
import { spotlight } from "./spotlight";

export function useScrollStar(
  ref: RefObject<Element | null>,
  id: string,
  { weight, own, live, onOwn, on = true }: { weight: BeatWeight; own?: string; live?: boolean; onOwn?: (owned: boolean) => void; on?: boolean },
): void {
  // the latest callback without re-registering on every render
  const cb = useRef(onOwn);
  useEffect(() => {
    cb.current = onOwn;
  }, [onOwn]);
  const gated = Boolean(onOwn);
  useEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    // follows eligibility (the facade is a no-op while it is false): a view
    // that boots paused or narrow registers when motion / the width returns,
    // so the words binder's registration of the same element keeps the gate
    const mq = window.matchMedia(DESKTOP_FINE);
    let off: (() => void) | null = null;
    const sync = () => {
      const want = mq.matches && !motionOffNow();
      if (want && !off) {
        off = spotlight.registerScrollStar(id, el, weight, {
          own,
          live,
          onOwn: gated ? (owned) => cb.current?.(owned) : undefined,
        });
      } else if (!want && off) {
        off();
        off = null;
      }
    };
    sync();
    mq.addEventListener("change", sync);
    const offMotion = onMotionOffChange(sync);
    return () => {
      mq.removeEventListener("change", sync);
      offMotion();
      off?.();
    };
  }, [ref, id, weight, own, live, gated, on]);
}
