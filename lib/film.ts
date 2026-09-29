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
    /** The incoming act card's SETTLED plate (M2: the iconic plate where one
     *  exists — pirates iconic-pearl, idiots iconic-ice, hp iconic-hall). Its
     *  ALT is resolveVariant(cardStill, "alt") unless `cardAltStill` says. */
    cardStill?: MediaId;
    /** A plate shown mid-card before the settled one (hp: MV-07 lights-line
     *  at p .7–.85, then iconic-hall; RECOGNIZABILITY S17). */
    cardMidStill?: MediaId;
    /** The ALT choreography's settled plate when it is a different asset,
     *  not the alternate of `cardStill` (rdr2: iconic-deadeye; S13). */
    cardAltStill?: MediaId;
    /** The outgoing half of a seam card (idiots: MV-04, the storm). */
    reelStill?: MediaId;
    /** The films chapter screen (SM-9). Its ALT is
     *  resolveVariant(filmsStill, "alt") unless `filmsAltStill` says. */
    filmsStill?: MediaId;
    /** hp: the films screen ALT is F-HP (the default is iconic-express; S12). */
    filmsAltStill?: MediaId;
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

/** "caption" (M2, RECOGNIZABILITY O-1): scene captions, act-card and films
 *  film titles, WANTED, and lettered film quotes. Only inside the display
 *  scope while `film.fontScope.extended` is on (validator #10). */
