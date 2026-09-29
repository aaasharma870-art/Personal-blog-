/* ============================================================================
   DERIVE — the pure act / world / card derivations of SPEC v2 §12.3, written
   as functions of (sections, film) so they run anywhere:
     - lib/sections.ts binds them to the real manifest for the app;
     - scripts/check-manifest.mjs imports THIS file directly (type-only
       imports, so Node's type stripping can load it) to validate the very
       same cards the page renders, and to run the adaptability fixtures.
   No React, no DOM, no value imports.
   ========================================================================== */

import type { SectionEntry, Tone, World } from "./page";
import type { ActSpec, Copy, LetteringId, TransitionKind, WorldSpec, film as FilmData } from "./film";
import type { QuoteId } from "./quotes";
import type { VariantChoice } from "./variants";

type Film = typeof FilmData;
type AnyAct = Film["acts"][number];

/** Roman numerals for act numbering (acts ≤ 4 by rule; 10 is plenty). */
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const roman = (n: number): string => ROMAN[n - 1] ?? String(n);

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
export const numberWord = (n: number): string => NUMBER_WORDS[n] ?? String(n);

/* — Acts and worlds ———————————————————————————————————————————————— */

export function actSpecOf(film: Film, id: string | null | undefined): AnyAct | null {
  if (!id) return null;
  return film.acts.find((a) => a.id === id) ?? null;
}

/** Acts that own ≥ 1 enabled section, in order of FIRST APPEARANCE on the
 *  page (so reordering the manifest renumbers them). */
export function actsInUse(sections: readonly SectionEntry[], film: Film): AnyAct[] {
  const seen: AnyAct[] = [];
  for (const s of sections) {
    const a = actSpecOf(film, s.act);
    if (a && !seen.includes(a)) seen.push(a);
  }
  return seen;
}

/** SPEC §12.3 worldOf: override ?? act's world ?? inherit. inherit: hero →
 *  the first act's world; films / credits / anything outside acts → house.
 *  film.enabled = false → every section is house. */
export function worldOfIn(entry: SectionEntry, sections: readonly SectionEntry[], film: Film): World {
  if (!film.enabled) return "house";
  if (entry.world) return entry.world;
  const act = actSpecOf(film, entry.act);
  if (act) return act.world;
  if (entry.type === "hero") return actsInUse(sections, film)[0]?.world ?? "house";
  return "house";
}

export function toneOfEntry(entry: SectionEntry): Tone {
  return entry.tone ?? "canvas";
}

/* — Act runs + derived cards ——————————————————————————————————————— */

export type ActRun = { act: AnyAct; n: number; sections: SectionEntry[] };

/** Contiguous runs of the same act in page order. A non-contiguous act
 *  shows up as two runs (the validator fails it). Sections with act null
 *  (hero, intermission, credits) belong to no run. */
export function actRunsOf(sections: readonly SectionEntry[], film: Film): ActRun[] {
  const order = actsInUse(sections, film);
  const runs: ActRun[] = [];
  let cur: ActRun | null = null;
  for (const s of sections) {
    const a = actSpecOf(film, s.act);
    if (!a) {
      cur = null;
      continue;
    }
    if (cur && cur.act === a) cur.sections.push(s);
    else {
      cur = { act: a, n: order.indexOf(a) + 1, sections: [s] };
      runs.push(cur);
    }
  }
  return runs;
}

export type Epigraph = { kind: "copy"; copy: Copy } | { kind: "quote"; id: QuoteId };

/** One derived act card (a letterboxed loading-reel interstitial, SPEC §8.2,
 *  §9.3). Inserted BEFORE the first section of each act run. */
