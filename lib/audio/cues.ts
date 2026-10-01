/* ============================================================================
   SOUND CUES — the id → source map (PHASE3-SPEC §3.5 "lib/audio/cues.ts",
   §10.3; PHASE3-PLAN §4.8). PURE DATA: no runtime imports (type imports
   only), so scripts/checks/sound.mjs (Node type stripping) can import it.

   Every CueId is either a procedural recipe (lib/audio/recipes.ts, same key;
   tsc enforces one recipe per recipe cue) or a file under public/audio/
   (<file>.webm Opus + <file>.mp3, listed in docs/build/SOUNDS.md). Files are
   fetched only after the first unmute; a missing file is a silent no-op.

   The event tables say which cues the engine plays for each page event
   (lib/events.ts). Callers do NOT also call sound.cue() for these events.
   ========================================================================== */

import type { EggId } from "@/components/eggs/egg-bus";
import type { TransitionKind } from "../film";
import type { WorldId } from "../worlds";

export const CUE_IDS = [
  "broom-whoosh",
  "broom-land",
  "wave-wash",
  "wave-recede",
  "duster-swipe",
  "shutter",
  "flash-whumpf",
  "match-strike",
  "shimmer-rise",
  "letterbox-whum",
  "projector-start",
  "reel-runout",
  "impact-iris",
  "impact-chalk",
  "impact-flash",
  "impact-lumos",
  "title-sting",
  "typewriter-click",
  "compass-lid",
  "compass-ratchet",
  "compass-settle",
  "drone-hum",
  "drone-gate",
  "drone-finish",
  "deadeye-swell",
  "deadeye-scratch",
  "deadeye-strike",
  "deadeye-release",
  "candle-fwip",
  "hall-swell",
  "map-unfold",
  "ink-scratch",
  "lumos-bell",
  "nox-snuff",
  "snitch-flutter",
  "snitch-ting",
  "parley-creak",
  "flag-snap",
  "coin-ting",
  "hollow-wind",
  "kraken-rumble",
  "wave-slap",
  "heartbeat-2",
  "quad-spinup",
  "pen-creak",
  "pen-ting",
  "eagle-shimmer",
  "bone-scratch",
  "fire-shift",
  "fire-crackle",
  "found-pirates",
  "found-idiots",
  "found-rdr2",
  "found-hp",
  "hunt-complete",
  "postcredits-whoosh",
  "postcredits-chime",
  "toggle-click",
  "tts-lumos",
  "tts-nox",
  "tts-solemn",
  "tts-mischief",
  "tts-parley",
] as const;

/** Every effect id (spec §10.3; PHASE3-PLAN §4.8). */
export type CueId = (typeof CUE_IDS)[number];

export const BED_IDS = ["pirates", "idiots", "rdr2", "hp", "house"] as const;

/** One bed per world plus the house (spec §10.2). */
export type BedId = (typeof BED_IDS)[number];

/** The cues played from files (public/audio/<id>.webm|.mp3; SOUNDS.md rows).
 *  Spoken lines: Higgsfield TTS, a generic preset voice (SOUNDS.md). */
export const FILE_CUES = ["tts-lumos", "tts-nox", "tts-solemn", "tts-mischief", "tts-parley"] as const satisfies readonly CueId[];

export type FileCueId = (typeof FILE_CUES)[number];
export type RecipeCueId = Exclude<CueId, FileCueId>;

/** File formats, in preference order by `canPlayType` (spec §10.4). */
export const AUDIO_EXTS = ["webm", "mp3"] as const;

/** A file cue's public path without the extension. */
export const fileBase = (id: FileCueId): string => `/audio/${id}`;

export function isFileCue(id: CueId): id is FileCueId {
  return (FILE_CUES as readonly string[]).includes(id);
}

/** A cue plus its start offset in seconds. */
export type Shot = readonly [CueId, number];

