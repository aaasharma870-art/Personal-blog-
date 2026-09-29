/* ============================================================================
   FILM — everything about the works, acts, slots, copy, lettering and eggs
   (SPEC v2 §12.1). DATA ONLY: no React, no JSX, type-only imports, so Node
   imports it directly (scripts/check-manifest.mjs).

   Four worlds light one page (SPEC §1): Pirates of the Caribbean lights the
   crossing (Act I), 3 Idiots the workshop (Act II), Red Dead Redemption 2 the
   frontier (Act III) and Harry Potter the ending (Act IV) plus the prologue.
   `house` is the neutral world of the hero-less chrome, the intermission and
   the credits; it is TRANSPARENT to transitions (SPEC §9.2).

   The manifest (lib/page.ts) says which ACT each section is in; the world,
   the act cards, numerals, labels, menu groups and credits all DERIVE from
   `acts` below (lib/sections.ts). Reorder or remove an act here and in the
   manifest, run `npm run check`, and nothing else needs editing.

   Copy statuses (SPEC §9.6, amended by Aryan's answer #2, 2026-09-28):
     confirmed = Aryan's existing words (content.ts / REPO): renders everywhere.
     proposed  = new microcopy about THE PAGE and every quote.
     draft     = anything about ARYAN (why a work matters, loglines, the
                 handbill reward). Claude DRAFTED these for him to rewrite
                 (`draft: true`, `alternates` to pick from); they render as
                 normal copy, with no visible badge.
   Where they render: `film.branchPreview` (true on design/three-films) shows
   proposed AND draft copy in every build, dev and plain production alike.
   With it off, drafts render in dev only and proposed copy in production
   only after `copySignedOff`. EITHER WAY `RELEASE=1 npm run check` fails
   while branchPreview is on or any shown string is unsigned (a draft with
   text, or proposed copy without sign-off): a merge to main needs Aryan.
   Writing-entry DRAFT labels (content.ts `writing`) are separate and stay
   visible: those essays really are unwritten.

   Variants (lib/variants.ts): `defaultVariant` is the page-wide default;
   `acts[].variant` picks each derived card's choreography,
   `prologue.variant` the intro's, `worlds.<w>.loaderVariant` the world
   loader's. Values: "default" | "alt" | { <piece>: "alt", "*": "default" }.
   ========================================================================== */

import type { LoaderKind, WorldId } from "./worlds";
import type { MediaId } from "./media";
import type { QuoteId } from "./quotes";
import type { Variant, VariantChoice } from "./variants";

export type Intensity = "whisper" | "grade" | "full";
export type CopyStatus = "confirmed" | "proposed" | "draft";
export type Copy = {
  text: string;
  status: CopyStatus;
  /** content.ts path ("gauntlet[0].body", "site.principleCapsule") or "REPO". */
  source?: string;
  /** draft only: what Aryan is asked to write or rewrite. */
  prompt?: string;
  /** draft only: marks a line Claude drafted FOR Aryan (he rewrites it
   *  before main). The validator keeps it equal to `status === "draft"`
   *  whenever the text is non-empty. */
  draft?: true;
  /** Other drafts to pick from (never rendered). */
  alternates?: readonly string[];
};
export type TransitionKind = "flight" | "seam" | "tintype" | "ignite" | "reel" | "title" | "opening";
export type WorkKind = "film" | "game";
export type Verb = "Navigation" | "Explanation" | "Reflection" | "Revelation";

export type WorldSlots = {
  line: "course" | "blueprint" | "graphite" | "ink-light" | "none";
  emphasis: "stamp" | "chalk-circle" | "pencil-underline" | "ribbon" | "none";
  ground: "rhumb" | "grid" | "none";
  reveal: "rise" | "draw" | "sketch" | "nib" | "clear";
  success: "needle-settle" | "chalk-tick" | "kindle" | "flare" | "none";
  loader: LoaderKind;
  /** World skin for structural section types (SPEC §12.2). */
  dressing: {
    notes: "plain" | "frontier" | "footprints";
    index: "plain" | "journal" | "parchment";
    quotes: "plain" | "campfire" | "light";
  };
};

