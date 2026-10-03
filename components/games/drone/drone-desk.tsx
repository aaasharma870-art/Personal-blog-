"use client";

import { useEffect, type RefObject } from "react";
import type { MotionValue } from "motion/react";
import { on } from "@/lib/events";
import { onIdle } from "@/lib/idle";
import { getLenis } from "@/lib/smooth-scroll";
import { armInvite } from "@/components/games/invite";

/* ============================================================================
   THE HOMEMADE DRONE · the desk (lazy; DESKTOP_FINE with motion on) — OWNER:
   W3-GAMES. Mounted by <DroneBand/> (components/worlds/idiots/drone-band.tsx)
   only where the toy can be played, so phones and reduced motion never load
   it. Three quiet jobs, none of them a game starting by itself:

   1. THE CAMERA (spec §6.1 "iconic-drone L07 (systems): drift; still while
      the drone flies", 1 → 1.02). L07 has no passing loop, so the plate is
      the CODE path of <LivePlate>: a drift on the band's own passage. The
      band hands its plate a `progress` camera; this feeds it the passage
      (top entering the viewport 0 → bottom leaving the top 1) on scroll,
      rAF-coalesced and only while the band is near, and HOLDS it while the
      drone flies (`game:start` → `game:stop`), so the plate under the
      course never moves. P3-11 (J8 #1): under Lenis the passage is Lenis's
      own position against the band's box, measured once per approach (no
      getBoundingClientRect per frame: it forced a layout in every rAF
      while the band was near).
   2. THE INVITE (B26, a toy-invite time star): on scroll-idle, once, the
      chalk drone beside "▲ Take off" lifts 8 px (the IC-3I-08 lift
      microbeat, ≤ 400 ms up) through the spotlight (components/games/
      invite.ts).
   3. THE PREFETCH: when the band comes within a viewport, the game chunk is
      fetched at idle, so the first take-off answers at once (INP).
   ========================================================================== */

export default function DroneDesk({
  band,
  p,
  mark,
}: {
  /** The band's picture box (the camera's passage and the invite's host). */
  band: RefObject<HTMLElement | null>;
  /** The plate camera's progress (DroneBand → LivePlate). */
  p: MotionValue<number>;
  /** The small chalk drone beside the pill. */
  mark: RefObject<HTMLElement | null>;
}) {
  // 1. the camera's passage, held while the drone flies
  useEffect(() => {
    const el = band.current;
    if (!el) return;
    let raf = 0;
    let near = false;
    let held = false;
    /** The band's document top and height (null: measure again). */
    let box: { top: number; h: number } | null = null;
    const put = () => {
      raf = 0;
      if (held) return;
      const vh = window.innerHeight;
      const y = getLenis()?.animatedScroll;
      let top: number;
      let h: number;
      if (y != null && box) {
        top = box.top - y;
        h = box.h;
      } else {
        const r = el.getBoundingClientRect();
        top = r.top;
        h = r.height;
        if (y != null) box = { top: r.top + y, h };
      }
      const t = (vh - top) / (vh + h);
      p.set(Math.min(1, Math.max(0, t)));
    };
    const remeasure = () => {
      box = null;
      ask();
    };
    const ask = () => {
      if (!near || held || raf) return;
      raf = requestAnimationFrame(put);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        near = Boolean(e?.isIntersecting);
        remeasure();
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(el);
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", remeasure);
    const offStart = on("game:start", (d) => {
      if (d.game === "drone") held = true;
    });
    const offStop = on("game:stop", (d) => {
      if (d.game !== "drone") return;
      held = false;
      ask();
    });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", ask);
      window.removeEventListener("resize", remeasure);
      offStart();
      offStop();
    };
  }, [band, p]);

  // 2. the B26 invite: the chalk drone beside the pill lifts once
  useEffect(() => {
    const host = band.current;
    if (!host) return;
    return armInvite(host, "B26", () =>
      mark.current?.animate(
        [
          { transform: "translateY(0)" },
          { transform: "translateY(-8px)", offset: 0.42, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          { transform: "translateY(-8px)", offset: 0.55 },
          { transform: "translateY(0)" },
        ],
        { duration: 900, easing: "cubic-bezier(0.65, 0, 0.35, 1)" },
      ),
    );
  }, [band, mark]);

  // 3. warm the game chunk when the band is within a viewport
  useEffect(() => {
    const el = band.current;
    if (!el) return;
    let cancel: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        cancel = onIdle(() => void import("@/components/games/drone/drone-game").catch(() => {}), { timeout: 2000 });
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancel?.();
    };
  }, [band]);

  return null;
}
