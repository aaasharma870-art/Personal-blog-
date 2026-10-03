/* ============================================================================
   WORDS ENGINE — titles arriving in character (PHASE3-SPEC §8.2; W2-WORDS).
   Plays one title's arrival into a Run. The markup is
   components/words/in-character-title.tsx (root › o › i, plus the hidden
   fx layer). Every moving layer is transform / opacity; the wipes are a
   static clip-path on `o` RIDING its translate while `i` counter-moves (so
   the letters stay put and only the edge travels).

     pirates DEFAULT stamped/burned  a scorch-edged wipe left → right, a blot .5 → .25 → 0,
                                     scale 1.04 → 1                                            420 ms
             ALT     branded         letters burn in from the centre outward, blot             420 ms
     idiots  DEFAULT chalked         a ragged chalk edge sweeps word by word, ≤ 12 dust specks 600 ms
             ALT     duster-reveal   the inverse wipe (right → left) behind a board duster     600 ms
     rdr2    DEFAULT poster press    scale 1.02 → 1, a pre-blurred ink duplicate .6 → 0,
                                     the ink fading up over 240 ms                            360 ms
             ALT     typewriter      per-character steps, 28 ms/char (≤ 800 ms), key clicks
     hp      DEFAULT ink nib         a wipe along the line, a nib riding the edge, a wet-ink
                                     sheen duplicate that dries                               900 ms
             ALT     ink bleed       letters bleed in from the centre, a soft ink duplicate     900 ms
             both: a faint underdrawing of the whole title (.38) until the ink has written it,
             so a frame caught mid-write still reads every word (P3-11 r1)
   ========================================================================== */

import { sound } from "@/lib/audio";
import type { Variant } from "@/lib/variants";
import {
  EASE_CLIP,
  EASE_DRAW,
  EASE_OUT,
  cloneContent,
  fxSpan,
  openFx,
  rng,
  setStyle,
  splitChars,
  variantOf,
  type Restore,
  type Run,
} from "./shared";
import { CHALK_EDGE, DUSTER, NIB, SCORCH_BLOT, SCORCH_EDGE } from "./sprites";

export type TitleWorld = "pirates" | "idiots" | "rdr2" | "hp";

/** Spec §8.2 durations (the arrival itself). */
export const TITLE_MS: Readonly<Record<TitleWorld, number>> = { pirates: 420, idiots: 600, rdr2: 360, hp: 900 };
/** How long each arrival VISIBLY moves, its decoration included (the
 *  scorch blot fades over 1 s, the chalk dust falls ≈ 0.7 s after the
 *  wipe, the wet-ink sheen dries 0.4 s after the nib): the spotlight hold,
 *  ≤ 1.2 s, ended early when the run finishes (P3-11 r1 J1 #9: the grant
 *  covers what the eye sees, no more). */
const TITLE_VISIBLE_MS: Readonly<Record<TitleWorld, number>> = { pirates: 1000, idiots: 1200, rdr2: 420, hp: 1200 };

/** The title's world: its own `data-words-world`, else the closest plane. */
export function titleWorldOf(root: HTMLElement): TitleWorld | null {
  const w = root.dataset.wordsWorld ?? root.closest<HTMLElement>("[data-world]")?.dataset.world;
  return w === "pirates" || w === "idiots" || w === "rdr2" || w === "hp" ? w : null;
}

type Parts = { root: HTMLElement; o: HTMLElement; i: HTMLElement; fx: HTMLElement | null };

export function titleParts(root: HTMLElement): Parts | null {
  const o = root.querySelector<HTMLElement>(":scope > [data-words-o]");
  const i = o?.querySelector<HTMLElement>(":scope > [data-words-i]");
  if (!o || !i) return null;
  return { root, o, i, fx: root.querySelector<HTMLElement>(":scope > [data-words-fx]") };
}

/** The armed (pre-arrival) state: the text at opacity 0 (it stays in the
 *  accessibility tree; only an OFFSCREEN title is ever armed). */
export function armTitle(root: HTMLElement): Restore | null {
  const p = titleParts(root);
  return p ? setStyle(p.o, { opacity: "0" }) : null;
}

