"use client";

import { Suspense, useId, useRef } from "react";
import { safeLazy } from "@/lib/safe-lazy";
import type { CSSProperties } from "react";
import { useDesktopFine } from "@/lib/flags";
import type { MediaAsset } from "@/lib/media";
import tooth from "@/assets/p3/raster/graphite-tooth.png";

/* ============================================================================
   ACT III KIT — shared bits of the rdr2 world components.

   VARIANT PIECES (lib/variants.ts registry keys; host = the section id).
   Every piece ships a DEFAULT and an ALT choreography (Aryan's binding
   answer): the section passes its manifest choice (variantChoiceOf(entry))
   and each client leaf resolves its own piece with useVariant(choice, key),
   so `?variant=beyond.band:alt`, `?variant=voices:alt` or `?variant=alt`
   preview one piece, one host, or everything.
   ========================================================================== */

export const RD_PIECES = {
  /** SM-15 band: DEFAULT ride-in (MV-10) · ALT dead-eye-release (iconic-deadeye → MV-10-alt). */
  band: "beyond.band",
  /** S14 handbill: DEFAULT nailed-up (iconic-wanted) · ALT pasted-and-stamped (iconic-wanted-alt). */
  handbill: "beyond.handbill",
  /** IC-RD-11 satchel: DEFAULT spill · ALT inventory. */
  satchel: "beyond.satchel",
  /** SM-11 journal: DEFAULT sketch-at-rest (hover swaps the page) · ALT leafing (scroll turns the page). */
  journal: "writing.journal",
  /** SM-16 camp: DEFAULT camp-at-dusk (iconic-camp) · ALT fireside-loop (MV-11 + MV-11L). */
  fire: "voices.fire",
} as const;

/** R-1 graphite (rdr2 STUDY §8): a slight wobble plus paper tooth, tuned
 *  for ~1 user unit ≈ 1 CSS px. Our own filter. */
export function GraphiteFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="g" />
      <feDisplacementMap in="SourceGraphic" in2="g" scale="1.2" result="w" />
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.6 1.25" result="tooth" />
      <feComposite in="w" in2="tooth" operator="in" />
    </filter>
  );
}

/**
 * BAKED GRAPHITE (PHASE3-SPEC §12.1 #5). The R-1 filter above re-runs a
 * per-pixel turbulence every time its SVG repaints (a draw-on, a moving
 * parent). Its look is the PAPER TOOTH — stroke alpha × clamp(1.25 − 1.6·A)
 * of that noise (mean .45); the displacement is sub-pixel (±.2 px). So the
 * tooth is baked once, by Chromium's own filter, into a tileable 128 px
 * texture (assets/p3/raster/graphite-tooth.png, 100 user units; see
 * bake-graphite-tooth.mjs beside it) and laid on the plain strokes as a
 * static CSS mask: same grain, no live filter, nothing recomputed per frame.
 *
 * `bakedGraphite(viewBoxW)` gives the SVG its mask variables (the tile is
 * 100 units of its own viewBox, so the grain keeps the filter's scale); the
 * rdr2.module.css classes apply them:
 *   .graphiteBaked  always (art that only renders ≥ 64rem: the journal page);
 *   .graphiteDw     at DESKTOP_WIDE only — below it the live filter stays,
 *                   so phones are byte-for-byte unchanged.
 */
export function bakedGraphite(viewBoxW: number): CSSProperties {
  return {
    "--graphite-tooth": `url(${tooth.src})`,
    "--graphite-tile": `${((100 / viewBoxW) * 100).toFixed(3)}%`,
  } as CSSProperties;
}

/** A DOM-safe unique id for SVG defs (SSR = client). */
export function useFid(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

/** A plate point (0–1 of the plate, a `marks` entry) as a fraction of a
 *  w × h box the plate COVERS (object-fit: cover, object-position = the
 *  plate's focal: MediaFrame's crop). The camera's focal is in box units. */
export function coverPoint(
  a: Pick<MediaAsset, "width" | "height" | "focal">,
  p: readonly [number, number],
  w: number,
  h: number,
): [number, number] {
  const k = Math.max(w / a.width, h / a.height);
  const pw = a.width * k;
  const ph = a.height * k;
  const [fx, fy] = a.focal ?? [0.5, 0.5];
  return [((w - pw) * fx + p[0] * pw) / w, ((h - ph) * fy + p[1] * ph) / h];
}

/* ============================================================================
   ACT III DESKTOP EXTRAS — facade + lazy impl (DP-13, rule 34). The first
   load ships only this hidden anchor; on DESKTOP_FINE the impl chunk
   (components/worlds/rdr2/rd-desktop.tsx) registers the part's SCROLL stars
   with the spotlight (B41 beyond, B46 writing, B47 voices; motion on) and
   draws its hunt egg when it fires (rd-eagle, rd-bone, rd-fire; spec §9.1:
   the effect bypasses the spotlight). Phones, touch tablets, the server
   and hydration: nothing. `note` = the rd-bone note (copy egg.bone.note).
   ========================================================================== */

export type RdPart = "beyond" | "writing" | "voices";

const DesktopImpl = safeLazy(() => import("@/components/worlds/rdr2/rd-desktop"));

export function RdDesktop({ part, note }: { part: RdPart; note?: string }) {
  const fine = useDesktopFine();
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span ref={ref} hidden>
      {fine ? (
        <Suspense fallback={null}>
          <DesktopImpl part={part} anchor={ref} note={note} />
        </Suspense>
      ) : null}
    </span>
  );
}
