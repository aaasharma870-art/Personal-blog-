"use client";

import { useEffect, useState } from "react";
import { spotlight } from "@/lib/spotlight";
import { FLAME_SPRITE } from "@/components/primitives/loaders/sprites-hp";
import { StageLayerPortal } from "@/components/stage/stage-layers";

/* ============================================================================
   THE WARM POINT, CARRIED (PHASE3-SPEC §2.3 B35, §7.3; the films half of the
   match cut, `pairWith` the tintype card's "B35-sun") — OWNER: W3-CINEMA.
   Lazy (film-frame.tsx mounts it on the LAST films screen only, on
   DESKTOP_FINE with motion on after ladder step 2; DP-13).

   The HP finale leaves ONE warm point on its plate (finales.tsx
   `[data-warm-point]`, DEFAULT and ALT). As the act-3 tintype card rises
   (its top from 80% of the viewport to the top: 80vh of scroll, ≥ 40vh),
   the point lifts off the plate and descends — a fixed sprite in the
   stage's "game-hud" layer (above the page, below the header; no game runs
   here) — and settles on the card's sun mark, which is itself sinking onto
   the plate's sun as the card arrives (tintype.tsx, `pin.enter`). Both
   halves are on screen together; at the meet the carried point fades into
   the card's sun. Reversible by position (scrolling back puts it back on
   the plate). Transform / opacity only, one rAF-coalesced read per scroll.

   Off: phones, reduced motion, Pause (the facade unmounts this file; the
   plate's point is restored at once), or when either half is absent.
   B35 is a weight-1 scroll star: its marker (films-section.tsx, the
   section's bottom edge) is registered with the spotlight here.
   ========================================================================== */

/** The descent runs while the card's top travels from (1 − Q0) of the
 *  viewport to its top. */
const Q0 = 0.2;
/** The sprite box (px); scaled to the source / target size. */
const BOX = 60;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

export default function WarmCarry() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  // B35's spotlight box (the marker films-section.tsx renders)
  useEffect(() => {
    const marker = document.querySelector('[data-beat="B35"]');
    return marker ? spotlight.registerScrollStar("B35", marker, 1) : undefined;
  }, []);

  useEffect(() => {
    if (!el) return;
    let raf = 0;
    let src: SVGGraphicsElement | null = null;
    let sun: HTMLElement | null = null;
    let card: HTMLElement | null = null;
    let on = false;

    const find = () => {
      if (!src?.isConnected) {
        const points = document.querySelectorAll<SVGGraphicsElement>("[data-films-frame] [data-warm-point] image");
        src = points.length ? points[points.length - 1] : null;
      }
      if (!sun?.isConnected) {
        sun = document.querySelector<HTMLElement>('[data-beat="B35-sun"] > span');
        card = sun?.closest<HTMLElement>("[data-act-card]") ?? null;
      }
    };
    const hide = () => {
      if (!on) return;
      on = false;
      el.style.visibility = "hidden";
      el.style.willChange = "";
      if (src) src.style.visibility = "";
    };
    const frame = () => {
      raf = 0;
      find();
      if (!src || !sun || !card) return hide();
      const vh = window.innerHeight;
      const top = card.getBoundingClientRect().top;
      const u = (clamp01((vh - top) / vh) - Q0) / (1 - Q0);
      if (u <= 0 || u >= 1) return hide();
      const s = src.getBoundingClientRect();
      const d = sun.getBoundingClientRect();
      if (!s.width || !d.width) return hide();
      const ex = easeSine(u);
      const ey = easeInOut(u);
      const x = s.left + s.width / 2 + (d.left + d.width / 2 - (s.left + s.width / 2)) * ex;
      const y = s.top + s.height / 2 + (d.top + d.height / 2 - (s.top + s.height / 2)) * ey;
      const w = s.width + (d.width - s.width) * ey;
      if (!on) {
        on = true;
        el.style.visibility = "visible";
        el.style.willChange = "transform, opacity";
        src.style.visibility = "hidden";
      }
      el.style.transform = `translate3d(${(x - BOX / 2).toFixed(1)}px,${(y - BOX / 2).toFixed(1)}px,0) scale(${(w / BOX).toFixed(3)})`;
      el.style.opacity = (u < 0.9 ? 1 : (1 - u) / 0.1).toFixed(3);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      raf = 0;
      hide();
    };
  }, [el]);

  return (
    <StageLayerPortal layer="game-hud">
      <div
        ref={setEl}
        aria-hidden="true"
        data-warm-carry=""
        className="pointer-events-none absolute left-0 top-0"
        style={{ width: BOX, height: BOX, visibility: "hidden", transformOrigin: "50% 50%" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB inline sprite (code), not content */}
        <img src={FLAME_SPRITE} alt="" width={BOX} height={BOX} className="size-full max-w-none" />
      </div>
    </StageLayerPortal>
  );
}