const charCount = (el: HTMLElement): number => (el.textContent ?? "").replace(/\s/g, "").length;
/** Typewriter: ms per character (28, compressed so the line is ≤ 800 ms). */
const typeStep = (n: number): number => Math.min(28, 800 / Math.max(1, n));

/** How long the title holds the spotlight (ms): its visible motion. */
export function titleHold(root: HTMLElement): number {
  const world = titleWorldOf(root);
  const p = titleParts(root);
  if (!world || !p) return 0;
  if (world === "rdr2" && variantOf(root, "words.title-rdr2") === "alt") {
    const n = charCount(p.i);
    return Math.round(Math.min(800, n * typeStep(n))) + 40;
  }
  return TITLE_VISIBLE_MS[world];
}

/* — geometry ———————————————————————————————————————————————————————— */

/** `o`'s box in the root (x, y, w, h), the text's horizontal extent inside
 *  `o` (L … R: balanced or short lines stop before the box edge), the font
 *  size and the text's centre (root coordinates). */
type Box = { x: number; y: number; w: number; h: number; L: number; R: number; em: number; cx: number; cy: number };

/** Gives the wrappers block boxes for the run (layout-identical: `o` is
 *  fit-content, aligned like the text) and measures `o` inside the root. */
function layout(run: Run, p: Parts): Box {
  const cs = getComputedStyle(p.root);
  const align = cs.textAlign;
  const display = cs.display;
  const position = cs.position;
  const em = parseFloat(cs.fontSize) || 16;
  const center = align === "center" || align === "-webkit-center";
  const end = align === "right" || align === "end" || align === "-webkit-right";
  run.style(p.root, {
    display: display === "inline" ? "block" : null,
    position: position === "static" ? "relative" : null,
    isolation: "isolate",
  });
  run.style(p.o, { display: "block", width: "fit-content", marginLeft: center || end ? "auto" : null, marginRight: center ? "auto" : null });
  run.style(p.i, { display: "block" });
  const rr = p.root.getBoundingClientRect();
  const or = p.o.getBoundingClientRect();
  const x = or.left - rr.left;
  const y = or.top - rr.top;
  const range = document.createRange();
  range.selectNodeContents(p.i);
  let L = Infinity;
  let R = -Infinity;
  for (const r of Array.from(range.getClientRects())) {
    if (r.width <= 0) continue;
    L = Math.min(L, r.left - or.left);
    R = Math.max(R, r.right - or.left);
  }
  if (!(R > L)) {
    L = 0;
    R = or.width;
  }
  return { x, y, w: or.width, h: or.height, L, R, em, cx: x + (L + R) / 2, cy: y + or.height / 2 };
}

/* — the wipe: a clip riding `o`'s translate, `i` counter-moving ———————— */

type Track = readonly { offset: number; f: number; easing?: string }[];

const smooth = (easing: string): Track => [
  { offset: 0, f: 0, easing },
  { offset: 1, f: 1 },
];

function framesOf(track: Track, at: (f: number) => string): Keyframe[] {
  return track.map((k) => ({ offset: k.offset, transform: at(k.f), ...(k.easing ? { easing: k.easing } : {}) }));
}

/** The track's time (0…1) at which the front reaches `f` (linear within a
 *  segment; enough for dust timing). */
function timeAt(track: Track, f: number): number {
  for (let k = 1; k < track.length; k++) {
    const a = track[k - 1];
    const b = track[k];
    if (f <= b.f) return b.f === a.f ? a.offset : a.offset + ((f - a.f) / (b.f - a.f)) * (b.offset - a.offset);
  }
  return 1;
}

/** The wipe's travel: the text's extent plus the overhang pad. */
const travelOf = (b: Box): number => b.R - b.L + 0.15 * b.em;

/** The static clip on `o` (o-local edges at the text's ends ± the pad). */
function clipOf(b: Box, dir: "ltr" | "rtl"): string {
  const pad = 0.15 * b.em;
  const v = 0.45 * b.em;
  return dir === "ltr"
    ? `inset(-${v}px ${(b.w - b.R - pad).toFixed(2)}px -${v}px -${v}px)`
    : `inset(-${v}px -${v}px -${v}px ${(b.L - pad).toFixed(2)}px)`;
}

