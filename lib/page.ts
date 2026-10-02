/* ============================================================================
   PAGE MANIFEST — the ordered list of sections on the home page (SPEC v2 §3,
   §12.2). PURE DATA: no React / component imports (type-only imports are
   fine), so Node can import it directly (scripts/check-manifest.mjs).

   Everything else DERIVES from this array (lib/sections.ts): each section's
   WORLD (from its act, lib/film.ts), the derived ACT CARDS between act runs
   (`pageItems`), act numerals and header labels, the nav / menu groups, the
   command palette, the sitemap anchors and the active-section observer.

   HOW TO ADD / REMOVE / REORDER A SECTION
   1. Add, remove or move ONE entry in `page` below. Put it inside the run of
      its act and set `act` (null = outside acts: the hero cold open, the
      intermission, the credits). To hide a section without deleting its
      content, set `enabled: false`. To rename it in the nav, change
      `nav.label` — never `id` (it is the #anchor; links would break).
   2. Brand-new kind of section? Add a member to `SectionEntry` (its props),
      then one line in components/sections/registry.ts — the compiler names
      anything you missed. Facts go in lib/content.ts, media in lib/media.ts
      (referenced here by MediaId, never by path), works/acts in lib/film.ts.
   3. Run `npm run check` (tsc + manifest validator), then `npm run build`.
   Section TYPES are structural (story, gauntlet, chapter …); the world skins
   them through lib/film.ts `slots.dressing` (SPEC §12.2).
   ========================================================================== */

import type { MediaId } from "./media";
import type { ToneId, WorldId } from "./worlds";
import type { ActId, Intensity } from "./film";
import type { VariantChoice } from "./variants";
import type { Beat, EstVh, Tempo } from "./beats";
import type { StageSpec } from "./stage";

/** Ground plane a section sits on (DESIGN v3 §1.3.4). SectionFrame emits it
 *  as `data-tone`; it selects --bg / --surface-* / --fg … from the world. */
export type Tone = ToneId;

/** Film world (lib/worlds.ts). DERIVED from the act (lib/sections.ts
 *  `worldOf`); SectionFrame emits it as `data-world`. */
export type World = WorldId;

export type Density = "spacious" | "default" | "tight";
export type MotionLevel = "static" | "standard" | "signature" | "scene";

// Mirrors lib/worlds.ts DEFAULT_TONE / DEFAULT_WORLD (this file may only
// type-import, because Node strips types but does not resolve "./worlds";
// the validator checks the two stay equal).
export const DEFAULT_TONE: Tone = "canvas";
export const DEFAULT_WORLD: World = "house";

export type NavSpec = {
  /** Shown in the header nav, section rail and command palette. */
  label: string;
  /** Header nav (default false: keep the header short). */
  primary?: boolean;
  /** Section rail (default true when `nav` exists). */
  rail?: boolean;
  /** Command palette (default true when `nav` exists). */
  palette?: boolean;
  /** Palette wording when it should differ from `label` ("Go to …"). */
  paletteLabel?: string;
  /** Extra command-palette search aliases. */
  keywords?: string[];
};

