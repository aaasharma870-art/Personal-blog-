import { markOf, type MediaId } from "@/lib/media";

/* ============================================================================
   FILMS PLATE MARKS — named 0–1 points on the films screens' stills that
   the finales and the ALT iris register to. MEASURED on the accepted files
   (sharp + visual check, 2026-09-29, act4-hp-films builder). They win over
   lib/media.ts `marks` here because they are newer (F-3I's registered
   `scooter` y is marked provisional); the integrator should copy them into
   lib/media.ts `marks` and delete this table.
   ========================================================================== */

type Mark = readonly [x: number, y: number];

const MEASURED: Partial<Record<MediaId, Readonly<Record<string, Mark>>>> = {
  // the Pearl's stern lantern (the page's one warm point on the sea)
  "F-PC": { lantern: [0.84, 0.555] },
  "F-PC-alt": { lantern: [0.836, 0.556] },
  // the tattered-sail Pearl plates (ART-DIRECTOR #9; measured on a 0.05 grid,
  // 2026-09-29, films-sections): the stern lantern; `treasure` = the moon
  // path on the water just before the bow, where the ALT's X is inked
  "iconic-pearl": { lantern: [0.925, 0.565], treasure: [0.39, 0.815] },
  "iconic-pearl-alt": { lantern: [0.948, 0.48], treasure: [0.41, 0.815] },
  // the yellow scooter's body (Pangong lake)
  "F-3I": { scooter: [0.79, 0.62] },
  "F-3I-alt": { scooter: [0.76, 0.6] },
  // the riderless horse on the ridge
  "F-RD": { horse: [0.766, 0.42] },
  "F-RD-alt": { horse: [0.716, 0.436] },
  // the point the enchanted ink spreads from
  "F-HP": { ink: [0.765, 0.64] },
  "F-HP-alt": { ink: [0.77, 0.62] },
};

/** A measured mark (this table first, then lib/media.ts), or null. */
export function filmMark(id: MediaId, name: string): Mark | null {
  return MEASURED[id]?.[name] ?? markOf(id, name);
}

/** Each world's focal mark name on its films still (the ALT iris origin). */
export const FOCAL_MARK = {
  pirates: "lantern", // the Pearl's stern lantern
  idiots: "scooter",
  rdr2: "fire", // the camp's fire (iconic-camp-alt, lib/media.ts marks)
  hp: "ink",
} as const;

/** DEAD EYE's targets on the frozen frontier: the five birds held mid-air
 *  (0–1 of the plate, left → right). MEASURED on the accepted 2560 × 1440
 *  file (sharp: dark blobs against a 61 px box mean, then a visual check,
 *  2026-09-29, M5 fix round). All five sit inside the 2.39:1 band (y .13 –
 *  .87) and the 3:2 crop (x .08 – .92). */
export const DEAD_EYE_TARGETS: Partial<Record<MediaId, readonly Mark[]>> = {
  "iconic-deadeye": [
    [0.6908, 0.1691],
    [0.7172, 0.3119],
    [0.7614, 0.2273],
    [0.798, 0.2526],
    [0.8751, 0.3065],
  ],
};
