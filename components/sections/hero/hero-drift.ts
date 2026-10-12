import { DESKTOP_FINE } from "@/lib/flags";
import { whenQuietEnd } from "@/lib/ladder";
import { spotlight } from "@/lib/spotlight";

/* ============================================================================
   HERO DRIFT (P3-11 r3; r2 J1 #4, PHASE3-SPEC §4.4 "sea never still"). A
   LAZY desktop chunk: hero-stage.tsx imports it only while the full desktop
   plate is live (motion on, fine pointer, on stage), so phones never load
   it (DP-13) and the first-load bundle carries one import call.

   After the titles the hero held a still frame for ~6 s (#13–18 at both
   reader widths): the sea loop moves, but too finely to read at a glance.
   Once the quiet window is over (the titles, or hydration when the intro
   did not play: lib/ladder.ts whenQuietEnd), the zoom layer leans toward
   the ship and back: its own `scale` property (composited, so no raster;
   it multiplies the spyglass zoom the layer's transform carries) about the
   layer's transform-origin, the Black Pearl. While it plays, B02 is a LIVE
   star (C1, lib/spotlight.ts): registered after the first second, once the
   push reads, and released with it.

   The host stops it (the returned function) when the plate leaves the
   stage (scrolled away, covered by the Act I card), on Pause and under
   reduced motion: the animation is cancelled, the layer is back at
   identity at once (like every hero transform there), nothing remains.
   ========================================================================== */

/** A push to ×`to` and back, each way over `ms` (eased in and out, so the
 *  turn at either end is still). */
const DRIFT = { to: 1.06, ms: 7000 } as const;

export function heroDrift(layer: HTMLElement, host: HTMLElement): () => void {
  let anim: Animation | null = null;
  let off: (() => void) | null = null;
  let timer = 0;
  let dead = false;
  if (window.matchMedia(DESKTOP_FINE).matches && typeof layer.animate === "function") {
    void whenQuietEnd().then(() => {
      if (dead) return;
      anim = layer.animate([{ scale: "1" }, { scale: String(DRIFT.to) }], {
        duration: DRIFT.ms,
        iterations: Number.POSITIVE_INFINITY,
        direction: "alternate",
        easing: "ease-in-out",
      });
      timer = window.setTimeout(() => {
        off = spotlight.registerScrollStar("B02", host, 2, { live: true });
      }, 1000);
    });
  }
  return () => {
    dead = true;
    window.clearTimeout(timer);
    off?.();
    anim?.cancel();
  };
}
