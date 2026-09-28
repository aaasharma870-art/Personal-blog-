/* ============================================================================
   WORLDS + TONE PLANES — the ids the token system is keyed by (DESIGN v2 §1.3,
   SPEC §9, §12). PURE DATA: no React, no DOM, so Node can import it
   (scripts/check-manifest.mjs) and server components can call `planeAttrs`.

   A world is a KEY, never a branch. Every visual difference between worlds
   lives in app/globals.css under `[data-world="<id>"]` (grounds + role inks);
   components read only the semantic vars (--bg, --surface-1, --fg, --accent,
   --world-line …) and so work unchanged in every world.

   ADD A WORLD (e.g. when the RDR2 design pass lands):
   1. Add its id to WORLD_IDS and an entry to `worlds` below.
   2. Fill its `[data-world="<id>"]` block in app/globals.css (every slot the
      house block sets; an empty block silently renders house values).
   3. Set `ready: true`, then `npm run check`.
   ========================================================================== */

export const WORLD_IDS = ["house", "pirates", "idiots", "hp", "rdr2"] as const;
export type WorldId = (typeof WORLD_IDS)[number];

/** The four ground planes a section can sit on (DESIGN v2 §1.3.4). */
export const TONE_IDS = ["canvas", "raised", "deep", "paper"] as const;
export type ToneId = (typeof TONE_IDS)[number];

/** Loader motif a world supplies (SPEC §8; `plain` = the neutral renderer). */
export type LoaderKind = "plain" | "course" | "gauge" | "ink-light";

export type WorldDef = {
  /** false = its globals.css token block is still a placeholder: the world
   *  renders house values and the manifest validator warns when a section
   *  uses it. */
  ready: boolean;
  /** Which loader renderer draws this world's motif (SPEC §12.1 `slots.loader`).
   *  Kinds without a registered renderer fall back to `plain`. */
  loader: LoaderKind;
};

export const worlds = {
  house: { ready: true, loader: "plain" },
  pirates: { ready: true, loader: "course" },
  idiots: { ready: true, loader: "gauge" },
  hp: { ready: true, loader: "ink-light" },
  // TODO(rdr2): placeholder until the RDR2 design pass supplies palette + loader.
  rdr2: { ready: false, loader: "plain" },
} as const satisfies Record<WorldId, WorldDef>;

export const DEFAULT_WORLD: WorldId = "house";
export const DEFAULT_TONE: ToneId = "canvas";

export function isWorldId(id: string): id is WorldId {
  return (WORLD_IDS as readonly string[]).includes(id);
}

/** The two attributes that select a plane's tokens. ALWAYS set them together
 *  on one element: `--bg` etc. are resolved where `data-tone` sits, from the
 *  `--world-*` values in effect there. (A lone `data-world` resolves as the
 *  canvas tone of that world; a lone `data-tone` uses the inherited world.) */
export function planeAttrs(
  tone: ToneId = DEFAULT_TONE,
  world: WorldId = DEFAULT_WORLD,
): { "data-tone": ToneId; "data-world": WorldId } {
  return { "data-tone": tone, "data-world": world };
}
