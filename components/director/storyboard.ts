/* ============================================================================
   THE STORYBOARD — reads the LIVE page into the camera's keys (./plan.ts).
   Nothing about the page's length is typed here: other workers change the
   layout, so every y is measured now and re-resolved at every leg start
   (`Key.resolve`); the plan's total is solved from it.

   WHAT A KEY IS (the same for both tours; the QUICK tour keeps fewer):
     hero            the top, held
     card-in         an act card at p .03 (the hook frame), a pass
     card-land       p = the act's `landAt` (.47): the new world fully shown, held
     card-title      p ~ .80: the title letters open, the logline on the lower
                     bar, held (the engine's title sting plays as it opens; .90 crops it)
     card-out        p 1: the pin lets go, a pass
     head            a section's heading frame: the h2 AND its lede / caveat
                     in the viewport (h2 at 30 % of the viewport), held
     star            a time star of weight >= the tour's minW, centred, held
                     (its entrance plays: spotlight stars need rest)
     finale          a film's finale frame, held (a film block taller than the
                     viewport gets two: the plate and its caption, then the quote)
   EVERY held frame of a plain section is fitted (fitCaptions, starFrameY): no plate
   caption under the progress line (a caption that ends below the line's clearance
   is pulled up into the frame), and a research claim never held without its caveat.
     end             the bottom of the page, held
     edge-out/in     the two ends of a dip to dark (QUICK, far-apart scenes)
   Card scroll stars are NOT held: the card's own land / title keys replace
   them. Scrubbed sentences get a slow zone (they are position-driven:
   crossing them fast is harmless, but crossing them slowly reads).
   ========================================================================== */

import { film, type ActSpec } from "@/lib/film";
import { anchorId, copyText, copyVisible, headerLabel, pageItems } from "@/lib/sections";
import { solvePlan, normalizeKeys, tempoOf, type Key, type Plan } from "./plan";
import { TITLE_AT, TITLE_AT_DEFAULT, TOURS } from "./timing";
import type { Tour } from "./api";

/** The seven chapters, in page order: id of the item that opens each + its label. */
export type Chapter = { id: string; label: string };

/** Scroll stars (their box is the spotlight range). */
const SCROLL_STAR = "[data-card-beat], [data-beat-scroll], [data-words=\"scrub\"]";
/** A scene further than this many viewports from the last one is reached by a dip. */
const DIP_MIN_VH = 2.6;
/** How far before the next scene's first key a dip lands (viewports). */
const DIP_IN_VH = 0.8;
/** Sections whose head frame carries a claim's lede and caveat. */
const RESEARCH = new Set(["work", "trading-algos", "optuna-screener", "experiment", "kill-list", "systems"]);

/* — chapters ——————————————————————————————————————————————————————— */

type ChapterMap = { list: Chapter[]; of: Map<string, number> };
let chapterMemo: ChapterMap | null = null;

/** The chapters as chapter-select.tsx lists them (Prologue, one per act card,
 *  Intermission, Credits), labelled as the header names them. */
export function chapters(): ChapterMap {
  if (chapterMemo) return chapterMemo;
  const list: Chapter[] = [];
  const of = new Map<string, number>();
  const open = (id: string, label: string) => {
    list.push({ id, label });
    of.set(id, list.length - 1);
  };
  const prologue = copyText("chapter.prologue");
  for (const it of pageItems) {
    if (it.kind === "act") {
      open(it.id, headerLabel(it.id) || `ACT ${it.numeral}`);
      continue;
    }
    const id = anchorId(it.entry);
    if (!id) continue;
    const type = it.entry.type;
    if (type === "hero") open(id, (copyVisible(prologue) ? prologue.text : "Opening").toUpperCase());
    else if (type === "films" || type === "credits") open(id, headerLabel(id) || id.toUpperCase());
    else if (!list.length) open(id, "OPENING");
    else of.set(id, list.length - 1);
  }
  chapterMemo = { list, of };
  return chapterMemo;
}

/* — the live page ———————————————————————————————————————————————————— */

type Item = { id: string; tempo: string };