type Base<T extends string, P> = {
  /** Becomes the #anchor. Never change once shipped (links break). */
  id: string;
  type: T;
  /** Default true. false = hidden everywhere (page, nav, rail, palette,
   *  numbering, sitemap, act derivation); the content stays in content.ts. */
  enabled?: boolean;
  /** Default true. false = no #id is rendered, so the section can't be a
   *  nav / rail / palette / sitemap target. Types in ANCHORLESS_TYPES have
   *  nowhere to put an id and must say `anchor: false` (compile error, and
   *  the validator re-checks). */
  anchor?: boolean;
  nav?: NavSpec;
  /** Participates in the derived 01…NN numbering. */
  numbered?: boolean;
  /** The act this section belongs to (lib/film.ts `acts[].id`). null =
   *  outside acts (hero cold open, intermission, credits). Acts must be
   *  contiguous runs in page order (validator). Default null. */
  act?: ActId | null;
  /** Rare override of the act's world. "house" is allowed silently; any
   *  other value is a "world cameo" (validator warning). */
  world?: World;
  /** Default film.intensity. whisper = ground + act label only; grade = plus
   *  motifs and static cards (no loops, no long cards); full = everything. */
  worldIntensity?: Intensity;
  /** Ground plane (default "canvas"). Emitted by SectionFrame as data-tone. */
  tone?: Tone;
  /** Reserved: SectionFrame will own spacing (Phase 1+). */
  density?: Density;
  /** "signature" ≤ 6 page-wide; "scene" + derived long cards ≤ 2. */
  motion?: MotionLevel;
  /** Which choreography / clip variant the section plays (lib/variants.ts):
   *  "default" | "alt", or per piece ({ aperture: "alt", "*": "default" }).
   *  Default: film.defaultVariant. Every signature / scene section (and the
   *  hero) must register a DEFAULT and an ALT in VARIANT_REGISTRY under its
   *  host ("hero" for the hero, else its id). Not to be confused with
   *  `props.variant` of a story (its structural layout). */
  variant?: VariantChoice;
  /* — Phase 3 (PHASE3-SPEC §3.2, §3.4; B1-BEATS fills them) — */
  /** The persistent stage behind / beside this section (desktop only).
   *  Plates only (DP-5: the stage asks `loopFor(cue.media)`). */
  stage?: StageSpec;
  /** The section's beats (spec §2.3; lib/beats.ts explains `at` / `span`:
   *  viewport-top scroll offset in vh from the section top @1440). Every
   *  enabled section has them; the validator (scripts/checks/beats.mjs)
   *  checks rations, spans, gaps and pacing. */
  beats?: readonly Beat[];
  /** Reading tempo (spec §2.1): slow 90 px/s, medium 110, brisk 150. */
  tempo?: Tempo;
  /** Height in viewports @1440 (d) / @1024 (t): seeded from spec §2.2,
   *  re-measured by `node tools/capture/beats.mjs <base> --write`. */
  estVh?: EstVh;
  props: P;
};

/** Section types whose component renders no #id at all. Their entries must
 *  set `anchor: false` and cannot have `nav` (the compiler enforces both). */
export const ANCHORLESS_TYPES = ["credibility", "mediaBand"] as const;
type AnchorlessType = (typeof ANCHORLESS_TYPES)[number];

/** One manifest entry of type T. Anchorless types pin `anchor: false` and
 *  forbid `nav`, so a new media band can't leak a dead #id into the sitemap,
 *  observer, nav, rail or palette. */
type Entry<T extends string, P> = T extends AnchorlessType
  ? Omit<Base<T, P>, "anchor" | "nav"> & { anchor: false; nav?: never }
  : Base<T, P>;

type NoProps = Record<string, never>;

/** A non-media reference: drawn in code, or an authentic (Aryan's own) file
 *  that is not a generated MediaId. The validator skips these prefixes. */
export type CodeRef = `code:${string}`;
export type AuthenticRef = `authentic:${string}`;

export type MediaBandProps = {
  image: MediaId;
  video?: MediaId;
  kicker?: string;
  statement: string;
  attribution?: string;
  /** Scroll-converging words (desktop, motion on). */
  converge?: boolean;
};

export type HeroProps = {
  cta: { label: string; to: string };
  media: MediaId;
  mediaMobile: MediaId;
  loop?: MediaId;
};

/** Story variants are STRUCTURAL; the world supplies the skin (SPEC §12.2):
 *  `notes` in rdr2 = the frontier dressing, in hp = HP-06 footprints. */
export type StoryProps =
  | { variant: "split" }
  | { variant: "voyage"; stills?: MediaId[]; sequence?: MediaId }
  | {
      variant: "notes";
      media?: MediaId;
      mediaMobile?: MediaId;
      /** `board`: the notice-board plate the HTML handbill registers on
       *  (M2: iconic-wanted; its `rects.posterRect`, RECOGNIZABILITY S14). */
      handbill?: { enabled: boolean; portrait: AuthenticRef | null; board?: MediaId };
    };

/** What a chapter renders after its own article (M2): the Option Alpha
 *  origin story and the supporting-work list moved out of the retired
 *  `work` monolith and follow the LAST chapter (the flagships lead, CLAUDE
 *  §5 "order the index by strength"). */
export type ChapterAppendix = "origin" | "supporting";

/** An Act II head plate (M2 finish; components/worlds/idiots/plate-band.tsx).
 *  `media` is the DEFAULT plate; the ALT plays the other side of its media
 *  pair (lib/media.ts `variants` / `variantOf`). */
export type HeadPlate = { media: MediaId };