export type LetteringSlot = "act-title" | "loader" | "egg" | "caption";
export type LetteringSpec = {
  id: string;
  /** The exact string set in the face (the glyph subset is cut from it).
   *  "" for a lettered QUOTE: its glyphs come from the quote registry, so
   *  the line's text never appears outside lib/quotes.ts (lint #7). */
  text: string;
  /** A registered line rendered through <FilmQuote rendition="lettered">. */
  quote?: QuoteId;
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
  // M2 (RECOGNIZABILITY O-3; FONTS.md FT-2 option c): Rye (OFL; it carries a
  // Reserved Font Name — we self-host Google's served subset, judged
  // low-risk in FONTS.md) is the rdr2 world face. Chinese Rocks stays
  // outline-only by its EULA and is not used; one line to reverse.
  { id: "rd-frontier", text: "THE FRONTIER", face: "Rye", mode: "A", slot: "act-title", shipped: true },
  { id: "hp-light", text: "The Light", face: "IM Fell English", mode: "A", slot: "act-title", shipped: true },
  { id: "rd-deadeye", text: "DEAD EYE", face: "Rye", mode: "A", slot: "egg", shipped: true },
  /* — M2 captions scope (O-1; slot "caption"). NEVER a logo face, lockup,
       bevel, bolt-in-a-letter or stacked mark (O-1 guard, ICONS H2). — */
  // the film titles (act cards at --text-title, films h3, credits O-6)
  { id: "pc-film", text: "PIRATES OF THE CARIBBEAN", face: "Pirata One", mode: "A", slot: "caption", shipped: true },
  { id: "3i-film", text: "3 IDIOTS", face: "Kalam", mode: "A", slot: "caption", shipped: true },
  { id: "rd-film", text: "RED DEAD REDEMPTION 2", face: "Rye", mode: "A", slot: "caption", shipped: true },
  { id: "hp-film", text: "HARRY POTTER", face: "IM Fell English", mode: "A", slot: "caption", shipped: true },
  // the WANTED handbill word (S14, FT-1)
  { id: "rd-wanted", text: "WANTED", face: "Rye", mode: "A", slot: "caption", shipped: true },
  // the principles map's banner title (copy "principles.map.title"; every glyph already in the hp subset)
  { id: "hp-map-title", text: "THE MAP OF THE PRINCIPLES", face: "IM Fell English", mode: "A", slot: "caption", shipped: true },
  // lettered film quotes (<FilmQuote rendition="lettered">; text lives in lib/quotes.ts)
  { id: "q-pc-1", text: "", quote: "Q-PC-1", face: "Pirata One", mode: "A", slot: "caption", shipped: true },
  { id: "q-3i-2", text: "", quote: "Q-3I-2", face: "Kalam", mode: "A", slot: "caption", shipped: true },
  { id: "q-3i-3", text: "", quote: "Q-3I-3", face: "Kalam", mode: "A", slot: "caption", shipped: true },
  // M2 finish (Act II builder): the lecture's question, chalked on the ICE
  // board at the optuna-screener head (IC-3I-05; the moment's name, not a
  // registered line: the answer is Q-3I-3, lettered through <FilmQuote>)
  { id: "3i-machine-q", text: "What is a machine?", face: "Kalam", mode: "A", slot: "caption", shipped: true },
  { id: "q-hp-2", text: "", quote: "Q-HP-2", face: "IM Fell English", mode: "A", slot: "caption", shipped: true },
  // the films chapter's four lines, lettered in their world faces (ART-DIRECTOR #11: the most
  // famous lines on the page were 10 px mono); attribution stays in Meta beside each
  { id: "q-pc-2", text: "", quote: "Q-PC-2", face: "Pirata One", mode: "A", slot: "caption", shipped: true },
  { id: "q-3i-1", text: "", quote: "Q-3I-1", face: "Kalam", mode: "A", slot: "caption", shipped: true },
  { id: "q-rd-1", text: "", quote: "Q-RD-1", face: "Rye", mode: "A", slot: "caption", shipped: true },
  { id: "q-hp-4", text: "", quote: "Q-HP-4", face: "IM Fell English", mode: "A", slot: "caption", shipped: true },
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
  // films screen (ART-DIRECTOR #9): the tattered-sail Pearl, CROSSED with the Act I card so no
  // variant shows the same plate twice (card: iconic-pearl / ALT -alt; films: -alt / ALT iconic-pearl)
  media: {
    plate: "MV-01", loop: "MV-03", mobile: "MV-02", cardStill: "iconic-pearl",
    filmsStill: "iconic-pearl-alt", filmsAltStill: "iconic-pearl",
  },
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
  media: { plate: "MV-06", cardStill: "iconic-ice", reelStill: "MV-04", filmsStill: "F-3I" },
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
  media: {
    plate: "MV-10", mobile: "MV-10m", loop: "MV-11L",
    cardStill: "MV-10", cardAltStill: "iconic-deadeye", filmsStill: "F-RD",
  },
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
  media: {
    plate: "MV-07", loop: "MV-09",
    cardStill: "iconic-hall", cardMidStill: "MV-07",
    filmsStill: "iconic-express", filmsAltStill: "F-HP",
  },
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
  /* — M2 eggs (components/eggs/**; SPEC §9.6): "egg.<key>", read through
       components/eggs/egg-copy.ts. Proposed until Aryan signs. — */
  /* eggs: palette commands */
  "egg.cmd.map": { text: "Open the Marauder's Map", status: "proposed" },
  "egg.cmd.map.keywords": { text: "i solemnly swear marauders map footprints hogwarts harry potter rooms", status: "proposed" },
  "egg.cmd.obliviate": { text: "Obliviate — forget this visit", status: "proposed" },
  "egg.cmd.parley": { text: "Parley — go to Contact", status: "proposed" },
  "egg.cmd.aal": { text: "Aal izz well", status: "proposed" },
  "egg.cmd.deadeye": { text: "Dead Eye (kill-list)", status: "proposed" },
  "egg.cmd.deadeye.stop": { text: "Stop Dead Eye", status: "proposed" },
  "egg.cmd.intro": { text: "Watch the intro again", status: "proposed" },
  "egg.cmd.eggs.off": { text: "Turn off easter eggs", status: "proposed" },
  "egg.cmd.eggs.on": { text: "Turn on easter eggs", status: "proposed" },
  "egg.group.eggs": { text: "Easter eggs", status: "proposed" },
  /* eggs: the Map dialog + the 404 */
  "egg.map.sub": { text: "Every room is a section of this page, in order. The footprints are yours.", status: "proposed" },
  "egg.map.you": { text: "You", status: "proposed" },
  "egg.map.close": { text: "close the map", status: "proposed" },
  "egg.map.empty": { text: "No footprints yet: scroll a little, then look again.", status: "proposed" },
  "egg.404.title": { text: "You've wandered off the map.", status: "proposed" },
  "egg.404.sub": { text: "This page isn't on the Map. Every room that is, is below.", status: "proposed" },
  "egg.404.home": { text: "back to the opening", status: "proposed" },
  "egg.404.alt.tip": { text: "This trail goes nowhere. Head back to camp.", status: "proposed" },
  "egg.404.alt.home": { text: "Back to camp", status: "proposed" },
  /* eggs: toasts */
  "egg.toast.obliviate": { text: "Obliviate: this visit is forgotten. The intro will play again from the top.", status: "proposed" },
  "egg.toast.lumos": { text: "Lumos — motion resumed.", status: "proposed" },
  "egg.toast.lumos.os": { text: "Lumos: your system asks for reduced motion, so the page stays still.", status: "proposed" },
  "egg.toast.nox": { text: "Nox — motion paused.", status: "proposed" },
  "egg.toast.eggs.off": { text: "Easter eggs are off for this visit.", status: "proposed" },
  "egg.toast.eggs.on": { text: "Easter eggs are on.", status: "proposed" },
  "egg.toast.deadeye.none": { text: "Dead Eye needs the kill-list in view: scroll to it, then call it again.", status: "proposed" },
  /* eggs: credits */
  "egg.credits.seeker.role": { text: "Seeker", status: "proposed" },
  "egg.credits.seeker.name": { text: "you", status: "proposed" },
  "egg.snitch.label": { text: "Catch the snitch", status: "proposed" },
  "egg.snitch.caught": { text: "Snitch caught", status: "proposed" },
  /* — M2 systems: the space-pen wink (IC-3I-06; our own phrasing, not a
       quote) and its footnote. The footnote is Claude's summary of the
       pen history: verify it before ship (SPEC). — */
  "systems.pencil.q": { text: "Why not just use a pencil?", status: "proposed" },
  "systems.pencil.body": {
    text: "The same question, asked of this page: no WebGL, just native scroll, CSS and SVG first.",
    status: "proposed",
  },
  "systems.pencil.footnote": {
    text: "The famous version of the pen story, where one side spends millions on a space pen while the other simply uses a pencil, is a myth. Pencil tips snap and graphite dust conducts, a hazard in orbit; the pressurised pen was developed privately, and both programmes ended up buying it.",
    status: "proposed",
  },
  /* — M2 principles: the Marauder's Map banner over the reader's step — */
  "principles.you": { text: "YOU", status: "proposed" },
  /* the map's own banner title (our wording, not a film line; lettering "hp-map-title") */
  "principles.map.title": { text: "THE MAP OF THE PRINCIPLES", status: "proposed" },
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

/* — World display faces (the fan faces; FONTS.md). One per film world. — */
export const worldFaces = {
  pirates: "Pirata One",
  idiots: "Kalam",
  rdr2: "Rye",
  hp: "IM Fell English",
} as const satisfies Record<Exclude<WorldId, "house">, string>;

/* — Scene captions (RECOGNIZABILITY RULE (b), §4, §6) ————————————————
   Every film scene that imagery alone can't carry names FILM + MOMENT in
   visible HTML: "THE LECTURE HALL AT ICE • 3 IDIOTS", set in the world's fan
   face (O-1) by <SceneCaption k="cap.act-2"> (components/primitives/
   scene-caption.tsx). A caption is a <p>, never a heading; it never sits
   beside a metric, verdict or research label (H4), and `experiment` gets
   none. Every moment is `proposed` until Aryan signs (copySignedOff); the
   branch preview renders them. Keys ending ".alt" name the ALT variant's
   imagery: pick with captionKeyFor(base, variant) (lib/sections.ts).
   Accuracy (rule c): Port Royal / Isla de Muerta / the Aztec gold are Curse
   of the Black Pearl (2003); Calypso's storm (the maelstrom battle) is At
   World's End (2007); the bottled Pearl is On Stranger Tides (2011);
   ICE = the film's Imperial College of Engineering; the yellow scooter at
   Pangong lake is 3 Idiots' final scene; the astronaut pen is Virus's pen,
   kept for a worthy student. NOT used (unverified): "Virus's stopwatch". */
export type CaptionWorld = Exclude<WorldId, "house">;
/** bl / br: over the media's calm bottom corner (desktop ≥ 640, never over
 *  moving media); under: below the frame; head: the section head. Under
 *  640 px every placement renders as `under`. */
export type CaptionPlace = "bl" | "br" | "under" | "head";
export type SceneCaptionSpec = {
  world: CaptionWorld;
  /** The MOMENT, in caps (status "proposed"). Absent when `quote` is set. */
  moment?: Copy;
  /** A registered line used as the moment (lettered FilmQuote). */
  quote?: QuoteId;
  /** Append "• <FILM>" (default "auto": the world's work title in caps). */
  film?: "auto" | false;
  /** Which variant's imagery this names ("both" = either). */
  variant: "default" | "alt" | "both";
  /** Default placement (the component's `place` prop overrides). */
  place: CaptionPlace;
  /** Where it renders (the builder that owns it; review aid). */
  where: string;
  /** Narrates a visual only (the intro flight hand-off): aria-hidden. */
  ariaHidden?: true;
};
const moment = (text: string): Copy => ({ text, status: "proposed" });

const captions = {
  /* prologue + hero (cards builder: components/intro/**) */
  "cap.intro.play": { world: "hp", moment: moment("HOGWARTS, ACROSS THE BLACK LAKE"), variant: "both", place: "bl", where: "intro play screen, below Play; clears with the intro text" },
  "cap.intro.flight.hp": { world: "hp", moment: moment("A BROOMSTICK OVER HOGWARTS"), variant: "both", place: "bl", where: "flight 0–2.5 s", ariaHidden: true },
  "cap.intro.flight.pc": { world: "pirates", moment: moment("TOWARD THE BLACK PEARL"), variant: "both", place: "br", where: "flight 3.5 s → the landed hero +2.5 s, then crossfades in place into cap.hero", ariaHidden: true },
  // M2 fix (ART-DIRECTOR #3): the hero names its plate for good (T1: the flight caption hands off to it in place)
  "cap.hero": { world: "pirates", moment: moment("THE BLACK PEARL ON THE HORIZON"), variant: "both", place: "br", where: "hero, bottom-right over the calm dark water on its own scrim (≥ 640; never over the crest); under the portrait still < 640" },
  /* Act I · pirates */
  "cap.act-1": { world: "pirates", moment: moment("THE BLACK PEARL"), variant: "default", place: "br", where: "opening card plate (iconic-pearl)" },
  "cap.act-1.alt": { world: "pirates", moment: moment("THE CHART TO ISLA DE MUERTA"), variant: "alt", place: "br", where: "opening card plate (iconic-pearl-alt + the chart)" },
  "cap.about": { world: "pirates", moment: moment("JACK’S COMPASS — IT POINTS TO WHAT YOU WANT MOST"), variant: "both", place: "head", where: "about head, opposite the h2" },
  "cap.journey.1": { world: "pirates", moment: moment("PORT ROYAL HARBOUR AT NIGHT"), variant: "both", place: "bl", where: "journey media, step 1 (still frame only)" },
  "cap.journey.2": { world: "pirates", moment: moment("THE FOG AROUND ISLA DE MUERTA"), variant: "both", place: "bl", where: "journey media, step 2" },
  // step 3 shows a squall with no ship and no gold (MV-05c / -alt), so it names the storm it shows
  // (ART-DIRECTOR #9: "the curse of the Aztec gold" promised a medallion the frame never had)
  "cap.journey.3": { world: "pirates", moment: moment("CALYPSO’S STORM"), variant: "both", place: "bl", where: "journey media, step 3 (the squall)" },
  "cap.journey.4": { world: "pirates", quote: "Q-PC-1", variant: "both", place: "bl", where: "journey media, step 4 (lettered Q-PC-1)" },
  /* Card I→II + Act II · idiots */
  "cap.act-2.out": { world: "pirates", moment: moment("THE KRAKEN’S STORM"), variant: "both", place: "br", where: "card I→II outgoing half, p .1–.35 (O-7)" },
  "cap.act-2": { world: "idiots", moment: moment("THE LECTURE HALL AT ICE"), variant: "default", place: "br", where: "card I→II settled (iconic-ice)" },
  "cap.act-2.alt": { world: "idiots", moment: moment("THE HOMEMADE DRONE, CHALKED AT ICE"), variant: "alt", place: "br", where: "card I→II settled (the duster wipes the storm off iconic-ice-alt; the drone in chalk under it)" },
  // M2 finish (Act II builder): the work head band, above the h2 (BLIND-1 D24)
  "cap.work.head": { world: "idiots", moment: moment("THE ASTRONAUT PEN ON VIRUS’S DESK"), variant: "both", place: "bl", where: "work head band, calm dark left (iconic-pen-alt; ALT iconic-pen)" },
  "cap.work.head.standin": { world: "idiots", moment: moment("THE LECTURE HALL AT ICE"), variant: "both", place: "bl", where: "work head band while iconic-corridor is planned (stand-in iconic-ice-alt / iconic-ice)" },
  // M2 finish: `under` the board (was bl): no scrim over the board, its frame or the chalk ledge (BLIND-1 D25)
  "cap.work": { world: "idiots", moment: moment("THE ICE CHALKBOARD"), variant: "both", place: "under", where: "under the gauntlet board (never over its labels)" },
  "cap.trading-algos": { world: "idiots", moment: moment("A RANCHO-STYLE BLUEPRINT"), variant: "both", place: "head", where: "above the Trading_Algos chalkboard panel, naming it as it enters (never beside a metric)" },
  // M2 finish: the chapter's head band (IC-3I-05); Q-3I-3 is chalked on the board itself
  "cap.optuna-screener": { world: "idiots", moment: moment("WHAT IS A MACHINE?"), variant: "both", place: "bl", where: "optuna-screener head band (iconic-ice-alt / iconic-ice), before the chapter's facts" },
  "cap.systems": { world: "idiots", moment: moment("THE HOMEMADE DRONE"), variant: "both", place: "bl", where: "systems band (iconic-drone); names no character" },
  // M2 finish: under the header inset (iconic-pen, or its PenCase stand-in)
  "cap.kill-list": { world: "idiots", moment: moment("VIRUS’S ASTRONAUT PEN"), variant: "both", place: "under", where: "kill-list header inset, under the plate (O-5; never on a row)" },
  /* Intermission · the films chapter (house plane, one world per screen) */
  // the films screen shows the TATTERED-sail Pearl under the moon (iconic-pearl-alt / iconic-pearl,
  // ART-DIRECTOR #9: F-PC's intact grey sails were not the Black Pearl)
  "cap.films.pirates": { world: "pirates", moment: moment("THE BLACK PEARL BY MOONLIGHT"), variant: "both", place: "under", where: "films screen (iconic-pearl-alt; ALT iconic-pearl)" },
  "cap.films.idiots": { world: "idiots", moment: moment("THE YELLOW SCOOTER AT PANGONG LAKE"), variant: "both", place: "under", where: "films screen (F-3I)" },
  "cap.films.rdr2": { world: "rdr2", moment: moment("THE HEARTLANDS AT DUSK"), variant: "both", place: "under", where: "films screen (F-RD)" },
  "cap.films.hp": { world: "hp", moment: moment("THE HOGWARTS EXPRESS"), variant: "default", place: "under", where: "films screen (iconic-express)" },
  "cap.films.hp.alt": { world: "hp", moment: moment("FLOATING CANDLES AND ENCHANTED INK"), variant: "alt", place: "under", where: "films screen (F-HP)" },
  /* Card II→III + Act III · rdr2 */
  "cap.act-3": { world: "rdr2", moment: moment("GOLDEN HOUR IN THE HEARTLANDS"), variant: "default", place: "br", where: "card II→III settled (MV-10)" },
  "cap.act-3.alt": { world: "rdr2", moment: moment("DEAD EYE"), variant: "alt", place: "br", where: "card II→III settled (iconic-deadeye + the X marks)" },
  "cap.beyond": { world: "rdr2", moment: moment("THE HEARTLANDS"), variant: "both", place: "bl", where: "beyond band (MV-10 / MV-10m)" },
  "cap.beyond.satchel": { world: "rdr2", moment: moment("WHAT’S IN THE SATCHEL"), variant: "both", place: "head", where: "Creative block head" },
  "cap.beyond.handbill": { world: "rdr2", moment: moment("A WANTED POSTER"), variant: "both", place: "under", where: "under the notice board (iconic-wanted)" },
  "cap.writing": { world: "rdr2", moment: moment("ARTHUR MORGAN’S JOURNAL"), variant: "both", place: "head", where: "writing, left page head (paper plane)" },
  "cap.voices": { world: "rdr2", moment: moment("THE GANG’S CAMP AT DUSK"), variant: "default", place: "head", where: "voices head, under the h2 (iconic-camp behind; ART-DIRECTOR #14)" },
  "cap.voices.alt": { world: "rdr2", moment: moment("THE CAMPFIRE"), variant: "alt", place: "under", where: "under the MV-11L loop (it moves)" },
  /* Card III→IV + Act IV · hp */
  "cap.act-4.out": { world: "rdr2", moment: moment("THE CAMPFIRE"), variant: "both", place: "br", where: "card III→IV outgoing, p .05–.3" },
  "cap.act-4": { world: "hp", moment: moment("THE GREAT HALL"), variant: "default", place: "br", where: "card III→IV settled, p > .85 (iconic-hall)" },
  "cap.act-4.alt": { world: "hp", moment: moment("LUMOS — THE GREAT HALL LIGHTS UP"), variant: "alt", place: "br", where: "card III→IV settled (Lumos sweep)" },
  "cap.principles": { world: "hp", moment: moment("THE MARAUDER’S MAP"), variant: "default", place: "head", where: "principles head, right of the h2 (parchment)" },
  "cap.principles.alt": { world: "hp", moment: moment("LUMOS — THE ENCHANTED CEILING"), variant: "alt", place: "head", where: "principles head (the Great Hall's starry ceiling + floating candles, each row's candle lights)" },
  "cap.contact": { world: "hp", moment: moment("A FLOATING CANDLE FROM THE GREAT HALL"), variant: "both", place: "under", where: "contact: under the last-light plate at every width (never stacked on the h2; the loop moves)" },
  /* Route loaders (loaders-eggs-chrome; under the loader art) */
  "cap.loader.pirates": { world: "pirates", moment: moment("JACK’S COMPASS"), variant: "default", place: "under", where: "route card, under the loader" },
  "cap.loader.pirates.alt": { world: "pirates", moment: moment("THE BLACK PEARL IN A BOTTLE"), variant: "alt", place: "under", where: "route card, under the loader" },
  // M2 fix (BLIND-1 "generic gears"): the board now carries the drone and Virus's pen in chalk; the caption names them
  "cap.loader.idiots": { world: "idiots", moment: moment("THE DRONE AND THE ASTRONAUT PEN"), variant: "default", place: "under", where: "route card, under the loader" },
  "cap.loader.idiots.alt": { world: "idiots", moment: moment("A DERIVATION ON THE ICE BOARD"), variant: "alt", place: "under", where: "route card, under the loader" },
  "cap.loader.rdr2": { world: "rdr2", moment: moment("ARTHUR MORGAN’S JOURNAL"), variant: "default", place: "under", where: "route card, under the loader" },
  "cap.loader.rdr2.alt": { world: "rdr2", moment: moment("DEAD EYE"), variant: "alt", place: "under", where: "route card, under the loader" },
  "cap.loader.hp": { world: "hp", moment: moment("THE FLOATING CANDLES"), variant: "default", place: "under", where: "route card, under the loader" },
  "cap.loader.hp.alt": { world: "hp", moment: moment("THE MARAUDER’S MAP"), variant: "alt", place: "under", where: "route card, under the loader" },
} as const satisfies Record<string, SceneCaptionSpec>;
export type CaptionKey = keyof typeof captions;

/** Every caption MOMENT as a lettering string (slot "caption", its world's
 *  face), so scripts/fetch-display-fonts.mjs cuts their glyphs. Derived:
 *  add a caption above and its lettering follows. */
const captionLettering: readonly LetteringSpec[] = (() => {
  const seen = new Set<string>();
  const out: LetteringSpec[] = [];
  for (const [key, c] of Object.entries(captions) as [CaptionKey, SceneCaptionSpec][]) {
    if (!c.moment) continue;
    const face = worldFaces[c.world];
    const k = `${face}|${c.moment.text}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ id: `cap:${key}`, text: c.moment.text, face, mode: "A", slot: "caption", shipped: true });
  }
  return out;
})();

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
  /** FT-1 / RECOGNIZABILITY O-1: extend the display-font scope beyond act
   *  titles / loaders / eggs to the "caption" slot (scene captions, film
   *  titles, WANTED, lettered quotes). false = captions set in house type. */
  fontScope: { extended: true as boolean },
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
  /** Static lettering (act titles, eggs, film titles, WANTED, lettered
   *  quotes) + every caption moment (derived). */
  lettering: [...lettering, ...captionLettering] as readonly LetteringSpec[],
  /** The fan face of each film world (FONTS.md; lib/fonts.ts maps it). */
  worldFaces,
  /** Scene captions (MOMENT • FILM), keyed "cap.*" (RECOGNIZABILITY §6). */
  captions: captions as Readonly<Record<CaptionKey, SceneCaptionSpec>>,
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
