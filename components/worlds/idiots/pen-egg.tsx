"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import type { FocalBox, MediaId } from "@/lib/media";
import { easeDraw } from "@/lib/motion";
import { EGG_EVENT } from "@/components/eggs/egg-bus";
import { EggHotspot } from "@/components/eggs/egg-hotspot";
import { ChalkFilter, useSvgId } from "@/components/worlds/idiots/chalk-motion";

/* ============================================================================
   THE WORTHY PEN (PHASE3-SPEC §9.1 #9, the `3i-pen` egg) — OWNER: W3-IDIOTS.
   LAZY: PenInset (plate-band.tsx) loads this chunk on DESKTOP_FINE only,
   after hydration — the only devices where the hotspot can be used (its
   button is also shown only by the full DESKTOP_FINE media query).

   PenHotspot  a transparent ≥ 44 px <EggHotspot hunt="3i-pen"> over the pen
               (its accessible name: "The astronaut pen"); activating it
               (pointer, Enter, Space) fires `worthy-pen` through the
               hotspots binder → triggerEgg. The egg runtime counts it only
               for the worthy and speaks the toast ("Worthy." / "Kept for the
               one who proves worthy. Read the whole ledger."); the sound
               engine plays the case creak + ting.
   PenWin      listens for that trigger and, ONLY when lib/hunt worthyOfPen()
               (every ledger row read, or Dead Eye won), draws Rancho's chalk
               circle round the pen (IC-3I-02): it draws in 0.9 s, holds and
               fades, gone by 3.6 s (an egg leaves nothing behind). Reduced
               motion / Pause: drawn at once, then removed. It is a
               REGISTERED overlay: it rides the plate's camera.
   The pen's box on each plate is measured on the 2560 × 1440 stills (a 10 %
   grid); the inset is 16:9 like the plates, so no crop maps it.
   ========================================================================== */

const PEN_RECT: Partial<Record<MediaId, FocalBox>> = {
  "iconic-pen": { x0: 0.515, x1: 0.79, y0: 0.555, y1: 0.645 },
  "iconic-pen-alt": { x0: 0.528, x1: 0.805, y0: 0.545, y1: 0.635 },
};

/** The circle's user space: the 16:9 inset as 160 × 90 (a uniform scale). */
const VB = { w: 160, h: 90 } as const;

/** A hand-drawn chalk loop round `r` (plate units → VB): a superellipse
 *  (n = 4) from ~10 o'clock, overshooting its start, drifting outward. */
function penLoop(r: FocalBox): string {
  const cx = ((r.x0 + r.x1) / 2) * VB.w;
  const cy = ((r.y0 + r.y1) / 2) * VB.h;
  const a = ((r.x1 - r.x0) / 2) * VB.w + 7;
  const b = ((r.y1 - r.y0) / 2) * VB.h + 6;
  const steps = 64;
  const start = -2.6;
  const sweep = Math.PI * 2 + 0.5;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = start + (sweep * i) / steps;
    const c = Math.cos(t);
    const sn = Math.sin(t);
    const wob = 1 + 0.03 * Math.sin(3 * t + 0.8) + (i / steps) * 0.035;
    const x = cx + a * wob * Math.sign(c) * Math.abs(c) ** 0.5;
    const y = cy + b * wob * Math.sign(sn) * Math.abs(sn) ** 0.5;
    pts.push(`${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

export function PenHotspot({ plate }: { plate: MediaId }) {
  const r = PEN_RECT[plate];
  if (!r) return null;
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${(r.x0 * 100).toFixed(2)}%`,
        top: `${(r.y0 * 100).toFixed(2)}%`,
        width: `${((r.x1 - r.x0) * 100).toFixed(2)}%`,
        height: `${((r.y1 - r.y0) * 100).toFixed(2)}%`,
      }}
    >
      <EggHotspot
        hunt="3i-pen"
        label="egg.hunt.name.3i-pen"
        className="pointer-events-auto absolute top-1/2 left-0 w-full -translate-y-1/2 text-(--w-chalk)"
      />
    </div>
  );
}

function PenCircle({ rect, onDone }: { rect: FocalBox; onDone: () => void }) {
  const reduced = useReducedMotion();
  const fid = useSvgId("pen-circle");
  useEffect(() => {
    const t = window.setTimeout(onDone, 3600);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      data-chalk="circle"
      data-egg="worthy-pen"
    >
      <defs>
        <ChalkFilter id={fid} />
      </defs>
      <motion.path
        d={penLoop(rect)}
        fill="none"
        className="stroke-(--w-chalk)"
        strokeWidth={2.4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        filter={`url(#${fid})`}
        initial={reduced ? false : { pathLength: 0, opacity: 1 }}
        animate={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 1, opacity: [1, 1, 0] }}
        transition={
          reduced
            ? { duration: 0 }
            : {
                pathLength: { duration: 0.9, ease: easeDraw },
                opacity: { duration: 3.5, times: [0, 0.86, 1], ease: "linear" },
              }
        }
      />
    </svg>
  );
}

export function PenWin({ plate }: { plate: MediaId }) {
  /** The win's key (a new one restarts the circle); null = no circle. */
  const [win, setWin] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    let n = 0;
    const on = (ev: Event) => {
      if ((ev as CustomEvent<{ id?: string }>).detail?.id !== "worthy-pen") return;
      // lib/hunt only from client code, lazily (W2-HUNT): the egg runtime's chunk
      void import("@/lib/hunt").then(
        (m) => {
          if (live && m.worthyOfPen()) setWin(++n);
        },
        () => undefined,
      );
    };
    window.addEventListener(EGG_EVENT, on);
    return () => {
      live = false;
      window.removeEventListener(EGG_EVENT, on);
    };
  }, []);
  const clear = useCallback(() => setWin(null), []);
  const r = PEN_RECT[plate];
  return r && win !== null ? <PenCircle key={win} rect={r} onDone={clear} /> : null;
}
