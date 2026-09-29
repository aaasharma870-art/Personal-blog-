/* ============================================================================
   EGG COPY — the eggs' microcopy about THE PAGE (SPEC v2 §9.6: new page
   microcopy is `proposed` until Aryan signs). The strings live in
   lib/film.ts `copy` as "egg.<key>" (M2 assembler: moved there so the
   release gate counts them); this module strips the prefix so the eggs keep
   their short keys. Every string renders through copyVisible()
   (lib/sections.ts). No film line appears here — the quoted lines render
   through <FilmQuote>.
   ========================================================================== */

import { film, type Copy, type CopyKey } from "@/lib/film";

type StripEgg<K> = K extends `egg.${infer R}` ? R : never;
export type EggCopyKey = StripEgg<CopyKey>;

export const eggCopy = Object.fromEntries(
  (Object.keys(film.copy) as CopyKey[])
    .filter((k) => k.startsWith("egg."))
    .map((k) => [k.slice(4), film.copy[k]]),
) as Record<EggCopyKey, Copy>;
