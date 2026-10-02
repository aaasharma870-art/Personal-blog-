/* ============================================================================
   HUNT ROWS — the 12-egg registry (PHASE3-SPEC §9.1). OWNER: W2-HUNT.
   PURE DATA: type-only imports, so Node imports it as it is
   (scripts/checks/hunt.mjs, spec §3.4 check 7). lib/hunt.ts serves it as
   `HUNT`; the panel, THE HUNT credits and the egg runtime read it from their
   lazy chunks (it never ships in the first load).

   Per egg: its world and host, the egg-bus id that fires it (`registryId`,
   the EggId `triggerEgg()` dispatches), its name / hint / credit copy keys
   (lib/film.ts `egg.hunt.*`; hp-lumos's hint is the Pause tooltip), how it
   is triggered, the palette words that reveal a spell, its keyboard path,
   its reduced-motion state and `browse: false` (no hunt egg is listed by the
   palette's empty query; a spell word surfaces it).
   ========================================================================== */

import type { EggId } from "./egg-bus";
import type { HuntId } from "./hunt-store";
import type { CopyKey } from "@/lib/film";
import type { WorldId } from "@/lib/worlds";

export type HuntWorld = Exclude<WorldId, "house">;
export type HuntTrigger = "typed" | "palette" | "hotspot" | "auto" | "button";

export type HuntRow = {
  world: HuntWorld;
  /** The egg-bus id `triggerEgg()` fires (lumos / nox share "lumos"). */
  registryId: EggId;
  /** Section id, act-card id, "global" or "credits". */
  host: string;
  name: CopyKey;
  hint: CopyKey;
  /** THE HUNT credits row at 12/12 ("<role> — you"). */
  credit: CopyKey;
  trigger: readonly HuntTrigger[];
  /** Palette query words that reveal a spell egg. */
  spell?: readonly string[];
  /** Every egg has a keyboard path (typed, palette or a <button>). */
  keyboard: true;
  /** What it does under reduced motion (spec §9.1 RM column). */
  rm: string;
  /** Never in the palette's empty-query browse list. */
  browse: false;
};

/** The 12 eggs, by world in page order (Act I pirates … Act IV hp). */
export const HUNT_ROWS = {
  "pc-parley": {
    world: "pirates",
    registryId: "parley",
    host: "global",
    name: "egg.hunt.name.pc-parley",
    hint: "egg.hunt.hint.pc-parley",
    credit: "egg.hunt.credit.pc-parley",
    trigger: ["typed", "palette"],
    spell: ["parley"],
    keyboard: true,
    rm: "toast only",
    browse: false,
  },
  "pc-coin": {
    world: "pirates",
    registryId: "aztec-coin",
    host: "journey",
    name: "egg.hunt.name.pc-coin",
    hint: "egg.hunt.hint.pc-coin",
    credit: "egg.hunt.credit.pc-coin",
    trigger: ["hotspot"],
    keyboard: true,
    rm: "an instant swap to the moonlit art, held until the next press or Esc",
    browse: false,
  },
  "pc-kraken": {
    world: "pirates",
    registryId: "hidden-kraken",
    host: "act-2",
    name: "egg.hunt.name.pc-kraken",
    hint: "egg.hunt.hint.pc-kraken",
    credit: "egg.hunt.credit.pc-kraken",
    trigger: ["auto", "button"],
    keyboard: true,
    rm: "static tentacle tip + toast",
    browse: false,
  },
  "3i-aal": {
    world: "idiots",
    registryId: "aal-izz-well",
    host: "optuna-screener",
    name: "egg.hunt.name.3i-aal",
    hint: "egg.hunt.hint.3i-aal",
    credit: "egg.hunt.credit.3i-aal",
    trigger: ["typed", "palette", "hotspot"],
    spell: ["aal"],
    keyboard: true,
    rm: "toast only",
    browse: false,
  },
  "3i-quad": {
    world: "idiots",
    registryId: "quadcopter-lift",
    host: "work",
    name: "egg.hunt.name.3i-quad",
    hint: "egg.hunt.hint.3i-quad",
    credit: "egg.hunt.credit.3i-quad",
    trigger: ["button"],
    keyboard: true,
    rm: "counts on settle; no lift",
    browse: false,
  },
  "3i-pen": {
    world: "idiots",
    registryId: "worthy-pen",
    host: "kill-list",
    name: "egg.hunt.name.3i-pen",
    hint: "egg.hunt.hint.3i-pen",
    credit: "egg.hunt.credit.3i-pen",
    trigger: ["hotspot"],
    keyboard: true,
    rm: "circle drawn at once",
    browse: false,
  },
  "rd-eagle": {
    world: "rdr2",
    registryId: "eagle-eye",
    host: "beyond",
    name: "egg.hunt.name.rd-eagle",
    hint: "egg.hunt.hint.rd-eagle",
    credit: "egg.hunt.credit.rd-eagle",
    trigger: ["hotspot"],
    keyboard: true,
    rm: "trail bright, static",
    browse: false,
  },
  "rd-bone": {
    world: "rdr2",
    registryId: "fossil-bone",
    host: "writing",
    name: "egg.hunt.name.rd-bone",
    hint: "egg.hunt.hint.rd-bone",
    credit: "egg.hunt.credit.rd-bone",
    trigger: ["hotspot"],
    keyboard: true,
    rm: "note drawn, static",
    browse: false,
  },
  "rd-fire": {
    world: "rdr2",
    registryId: "campfire-flare",
    host: "voices",
    name: "egg.hunt.name.rd-fire",
    hint: "egg.hunt.hint.rd-fire",
    credit: "egg.hunt.credit.rd-fire",
    trigger: ["hotspot"],
    keyboard: true,
    rm: "no flare; toast",
    browse: false,
  },
  "hp-map": {
    world: "hp",
    registryId: "marauders-map",
    host: "global",
    name: "egg.hunt.name.hp-map",
    hint: "egg.hunt.hint.hp-map",
    credit: "egg.hunt.credit.hp-map",
    trigger: ["typed", "palette"],
    spell: ["solemn"],
    keyboard: true,
    rm: "opens flat",
    browse: false,
  },
  "hp-lumos": {
    world: "hp",
    registryId: "lumos",
    host: "global",
    name: "egg.hunt.name.hp-lumos",
    hint: "pause.tooltip.resume",
    credit: "egg.hunt.credit.hp-lumos",
    trigger: ["typed", "palette"],
    spell: ["lumos", "nox"],
    keyboard: true,
    rm: "toast toast.lumos.os, no light or bloom; still counts",
    browse: false,
  },
  "hp-snitch": {
    world: "hp",
    registryId: "snitch",
    host: "credits",
    name: "egg.hunt.name.hp-snitch",
    hint: "egg.hunt.hint.hp-snitch",
    credit: "egg.hunt.credit.hp-snitch",
    trigger: ["button"],
    keyboard: true,
    rm: "rests, catchable",
    browse: false,
  },
} as const satisfies Record<HuntId, HuntRow>;

/** The worlds in page order (the panel's and the credits' order). */
export const HUNT_WORLDS: readonly HuntWorld[] = ["pirates", "idiots", "rdr2", "hp"];