/** Reveals the title along `dir`; returns the travel T (px). */
function wipe(run: Run, p: Parts, b: Box, dir: "ltr" | "rtl", ms: number, track: Track): number {
  const T = travelOf(b);
  const s = dir === "ltr" ? -1 : 1;
  run.style(p.o, { clipPath: clipOf(b, dir), willChange: "transform" });
  run.style(p.i, { willChange: "transform" });
  const o = { duration: ms, easing: "linear", fill: "both" as const };
  run.animate(p.o, framesOf(track, (f) => `translateX(${(s * T * (1 - f)).toFixed(2)}px)`), o);
  run.animate(p.i, framesOf(track, (f) => `translateX(${(-s * T * (1 - f)).toFixed(2)}px)`), o);
  return T;
}

/** A sprite riding the wipe's front (`anchor` = the share of its width
 *  behind the front). */
function rider(
  run: Run,
  fx: HTMLElement,
  b: Box,
  T: number,
  dir: "ltr" | "rtl",
  ms: number,
  track: Track,
  s: { w: number; h: number; top: number; bg: string; anchor: number; fade?: number },
): HTMLSpanElement {
  const front0 = dir === "ltr" ? b.x + b.L : b.x + b.R;
  const left = dir === "ltr" ? front0 - s.w * s.anchor : front0 - s.w * (1 - s.anchor);
  const el = fxSpan(fx, {
    left: `${left}px`,
    top: `${s.top}px`,
    width: `${s.w}px`,
    height: `${s.h}px`,
    backgroundImage: s.bg,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    willChange: "transform, opacity",
  });
  const sign = dir === "ltr" ? 1 : -1;
  run.animate(el, framesOf(track, (f) => `translateX(${(sign * T * f).toFixed(2)}px)`), { duration: ms, easing: "linear", fill: "both" });
  run.animate(el, [{ opacity: 1 }, { opacity: 1, offset: s.fade ?? 0.82 }, { opacity: 0 }], { duration: ms, fill: "both" });
  return el;
}

/** Chalk dust falling from the baseline as the front passes. */
function dust(run: Run, fx: HTMLElement, b: Box, count: number, ms: number, when: (x: number) => number, seed: () => number): void {
  for (let k = 0; k < count; k++) {
    const x = b.x + b.L + ((b.R - b.L) * (k + 0.2 + seed() * 0.6)) / count;
    const size = 1.6 + seed() * 1.6;
    const d = fxSpan(fx, {
      left: `${x.toFixed(1)}px`,
      top: `${(b.y + b.h - 0.22 * b.em).toFixed(1)}px`,
      width: `${size.toFixed(1)}px`,
      height: `${size.toFixed(1)}px`,
      borderRadius: "50%",
      background: "#f2efe6",
      opacity: "0",
      willChange: "transform, opacity",
    });
    const fall = 0.35 * b.em + seed() * 0.45 * b.em;
    run.animate(
      d,
      [
        { opacity: 0, transform: "translate(0px, 0px)" },
        { opacity: 0.85, transform: "translate(0px, 1px)", offset: 0.08 },
        { opacity: 0, transform: `translate(${((seed() - 0.5) * 8).toFixed(1)}px, ${fall.toFixed(1)}px)` },
      ],
      { duration: 520 + seed() * 260, delay: Math.max(0, when(x) * ms), easing: "cubic-bezier(0.4, 0, 0.9, 0.6)", fill: "both" },
    );
  }
}

/** A visual copy of the text laid exactly over `o` (inside the fx layer). */
function overlay(fx: HTMLElement, p: Parts, b: Box, style: Record<string, string>): HTMLSpanElement {
  const wrap = fxSpan(fx, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, transformOrigin: "50% 50%", ...style });
  const copy = cloneContent(p.i);
  copy.removeAttribute("style");
  copy.style.display = "block";
  wrap.appendChild(copy);
  return wrap;
}