/** Every section type (SPEC v2 §12.2). `credibility` and `mediaBand` are the
 *  retired D-3 layer, kept only until the retirement pass deletes them. */
export type SectionEntry =
  | Entry<"hero", HeroProps>
  | Entry<"story", StoryProps>
  /** `head`: the full-bleed band above the h2 (M2 fix round 3: Virus's
   *  astronaut pen on his desk, iconic-pen-alt). */
  | Entry<"gauntlet", { board: MediaId; head?: HeadPlate }>
  /** `head`: the band at the chapter's head, before its facts (M2 finish:
   *  optuna-screener's lecture-hall board, IC-3I-05). */
  | Entry<"chapter", { projectId: string; cover: CodeRef; appendix?: readonly ChapterAppendix[]; head?: HeadPlate }>
  | Entry<"experiment", { demo: "backtest" }>
  /** `media`: the 21:9 band at the section head (M2: iconic-drone, S10). */
  | Entry<"matrix", { source: "capabilities"; media?: MediaId }>
  /** `head`: the header inset beside the h2 (M2 finish: iconic-pen, O-5). */
  | Entry<"ledger", { include: ("flagships" | "survivors" | "killed")[]; head?: HeadPlate }>
  | Entry<"films", { order: "acts" }>
  | Entry<"index", { source: "writing"; preview: "vignette" | "filmstrip" | "inline" }>
  /** `media`: the DEFAULT plate (M2: iconic-camp); `altMedia` + `loop`: the
   *  ALT variant's still and its loop (MV-11 + MV-11L, registered to each
   *  other; RECOGNIZABILITY S16). */
  | Entry<"quotes", { source: "testimonials"; media?: MediaId; altMedia?: MediaId; loop?: MediaId }>
  | Entry<"principles", NoProps>
  | Entry<"contact", { media?: MediaId; loop?: MediaId }>
  | Entry<"credits", NoProps>
  | Entry<"credibility", NoProps>
  | Entry<"mediaBand", MediaBandProps>;

export type SectionType = SectionEntry["type"];
export type EntryOf<K extends SectionType> = Extract<SectionEntry, { type: K }>;

/* ============================================================================
   THE DEFAULT MANIFEST — SPEC v2 §3 order. Acts: I The Crossing (pirates) ·
   II The Workshop (idiots) · Intermission (house) · III The Frontier (rdr2) ·
   IV The Light (hp). Cards act-1…act-4 are DERIVED (lib/sections.ts).

   M2 NOTE — every SPEC v2 section is its own entry now: the chapters,
   the experiment and the kill-list moved out of the `work` gauntlet, the
   films chapter is on, and the credits roll is the `credits` section
   (rendered after <main> by app/page.tsx, so it stays the page <footer>).
   ========================================================================== */