export type ActCardItem = {
  kind: "act";
  /** DOM id / anchor: `act-<n>` by position (SPEC §12.3). */
  id: string;
  /** The act's id in lib/film.ts. */
  act: string;
  /** 1-based position among the acts in use. */
  n: number;
  numeral: string;
  /** Upper-bar reel mark, e.g. "II / IV". */
  reel: string;
  /** Card choreography: opening | seam | tintype | ignite | reel | title. */
  transition: TransitionKind;
  /** The last non-house world before the card (house is transparent); null
   *  for the opening card (the hero is already the first act's world). */
  from: World | null;
  /** The incoming world (its deep ground, its loader, its lettering). */
  to: World;
  /** Pinned long card (≤ 60vh, desktop fine pointer; D-5). */
  long: boolean;
  /** Act title, e.g. "The Workshop" (the h2; world lettering on cards). */
  title: string;
  titleCopy: Copy;
  /** Upper-bar Meta and header label, e.g. "ACT II • THE WORKSHOP". */
  label: string;
  /** Meta work credit, e.g. "AFTER 3 IDIOTS" (null for house). */
  credit: string | null;
  epigraph: Epigraph | null;
  /** A TIP (SPEC §8.3), shown instead of an epigraph (card III). */
  tip: Copy | null;
  /** The act's logline (a Claude draft for Aryan; gate with copyVisible). */
  logline: Copy | null;
  /** The card's choreography variant: `acts[].variant` ?? film.defaultVariant
   *  (registry host "card-<transition>", piece "choreo"; lib/variants.ts). */
  variant: VariantChoice;
  lettering: LetteringId | null;
  /** Text equivalent of the frame (sr-only; visible on the static card). */
  summary: string;
  /** Id of the section the card precedes. */
  before: string;
};

export type SectionItem = {
  kind: "section";
  entry: SectionEntry;
  world: World;
  tone: Tone;
  /** entry.variant ?? film.defaultVariant (lib/variants.ts). */
  variant: VariantChoice;
};

export type PageItem = SectionItem | ActCardItem;

function transitionFor(film: Film, from: World | null, to: World, first: boolean): TransitionKind {
  if (first) return "opening";
  if (from === to) return "title";
  const key = `${from}>${to}`;
  return film.transitions[key] ?? film.transitions["*"] ?? "reel";
}

export function workCredit(w: WorldSpec | undefined): string | null {
  return w?.work ? `AFTER ${w.work.title.toUpperCase()}` : null;
}

/** The act cards for an ordered list of ENABLED sections. */
export function actCardsOf(sections: readonly SectionEntry[], film: Film): ActCardItem[] {
  if (!film.enabled) return [];
  const runs = actRunsOf(sections, film);
  const count = actsInUse(sections, film).length;
  const cards: ActCardItem[] = [];
  runs.forEach((run, i) => {
    const firstSection = run.sections[0];
    const idx = sections.indexOf(firstSection);
    // the last non-house world before this run (house is transparent)
    let from: World | null = null;
    for (let j = idx - 1; j >= 0; j--) {
      const w = worldOfIn(sections[j], sections, film);
      if (w !== "house") {
        from = w;
        break;
      }
    }
    const to = run.act.world;
    const first = i === 0;
    const transition = transitionFor(film, first ? null : from, to, first);
    const key = `${from}>${to}`;
    const long =
      !first &&
      (transition === "seam" || transition === "ignite") &&
      film.longCards.includes(key) &&
      film.intensity === "full";
    const spec = film.worlds[to];
    const title = run.act.title.text;
    const numeral = roman(run.n);
    const a = run.act as ActSpec;
    const epigraph: Epigraph | null =
      a.epigraph === undefined
        ? null
        : typeof a.epigraph === "string"
          ? { kind: "quote", id: a.epigraph }
          : { kind: "copy", copy: a.epigraph };
    const tip = a.tip ? (film.tips[a.tip - 1] ?? null) : null;
    const credit = workCredit(spec);
    const summary = first
      ? `Opening card. A research journal in ${numberWord(count)} acts: ${actsInUse(sections, film)
          .map((x, k) => `${roman(k + 1)}, ${x.title.text}`)
          .join("; ")}.`
      : `Act ${numeral}, ${title}${spec?.work ? `, after ${spec.work.title}` : ""}.`;
    cards.push({
      kind: "act",
      id: `act-${run.n}`,
      act: run.act.id,
      n: run.n,
      numeral,
      reel: `${numeral} / ${roman(count)}`,
      transition,
      from: first ? null : from,
      to,
      long,
      title,
      titleCopy: run.act.title,
      label: `ACT ${numeral} • ${title.toUpperCase()}`,
      credit,
      epigraph,
      tip,
      logline: a.logline ?? null,
      variant: a.variant ?? film.defaultVariant,
      lettering: spec?.lettering ?? null,
      summary,
      before: firstSection.id,
    });
  });
  return cards;
}

