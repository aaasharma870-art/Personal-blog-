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

/** Every section type (SPEC v2 §12.2). `credibility` and `mediaBand` are the
 *  retired D-3 layer, kept only until the retirement pass deletes them. */
export type SectionEntry =
  | Entry<"hero", HeroProps>
  | Entry<"story", StoryProps>
  | Entry<"gauntlet", { board: MediaId }>
  | Entry<"chapter", { projectId: string; cover: CodeRef; appendix?: readonly ChapterAppendix[] }>
  | Entry<"experiment", { demo: "backtest" }>
  /** `media`: the 21:9 band at the section head (M2: iconic-drone, S10). */
  | Entry<"matrix", { source: "capabilities"; media?: MediaId }>
  | Entry<"ledger", { include: ("flagships" | "survivors" | "killed")[] }>
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
    props: { board: "MV-06" },
  },
  {
    id: "trading-algos",
    type: "chapter",
    act: "act-2",
    numbered: true,
    nav: { label: "Trading_Algos", keywords: ["flagship", "research", "futures"] },
    props: { projectId: "trading-algos", cover: "code:schematic-trading-algos" },
  },
  {
    id: "optuna-screener",
    type: "chapter",
    act: "act-2",
    numbered: true,
    nav: { label: "Optuna", keywords: ["pipeline", "screener", "optimizer"] },
    props: {
      projectId: "optuna-screener",
      cover: "code:schematic-optuna",
      appendix: ["origin", "supporting"],
    },
  },
  {
    id: "experiment",
    type: "experiment",
    act: "act-2",
    tone: "raised",
    props: { demo: "backtest" },
  },
  {
    id: "systems",
    type: "matrix",
    act: "act-2",
    numbered: true,
    nav: { label: "Systems", primary: true },
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
    props: { include: ["flagships", "survivors", "killed"] },
  },

  /* ══ INTERMISSION · house ══ (act null) */
  {
    id: "films",
    type: "films",
    act: null,
    world: "house",
    tone: "deep",
    nav: { label: "Films", keywords: ["movies", "game", "intermission", "credits"] },
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
    props: { source: "testimonials", media: "iconic-camp", altMedia: "MV-11", loop: "MV-11L" },
  },

  /* ══ ACT IV · THE LIGHT · hp ══ (card act-4: `ignite`, long #2) */
  {
    id: "principles",
    type: "principles",
    act: "act-4",
    numbered: true,
    nav: { label: "Principles", primary: true },
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
    props: {},
  },
];
