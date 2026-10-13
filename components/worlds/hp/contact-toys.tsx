"use client";

import { useEffect } from "react";
import { spotlight } from "@/lib/spotlight";
import type { VariantChoice } from "@/lib/variants";
import CandleToy from "@/components/worlds/hp/candle-toy";
import WandCursor from "@/components/worlds/hp/wand-cursor";

/* ============================================================================
   CONTACT TOYS — the hall's two desktop modules (PHASE3-SPEC §9.2 #4) in ONE
   lazy chunk: contact-scene.tsx mounts this on DESKTOP_FINE with motion on,
   after the intro's quiet window. One import() instead of two keeps one
   chunk-loader stub out of the first load (W3 budget); the two always load
   together anyway. The wand cursor, then the candle toy (all lit → `flare`,
   the same single flare as a copy).
   ========================================================================== */

type ViewTimelineCtor = new (o: { subject: Element }) => AnimationTimeline;

/** B56-trail (P3-11 r1): the last light's trail (contact-scene.tsx
 *  [data-motif=last-light-trail]) laid down point by point as it scrolls
 *  through its window ("top 85%, bottom 55%"): each point's opacity on a
 *  ViewTimeline of the trail box, staggered (compositor only). No
 *  ViewTimeline → the trail stays as it was. Motion off unmounts this chunk
 *  (contact-scene), which cancels it: the trail lies static. */
function useTrailOn() {
  useEffect(() => {
    const VT = (window as unknown as { ViewTimeline?: ViewTimelineCtor }).ViewTimeline;
    const box = document.querySelector('[data-motif="last-light-trail"]');
    if (!VT || !box) return;
    const timeline = new VT({ subject: box });
    const pts = Array.from(box.children) as HTMLElement[];
    const anims = pts.map((el, i) => {
      const at = 12 + (i / Math.max(1, pts.length - 1)) * 38;
      // each point LANDS (P3-11 r3: a 5 px fade read as rigid scroll): it
      // drops in from 2.6× and settles, opacity + scale only (the `scale`
      // property: it composes with the point's own translate / rotate)
      return el.animate([{ opacity: 0, scale: 2.6 }, { opacity: el.style.opacity || 1, scale: 1 }], {
        timeline,
        rangeStart: `cover ${at.toFixed(1)}%`,
        rangeEnd: `cover ${(at + 6).toFixed(1)}%`,
        fill: "both",
      } as KeyframeAnimationOptions);
    });
    return () => anims.forEach((a) => a.cancel());
  }, []);
}

/** Act IV's LIVE stars (C1, P3-11 r3), registered here so they cost the
 *  first load nothing; this chunk lives only on DESKTOP_FINE with motion on
 *  (Pause / reduced motion unmount it: they leave, the art lies static).
 *   - B56-flame: the last light's loop and drift (contact-scene.tsx) move
 *     while the page is still: lent the still screen after the bracket.
 *   - B54-hall: the Map's hall (principles-map.tsx HeadTrail, ≥ xl):
 *     GATED, someone's prints walk across the hall to the corridor (each
 *     fades in as the walker passes, then fades behind; ≈ 3.6 s, again)
 *     only while the spotlight lends it the still screen (r2 J3: "on
 *     arrival the map holds still for about 6 s"). */
const HALL_WALK_MS = 3600;

function useLiveStars() {
  useEffect(() => {
    const offs: (() => void)[] = [];
    const flame = document.querySelector('[data-beat="B56-flame"]');
    if (flame) offs.push(spotlight.registerScrollStar("B56-flame", flame, 1, { live: true }));
    const hall = document.querySelector<HTMLElement>('[data-beat="B54-hall"]');
    if (hall?.offsetWidth) {
      const prints = hall.querySelectorAll<SVGGElement>("svg > g");
      let walks: Animation[] = [];
      const stop = () => {
        walks.forEach((w) => w.cancel());
        walks = [];
      };
      const walk = (owned: boolean) => {
        stop();
        if (!owned) return;
        walks = Array.from(prints, (g, i) => {
          const a = (i / prints.length) * 0.62;
          return g.animate(
            [{ opacity: 0 }, { opacity: 0, offset: a }, { opacity: 0.95, offset: a + 0.04 }, { opacity: 0.3, offset: Math.min(0.92, a + 0.4) }, { opacity: 0 }],
            { duration: HALL_WALK_MS, iterations: Infinity },
          );
        });
      };
      offs.push(spotlight.registerScrollStar("B54-hall", hall, 1, { live: true, onOwn: walk }), stop);
    }
    return () => offs.forEach((off) => off());
  }, []);
}

export default function ContactToys({ choice, flare }: { choice: VariantChoice; flare: () => void }) {
  useTrailOn();
  useLiveStars();
  return (
    <>
      <WandCursor choice={choice} />
      <CandleToy choice={choice} flare={flare} />
    </>
  );
}
