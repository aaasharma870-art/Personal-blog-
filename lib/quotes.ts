/* ============================================================================
   QUOTES — the registry of every line quoted from the works (SPEC v2 §9.6,
   §10.2.1; texts and verification status from build/ICONS.md §3.1–§6.1).
   PURE DATA: no React, no imports — Node imports it (scripts/check-manifest.mjs).

   A quote renders ONLY through <FilmQuote id rendition attribution> (the
   component lands with the Act/credits builders). The validator's quote lint
   fails any UI/alt/film.ts string that equals a registry text but is not
   rendered through FilmQuote, and any entry without `work` and `year`.

   Every entry starts `status: "proposed"`: production builds fail until
   Aryan signs the list (film.copySignedOff or a per-entry "confirmed").
   COMMUNITY entries must also be checked in the work itself first.
   ========================================================================== */

export type QuoteVerified = "VERIFIED" | "COMMUNITY";
export type QuoteStatus = "proposed" | "confirmed";

export type QuoteDef = {
  /** Verbatim. Never edited, never paraphrased. */
  text: string;
  /** The work as credited (house type only). */
  work: string;
  /** Release year of the specific film / game the line is from. */
  year: string;
  speaker?: string;
  verified: QuoteVerified;
  /** true = the rendered text is a marked excerpt of a longer line. */
  excerpt?: true;
  /** The shortened form an `excerpt` renders (starts or ends with "…"). */
  excerptText?: string;
  status: QuoteStatus;
  /** Where it renders (SPEC §10.2.1): a section id, "intro", "credits",
   *  "card:<act id>", "egg:<egg id>" or "console". Feeds `quotesInUse` →
   *  the credits' LINES QUOTED row (only quotes whose host renders). */
  host: string;
  /** Placement guard carried from the SPEC (read by the critics). */
  guard?: string;
};

export const quotes = {
  "Q-HP-1": {
    text: "I solemnly swear that I am up to no good.",
    work: "Harry Potter and the Prisoner of Azkaban",
    year: "2004",
    verified: "VERIFIED",
    status: "proposed",
    host: "intro",
    guard: "Intro, above Play (epigraph rendition, credits attribution); the Map egg trigger. Never in a display face.",
  },
  "Q-HP-2": {
    text: "Mischief managed.",
    work: "Harry Potter and the Prisoner of Azkaban",
    year: "2004",
    verified: "VERIFIED",
    status: "proposed",
    host: "credits",
    guard: "The credits' last line; the Map's close; the 404's way home.",
  },
  "Q-HP-3": {
    text: "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.",
    work: "Harry Potter and the Prisoner of Azkaban",
    year: "2004",
    speaker: "Albus Dumbledore",
    verified: "VERIFIED",
    excerpt: true,
    excerptText: "…if one only remembers to turn on the light.",
    status: "proposed",
    host: "card:act-4",
    guard: "Card III→IV epigraph. A film-only line: attribute to the film, not the book.",
  },
  "Q-HP-4": {
    text: "It does not do to dwell on dreams, Harry, and forget to live.",
    work: "Harry Potter and the Philosopher's Stone",
    year: "2001",
    speaker: "Albus Dumbledore",
    verified: "VERIFIED",
    status: "proposed",
    host: "films",
    guard: "Films HP screen. Grief context: never near SOS Foundation or family content.",
  },
  "Q-PC-1": {
    text: "Now… bring me that horizon.",
    work: "Pirates of the Caribbean: The Curse of the Black Pearl",
    year: "2003",
    speaker: "Jack Sparrow",
    verified: "COMMUNITY",
    status: "proposed",
    host: "journey",
    guard: "Journey waypoint 4 caption (NOW • BRING ME THAT HORIZON.). Check the ellipsis in the film.",
  },
  "Q-PC-2": {
    text: "Not all treasure is silver and gold, mate.",
    work: "Pirates of the Caribbean: The Curse of the Black Pearl",
    year: "2003",
    speaker: "Jack Sparrow",
    verified: "VERIFIED",
    status: "proposed",
    host: "films",
    guard: "Films Pirates screen. Never next to a return or Sharpe figure.",
  },
  "Q-PC-3": {
    text: "The code is more what you'd call 'guidelines' than actual rules.",
    work: "Pirates of the Caribbean: The Curse of the Black Pearl",
    year: "2003",
    speaker: "Hector Barbossa",
    verified: "COMMUNITY",
    status: "proposed",
    host: "console",
    guard: "Console egg only; never near the gauntlet or kill-list.",
  },
  "Q-3I-1": {
    text: "Aal izz well.",
    work: "3 Idiots",
    year: "2009",
    speaker: "Rancho",
    verified: "VERIFIED",
    status: "proposed",
    host: "films",
    guard: "Films 3I screen; the LD-3I stall status (real loads only, never on an error); the palette egg.",
  },
  "Q-3I-2": {
    text: "Pursue excellence, and success will follow.",
    work: "3 Idiots",
    year: "2009",
    speaker: "Farhan, quoting Rancho",
    verified: "VERIFIED",
    excerpt: true,
    status: "proposed",
    host: "work",
    guard: "The dawn board's top margin. The line's joke tail is dropped (excerpt: true marks it honestly).",
  },
  "Q-3I-3": {
    text: "A machine is anything that reduces human effort.",
    work: "3 Idiots",
    year: "2009",
    speaker: "Rancho",
    verified: "COMMUNITY",
    status: "proposed",
    host: "optuna-screener",
    guard: "Chalked on the optuna-screener head board (machine-board.tsx), under the lettered question \"What is a machine?\", before the chapter's facts; never beside a metric (M2 finish; was under the pipeline FIG).",
  },
  "Q-RD-1": {
    text: "Be loyal to what matters.",
    work: "Red Dead Redemption 2",
    year: "2018",
    speaker: "Arthur Morgan",
    verified: "COMMUNITY",
    status: "proposed",
    host: "films",
    guard: "Films RDR screen. Never in Beyond beside the SOS Foundation (it would read as Aryan speaking about family).",
  },
  "Q-RD-2": {
    text: "We can't change what's done, we can only move on.",
    work: "Red Dead Redemption 2",
    year: "2018",
    speaker: "Arthur Morgan",
    verified: "COMMUNITY",
    status: "proposed",
    host: "egg:dead-eye",
    guard: "The Dead Eye end toast.",
  },
} as const satisfies Record<string, QuoteDef>;

export type QuoteId = keyof typeof quotes;

/** Lines that must never ship anywhere (SPEC §10.2.1 OUT; H4). The validator
 *  greps the repo's UI sources for these. Lower-cased fragments. */
export const OUT_LINES: readonly string[] = [
  "the problem is not the problem",
  "give me some sunshine",
  "i have a plan",
];

export function isQuoteId(id: string): id is QuoteId {
  return Object.prototype.hasOwnProperty.call(quotes, id);
}