/** Letters arriving from the centre outward (per-character opacity). */
function radial(run: Run, p: Parts, b: Box, o: { charMs: number; spread: number }): void {
  const split = splitChars(p.i);
  run.restore(split.restore);
  const rr = p.root.getBoundingClientRect();
  const d = split.chars.map((c) => {
    const r = c.getBoundingClientRect();
    const dx = r.left + r.width / 2 - rr.left - b.cx;
    const dy = (r.top + r.height / 2 - rr.top - b.cy) * 1.6;
    return Math.hypot(dx, dy);
  });
  const max = Math.max(1, ...d);
  split.chars.forEach((c, k) =>
    run.animate(c, [{ opacity: 0 }, { opacity: 1 }], { duration: o.charMs, delay: (d[k] / max) * o.spread, easing: EASE_OUT, fill: "both" }),
  );
}

/** Each word's right edge as a front fraction (sorted, merged, ending at 1). */
function wordStops(p: Parts, b: Box, T: number): number[] {
  const left = p.o.getBoundingClientRect().left;
  const range = document.createRange();
  const xs: number[] = [];
  const walker = document.createTreeWalker(p.i, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = (n as Text).data;
    const re = /\S+/g;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      range.setStart(n, m.index);
      range.setEnd(n, m.index + m[0].length);
      for (const r of Array.from(range.getClientRects())) xs.push(r.right - left);
    }
  }
  const stops: number[] = [];
  for (const x of xs.sort((a, b) => a - b)) {
    const f = Math.min(1, (x + 2 - b.L) / T);
    if (!stops.length || f - stops[stops.length - 1] > 0.03) stops.push(f);
  }
  if (!stops.length || stops[stops.length - 1] < 1) stops.push(1);
  return stops;
}

/** "≈ stroke-by-stroke": the front moves across each word, then rests. */
function strokeTrack(stops: number[]): Track {
  const PAUSE = 0.05;
  const moves = stops.map((f, k) => Math.max(0.02, f - (k ? stops[k - 1] : 0)));
  const total = moves.reduce((a, m) => a + m, 0) + PAUSE * (stops.length - 1);
  const out: { offset: number; f: number; easing?: string }[] = [{ offset: 0, f: 0, easing: "cubic-bezier(0.3, 0.5, 0.4, 1)" }];
  let t = 0;
  stops.forEach((f, k) => {
    t += moves[k] / total;
    const last = k === stops.length - 1;
    out.push({ offset: Math.min(1, t), f, ...(last ? {} : { easing: "linear" }) });
    if (!last) {
      t += PAUSE / total;
      out.push({ offset: Math.min(1, t), f, easing: "cubic-bezier(0.3, 0.5, 0.4, 1)" });
    }
  });
  out[out.length - 1].offset = 1;
  return out;
}

function seedOf(s: string): number {
  let h = 2166136261;
  for (let k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 16777619);
  return h >>> 0;
}

/* — the four worlds ————————————————————————————————————————————————— */

function pirates(run: Run, p: Parts, b: Box, v: Variant): void {
  const fx = openFx(run, p.fx);
  if (fx) {
    const tw = b.R - b.L;
    const blot = fxSpan(fx, {
      left: `${b.x + b.L - 0.12 * tw}px`,
      top: `${b.y - 0.3 * b.h}px`,
      width: `${1.24 * tw}px`,
      height: `${1.6 * b.h}px`,
      backgroundImage: SCORCH_BLOT,
      backgroundSize: "100% 100%",
      zIndex: "-1",
      opacity: "0",
      willChange: "transform, opacity",
    });
    run.animate(
      blot,
      v === "alt"
        ? [{ opacity: 0.45, transform: "scale(0.9)" }, { opacity: 0.2, transform: "scale(1)", offset: 0.45 }, { opacity: 0, transform: "scale(1.02)" }]
        : [{ opacity: 0.5, transform: "scale(0.96)" }, { opacity: 0.25, transform: "scale(1)", offset: 0.42 }, { opacity: 0, transform: "scale(1)" }],
      { duration: 1000, easing: "linear", fill: "both" },
    );
  }
  if (v === "alt") {
    run.style(p.root, { transformOrigin: `${b.cx}px ${b.cy}px` });
    run.animate(p.root, [{ transform: "scale(1.03)" }, { transform: "none" }], { duration: TITLE_MS.pirates, easing: EASE_OUT, fill: "both" });
    radial(run, p, b, { charMs: 170, spread: 250 });
    return;
  }
  run.style(p.root, { transformOrigin: `${b.x + b.L}px ${b.y + b.h * 0.6}px` });
  run.animate(p.root, [{ transform: "scale(1.04)" }, { transform: "none" }], { duration: TITLE_MS.pirates, easing: EASE_OUT, fill: "both" });
  const track = smooth(EASE_CLIP);
  const T = wipe(run, p, b, "ltr", TITLE_MS.pirates, track);
  if (fx) rider(run, fx, b, T, "ltr", TITLE_MS.pirates, track, { w: 0.55 * b.em, h: b.h + 0.5 * b.em, top: b.y - 0.25 * b.em, bg: SCORCH_EDGE, anchor: 0.72 });
}