/** `impact` (lib/impact.ts): one per world, once per view. */
export const IMPACT_CUES: Partial<Record<WorldId, CueId>> = {
  pirates: "impact-iris",
  idiots: "impact-chalk",
  rdr2: "impact-flash",
  hp: "impact-lumos",
};

/** `transition:meet`: the two halves of a card meet (spec §10.3). */
export const MEET_CUES: Partial<Record<TransitionKind, readonly Shot[]>> = {
  flight: [
    ["broom-whoosh", 0],
    ["broom-land", 1.15],
  ],
  opening: [["wave-wash", 0]],
  seam: [
    ["wave-recede", 0],
    ["duster-swipe", 0.3],
  ],
  tintype: [
    ["shutter", 0],
    ["flash-whumpf", 0.09],
  ],
  ignite: [
    ["match-strike", 0],
    ["shimmer-rise", 0.35],
  ],
};

/** `egg:trigger`: each egg's own sound (spec §10.3 "Eggs"). The Pause
 *  control never triggers an egg, so lumos/nox are the typed/palette spells.
 *  "Mischief managed" (tts-mischief) plays when the map dialog closes: the
 *  dialog calls sound.cue() itself (there is no event for it). */
export const EGG_CUES: Partial<Record<EggId, readonly Shot[]>> = {
  "marauders-map": [
    ["map-unfold", 0],
    ["ink-scratch", 0.45],
    ["tts-solemn", 0.35],
  ],
  lumos: [
    ["lumos-bell", 0],
    ["tts-lumos", 0.2],
  ],
  nox: [
    ["nox-snuff", 0],
    ["tts-nox", 0.12],
  ],
  parley: [
    ["parley-creak", 0],
    ["flag-snap", 0.4],
    ["tts-parley", 0.6],
  ],
  "aal-izz-well": [["heartbeat-2", 0]],
  snitch: [["snitch-flutter", 0]],
  "hidden-kraken": [
    ["kraken-rumble", 0],
    ["wave-slap", 0.75],
  ],
  "quadcopter-lift": [["quad-spinup", 0]],
  "aztec-coin": [
    ["coin-ting", 0],
    ["hollow-wind", 0.25],
  ],
  "worthy-pen": [
    ["pen-creak", 0],
    ["pen-ting", 0.32],
  ],
  "eagle-eye": [["eagle-shimmer", 0]],
  "fossil-bone": [["bone-scratch", 0]],
  "campfire-flare": [
    ["fire-shift", 0],
    ["fire-crackle", 0.18],
  ],
};

/** `hunt:found`: the per-world "found" chime (bell, chalk tick, spur
 *  jingle, glass chime), keyed by the HuntId prefix (lib/hunt.ts). */
export const FOUND_CUES: Readonly<Record<string, CueId>> = {
  pc: "found-pirates",
  "3i": "found-idiots",
  rd: "found-rdr2",
  hp: "found-hp",
};

/** `toy` actions → cue (+ a pitch step per `n` for the candles). The hosts
 *  (W3) emit these action names. */
export const TOY_CUES: Readonly<Record<string, Readonly<Record<string, readonly [CueId, number?]>>>> = {
  compass: {
    open: ["compass-lid"],
    close: ["compass-lid", 0.86],
    tick: ["compass-ratchet"],
    spin: ["compass-ratchet"],
    settle: ["compass-settle"],
  },
  candles: {
    light: ["candle-fwip"],
    done: ["hall-swell"],
    lit: ["hall-swell"],
  },
};

/** Section-entry cues on the home page (once per view each): the films
 *  chapter starts a projector, the credits run the reel out. */
export const ENTRY_CUES: Readonly<Record<string, CueId>> = {
  films: "projector-start",
  credits: "reel-runout",
};

/** Bed ids → the world sections they follow (spec §10.2). Sections not
 *  listed take their world's bed; these override it. */
export const SILENT_SECTIONS: readonly string[] = ["experiment"];
