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
  pirates: "lantern",
  idiots: "scooter",
  rdr2: "horse",
  hp: "ink",
} as const;