function idiots(run: Run, p: Parts, b: Box, v: Variant, seed: () => number): void {
  const ms = TITLE_MS.idiots;
  // the word stops are read before anything else is written (one layout)
  const stops = v === "alt" ? null : wordStops(p, b, travelOf(b));
  const fx = openFx(run, p.fx);
  if (!stops) {
    const track = smooth(EASE_OUT);
    const T = wipe(run, p, b, "rtl", ms, track);
    if (fx) {
      const h = Math.min(b.h, 1.05 * b.em);
      rider(run, fx, b, T, "rtl", ms, track, { w: h * (40 / 24), h, top: b.y + (b.h - h) / 2, bg: DUSTER, anchor: 0.35, fade: 0.86 });
      dust(run, fx, b, 8, ms, (x) => timeAt(track, (b.x + b.R - x) / T), seed);
    }
    return;
  }
  const track = strokeTrack(stops);
  const T = wipe(run, p, b, "ltr", ms, track);
  if (fx) {
    rider(run, fx, b, T, "ltr", ms, track, { w: 0.5 * b.em, h: b.h + 0.4 * b.em, top: b.y - 0.2 * b.em, bg: CHALK_EDGE, anchor: 0.75 });
    dust(run, fx, b, Math.min(12, Math.max(4, Math.round((b.R - b.L) / 48))), ms, (x) => timeAt(track, (x - b.x - b.L) / T), seed);
  }
}

function rdr2(run: Run, p: Parts, b: Box, v: Variant, seed: () => number): void {
  if (v === "alt") {
    const split = splitChars(p.i);
    run.restore(split.restore);
    const step = typeStep(split.chars.length);
    split.chars.forEach((c, k) => {
      run.animate(c, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: k * step, fill: "both" });
      // a carriage click per key (the sound facade is a no-op while muted)
      if (step >= 20 || k % 2 === 0) run.later(() => sound.cue("typewriter-click", { rate: 0.92 + seed() * 0.16 }), k * step);
    });
    return;
  }
  const ms = TITLE_MS.rdr2;
  run.style(p.root, { transformOrigin: `${b.cx}px ${b.cy}px` });
  run.animate(p.root, [{ transform: "scale(1.02)" }, { transform: "none" }], { duration: ms, easing: EASE_OUT, fill: "both" });
  // P3-11 r1 integration (J8 #7, F2: B33 "pops in" at the 3 Idiots → RDR2
  // hand-off): the ink comes up over 240 ms under the press, not in 90
  run.animate(p.o, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: EASE_OUT, fill: "both" });
  const fx = openFx(run, p.fx);
  if (fx) {
    const blur = overlay(fx, p, b, {
      color: "transparent",
      textShadow: `0 0 ${(0.05 * b.em).toFixed(1)}px var(--fg), 0 0 ${(0.16 * b.em).toFixed(1)}px var(--fg)`,
      willChange: "transform, opacity",
    });
    run.animate(blur, [{ opacity: 0.6, transform: "scale(1.015)" }, { opacity: 0, transform: "none" }], { duration: ms, easing: EASE_OUT, fill: "both" });
  }
}