/** The items in page order with their tempo code (the hero button's data). */
function readItems(): Item[] {
  const raw = document.querySelector<HTMLElement>("[data-dc-shots]")?.dataset.dcShots ?? "";
  const items: Item[] = [];
  for (const tok of raw.split(/\s+/)) {
    const i = tok.lastIndexOf(":");
    if (i < 1) continue;
    items.push({ id: tok.slice(0, i), tempo: tok.slice(i + 1) });
  }
  if (items.length) return items;
  return [...document.querySelectorAll<HTMLElement>("section[id], footer[id], [data-act-card][id]")].map((el) => ({
    id: el.id,
    tempo: el.hasAttribute("data-act-card") ? "c" : "m",
  }));
}

const vhNow = (): number => window.innerHeight;
export const maxScroll = (): number => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
const shown = (el: Element): boolean => el.getClientRects().length > 0;
const pageTop = (el: Element): number => el.getBoundingClientRect().top + window.scrollY;
const clampY = (y: number): number => Math.min(maxScroll(), Math.max(0, y));

/** An act card's pin: its top and pinned travel (null when it does not pin). */
function cardGeom(el: HTMLElement): { top: number; travel: number } | null {
  const pin = el.querySelector<HTMLElement>(":scope > [data-act-card-pin]") ?? el;
  const r = pin.getBoundingClientRect();
  const travel = r.height - vhNow();
  return travel > 40 ? { top: r.top + window.scrollY, travel } : null;
}

/** A section's heading frame: the h2 at 30 % of the viewport, but never
 *  before the section's own top (so the lede and caveat below it are in). */
function headY(el: Element): number {
  const title = document.getElementById(`${el.id}-title`) ?? el.querySelector("h1, h2");
  const top = pageTop(el);
  const vh = vhNow();
  const base = top - 0.15 * vh;
  return title ? Math.max(pageTop(title) - 0.3 * vh, base) : base;
}

/** The header covers the top 68 px of a frame. */
const HEADER_H = 68;

/** A head frame puts the section's top 0.15 vh below the top of the frame, so the last lines of the section
 *  BEFORE it can show in the strip under the header, sliced by its edge (About's frame showed the opening
 *  program's last credit, "ACT IV • AFTER HARRY POTTER", half hidden). `y`, moved down (never more than 12 %
 *  of the viewport) until every visible line of the section before sits behind the header. */
function clearTail(el: Element, y: number): number {
  // the block before the section (sections may sit in a wrapper of their own: climb to the first one that has a sibling)
  let up: Element | null = el;
  while (up && !up.previousElementSibling && up.parentElement && up.parentElement.tagName !== "MAIN") up = up.parentElement;
  const prev = up?.previousElementSibling;
  if (!prev || !shown(prev)) return y;
  const sy = window.scrollY;
  const seen = pageTop(el);
  let lowest = 0;
  const walk = document.createTreeWalker(prev, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim()) continue;
    const p = n.parentElement;
    if (!p || p.closest("script, style, noscript")) continue;
    const cs = getComputedStyle(p);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.1) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 4 || r.height < 6) continue;
      const bottom = r.bottom + sy;
      if (bottom <= seen) lowest = Math.max(lowest, bottom);
    }
  }
  const need = lowest - (y + HEADER_H) + 2;
  return need > 0 && need <= 0.12 * vhNow() ? y + need : y;
}

/** A time star's centred frame. */
function starY(el: Element): number {
  const r = el.getBoundingClientRect();
  return r.top + window.scrollY + r.height / 2 - vhNow() / 2;
}

/* — framing: captions clear of the line, caveats in the frame ——————————— */

/** Plate captions (a card's own are pinned, so they are never measured here). */
const CAPTION = ".scene-caption, [data-card-caption]";
/** The progress line occupies the bottom 20 px (4 px off the edge, 16 px tall): a caption ends 24 px above the edge. */
const LINE_CLEAR = 24;
/** The header covers the top 68 px; a caption pulled into the frame starts below 72. */
const HEADER_CLEAR = 72;

/** `y`, moved down (never more than 14 % of the viewport) so that the lowest caption that
 *  starts in the frame ends above the progress line, as long as its top then still clears the
 *  header. The viewport can be short (1280x720, 1366x768) where plates and their captions
 *  were centred on the plate alone. */
