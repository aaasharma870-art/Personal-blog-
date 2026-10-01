"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { beatAttrs } from "@/lib/beats";
import { bootGateOn } from "@/lib/flags";
import { hasRunThisSession, markRunThisSession } from "@/lib/session";

/* ============================================================================
   POST-CREDITS (PHASE3-SPEC §9.4; B58) — OWNER: W2-HUNT.
   Pre-mounted in the credits roll (components/site/footer.tsx) after the
   [data-credits-last] block. The page used to end 116 px after the last
   line; under the BOOT GATE only (DESKTOP_FINE, motion on at boot, JS;
   app/p3/game.css) it gains a 60vh tail, from first paint (no shift).
   Phones, no-JS and paused-at-boot views get neither the tail nor the scene.
   Trigger: the tail ≥ 50 % in view for 1.0 s, once per session. The scene
   (components/eggs/post-credits-scene.tsx, lazy) asks the spotlight as a
   time star; DEFAULT the riderless broom, ALT ink footprints, the extended
   cut at 12/12; motion off or a skip shows its still end state.
   ========================================================================== */

const Scene = dynamic(() => import("@/components/eggs/post-credits-scene"), { ssr: false });
const RUN_KEY = "post-credits";
const DWELL_MS = 1000;

export function PostCredits() {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined" || !bootGateOn() || hasRunThisSession(RUN_KEY)) return;
    let timer = 0;
    let warmed = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        if (e.isIntersecting && !warmed) {
          warmed = true;
          void import("@/components/eggs/post-credits-scene");
        }
        if (e.intersectionRatio >= 0.5) {
          timer ||= window.setTimeout(() => {
            io.disconnect();
            markRunThisSession(RUN_KEY);
            setPlay(true);
          }, DWELL_MS);
        } else {
          window.clearTimeout(timer);
          timer = 0;
        }
      },
      { threshold: [0, 0.5] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className="post-credits" aria-hidden="true" data-post-credits="" {...beatAttrs("B58", { weight: 3 })}>
      {play ? <Scene /> : null}
    </div>
  );
}
