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

   Copy statuses (SPEC §9.6):
     confirmed = Aryan's existing words (content.ts / REPO): renders everywhere.
     proposed  = new microcopy about THE PAGE and every quote: dev + preview;
                 production fails until `copySignedOff` (or per-string).
     draft     = anything about ARYAN (why a work matters, loglines, the
                 handbill reward): only a prompt here, never a phrasing; the
                 text stays "" until he writes it; production fails if one
                 would render.
   ========================================================================== */

import type { LoaderKind, WorldId } from "./worlds";
import type { MediaId } from "./media";
import type { QuoteId } from "./quotes";

export type Intensity = "whisper" | "grade" | "full";
export type CopyStatus = "confirmed" | "proposed" | "draft";
export type Copy = {
  text: string;
  status: CopyStatus;
  /** content.ts path ("gauntlet[0].body", "site.principleCapsule") or "REPO". */
  source?: string;
  /** draft only: what Aryan is asked to write (never a sample phrasing). */
  prompt?: string;
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
  /** Films chapter: Aryan's own reason. Starts `draft` with text "". */
  reason?: Copy;
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

const draftReason: Copy = {
  text: "",
  status: "draft",
  prompt:
    "[DRAFT — Aryan: what you took from this film or game, 1–2 sentences in your own words. Prompts: what do you remember first? Where does it show up in how you work? Leave empty to ship this screen without a reason.]",
};

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
  reason: draftReason,
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
  reason: draftReason,
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
  reason: draftReason,
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
  reason: draftReason,
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
    text: "",
    status: "draft",
    prompt: "[DRAFT — Aryan: a reward line in your words, or leave empty]",
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

const actLogline: Copy = {
  text: "",
  status: "draft",
  prompt: "[DRAFT — Aryan: one line, in your words, on what this act is about. Optional.]",
};

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
  } satisfies PrologueSpec,
  worlds: { house, pirates, idiots, rdr2, hp } satisfies Record<WorldId, WorldSpec>,
  acts: [
    { id: "act-1", world: "pirates", title: { text: "The Crossing", status: "proposed" }, logline: actLogline },
    {
      id: "act-2",
      world: "idiots",
      title: { text: "The Workshop", status: "proposed" },
      logline: actLogline,
      epigraph: { text: "Treat every backtest as guilty until proven innocent.", status: "confirmed", source: "REPO" },
    },
    { id: "act-3", world: "rdr2", title: { text: "The Frontier", status: "proposed" }, logline: actLogline, tip: 2 },
    { id: "act-4", world: "hp", title: { text: "The Light", status: "proposed" }, logline: actLogline, epigraph: "Q-HP-3" },
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