function fitCaptions(y: number): number {
  const vh = vhNow();
  const sy = window.scrollY;
  let out = y;
  for (let pass = 0; pass < 2; pass++) {
    let need = 0;
    for (const c of document.querySelectorAll<HTMLElement>(CAPTION)) {
      if (c.closest("[data-act-card]") || !shown(c)) continue;
      const r = c.getBoundingClientRect();
      if (r.height < 4) continue;
      const top = r.top + sy;
      const bottom = r.bottom + sy;
      // in the frame at all (a caption whose first pixels touch the bottom edge belongs to the next scene)
      if (top >= out + vh - 4 || bottom <= out + HEADER_CLEAR) continue;
      const short = bottom - (out + vh - LINE_CLEAR);
      if (short > 0 && short <= 0.14 * vh && top - (out + short) >= HEADER_CLEAR) need = Math.max(need, short);
    }
    if (!need) break;
    out += need;
  }
  return out;
}

/** Research claims held in a frame carry their caveat in the same frame: star id -> the element
 *  that holds the caveat. B20 is Trading_Algos-'s FIG. 1 ("3 strategies" survive); the caveat
 *  ("of many more tested", lib/content.ts) is the first metric tile under it. */
const CAVEAT: Readonly<Record<string, string>> = { B20: "#trading-algos-metrics > :first-child" };

/** A star's frame: centred, the caveat pulled in when it is just out of frame (never more than
 *  would push the star's own top under the header); when the viewport cannot hold both, the
 *  frame is the caveat's (the claim with its caveat, never the claim alone). */
function starFrameY(el: Element, id: string): number {
  const y0 = starY(el);
  const sel = CAVEAT[id];
  const cav = sel ? document.querySelector(sel) : null;
  if (!cav || !shown(cav)) return y0;
  const vh = vhNow();
  const sy = window.scrollY;
  const c = cav.getBoundingClientRect();
  const need = c.bottom + sy - (y0 + vh - LINE_CLEAR - 8);
  if (need <= 0) return y0;
  const top = el.getBoundingClientRect().top + sy;
  if (need <= top - HEADER_CLEAR - y0) return y0 + need;
  return c.top + sy + c.height / 2 - vh / 2;
}

/** A finale block (one film: plate, caption, quote) that does not fit the viewport. */
function tallFilm(el: Element): HTMLElement | null {
  const film = el.closest<HTMLElement>("[data-films-world]");
  return film && film.getBoundingClientRect().height > vhNow() - 100 ? film : null;
}

/** The visible text lines of `root` as page-y [top, bottom] pairs, trimmed by 15 % each side (a line box is
 *  taller than its glyphs). */
function textLines(root: Element): [number, number][] {
  const sy = window.scrollY;
  const out: [number, number][] = [];
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim() || n.parentElement?.closest("script, style, noscript")) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 4 || r.height < 8) continue;
      const trim = 0.15 * r.height;
      out.push([r.top + sy + trim, r.bottom + sy - trim]);
    }
  }
  return out;
}

/** Frame 1 of a film block taller than the viewport holds its title, the plate and the caption, with the first
 *  lines of the quote and the paragraphs under them. `y`, moved (at most 14 % of the viewport either way) to
 *  where the fewest of those lines are sliced by the header's lower edge or lie under the progress line, the
 *  title and the caption counting triple: the block's own bottom is frame 2's. */