/** Sections + cards, interleaved in render order (SPEC §12.3 `interleave`). */
export function pageItemsOf(sections: readonly SectionEntry[], film: Film): PageItem[] {
  const cards = actCardsOf(sections, film);
  const byBefore = new Map(cards.map((c) => [c.before, c] as const));
  const items: PageItem[] = [];
  for (const entry of sections) {
    const card = byBefore.get(entry.id);
    if (card) items.push(card);
    items.push({
      kind: "section",
      entry,
      world: worldOfIn(entry, sections, film),
      tone: toneOfEntry(entry),
      variant: entry.variant ?? film.defaultVariant,
    });
  }
  return items;
}

/* — Labels, groups, works ——————————————————————————————————————————— */

/** Header act label for the active section id (SPEC §9.5). */
export function headerLabelOf(
  activeId: string | null | undefined,
  sections: readonly SectionEntry[],
  film: Film,
): string {
  if (!activeId || !film.enabled) return "";
  const card = actCardsOf(sections, film).find((c) => c.id === activeId);
  if (card) return card.label;
  const s = sections.find((e) => e.id === activeId);
  if (!s || s.type === "hero") return "";
  if (s.type === "films") return "INTERMISSION";
  if (s.type === "credits") return "CREDITS";
  const act = actSpecOf(film, s.act);
  if (!act) return "";
  const n = actsInUse(sections, film).indexOf(act) + 1;
  return `ACT ${roman(n)} • ${act.title.text.toUpperCase()}`;
}

export type WorkInUse = { world: World; title: string; years: string; kind: "film" | "game" };

/** The works of the worlds of enabled acts, in act order (+ the prologue's
 *  world if it is not already in use). Feeds the prologue credit line, the
 *  opening rows, the films chapter and the credits' WORLDS BORROWED FROM. */
export function worksInUseOf(sections: readonly SectionEntry[], film: Film): WorkInUse[] {
  if (!film.enabled) return [];
  const worldsInOrder: World[] = [];
  for (const a of actsInUse(sections, film)) if (!worldsInOrder.includes(a.world)) worldsInOrder.push(a.world);
  if (film.prologue.enabled && !worldsInOrder.includes(film.prologue.world)) worldsInOrder.push(film.prologue.world);
  const out: WorkInUse[] = [];
  for (const w of worldsInOrder) {
    const spec = film.worlds[w];
    if (spec?.work) out.push({ world: w, ...spec.work });
  }
  return out;
}

/** "three films and a game", "four films", "a film and a game" … */
export function worksPhrase(works: readonly WorkInUse[]): string {
  const films = works.filter((w) => w.kind === "film").length;
  const games = works.filter((w) => w.kind === "game").length;
  const part = (n: number, one: string, many: string) =>
    n === 0 ? "" : n === 1 ? `a ${one}` : `${numberWord(n)} ${many}`;
  return [part(films, "film", "films"), part(games, "game", "games")].filter(Boolean).join(" and ");
}

/** Fills {acts} / {ACTS} / {works} / {n} tokens of a page-copy template. */
export function fillCopy(
  text: string,
  sections: readonly SectionEntry[],
  film: Film,
  extra: Record<string, string | number> = {},
): string {
  const acts = numberWord(actsInUse(sections, film).length);
  const vars: Record<string, string> = {
    acts,
    ACTS: acts.toUpperCase(),
    works: worksPhrase(worksInUseOf(sections, film)),
    ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])),
  };
  return text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}

/** Enabled, anchored sections of a world (the films chapter's "Seen here in"). */
export function seenHereInOf(world: World, sections: readonly SectionEntry[], film: Film): SectionEntry[] {
  return sections.filter((s) => s.anchor !== false && s.nav && worldOfIn(s, sections, film) === world);
}

/** Deterministic tip choice (never Math.random at SSR): hash(key) % n over
 *  the tips eligible for the page (SPEC §8.3). */
export function tipForKey(key: string, film: Film, exclude: readonly string[] = []): Copy | null {
  const eligible = film.tips.filter((t) => !exclude.includes(t.text));
  if (!eligible.length) return null;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return eligible[h % eligible.length];
}

/** Compass bearing of an act row on the opening card (SPEC §12.3). */
export function bearingOf(actIndex: number, actCount: number): number {
  return (actIndex * 360) / Math.max(1, actCount) + 22.5;
}
