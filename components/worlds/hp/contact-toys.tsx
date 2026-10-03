"use client";

import { useEffect } from "react";
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
      return el.animate([{ opacity: 0 }, { opacity: el.style.opacity || 1 }], {
        timeline,
        rangeStart: `cover ${at.toFixed(1)}%`,
        rangeEnd: `cover ${(at + 6).toFixed(1)}%`,
        fill: "both",
      } as KeyframeAnimationOptions);
    });
    return () => anims.forEach((a) => a.cancel());
  }, []);
}

export default function ContactToys({ choice, flare }: { choice: VariantChoice; flare: () => void }) {
  useTrailOn();
  return (
    <>
      <WandCursor choice={choice} />
      <CandleToy choice={choice} flare={flare} />
    </>
  );
}