export type WorldSpec = {
  id: WorldId;
  /** Nominative credit (house = null). Titles are set in HOUSE type only. */
  work: { title: string; years: string; kind: WorkKind } | null;
  verb: Verb | null;
  slots: WorldSlots;
  /** The act title's lettering (SPEC §9.7); missing → Newsreader `title`. */
  lettering?: LetteringId;
  media: {
    plate?: MediaId;
    loop?: MediaId;
    mobile?: MediaId;
    cardStill?: MediaId;
    reelStill?: MediaId;
    filmsStill?: MediaId;
  };
  /** Films chapter: what this page borrowed (a site fact). */
  borrowed?: Copy;
  /** Films chapter: one attributed line (quote registry). */
  line?: QuoteId;
  /** Films chapter: why this work matters to Aryan. A Claude draft
   *  (`draft: true`) until he rewrites it. */
  reason?: Copy;
  /** This world's loader variant (default: film.defaultVariant). */
  loaderVariant?: VariantChoice;
};

export type ActSpec = {
  id: string;
  world: WorldId;
  title: Copy;
  logline?: Copy;
  /** A Copy (Aryan's words) or a QuoteId (a film line, epigraph rendition). */
  epigraph?: Copy | QuoteId;
  /** 1-based index into `film.tips` (SPEC §8.3 numbering). */
  tip?: number;
  /** The derived card's choreography variant (default: film.defaultVariant). */
  variant?: VariantChoice;
};

export type PrologueSpec = {
  enabled: boolean;
  world: WorldId;
  poster: MediaId;
  posterMobile: MediaId;
  flight: MediaId;
  /** lib/intro-trail.json id (baked broom path; the intro builder owns it). */
  trail: string;
  /** Section id the flight lands on (must be the hero). */
  landsOn: string;
  maxFlightS: number;
  /** The intro's variant: one for every piece, or per piece (play, flight,
   *  codeflight, landing). Default: film.defaultVariant. */
  variant?: VariantChoice;
};

export type EggSpec = {
  id: string;
  /** Section id, "global", "chrome", "intro", "console" or "404". */
  host: string;
  trigger: ("palette" | "typed" | "auto" | "media")[];
  desktopOnly?: boolean;
  enabled: boolean;
};

export type LetteringSlot = "act-title" | "loader" | "egg";
export type LetteringSpec = {
  id: string;
  text: string;
  /** Font family name; lib/fonts.ts maps it to a CSS var. */
  face: string;
  /** A = self-hosted woff2 subset (OFL); B = outline-only SVG (personal /
   *  desktop licence; the binary never enters git). */
  mode: "A" | "B";
  slot: LetteringSlot;
  /** false = not shipped yet (the act title falls back to Newsreader). */
  shipped: boolean;
};

/* — Lettering (SPEC §9.7; FONTS.md is the licence record) ———————————— */
const lettering = [
  { id: "pc-crossing", text: "THE CROSSING", face: "Pirata One", mode: "A", slot: "act-title", shipped: true },
  { id: "3i-workshop", text: "The Workshop", face: "Kalam", mode: "A", slot: "act-title", shipped: true },
  // Chinese Rocks (Typodermic free Desktop EULA): outline-only by licence
  // (§2.2 fixed artwork only; §4.3 no website embedding). NOT shipped in M1:
  // the licensee must be Aryan (he accepts the EULA), and the outline step
  // is his call (FONTS.md). Falls back to Newsreader `title` (fixture L).
  { id: "rd-frontier", text: "THE FRONTIER", face: "Chinese Rocks", mode: "B", slot: "act-title", shipped: false },
  { id: "hp-light", text: "The Light", face: "IM Fell English", mode: "A", slot: "act-title", shipped: true },
  { id: "rd-deadeye", text: "DEAD EYE", face: "Rye", mode: "A", slot: "egg", shipped: true },
] as const satisfies readonly LetteringSpec[];
export type LetteringId = (typeof lettering)[number]["id"];

