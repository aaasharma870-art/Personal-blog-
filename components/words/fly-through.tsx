"use client";

/* ============================================================================
   FLY-THROUGH (spec §8.5 / §2.5, P3-7; plan §3.6) — OWNER: W2-WORDS.
   An aria-hidden sprite (gull glide / graphite gallop) crossing the host's
   image zone once, as a `needsIdle` spotlight star (words.flythrough
   DEFAULT / ALT).
   W1.0 stub: renders nothing.
   ========================================================================== */

export type FlyThroughProps = {
  kind: "gull" | "horse";
  path: { points: readonly (readonly [number, number])[]; ms: number };
  frames?: readonly string[];
  beat: string;
};

export function FlyThrough(props: FlyThroughProps): null {
  void props;
  return null;
}
