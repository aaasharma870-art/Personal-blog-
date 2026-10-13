"use client";

import { enginePart } from "@/components/primitives/camera";

/* ============================================================================
   WEATHER LAYER (spec §7.7) — OWNER: W2-PLATES.
   aria-hidden particles inside a frame / image / window zone: Pirates spray
   flecks (drift + fall), 3 Idiots chalk dust (a slow rise in the beam), RDR2
   fireflies (a slow blink, ≤ 1 Hz), HP candle motes (rise).
   - ≤ 16 sprites per layer (`count`, clamped), each its own small layer: a
     static radial-gradient dot (painted once, DPR-independent) animated by
     ONE infinite WAAPI transform / opacity keyframe (compositor only),
     desynchronised by seeded negative delays (deterministic: no hydration
     concern, and the layer renders nothing on the server anyway).
   - Fills its positioned parent (absolute inset-0): the host puts it on
     the image side, a split window or a card frame, NEVER over a text
     column or research data. `zone` is recorded (`data-zone`) for probes.
   - Paused while offscreen (IntersectionObserver) or the tab is hidden;
     cancelled (unmounted) under reduced motion or Pause, within one render.
   THE FACADE (DP-13): first-load renders nothing until DESKTOP_FINE, motion
   on and ladder step 2; then the sprites load from the desktop plates
   engine (components/stage/stage.tsx `WeatherImpl`; the stage's own split
   windows and backdrops use the same sprites inside its layers).
   ========================================================================== */

export type WeatherKind = "spray" | "chalk" | "fireflies" | "motes";

export type WeatherLayerProps = {
  kind: WeatherKind;
  zone?: "frame" | "image" | "window";
  count?: number;
  /** false: the sprites stay built but paused (a card frame's weather
   *  outside its beat's range: no compositor work while hidden). */
  run?: boolean;
};

/** The sprites (the engine's WeatherImpl) once the plates engine is wanted. */
export const WeatherLayer = enginePart("WeatherImpl");