/* — Worlds ——————————————————————————————————————————————————————————— */
const plainDressing = { notes: "plain", index: "plain", quotes: "plain" } as const;

/** A line Claude drafted for ARYAN to rewrite (Aryan's answer #2: "write
 *  emotionally impactful one-liners … that he will personally rewrite").
 *  Tied only to facts in lib/content.ts; no invented events, ages, dates or
 *  places. Renders normally on the branch; blocks RELEASE=1 until he makes it
 *  his own and marks it confirmed. Research record: research/build/ONE-LINERS.md. */
const aryanDraft = (text: string, prompt: string, alternates: readonly string[] = []): Copy => ({
  text,
  status: "draft",
  draft: true,
  prompt,
  ...(alternates.length ? { alternates } : {}),
});

const REASON_PROMPT =
  "[DRAFT by Claude — Aryan: rewrite in your own words (1–2 sentences): why this film or game matters to you. Pick an alternate, edit one, or write your own; set status \"confirmed\" when it is yours.]";

/** Films chapter reasons (SM-9 renders them; M2). Guards from lib/quotes.ts
 *  hold: nothing about family near Q-HP-4 / Q-RD-1, no return or Sharpe
 *  figure near Q-PC-2. */
const reasons = {
  pirates: aryanDraft(
    "My first strategies were a compass that pointed wherever I wanted it to. The real crossing began when I stopped steering by what I hoped and started steering by data I had never seen.",
    REASON_PROMPT,
    [
      "A course is something you keep correcting, not something you declare once. That is how chart patterns on TradingView became a pipeline that tells me when I'm wrong.",
      "Everyone in it is sailing toward something they can't prove is there. I still am; I've just learned to test the map before I trust it.",
    ],
  ),
  idiots: aryanDraft(
    "It made curiosity feel like a discipline instead of a distraction. Nobody assigned me a validation pipeline; I built one because I needed to know why my own ideas kept breaking.",
    REASON_PROMPT,
    [
      "It is about learning something because you need to understand it, not to look like you do. Everything I have built on my own started exactly that way.",
      "It taught me that the honest explanation beats the impressive answer. So on this page the chalk circles the caveat, never the number.",
    ],
  ),
  rdr2: aryanDraft(
    "Its hero keeps a journal of what really happened, not what he wished had. My kill-list is that journal: every idea that didn't survive, written down honestly, so the next one starts wiser.",
    REASON_PROMPT,
    [
      "It moves slowly on purpose: long rides, quiet camps, nothing rushed. That is the patience distance running taught me, and the same patience a holdout asks for.",
      "Most of the frontier is waiting and watching the light change. That is what photography is to me, and on the good days it is what research is too.",
    ],
  ),
  hp: aryanDraft(
    "Even its magic has rules, and the wonder is in finding them. That is what markets still feel like to me: rules under the noise, and the honest work of proving which ones are real.",
    REASON_PROMPT,
    [
      "Its bravest moments are about telling the truth when a lie would be easier. That is the whole job in research: say what the data shows, especially when it isn't what I hoped.",
      "It taught me that wonder and rigor aren't opposites. I still feel it when a pre-registered test comes back and the answer is real, whichever way it went.",
    ],
  ),
} as const satisfies Record<Exclude<WorldId, "house">, Copy>;

const house: WorldSpec = {
  id: "house",
  work: null,
  verb: null,
  slots: {
    line: "none", emphasis: "none", ground: "none", reveal: "clear", success: "none",
    loader: "plain", dressing: plainDressing,
  },
  media: {},
};

const pirates: WorldSpec = {
  id: "pirates",
  work: { title: "Pirates of the Caribbean", years: "2003–2017", kind: "film" },
  verb: "Navigation",
  slots: {
    line: "course", emphasis: "stamp", ground: "rhumb", reveal: "rise", success: "needle-settle",
    loader: "course", dressing: plainDressing,
  },
  lettering: "pc-crossing",
  media: { plate: "MV-01", loop: "MV-03", mobile: "MV-02", cardStill: "MV-01", filmsStill: "F-PC" },
  borrowed: {
    text: "On this page it became the course line through the Journey and Jack's compass, which settles on each bearing.",
    status: "proposed",
  },
  line: "Q-PC-2",
  reason: reasons.pirates,
  loaderVariant: "default",
};

