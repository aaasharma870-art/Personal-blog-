/* ============================================================================
   WORDS DATA (PHASE3-SPEC §8.2, §8.3, §8.5; plan §6.4) — OWNER: W2-WORDS.
   PURE DATA, no imports: hosts read it (server components) and
   scripts/checks/words.mjs imports this file directly in Node.

   Every string below is an EXISTING string of the page (CONTENT-RULES: no
   new words). The scrub lines are the exact spec §8.3 sentences, copied
   verbatim from their source field; the validator (scripts/checks/
   words.mjs) fails when a source drifts (Phase 2 rewrites), and
   `splitAround()` then returns null so the host renders plain text.
   ========================================================================== */

/** The four scroll-scrubbed sentences (one per act; spec §8.3 / D3-6). */
export const SCRUB_LINES = {
  /** Act I · About, pillar 02 (`pillars[1].body`, sentence 2). */
  B08: {
    act: "act-1",
    host: "about",
    source: "pillars[1].body",
    text: "The work I am proudest of is not a winning strategy — it is the documented graveyard of my own ideas that did not survive testing.",
  },
  /** Act II · trading-algos "learned" (`featuredProjects[0].learned`, sentence 2). */
  B21: {
    act: "act-2",
    host: "trading-algos",
    source: "featuredProjects[0].learned",
    text: "A documented 'no' protects capital better than another optimistic 'yes'.",
  },
  /** Act III · beyond, Creative · Photography (`beyond[3].items[0].body`). */
  B42: {
    act: "act-3",
    host: "beyond",
    source: "beyond[3].items[0].body",
    text: "Nature, architecture, people — studying composition and the behavior of light and shadow.",
  },
  /** Act IV · principles, room 05 (`principles[4].body`, sentence 2). */
  B55: {
    act: "act-4",
    host: "principles",
    source: "principles[4].body",
    text: "Most failures I have seen were failures of attention before they were failures of math.",
  },
} as const;

export type ScrubBeat = keyof typeof SCRUB_LINES;

/** The two physical words (spec §8.5; ≤ 1 per section, prose only). The
 *  host copy is checked by scripts/checks/words.mjs. */
export const PHYSICAL_WORDS = {
  /** optuna-screener: "noise" in the problem paragraph (`featuredProjects[1].problem`). */
  B23: { host: "optuna-screener", word: "noise", kind: "grain", source: "featuredProjects[1].problem" },
  /** kill-list: "Killed" in the intro paragraph (components/sections/ledger/ledger-section.tsx). */
  B29: { host: "kill-list", word: "Killed", kind: "strike", source: "components/sections/ledger/ledger-section.tsx" },
} as const;

/** The eight in-character titles (spec §8.2 / D3-16): the first world h2
 *  of each act and the four films-screen film titles. */
export const TITLE_BEATS = {
  B07: { host: "about", world: "pirates", via: "SectionHead" },
  B16: { host: "work", world: "idiots", via: "SectionHead" },
  B40: { host: "beyond", world: "rdr2", via: "SectionHead" },
  B53: { host: "principles", world: "hp", via: "SectionHead" },
  B31: { host: "films", world: "pirates", via: "FilmTitle" },
  B32: { host: "films", world: "idiots", via: "FilmTitle" },
  B33: { host: "films", world: "rdr2", via: "FilmTitle" },
  B34: { host: "films", world: "hp", via: "FilmTitle" },
} as const;

/** The two fly-throughs (spec §2.5 / §3.8; `needsIdle` stars). */
export const FLY_BEATS = {
  /** Act I: a gull across the voyage window's sky (journey end). */
  B12: { host: "journey", kind: "gull" },
  /** Act III: the graphite horse along the journal's bottom edge (writing). */
  B45: { host: "writing", kind: "horse" },
} as const;

/** The horse sprite's coordinate box (docs/build/media-staged/p3/sprites/
 *  horse/frames.json `viewBox`; ground at y = 100, facing right). */
export const HORSE_VIEWBOX = "0 0 183.5 100";
