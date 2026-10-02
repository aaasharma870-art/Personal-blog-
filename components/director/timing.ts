/* Director's cut timing (PHASE3-SPEC §11.1), pure data shared by the player
   (directors-cut.ts) and the server-rendered /lab/p3/cinema shot list.
   SPEED: px/s per tempo code (c = card, s = slow, m = medium, b = brisk).
   DWELL: ms held on a star by its weight. */
export const SPEED = { c: 140, s: 90, m: 110, b: 150 } as const;
export const DWELL: Readonly<Record<number, number>> = { 3: 1200, 2: 600 };