const idiots: WorldSpec = {
  id: "idiots",
  work: { title: "3 Idiots", years: "2009", kind: "film" },
  verb: "Explanation",
  slots: {
    line: "blueprint", emphasis: "chalk-circle", ground: "grid", reveal: "draw", success: "chalk-tick",
    loader: "gauge", dressing: plainDressing,
  },
  lettering: "3i-workshop",
  media: { plate: "MV-06", cardStill: "MV-06", reelStill: "MV-04", filmsStill: "F-3I" },
  borrowed: {
    text: "On this page it became the blueprints: every schematic in Act II draws the real system, and the chalk circles the caveat, never the number.",
    status: "proposed",
  },
  line: "Q-3I-1",
  reason: reasons.idiots,
  loaderVariant: "default",
};

const rdr2: WorldSpec = {
  id: "rdr2",
  work: { title: "Red Dead Redemption 2", years: "2018", kind: "game" },
  verb: "Reflection",
  slots: {
    line: "graphite", emphasis: "pencil-underline", ground: "none", reveal: "sketch", success: "kindle",
    loader: "plate-trail", dressing: { notes: "frontier", index: "journal", quotes: "campfire" },
  },
  lettering: "rd-frontier",
  media: { plate: "MV-10", mobile: "MV-10m", loop: "MV-11L", cardStill: "MV-10", filmsStill: "F-RD" },
  borrowed: {
    text: "On this page it became the journal and the fire: graphite that keeps the record, a plate that develops while you wait, and the campfire where the voices sit.",
    status: "proposed",
  },
  line: "Q-RD-1",
  reason: reasons.rdr2,
  loaderVariant: "default",
};

const hp: WorldSpec = {
  id: "hp",
  work: { title: "Harry Potter", years: "2001–2011", kind: "film" },
  verb: "Revelation",
  slots: {
    line: "ink-light", emphasis: "ribbon", ground: "none", reveal: "nib", success: "flare",
    loader: "ink-light", dressing: { notes: "footprints", index: "parchment", quotes: "light" },
  },
  lettering: "hp-light",
  media: { plate: "MV-07", loop: "MV-09", cardStill: "MV-07", filmsStill: "F-HP" },
  borrowed: {
    text: "On this page it became the light: the play screen, ink that draws itself, and the candles that come on in Act IV.",
    status: "proposed",
  },
  line: "Q-HP-4",
  reason: reasons.hp,
  loaderVariant: "default",
};

/* — Tips (SPEC §8.3): Aryan's own rules, verbatim, or marked proposed ——— */
const tips = [
  { text: "Treat every backtest as guilty until proven innocent.", status: "confirmed", source: "REPO" },
  { text: "The result stands; no re-optimization after the fact.", status: "confirmed", source: "gauntlet[0].body" },
  { text: "The frozen rule is run on the holdout exactly once, no retuning.", status: "proposed", source: "gauntlet[1].body" },
  { text: "Zero-cost runs are banned.", status: "confirmed", source: "gauntlet[4].body" },
  { text: "Failed strategies are never retuned. Each ships a written post-mortem.", status: "confirmed", source: "gauntlet[6].body" },
  { text: "Target CPCV Sharpe 1.0–1.5 · anything > 2.0 is a red flag.", status: "proposed", source: "featuredProjects[1].metrics[2]" },
  { text: "Models are instruments, not idols.", status: "confirmed", source: "site.principleCapsule" },
  { text: "Do the work well and hold the outcome loosely.", status: "confirmed", source: "principles[1].body" },
  { text: "Good judgment is trained, not issued at birth.", status: "confirmed", source: "principles[0].body" },
  { text: "Most failures I have seen were failures of attention before they were failures of math.", status: "confirmed", source: "principles[4].body" },
] as const satisfies readonly Copy[];

