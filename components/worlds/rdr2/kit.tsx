"use client";

import { useId } from "react";

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

/** A DOM-safe unique id for SVG defs (SSR = client). */
export function useFid(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}
