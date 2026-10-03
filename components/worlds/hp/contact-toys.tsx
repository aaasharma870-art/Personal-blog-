"use client";

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

export default function ContactToys({ choice, flare }: { choice: VariantChoice; flare: () => void }) {
  return (
    <>
      <WandCursor choice={choice} />
      <CandleToy choice={choice} flare={flare} />
    </>
  );
}