function frameFilm(y: number, film: HTMLElement): number {
  const vh = vhNow();
  const lines = textLines(film);
  const title = film.querySelector("h3");
  const tr = title?.getBoundingClientRect();
  const titleTop = tr ? tr.top + window.scrollY : null;
  const titleBottom = tr ? tr.bottom + window.scrollY : null;
  const zone = (v: number): number => v + vh - LINE_CLEAR;
  const cost = (v: number): number => {
    let c = 0;
    for (const [t, b] of lines) {
      const head = t < v + HEADER_H && b > v + HEADER_H;
      const under = b > zone(v) && t < v + vh;
      if (!head && !under) continue;
      c += titleTop !== null && titleBottom !== null && t >= titleTop - 2 && b <= titleBottom + 2 ? 3 : 1;
    }
    for (const cap of film.querySelectorAll<HTMLElement>(CAPTION)) {
      const r = cap.getBoundingClientRect();
      if (r.height < 4) continue;
      const t = r.top + window.scrollY;
      const b = r.bottom + window.scrollY;
      if (b > zone(v) || t < v + HEADER_CLEAR) c += 3;
    }
    return c;
  };
  const reach = 0.14 * vh;
  const cand = new Set<number>([y]);
  for (const [t, b] of lines) {
    // a line just above the progress line's zone, just below the frame's edge, just behind the header, just under it
    for (const v of [b - (vh - LINE_CLEAR), t - vh, b - HEADER_H, t - HEADER_H]) if (Math.abs(v - y) <= reach) cand.add(Math.round(v));
  }
  if (titleTop !== null) cand.add(Math.round(titleTop - HEADER_H - 6));
  let best = y;
  let bestCost = cost(y);
  for (const v of cand) {
    const c = cost(v);
    if (c < bestCost || (c === bestCost && Math.abs(v - y) < Math.abs(best - y))) {
      best = v;
      bestCost = c;
    }
  }
  return best;
}

/** The wake-up a closed ledger lens needs before the kill-list's head is held (components/site/ledger-reckoning.tsx). */
const wakeLedger = (): void => {
  window.dispatchEvent(new Event("ledger:wake"));
};
const PREP: Readonly<Record<string, () => void>> = { "kill-list": wakeLedger };

