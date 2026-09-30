"use client";

/* ============================================================================
   WEATHER LAYER (spec §7.7) — OWNER: W2-PLATES.
   aria-hidden particles inside a frame / image / window zone.
   W1.0 stub: renders nothing.
   ========================================================================== */

export type WeatherKind = "spray" | "chalk" | "fireflies" | "motes";

export type WeatherLayerProps = {
  kind: WeatherKind;
  zone?: "frame" | "image" | "window";
  count?: number;
};

export function WeatherLayer(props: WeatherLayerProps): null {
  void props;
  return null;
}
