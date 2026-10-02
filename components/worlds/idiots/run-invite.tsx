"use client";

import { useEffect, type RefObject } from "react";
import { DESKTOP_FINE, motionOffNow, onMotionOffChange } from "@/lib/flags";
import { spotlight } from "@/lib/spotlight";
import type { Variant } from "@/lib/variants";

/* ============================================================================
   THE RUN INVITE (B18; PHASE3-SPEC §2.3 row B18, §3.8) — OWNER: W3-IDIOTS.
   LAZY (gauntlet-tabs.tsx mounts it on DESKTOP_FINE with motion on, before
   the visitor's first Run), so it costs the first load nothing.

   When the Run slot (the element carrying data-beat="B18") is in view, it
   asks the spotlight for the B18 toy-invite star (weight 1, needsIdle: it
   waits for scroll-idle, and is dropped if the slot leaves the viewport).
   On "play" it plays ONE invite, transform / opacity only (WAAPI), ≤ 0.9 s:
     DEFAULT "pulse"  the button's chalk ring (`[data-run-ring]`, static at
                      opacity 0) breathes out ~8 px all round and fades;
     ALT     "nudge"  the ▶ glyph (`[data-run-glyph]`) steps forward twice.
   (`work.invite`: registered in lib/variants.ts by the assembler.) The Run
   itself never starts: an invite is never the toy. RM / Pause mid-invite,
   leaving DESKTOP_FINE or the first Run (this unmounts) cancel it at once.
   ========================================================================== */

const STAR = "B18";

function play(host: HTMLElement, variant: Variant): Animation[] {
  const button = host.querySelector<HTMLElement>("button");
  if (!button) return [];
  if (variant === "alt") {
    const glyph = button.querySelector<SVGElement>("[data-run-glyph]");
    if (!glyph || typeof glyph.animate !== "function") return [];
    return [
      glyph.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(4px)", offset: 0.2 },
          { transform: "translateX(0)", offset: 0.45 },
          { transform: "translateX(4px)", offset: 0.65 },
          { transform: "translateX(0)" },
        ],
        { duration: 760, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      ),
    ];
  }
  const ring = button.querySelector<HTMLElement>("[data-run-ring]");
  if (!ring || typeof ring.animate !== "function") return [];
  const w = button.offsetWidth || 1;
  const h = button.offsetHeight || 1;
  // ~8 px outward on every side, whatever the button's width
  const sx = 1 + 16 / w;
  const sy = 1 + 16 / h;
  return [
    ring.animate(
      [
        { transform: "scale(1)", opacity: 0 },
        { transform: "scale(1)", opacity: 0.85, offset: 0.2 },
        { transform: `scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`, opacity: 0 },
      ],
      { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    ),
  ];
}

export default function RunInvite({ host, variant }: { host: RefObject<HTMLElement | null>; variant: Variant }) {
  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let asking = false;
    let gone = false;
    let anims: Animation[] = [];
    const stop = () => {
      anims.forEach((a) => a.cancel());
      anims = [];
    };
    const offMotion = onMotionOffChange(() => {
      if (motionOffNow()) stop();
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || asking) return;
        io.disconnect();
        asking = true;
        void spotlight.request(STAR, { weight: 1, needsIdle: true, durationMs: 900 }).then((answer) => {
          asking = false;
          if (gone || answer !== "play" || motionOffNow() || !window.matchMedia(DESKTOP_FINE).matches) return;
          anims = play(el, variant);
        });
      },
      { threshold: 0.9 },
    );
    io.observe(el);
    return () => {
      gone = true;
      io.disconnect();
      offMotion();
      stop();
      // withdrawn while still waiting (the first Run, a variant switch)
      if (asking) spotlight.release(STAR);
    };
  }, [host, variant]);
  return null;
}