function starEl(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-beat="${CSS.escape(id)}"][data-beat-star]`);
}

/* — scenes ——————————————————————————————————————————————————————————— */

/** The QUICK tour: what it keeps. rank 0 = always; rank n = added (in rank
 *  order) while the solved cruise stays comfortable. `ext`: the scene runs
 *  to the section's end ("sec") or this many viewports past its head. */
type QuickScene = { rank: number; ext: "sec" | number; shows?: readonly string[] };
const QUICK: Readonly<Record<string, QuickScene>> = {
  about: { rank: 0, ext: "sec" },
  work: { rank: 0, ext: "sec" },
  experiment: { rank: 0, ext: "sec" },
  systems: { rank: 0, ext: "sec", shows: ["B26"] },
  "kill-list": { rank: 0, ext: "sec" },
  contact: { rank: 0, ext: "sec" },
  films: { rank: 1, ext: 1.2 },
  beyond: { rank: 2, ext: 1.2 },
  journey: { rank: 3, ext: 1.2 },
  "trading-algos": { rank: 4, ext: "sec" },
  "optuna-screener": { rank: 5, ext: "sec" },
  principles: { rank: 6, ext: 1.2 },
  voices: { rank: 7, ext: 1.2 },
  writing: { rank: 8, ext: 1.2 },
};

type Scene = { id: string; keys: Key[]; endY: () => number | null; endKey: Key | null };

function mk(partial: Partial<Key> & Pick<Key, "id" | "kind" | "y" | "chapter">): Key {
  return { hold: 0, settle: 0, tempo: 1, ...partial };
}

/** The keys of one page item for `tour`. `quick` carries the QUICK scene
 *  (or null in the FULL tour). */
function sceneOf(tour: Tour, it: Item, chapter: number, last: boolean, q: QuickScene | null, vh: number): Scene | null {
  // the QUICK tour passes the last item (the credits) to its end key alone
  if (tour === "quick" && last) return null;
  const P = TOURS[tour];
  const H = P.holds;
  const el = document.getElementById(it.id);
  if (!el || !shown(el)) return null;
  const tempo = tempoOf(it.tempo);
  const keys: Key[] = [];

  if (it.id === "top" || el.hasAttribute("data-hero")) {
    keys.push(mk({ id: it.id, kind: "hero", y: 0, hold: H.hero, tempo, chapter, resolve: () => 0 }));
    return { id: it.id, keys, endY: () => 0, endKey: keys[0] };
  }

  if (el.hasAttribute("data-act-card")) {
    const g = cardGeom(el);
    if (!g) {
      const y = headY(el);
      keys.push(mk({ id: it.id, kind: "head", y, hold: H.head, tempo, chapter, resolve: () => (document.getElementById(it.id) ? headY(document.getElementById(it.id)!) : null) }));
      return { id: it.id, keys, endY: () => pageTop(el), endKey: keys[0] };
    }
    const act = pageItems.find((p) => p.kind === "act" && p.id === it.id);
    const landAt = (act && act.kind === "act" ? (film.acts as readonly ActSpec[]).find((a) => a.id === act.act)?.landAt : undefined) ?? 0.47;
    const titleAt = TITLE_AT[it.id] ?? TITLE_AT_DEFAULT;
    const at = (p: number) => () => {
      const c = document.getElementById(it.id);
      const gg = c ? cardGeom(c) : null;
      return gg ? gg.top + p * gg.travel : null;
    };
    const k = (id: string, kind: Key["kind"], p: number, extra: Partial<Key> = {}) =>
      mk({ id: `${it.id}:${id}`, kind, y: g.top + p * g.travel, tempo, chapter, resolve: at(p), ...extra });
    keys.push(
      k("in", "card-in", 0.03),
      k("land", "card-land", Math.min(0.95, landAt), { hold: H.land, settle: P.settle }),
      k("title", "card-title", titleAt, { hold: H.title }),
      k("out", "card-out", 1),
    );
    return { id: it.id, keys, endY: at(1), endKey: keys[3] };
  }

  // a plain section: its heading frame, then its stars
  const hy = headY(el);
  const research = RESEARCH.has(it.id);
  const bottom = pageTop(el) + el.getBoundingClientRect().height;
  const headKey = mk({
    id: `${it.id}:head`,
    kind: "head",
    y: fitCaptions(clearTail(el, hy)),
    hold: research ? H.headResearch : H.head,
    tempo,
    chapter,
    prep: PREP[it.id],
    resolve: () => {
      const e = document.getElementById(it.id);
      return e ? fitCaptions(clearTail(e, headY(e))) : null;
    },
  });
  keys.push(headKey);

  const starKey = (s: HTMLElement, hold: number, kind: "star" | "finale"): Key => {
    const beat = s.dataset.beat ?? "";
    return mk({
      id: `${it.id}:${s.dataset.beat ?? "star"}`,
      kind,
      y: fitCaptions(starFrameY(s, beat)),
      hold,
      tempo,
      chapter,
      resolve: () => {
        const e = s.isConnected ? s : starEl(beat);
        return e ? fitCaptions(starFrameY(e, beat)) : null;
      },
    });
  };

  /** A film block taller than the viewport: its finale is two frames, the plate with its caption
   *  (the plate-centred frame, as before) and then the bottom of the block (quote, its
   *  attribution and the paragraphs under it, which a centred frame slices mid-sentence). */
  const finaleKeys = (s: HTMLElement, hold: number): Key[] => {
    const film = tallFilm(s);
    const beat = s.dataset.beat ?? "";
    let first = starKey(s, hold, "finale");
    if (film) {
      // a tall block: frame 1 is fitted to its text (frameFilm); frame 2 shows the bottom
      const plain = first.resolve;
      first = {
        ...first,
        y: frameFilm(first.y, film),
        resolve: () => {
          const e = s.isConnected ? s : starEl(beat);
          const f = e?.closest<HTMLElement>("[data-films-world]");
          const y0 = plain?.() ?? null;
          return y0 !== null && f ? frameFilm(y0, f) : y0;
        },
      };
    }
    const lowY = (f: Element): number => f.getBoundingClientRect().bottom + window.scrollY - vhNow() + LINE_CLEAR + 16;
    // the second frame must be a real step down from the first (else the plate frame already shows it all)
    if (!film || lowY(film) - first.y < 0.12 * vhNow()) return [first];
    const second = mk({
      id: `${it.id}:${beat}:quote`,
      kind: "finale",
      y: lowY(film),
      hold: hold * 1.2,
      tempo,
      chapter,
      keep: true,
      resolve: () => {
        const e = s.isConnected ? s : starEl(beat);
        const f = e?.closest("[data-films-world]");
        return f ? lowY(f) : null;
      },
    });
    return [{ ...first, hold: hold * 0.6, keep: true }, second];
  };

  if (tour === "full") {
    for (const s of el.querySelectorAll<HTMLElement>("[data-beat-star][data-beat-weight]")) {
      if (!shown(s) || s.getBoundingClientRect().height < 4) continue;
      // a hidden egg or a toy's button is for the visitor to find: the camera never frames it
      if (s.matches("button, [data-egg], [data-toy]")) continue;
      const w = Number(s.dataset.beatWeight);
      const fin = (s.dataset.beat ?? "").endsWith("-finale");
      if (!fin && (w < P.minW || s.matches(SCROLL_STAR))) continue;
      const hold = fin ? H.finale : w >= 3 ? H.w3 : H.w2;
      const y = starY(s);
      if (y < hy + 0.35 * vh || y > bottom - 0.5 * vh) continue;
      if (fin) keys.push(...finaleKeys(s, hold));
      else keys.push(starKey(s, hold, "star"));
    }
    // scrubbed sentences: a slow zone (the spotlight's range: top at 92 % -> bottom at 52 %)
    for (const s of el.querySelectorAll<HTMLElement>("[data-words=\"scrub\"]")) {
      if (!shown(s)) continue;
      const r = s.getBoundingClientRect();
      const y0 = r.top + window.scrollY - 0.92 * vh;
      const y1 = r.bottom + window.scrollY - 0.52 * vh;
      if (y0 < hy + 0.2 * vh || y1 > bottom - 0.3 * vh || y1 - y0 < 120) continue;
      const cap = Math.max(200, (y1 - y0) / 1.5);
      keys.push(mk({ id: `${it.id}:${s.dataset.beat ?? "scrub"}:in`, kind: "star", y: y0, tempo, chapter, cap, resolve: () => (s.isConnected ? s.getBoundingClientRect().top + window.scrollY - 0.92 * vhNow() : null) }));
      keys.push(mk({ id: `${it.id}:${s.dataset.beat ?? "scrub"}:out`, kind: "star", y: y1, tempo, chapter, resolve: () => (s.isConnected ? s.getBoundingClientRect().bottom + window.scrollY - 0.52 * vhNow() : null) }));
    }
  } else if (q?.shows) {
    for (const id of q.shows) {
      const s = starEl(id);
      if (s && shown(s)) keys.push(starKey(s, H.w3, "star"));
    }
  }

  let endY: () => number | null;
  if (q && q.ext !== "sec") {
    const span = q.ext;
    endY = () => {
      const e = document.getElementById(it.id);
      return e ? headY(e) + span * vhNow() : null;
    };
  } else {
    endY = () => {
      const e = document.getElementById(it.id);
      return e ? pageTop(e) + e.getBoundingClientRect().height - vhNow() : null;
    };
  }
  return { id: it.id, keys, endY, endKey: null };
}

/* — the tour ————————————————————————————————————————————————————————— */

export type Cut = {
  plan: Plan;
  /** the chapters the plan visits (display order) */
  labels: string[];
  /** display index of each of the page's chapters (-1: not in this tour) */
  display: number[];
  /** per display chapter: plan second its first element starts / that element's index */
  starts: number[];
  firstEl: number[];
  /** what was dropped (quick) or kept (for the report) */
  scenes: string[];
};

function keysFor(tour: Tour, level: number): { keys: Key[]; scenes: string[] } | null {
  const vh = vhNow();
  const P = TOURS[tour];
  const items = readItems();
  const { of } = chapters();
  const scenes: Scene[] = [];
  const cardIds = new Set(items.filter((i) => document.getElementById(i.id)?.hasAttribute("data-act-card")).map((i) => i.id));
  let prevCh = 0;
  items.forEach((it, idx) => {
    const ch = of.get(it.id) ?? prevCh;
    prevCh = ch;
    const isLast = idx === items.length - 1;
    let q: QuickScene | null = null;
    if (tour === "quick") {
      const el = document.getElementById(it.id);
      const hero = it.id === "top" || el?.hasAttribute("data-hero");
      const card = cardIds.has(it.id);
      q = QUICK[it.id] ?? null;
      if (!hero && !card && !isLast) {
        if (!q || q.rank > level) return;
      }
    }
    const s = sceneOf(tour, it, ch, isLast, q, vh);
    if (s) scenes.push(s);
  });
  if (!scenes.length) return null;

  // the end of the page is a scene of its own (so a far last scene gets its dip too)
  const lastItem = items[items.length - 1];
  const lastCh = lastItem ? (of.get(lastItem.id) ?? 0) : 0;
  const endKey = mk({ id: "end", kind: "end", y: maxScroll(), hold: P.holds.end, tempo: 0.8, chapter: lastCh, resolve: () => maxScroll() });
  scenes.push({ id: "end", keys: [endKey], endY: () => maxScroll(), endKey });

  const keys: Key[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const prev = scenes[i - 1];
    if (prev && prev.keys.length && s.keys.length) {
      const prevLast = prev.keys[prev.keys.length - 1];
      const prevEnd = Math.max(prev.endY() ?? prevLast.y, prevLast.y + 0.25 * vh);
      const first = s.keys[0];
      const nextStart = first.resolve?.() ?? first.y;
      if (P.dips && nextStart - prevEnd > DIP_MIN_VH * vh) {
        // far apart: dip to dark. The last scene's card-out (or a new edge) leaves by a dip
        let out: Key;
        if (prev.endKey && prev.endKey.kind === "card-out") out = prev.endKey;
        else {
          out = mk({ id: `${prev.id}:out`, kind: "edge-out", y: prevEnd, tempo: prevLast.tempo, chapter: prevLast.chapter, resolve: () => Math.max(prev.endY() ?? prevEnd, (prevLast.resolve?.() ?? prevLast.y) + 0.25 * vhNow()) });
          keys.push(out);
        }
        out.dip = true;
        keys.push(
          mk({
            id: `${s.id}:edge`,
            kind: "edge-in",
            y: nextStart - DIP_IN_VH * vh,
            tempo: first.tempo,
            chapter: first.chapter,
            resolve: () => {
              const y = first.resolve?.();
              return y == null ? null : y - DIP_IN_VH * vhNow();
            },
          }),
        );
      } else if (P.dips && !prev.endKey && prevEnd < nextStart - 0.3 * vh) {
        // joined by a glide: the scene's tail is a pass key at its end
        keys.push(mk({ id: `${prev.id}:tail`, kind: "star", y: prevEnd, tempo: prevLast.tempo, chapter: prevLast.chapter, resolve: () => Math.max(prev.endY() ?? prevEnd, (prevLast.resolve?.() ?? prevLast.y) + 0.25 * vhNow()) }));
      }
    }
    keys.push(...s.keys);
  }
  return { keys, scenes: scenes.map((s) => s.id) };
}

/** Plan a tour from the live page (null when there is nothing to play). */
export function planTour(tour: Tour): Cut | null {
  const P = TOURS[tour];
  const vh = vhNow();
  let best: { plan: Plan; scenes: string[] } | null = null;
  const make = (level: number) => {
    const k = keysFor(tour, level);
    if (!k) return null;
    const keys = normalizeKeys(k.keys, vh).map((key) => ({ ...key, y: clampY(key.y) }));
    return { plan: solvePlan(tour, keys, P), scenes: k.scenes };
  };
  if (tour === "quick") {
    const maxRank = Math.max(...Object.values(QUICK).map((q) => q.rank));
    best = make(0);
    for (let level = 1; best && level <= maxRank; level++) {
      const next = make(level);
      if (!next || next.plan.vBase > P.comfy || next.plan.total > P.window[1]) break;
      best = next;
    }
  } else {
    best = make(0);
  }
  if (!best) return null;
  const { plan } = best;
  const display: number[] = [];
  const labels: string[] = [];
  const starts: number[] = [];
  const firstEl: number[] = [];
  const list = chapters().list;
  list.forEach((c, i) => {
    if (plan.chapterEl[i] === undefined) {
      display[i] = -1;
      return;
    }
    display[i] = labels.length;
    labels.push(c.label);
    starts.push(plan.chapterStart[i]);
    firstEl.push(plan.chapterEl[i]);
  });
  return { plan, labels, display, starts, firstEl, scenes: best.scenes };
}