/* — Page microcopy (SPEC §9.6). `{acts}` / `{works}` are filled by
     lib/sections.ts from the enabled acts ("four", "three films and a game"). */
const copy = {
  "opening.h2": { text: "A research journal in {acts} acts.", status: "proposed" },
  "intro.title": { text: "ARYAN SHARMA • A RESEARCH JOURNAL IN {ACTS} ACTS", status: "proposed" },
  "intro.play": { text: "Play", status: "proposed" },
  "intro.skip": { text: "Skip intro", status: "proposed" },
  "intro.desc": {
    text: "The page is already loaded behind this intro. Press Play to watch a six-second flight, or Escape to skip it.",
    status: "proposed",
  },
  "intro.loading": { text: "Loading the flight…", status: "proposed" },
  "films.h2": { text: "Three films and a game", status: "proposed" },
  "films.lead": {
    text: "This page borrows its light from {works}. Here is what it took from each.",
    status: "proposed",
  },
  "beyond.handbill.sub": { text: "for questions about quantitative research", status: "proposed" },
  "beyond.handbill.reward": {
    text: "An honest answer, including “I don't know yet.”",
    status: "draft",
    draft: true,
    prompt: "[DRAFT by Claude — Aryan: the WANTED poster's reward line, in your words (or empty to drop the row)]",
    alternates: [
      "A straight answer and a written post-mortem.",
      "A good question back, and the data to test it.",
    ],
  },
  "beyond.map.caption": { text: "ILLUSTRATIVE MAP", status: "proposed" },
  "beyond.photo.caption": { text: "Photograph: Aryan Sharma", status: "proposed" },
  "deadeye.status": { text: "Dead Eye: {n} killed ideas marked", status: "proposed" },
  "credits.ai": { text: "Claude (Anthropic), directed and reviewed by Aryan Sharma", status: "proposed" },
  /** H3, verbatim (SPEC F-3 resolved; the validator checks it byte-for-byte). */
  "credits.legal": {
    text: "Fan tribute — not affiliated with Warner Bros., Disney, Vinod Chopra Films or Rockstar Games.",
    status: "confirmed",
    source: "SPEC §15 H3",
  },
  "credits.legalMore": {
    text: "Titles, names and quoted lines belong to their owners and appear here as personal references. Every image, drawing, map and instrument on this page was made for it.",
    status: "proposed",
  },
  "credits.end": { text: "To be continued.", status: "proposed" },
  "pause.tooltip.pause": { text: "Nox — pause motion", status: "proposed" },
  "pause.tooltip.resume": { text: "Lumos — resume motion", status: "proposed" },
} as const satisfies Record<string, Copy>;
export type CopyKey = keyof typeof copy;

const LOGLINE_PROMPT = "[DRAFT by Claude — Aryan: one line, in your words, on what this act is about. Optional.]";
const loglines = {
  "act-1": aryanDraft("Where I started, and the course I've been correcting ever since.", LOGLINE_PROMPT),
  "act-2": aryanDraft("What I build, how I try to break it, and what didn't survive.", LOGLINE_PROMPT),
  "act-3": aryanDraft(
    "Life beyond the screen: the miles, the mat, the camera, and the people who have watched me work.",
    LOGLINE_PROMPT,
  ),
  "act-4": aryanDraft("What I believe about doing this work honestly, and where to find me.", LOGLINE_PROMPT),
} as const satisfies Record<string, Copy>;

export const FAN_TRIBUTE_LINE = copy["credits.legal"].text;