function hp(run: Run, p: Parts, b: Box, v: Variant): void {
  const ms = TITLE_MS.hp;
  const fx = openFx(run, p.fx);
  // the UNDERDRAWING (P3-11 r1, strangers D38: "PHILOSOPH…" caught mid-write):
  // the whole title stays readable while the nib writes — a faint copy of
  // the words lies under the ink and fades as the line is finished (over
  // the revealed letters it is the same ink, so only the unwritten part
  // shows it)
  if (fx) {
    const guide = overlay(fx, p, b, { opacity: "0", willChange: "opacity" });
    run.animate(guide, [{ opacity: 0.38 }, { opacity: 0.38, offset: 0.78 }, { opacity: 0 }], { duration: ms, easing: "linear", fill: "both" });
  }
  if (v === "alt") {
    run.style(p.root, { transformOrigin: `${b.cx}px ${b.cy}px` });
    radial(run, p, b, { charMs: 300, spread: 520 });
    if (fx) {
      const bleed = overlay(fx, p, b, {
        color: "transparent",
        textShadow: `0 0 ${(0.08 * b.em).toFixed(1)}px var(--fg), 0 0 ${(0.24 * b.em).toFixed(1)}px var(--fg)`,
        willChange: "transform, opacity",
      });
      run.animate(bleed, [{ opacity: 0.5, transform: "scale(1.04)" }, { opacity: 0, transform: "none" }], { duration: ms, easing: EASE_OUT, fill: "both" });
    }
    return;
  }
  const track = smooth(EASE_DRAW);
  const T = wipe(run, p, b, "ltr", ms, track);
  if (!fx) return;
  // the wet-ink sheen: a gold copy revealed by the same edge, then drying
  const sheen = overlay(fx, p, b, { color: "var(--w-ink-contour)", willChange: "opacity" });
  const copy = sheen.firstElementChild as HTMLElement | null;
  if (copy) {
    const so = document.createElement("span");
    so.style.display = "block";
    so.style.clipPath = clipOf(b, "ltr");
    so.style.willChange = "transform";
    copy.style.willChange = "transform";
    sheen.insertBefore(so, copy);
    so.appendChild(copy);
    const o = { duration: ms, easing: "linear", fill: "both" as const };
    run.animate(so, framesOf(track, (f) => `translateX(${(-T * (1 - f)).toFixed(2)}px)`), o);
    run.animate(copy, framesOf(track, (f) => `translateX(${(T * (1 - f)).toFixed(2)}px)`), o);
  }
  run.animate(sheen, [{ opacity: 0.7 }, { opacity: 0.55, offset: 0.7 }, { opacity: 0 }], { duration: ms + 400, easing: "linear", fill: "both" });
  // the nib, its tip on the last line's baseline, riding the edge
  const nh = 1.05 * b.em;
  const nw = 0.42 * b.em;
  const nib = fxSpan(fx, {
    left: `${b.x + b.L - nw / 2}px`,
    top: `${b.y + b.h - 0.2 * b.em - nh}px`,
    width: `${nw}px`,
    height: `${nh}px`,
    willChange: "transform, opacity",
  });
  fxSpan(nib, { inset: "0", backgroundImage: NIB, backgroundSize: "100% 100%", transform: "rotate(32deg)", transformOrigin: "50% 100%" });
  run.animate(nib, framesOf(track, (f) => `translateX(${(T * f).toFixed(2)}px)`), { duration: ms, easing: "linear", fill: "both" });
  run.animate(nib, [{ opacity: 0 }, { opacity: 1, offset: 0.06 }, { opacity: 1, offset: 0.88 }, { opacity: 0 }], { duration: ms, fill: "both" });
}

/** Plays `root`'s arrival into `run` (ends itself). Returns its duration
 *  (ms), or null when the root is not a playable title. */
export function playTitle(root: HTMLElement, run: Run, variant?: Variant): number | null {
  const world = titleWorldOf(root);
  const p = titleParts(root);
  if (!world || !p) return null;
  const v = variant ?? variantOf(root, `words.title-${world}`);
  const seed = rng(seedOf(root.textContent ?? world));
  const b = layout(run, p);
  if (b.R - b.L < 1 || b.h < 1) {
    run.end();
    return null;
  }
  if (world === "pirates") pirates(run, p, b, v);
  else if (world === "idiots") idiots(run, p, b, v, seed);
  else if (world === "rdr2") rdr2(run, p, b, v, seed);
  else hp(run, p, b, v);
  const ms = world === "rdr2" && v === "alt" ? 820 : TITLE_MS[world];
  run.endWhenDone(ms + 1600);
  return ms;
}