export const page: readonly SectionEntry[] = [
  /* — Cold open (act null; world = the first act's: pirates) — */
  {
    id: "top",
    type: "hero",
    act: null,
    tone: "deep",
    motion: "signature",
    variant: "default",
    stage: { mode: "own" },
    tempo: "slow",
    estVh: { d: 1, t: 1 },
    beats: [
      // B00 / B01 (the prologue) live in lib/film.ts `prologue.beats`
      { id: "B02", at: 0, span: 100, kind: "signature", timing: "scroll", star: true, weight: 2, feature: "existing" },
    ],
    props: {
      cta: { label: "View the quant portfolio ↓", to: "work" },
      media: "MV-01",
      mediaMobile: "MV-02",
      loop: "MV-03",
    },
  },

  /* — Retired D-3 layer (the credibility marquee, the media bands): the
       ethos line is now Card I→II's epigraph. Delete at the retirement pass. */
  { id: "credibility", type: "credibility", anchor: false, enabled: false, props: {} },

  /* ══ ACT I · THE CROSSING · pirates ══ (card act-1: `opening`) */
  {
    id: "about",
    type: "story",
    act: "act-1",
    numbered: true,
    nav: { label: "About", primary: true },
    // backdrop over the stage (spec §3.2): cue 1 continues the act-1 program
    // block's still; cue 2 at the pillars crossfades (≥ 40vh) to MV-05a
    // (its loop by loopFor), ending before the journey h2 (the B09 match cut)
    stage: {
      mode: "backdrop",
      scrim: { text: 0.86, image: 0.45, imageZone: "gutters" },
      cues: [
        { media: "iconic-pearl", camera: "drift", depth: true, weather: "spray" },
        { at: "about-pillars", media: "MV-05a", camera: "drift" },
      ],
    },
    tempo: "medium",
    estVh: { d: 1.473, t: 1.941 },
    beats: [
      { id: "B07", at: -100, span: 100, kind: "title", timing: "time", star: true, weight: 1, feature: "P3-7" },
      { id: "B08", at: 0, span: 50, kind: "scrub-sentence", timing: "scroll", star: true, weight: 1, feature: "P3-7" },
      { id: "B08-invite", at: 50, span: 22.9, kind: "toy-invite", timing: "time", star: true, weight: 1, needsIdle: true, feature: "P3-8" },
      { id: "B09", at: 72.9, span: 66, kind: "match-cut", timing: "scroll", star: true, weight: 1, pairWith: "B09-window", feature: "P3-2" },
    ],
    props: { variant: "split" },
  },
  {
    id: "journey",
    type: "story",
    act: "act-1",
    numbered: true,
    motion: "signature",
    variant: "default",
    nav: { label: "Journey", primary: true },
    stage: { mode: "own" },
    tempo: "medium",
    estVh: { d: 3.173, t: 3.144 },
    beats: [
      { id: "B09-window", at: 0, span: 10, kind: "match-cut", timing: "scroll", feature: "P3-2" },
      { id: "B10", at: 0, span: 106.2, kind: "signature", timing: "scroll", star: true, weight: 2, feature: "existing" },
      { id: "B11", at: 106.2, span: 105.6, kind: "signature", timing: "scroll", star: true, weight: 2, feature: "existing" },
      { id: "B12", at: 211.8, span: 101, kind: "fly-through", timing: "time", star: true, weight: 2, needsIdle: true, feature: "P3-7" },
    ],
    props: {
      variant: "voyage",
      stills: ["MV-05a", "MV-05b", "MV-05c", "MV-05d"],
      sequence: "JV",
    },
  },
  {
    id: "band-ethos",
    type: "mediaBand",
    anchor: false,
    enabled: false,
    props: {
      video: "band-flow",
      image: "still-terminal",
      kicker: "Operating ethos",
      statement: "Treat every backtest as guilty until proven innocent.",
      converge: true,
    },
  },

  /* ══ ACT II · THE WORKSHOP · idiots ══ (card act-2: `seam`, long #1) */
  {
    id: "work",
    type: "gauntlet",
    act: "act-2",
    numbered: true,
    motion: "signature",
    variant: "default",
    nav: { label: "Work", primary: true },
    stage: { mode: "own" },
    tempo: "brisk",
    estVh: { d: 2.593, t: 2.713 },
    beats: [
      { id: "B16", at: -100, span: 100, kind: "title", timing: "time", star: true, weight: 1, feature: "P3-7" },
      { id: "B17", at: 0, span: 100.1, kind: "signature", timing: "time", star: true, weight: 2, feature: "existing" },
      { id: "B18", at: 100.1, span: 54.6, kind: "toy-invite", timing: "time", star: true, weight: 1, needsIdle: true, feature: "P3-8" },
    ],
    // head (M2 fix round 3, blind D24/A24: the corridor alone scored 3I .40,
    // "generic architecture"): Virus's astronaut pen on his desk — the
    // OTHER pen plate from the kill-list's (platePick swaps sides per
    // variant, so the two sections never show the same picture in one view)
    props: { board: "MV-06", head: { media: "iconic-pen-alt" } },
  },
  {
    id: "trading-algos",
    type: "chapter",
    act: "act-2",
    numbered: true,
    nav: { label: "Trading_Algos", keywords: ["flagship", "research", "futures"] },
    // split, window right (spec §3.2): the corridor, panning left, chalk dust
    stage: { mode: "split", side: "right", cues: [{ media: "iconic-corridor", camera: "pan-l", weather: "chalk" }] },
    tempo: "brisk",
    estVh: { d: 2.134, t: 2.928 },
    beats: [
      { id: "B19", at: -100, span: 100, kind: "stage-cue", timing: "scroll", star: true, weight: 1, feature: "P3-2" },
      { id: "B20", at: 0, span: 95.4, kind: "signature", timing: "time", star: true, weight: 2, feature: "existing" },
      { id: "B20-rack", at: 0, span: 95.4, kind: "stage-cue", timing: "scroll", feature: "P3-2" },
      { id: "B21", at: 95.4, span: 50, kind: "scrub-sentence", timing: "scroll", star: true, weight: 1, feature: "P3-7" },
      { id: "B21-circle", at: 145.4, span: 33.5, kind: "signature", timing: "time", star: true, weight: 1, feature: "existing" },
    ],
    props: { projectId: "trading-algos", cover: "code:schematic-trading-algos" },
  },
  {
    id: "optuna-screener",
    type: "chapter",
    act: "act-2",
    numbered: true,
    nav: { label: "Optuna", keywords: ["pipeline", "screener", "optimizer"] },
    // head own (MachineBoard), body split right from the approach (spec §3.2);
    // chalk dust in the window (spec §7.7; W2-PLATES: weather in all three
    // split windows). Cue 2's depth needs a registered line on
    // iconic-corridor-alt (none yet: the stage keeps it camera-only).
    stage: {
      mode: "split",
      side: "right",
      cues: [
        { at: "optuna-screener-approach", media: "iconic-ice", camera: "push", weather: "chalk" },
        { at: "optuna-screener-metrics", media: "iconic-corridor-alt", camera: "drift", depth: true },
      ],
    },
    tempo: "brisk",
    estVh: { d: 4.94, t: 6.564 },
    beats: [
      { id: "B22", at: 0, span: 83.2, kind: "signature", timing: "time", star: true, weight: 2, feature: "existing" },
      { id: "B23", at: 83.2, span: 88.9, kind: "physical-word", timing: "time", star: true, weight: 1, feature: "P3-7" },
      { id: "B23-rack", at: 83.2, span: 88.9, kind: "stage-cue", timing: "scroll", feature: "P3-2" },
      { id: "B24", at: 172.1, span: 80.1, kind: "signature", timing: "time", star: true, weight: 1, feature: "existing" },
    ],
    props: {
      projectId: "optuna-screener",
      cover: "code:schematic-optuna",
      appendix: ["origin", "supporting"],
      // head: WHAT IS A MACHINE? (the lecture-hall board; ALT iconic-ice)
      head: { media: "iconic-ice-alt" },
    },
  },
  {
    id: "experiment",
    type: "experiment",
    act: "act-2",
    tone: "raised",
    stage: { mode: "opaque" }, // H4: no film here
    tempo: "brisk",
    estVh: { d: 1.258, t: 1.338 },
    beats: [
      { id: "B25", at: 0, span: 111.1, kind: "signature", timing: "time", star: true, weight: 1, feature: "P3-7" },
    ],
    props: { demo: "backtest" },
  },
  {
    id: "systems",
    type: "matrix",
    act: "act-2",
    numbered: true,
    nav: { label: "Systems", primary: true },
    stage: { mode: "own" },
    tempo: "brisk",
    estVh: { d: 2.404, t: 2.419 },
    beats: [
      { id: "B26", at: 0, span: 97.7, kind: "toy-invite", timing: "time", star: true, weight: 1, needsIdle: true, feature: "P3-8" },
      { id: "B27", at: 97.7, span: 119.9, kind: "signature", timing: "time", star: true, weight: 2, feature: "existing" },
    ],
    props: { source: "capabilities", media: "iconic-drone" },
  },
  {
    id: "band-method",
    type: "mediaBand",
    anchor: false,
    enabled: false,
    props: {
      video: "v-contour",
      image: "still-network",
      kicker: "On method",
      statement:
        "A good system is not merely fast — it is inspectable, resilient, and honest about its limits.",
    },
  },
  {
    id: "kill-list",
    type: "ledger",
    act: "act-2",
    motion: "signature",
    variant: "default",
    nav: { label: "Kill-list", keywords: ["killed", "rejected", "post-mortem", "graveyard"] },
    stage: { mode: "opaque" }, // the head inset keeps its own plate
    tempo: "brisk",
    estVh: { d: 2.358, t: 2.784 },
    beats: [
      { id: "B28", at: 0, span: 96.8, kind: "toy-invite", timing: "time", star: true, weight: 1, needsIdle: true, feature: "P3-8" },
      { id: "B29", at: 96.8, span: 94.4, kind: "physical-word", timing: "time", star: true, weight: 1, feature: "P3-7" },
    ],
    // head: VIRUS'S ASTRONAUT PEN (iconic-pen; ALT iconic-pen-alt)
    props: { include: ["flagships", "survivors", "killed"], head: { media: "iconic-pen" } },
  },

  /* ══ INTERMISSION · house ══ (act null) */
  {
    id: "films",
    type: "films",
    act: null,
    world: "house",
    tone: "deep",
    nav: { label: "Films", keywords: ["movies", "game", "intermission", "credits"] },
    stage: { mode: "own" },
    tempo: "slow",
    estVh: { d: 6.056, t: 5.816 },
    // each screen's title + finale belong to that film's world (rations)
    beats: [
      { id: "B30", at: -44.6, span: 40, kind: "letterbox", timing: "scroll", star: true, weight: 3, feature: "P3-6" },
      { id: "B31", at: 0, span: 55.5, kind: "title", timing: "time", star: true, weight: 1, world: "pirates", feature: "P3-7" },
      { id: "B31-finale", at: 55.5, span: 55.5, kind: "signature", timing: "time", star: true, weight: 1, world: "pirates", feature: "existing" },
      { id: "B31-bars", at: 100, span: 40, kind: "letterbox", timing: "scroll", feature: "P3-6" },
      { id: "B32", at: 111, span: 66.7, kind: "title", timing: "time", star: true, weight: 1, world: "idiots", feature: "P3-7" },
      { id: "B32-finale", at: 177.7, span: 66.6, kind: "signature", timing: "time", star: true, weight: 2, world: "idiots", feature: "existing" },
      { id: "B33", at: 244.3, span: 66.7, kind: "title", timing: "time", star: true, weight: 1, world: "rdr2", feature: "P3-7" },
      { id: "B33-finale", at: 311, span: 66.7, kind: "signature", timing: "time", star: true, weight: 2, world: "rdr2", feature: "existing" },
      { id: "B34", at: 377.7, span: 66.6, kind: "title", timing: "time", star: true, weight: 1, world: "hp", feature: "P3-7" },
      { id: "B34-finale", at: 444.3, span: 66.7, kind: "signature", timing: "time", star: true, weight: 2, world: "hp", feature: "existing" },
      { id: "B35", at: 511, span: 81.7, kind: "match-cut", timing: "scroll", star: true, weight: 1, pairWith: "B35-sun", feature: "P3-6" },
    ],
    props: { order: "acts" },
  },

  /* ══ ACT III · THE FRONTIER · rdr2 ══ (card act-3: `tintype`, 0 travel) */
  {
    id: "beyond",
    type: "story",
    act: "act-3",
    numbered: true,
    motion: "signature",
    variant: "default",
    nav: { label: "Beyond", primary: true },
    // own band + the lower half split, window LEFT from Activities (spec
    // §3.2): MV-10 pushing toward the sun, golden into dusk (lib/sky.ts: the
    // stage fades a static grade toward the next section's sky), depth on
    // its horizon (no loop: L04 did not pass), fireflies at dusk (§7.7)
    stage: {
      mode: "split",
      side: "left",
      cues: [{ at: "beyond-activities", media: "MV-10", camera: "push", depth: true, grade: "golden", weather: "fireflies" }],
    },
    tempo: "medium",
    estVh: { d: 4.805, t: 5.476 },
    beats: [
      // B39: the breath after the act-3 card (quiet only): the FrontierBand drift
      { id: "B39-drift", at: -100, span: 100, kind: "stage-cue", timing: "scroll", feature: "existing" },
      { id: "B40", at: 0, span: 98.3, kind: "title", timing: "time", star: true, weight: 1, feature: "P3-7" },
      { id: "B41", at: 98.3, span: 100, kind: "signature", timing: "scroll", star: true, weight: 2, feature: "existing" },
      { id: "B42", at: 198.3, span: 100, kind: "scrub-sentence", timing: "scroll", star: true, weight: 1, feature: "P3-7" },
      { id: "B42-rack", at: 198.3, span: 100, kind: "stage-cue", timing: "scroll", feature: "P3-2" },
      { id: "B43", at: 298.3, span: 59.9, kind: "signature", timing: "time", star: true, weight: 2, feature: "existing" },
      { id: "B43-wanted", at: 358.2, span: 59.9, kind: "signature", timing: "time", star: true, weight: 2, feature: "existing" },
    ],
    props: {
      variant: "notes",
      media: "MV-10",
      mediaMobile: "MV-10m",
      handbill: { enabled: true, portrait: "authentic:portrait", board: "iconic-wanted" },
    },
  },
  {
    id: "writing",
    type: "index",
    act: "act-3",
    tone: "paper",
    numbered: true,
    nav: { label: "Writing", primary: true },
    stage: { mode: "opaque" }, // paper
    tempo: "medium",
    estVh: { d: 2.871, t: 3.117 },
    beats: [
      { id: "B44", at: 0, span: 96.9, kind: "signature", timing: "time", star: true, weight: 2, feature: "existing" },
      { id: "B45", at: 96.9, span: 100, kind: "fly-through", timing: "time", star: true, weight: 2, needsIdle: true, feature: "P3-7" },
      { id: "B46", at: 196.9, span: 97.9, kind: "signature", timing: "scroll", star: true, weight: 1, feature: "existing" },
    ],
    props: { source: "writing", preview: "vignette" },
  },
  {
    id: "voices",
    type: "quotes",
    act: "act-3",
    tone: "deep",
    numbered: true,
    nav: {
      label: "Voices",
      primary: true,
      paletteLabel: "Testimonials",
      keywords: ["teachers", "voices", "quotes", "recommendations"],
    },
    stage: { mode: "own" }, // campSticky; no letterbox, no subtitle
    tempo: "slow",
    estVh: { d: 1.602, t: 2.01 },
    beats: [
      { id: "B47", at: 0, span: 154.8, kind: "signature", timing: "scroll", star: true, weight: 2, feature: "P3-5" },
      { id: "B47-fireflies", at: 50, span: 104.8, kind: "stage-cue", timing: "scroll", feature: "P3-6" },
    ],
    props: { source: "testimonials", media: "iconic-camp", altMedia: "MV-11", loop: "MV-11L" },
  },

  /* ══ ACT IV · THE LIGHT · hp ══ (card act-4: `ignite`, long #2) */
  {
    id: "principles",
    type: "principles",
    act: "act-4",
    numbered: true,
    nav: { label: "Principles", primary: true },
    stage: { mode: "opaque" }, // the map sheet
    tempo: "medium",
    estVh: { d: 2.989, t: 3.183 },
    beats: [
      { id: "B52", at: -100, span: 100, kind: "signature", timing: "time", star: true, weight: 1, feature: "existing" },
      { id: "B53", at: 0, span: 98.4, kind: "title", timing: "time", star: true, weight: 1, feature: "P3-7" },
      { id: "B54", at: 98.4, span: 94.5, kind: "signature", timing: "scroll", star: true, weight: 2, feature: "existing" },
      { id: "B55", at: 192.9, span: 65.7, kind: "scrub-sentence", timing: "scroll", star: true, weight: 1, feature: "P3-7" },
    ],
    props: {},
  },
  {
    // Not in the primary nav: the header's outlined "Contact" button is the
    // single header entry point. Still in the rail and the palette.
    id: "contact",
    type: "contact",
    act: "act-4",
    tone: "deep",
    nav: { label: "Contact" },
    stage: { mode: "own" },
    tempo: "medium",
    estVh: { d: 1, t: 1 },
    beats: [
      { id: "B56", at: 0, span: 100, kind: "signature", timing: "time", star: true, weight: 2, feature: "existing" },
    ],
    props: { media: "MV-08", loop: "MV-09" },
  },

  /* — Credits (act null, house): the closing roll, the page <footer>. It
       must stay the LAST entry: app/page.tsx renders it after </main>. — */
  {
    id: "credits",
    type: "credits",
    act: null,
    world: "house",
    tone: "deep",
    // backdrop: the roll over the last shot (MV-08 → its loop, push 1 → 1.06)
    stage: {
      mode: "backdrop",
      scrim: { text: 0.86, image: 0.45, imageZone: "gutters" },
      cues: [{ media: "MV-08", camera: "push", weather: "motes" }],
    },
    tempo: "slow",
    estVh: { d: 2.865, t: 3.169 },
    beats: [
      // B57: IC-HP-12's existing once-per-session dart, the §2.1 exception
      { id: "B57", at: 0, span: 101, kind: "signature", timing: "time", star: true, weight: 2, feature: "existing" },
      // B58: "Mischief managed" → the post-credits scene in the +60vh tail
      { id: "B58", at: 101, span: 75.6, kind: "post-credits", timing: "time", star: true, weight: 3, feature: "P3-8" },
    ],
    props: {},
  },
];