export const film = {
  /** false = the movie layer is off: every world renders as house, no intro,
   *  cards, films chapter, eggs, lettering, quotes or credits film rows. */
  enabled: true,
  intensity: "full" as Intensity,
  /** H-1: a work-credit line in the hero (default OFF: screen one is Aryan's). */
  heroCredit: false,
  /** F-5: Aryan signs the proposed microcopy + every quote. */
  copySignedOff: false,
  /** M1.5 (Aryan's answer #2): proposed AND draft copy render in EVERY
   *  build of this branch (no FILM_PREVIEW env needed, and no visible DRAFT
   *  badge). Every string keeps its status; RELEASE=1 fails while this is
   *  on or any shown string is unsigned. Turn off before merging to main. */
  branchPreview: true as boolean,
  /** The page-wide variant (lib/variants.ts): what every section, card,
   *  loader and the intro play unless they choose otherwise. */
  defaultVariant: "default" as Variant,
  /** FT-1: extend the display-font scope beyond act titles / loaders / eggs. */
  fontScope: { extended: false },
  prologue: {
    enabled: true,
    world: "hp",
    poster: "IN-01",
    posterMobile: "IN-01m",
    flight: "IN-02",
    trail: "intro-trail",
    landsOn: "top",
    maxFlightS: 6.0,
    variant: "default",
  } satisfies PrologueSpec,
  worlds: { house, pirates, idiots, rdr2, hp } satisfies Record<WorldId, WorldSpec>,
  acts: [
    {
      id: "act-1",
      world: "pirates",
      title: { text: "The Crossing", status: "proposed" },
      logline: loglines["act-1"],
      variant: "default",
    },
    {
      id: "act-2",
      world: "idiots",
      title: { text: "The Workshop", status: "proposed" },
      logline: loglines["act-2"],
      epigraph: { text: "Treat every backtest as guilty until proven innocent.", status: "confirmed", source: "REPO" },
      variant: "default",
    },
    {
      id: "act-3",
      world: "rdr2",
      title: { text: "The Frontier", status: "proposed" },
      logline: loglines["act-3"],
      tip: 2,
      variant: "default",
    },
    {
      id: "act-4",
      world: "hp",
      title: { text: "The Light", status: "proposed" },
      logline: loglines["act-4"],
      epigraph: "Q-HP-3",
      variant: "default",
    },
  ] as const satisfies readonly ActSpec[],
  /** "prev>next" world pair → card choreography. `house` is transparent. */
  transitions: {
    "hp>pirates": "flight",
    "pirates>idiots": "seam",
    "idiots>rdr2": "tintype",
    "rdr2>hp": "ignite",
    "idiots>hp": "ignite", // used when the rdr2 act is disabled (fixture I)
    "*": "reel",
  } as Readonly<Record<string, TransitionKind>>,
  /** Pairs whose card is a pinned long card (≤ 60vh, D-5). The validator
   *  counts DERIVED long cards (≤ 2), not list entries. */
  longCards: ["pirates>idiots", "rdr2>hp", "idiots>hp"] as readonly string[],
  tips,
  copy,
  lettering,
  eggs: {
    enabled: true,
    typed: true,
    list: [
      { id: "marauders-map", host: "global", trigger: ["palette", "typed"], enabled: true },
      { id: "lumos-nox", host: "chrome", trigger: ["palette", "typed"], enabled: true },
      { id: "accio-obliviate", host: "global", trigger: ["palette"], enabled: true },
      { id: "bolt-favicon", host: "intro", trigger: ["auto"], enabled: true },
      { id: "snitch", host: "credits", trigger: ["auto"], enabled: true },
      { id: "patronus", host: "contact", trigger: ["typed", "palette"], desktopOnly: true, enabled: true },
      { id: "hidden-kraken", host: "act-2", trigger: ["media"], enabled: true },
      { id: "parley", host: "global", trigger: ["palette"], enabled: true },
      { id: "quadcopter-lift", host: "work", trigger: ["auto"], enabled: true },
      { id: "aal-izz-well", host: "global", trigger: ["palette"], enabled: true },
      { id: "dead-eye", host: "kill-list", trigger: ["palette", "typed"], desktopOnly: true, enabled: true },
      { id: "console-line", host: "console", trigger: ["auto"], enabled: true },
      { id: "owl", host: "intro", trigger: ["media"], enabled: false }, // only if IN-02 renders it cleanly (it does not)
    ] satisfies EggSpec[],
  },
} as const;

export type ActId = (typeof film.acts)[number]["id"];
export const ACT_IDS: readonly ActId[] = film.acts.map((a) => a.id);

export function isActId(id: string): id is ActId {
  return (ACT_IDS as readonly string[]).includes(id);
}
