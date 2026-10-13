/* ============================================================================
   WORDS ENGINE — scroll-scrubbed sentences (PHASE3-SPEC §8.3; W2-WORDS;
   P3-11 r1 F1). Markup: components/words/scrub-sentence.tsx (one span per
   word, `[data-w]`).

   Per-word opacity .28 → 1 while the sentence travels from 92% to 52% of
   the viewport (its top at 92% → its bottom at 52%): complete before the
   reading line (45–50%).
   - Compositor path: each word's WAAPI animation runs on ONE document
     ScrollTimeline; its keyframe offsets are the word's own window as a
     share of the page's scroll range (re-measured on resize / layout change
     only; no layout reads while scrolling). Lenis scrolls the window, so the
     timeline follows it.
   - Fallback (no ScrollTimeline): the same animations, paused, their
     currentTime set from scrollY in one rAF per scroll frame.
   - A sentence that is IN VIEW when it binds waits until it has left the
     viewport before it dims (never dims text in front of the reader); one
     that left upward (already read) never dims.
   - NEVER UNREADABLE WHEN THE READER STOPS (r1 J9 / strangers): once the
     page has been still for 400 ms, every sentence with a word in view
     completes (its dim words fade up within 0.4 s) and stays lit. A
     sentence also completes, and stays lit, once its window has been
     scrolled past: it never re-dims.
   - The sentence is its beat's SCROLL star (lib/spotlight.ts), owning over
     exactly its scrub window ("top 92%, bottom 52%") and GATED, so it
     yields to time stars: while one plays (a title, the chalk circle, an
     invite) the words hold still; when it ends they fade up and the
     sentence frees the spotlight. It frees it too when it completes (r1
     J1 #3: no ownership after the performance).
     DEFAULT word-opacity: words in reading order, ≈ 3 words fading at once.
     ALT     line-sweep: line after line, each swept left → right.
   ========================================================================== */

import type { BeatWeight } from "@/lib/beats";
import { spotlight } from "@/lib/spotlight";
import { EASE_OUT, variantOf } from "./shared";

const DIM = 0.28;
const FROM = 0.92;
const TO = 0.52;
/** The spotlight window: exactly the scrub range above. */
const OWN = `top ${FROM * 100}%, bottom ${TO * 100}%`;
/** The reader stopped: a sentence in view completes. */
const IDLE_MS = 400;
/** The finishing fade: ≤ 400 ms in all (the spotlight's hand-back grace is 500). */
const FADE_MS = 240;
const FADE_STEP = 16;
const FADE_STEPS = 10;

type ScrollTimelineCtor = new (o: { source?: Element | null; axis?: "block" | "inline" | "x" | "y" }) => AnimationTimeline;

let timeline: AnimationTimeline | null | undefined;

function docTimeline(): AnimationTimeline | null {
  if (timeline !== undefined) return timeline;
  const STL = (globalThis as unknown as { ScrollTimeline?: ScrollTimelineCtor }).ScrollTimeline;
  try {
    timeline = STL ? new STL({ source: document.scrollingElement ?? document.documentElement, axis: "block" }) : null;
  } catch {
    timeline = null;
  }
  return timeline;
}

const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/* — the shared re-measure / scroll / idle bus ——————————————————————————— */

const live = new Set<Scrub>();
let busOff: (() => void) | null = null;
let measureRaf = 0;
let syncRaf = 0;
let idleTimer = 0;

function remeasure(): void {
  measureRaf = 0;
  const all = [...live];
  for (const s of all) s.measure(); // every read first …
  for (const s of all) s.apply(); // … then every write
  // a layout change (a disclosure, late content) may bring a dim sentence
  // into view without a scroll: the stillness check runs after it too
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(onIdle, IDLE_MS);
}

function scheduleMeasure(): void {
  if (!measureRaf) measureRaf = requestAnimationFrame(remeasure);
}

function onIdle(): void {
  idleTimer = 0;
  const y = window.scrollY;
  const V = window.innerHeight;
  for (const s of [...live]) s.idle(y, V);
}

function onScroll(): void {
  window.clearTimeout(idleTimer);
  idleTimer = window.setTimeout(onIdle, IDLE_MS);
  if (syncRaf) return;
  syncRaf = requestAnimationFrame(() => {
    syncRaf = 0;
    const y = window.scrollY;
    for (const s of [...live]) s.sync(y);
  });
}

function ensureBus(): void {
  if (busOff) return;
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleMeasure) : null;
  ro?.observe(document.body);
  window.addEventListener("resize", scheduleMeasure, { passive: true });
  const fonts = document.fonts;
  fonts?.addEventListener?.("loadingdone", scheduleMeasure);
  window.addEventListener("scroll", onScroll, { passive: true });
  busOff = () => {
    ro?.disconnect();
    window.removeEventListener("resize", scheduleMeasure);
    fonts?.removeEventListener?.("loadingdone", scheduleMeasure);
    window.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(measureRaf);
    cancelAnimationFrame(syncRaf);
    window.clearTimeout(idleTimer);
    measureRaf = 0;
    syncRaf = 0;
    idleTimer = 0;
    busOff = null;
  };
}

function dropFromBus(s: Scrub): void {
  live.delete(s);
  if (!live.size) busOff?.();
}

/* — one sentence ———————————————————————————————————————————————————— */

export class Scrub {
  private words: HTMLElement[];
  private anims: Animation[] = [];
  /** Each word's [start, end] scroll positions (px). */
  private ranges: [number, number][] = [];
  private max = 1;
  /** The sentence's page box and its scrub window (px). */
  private top = 0;
  private bottom = 0;
  private s1 = Infinity;
  private io: IntersectionObserver | null = null;
  private offStar: (() => void) | null = null;
  private timer = 0;
  private held = false;
  private done = false;
  private dead = false;

  constructor(
    readonly el: HTMLElement,
    private readonly id: string,
    private readonly weight: BeatWeight,
  ) {
    this.words = Array.from(el.querySelectorAll<HTMLElement>(":scope > [data-w]"));
  }

  /** Binds now, or (in view) once the sentence has left the viewport. */
  start(inView: boolean): void {
    if (!this.words.length) return;
    if (!inView) return this.attach();
    this.io = new IntersectionObserver(([e]) => {
      if (e && !e.isIntersecting) {
        this.io?.disconnect();
        this.io = null;
        this.attach();
      }
    });
    this.io.observe(this.el);
  }

  private attach(): void {
    if (this.dead) return;
    live.add(this);
    ensureBus();
    this.measure();
    // already read (it left the viewport upward): it never dims
    if (window.scrollY >= this.s1) return this.complete(false);
    this.apply();
    this.offStar = spotlight.registerScrollStar(this.id, this.el, this.weight, { own: OWN, onOwn: (owned) => this.gate(owned) });
  }

  /** Reads: each word's window in scroll px (no writes). */
  measure(): void {
    const se = document.scrollingElement ?? document.documentElement;
    const y = window.scrollY;
    const V = window.innerHeight;
    this.max = Math.max(1, se.scrollHeight - se.clientHeight);
    const rs = this.words.map((w) => w.getBoundingClientRect());
    const top = Math.min(...rs.map((r) => r.top)) + y;
    const bottom = Math.max(...rs.map((r) => r.bottom)) + y;
    const s0 = top - FROM * V;
    const s1 = Math.max(s0 + 1, bottom - TO * V);
    this.top = top;
    this.bottom = bottom;
    this.s1 = s1;
    const span = s1 - s0;
    const n = rs.length;
    let win: [number, number][];
    if (variantOf(this.el, "words.scrub") === "alt") {
      // line-sweep: group by line, sweep each line left → right in turn
      const lines: { idx: number[]; left: number; right: number }[] = [];
      let lastTop = -Infinity;
      rs.forEach((r, i) => {
        if (Math.abs(r.top - lastTop) > r.height * 0.5) {
          lines.push({ idx: [], left: Infinity, right: -Infinity });
          lastTop = r.top;
        }
        const line = lines[lines.length - 1];
        line.idx.push(i);
        line.left = Math.min(line.left, r.left);
        line.right = Math.max(line.right, r.right);
      });
      win = new Array(n);
      const L = lines.length;
      lines.forEach((line, k) => {
        const width = Math.max(1, line.right - line.left);
        for (const i of line.idx) {
          const f = (rs[i].left - line.left) / width;
          const a = (k + f * 0.72) / L;
          win[i] = [a, Math.min((k + 1) / L, a + 0.28 / L)];
        }
      });
    } else {
      const w = Math.min(0.5, Math.max(0.12, 3 / n));
      win = rs.map((_, i) => {
        const a = n > 1 ? (i / (n - 1)) * (1 - w) : 0;
        return [a, a + w];
      });
    }
    this.ranges = win.map(([a, b]) => [s0 + a * span, s0 + b * span]);
  }

  /** Writes: creates or updates the word animations. */
  apply(): void {
    if (this.dead || this.done) return;
    const tl = docTimeline();
    this.words.forEach((w, i) => {
      const [a, b] = this.ranges[i] ?? [0, 1];
      if (tl) {
        const A = clamp01(a / this.max);
        const B = Math.max(A, clamp01(b / this.max));
        const kf: Keyframe[] = [
          { offset: 0, opacity: DIM },
          { offset: A, opacity: DIM },
          { offset: B, opacity: 1 },
          { offset: 1, opacity: 1 },
        ];
        const cur = this.anims[i];
        if (cur && cur.effect instanceof KeyframeEffect) cur.effect.setKeyframes(kf);
        else {
          const anim = w.animate(kf, { timeline: tl, fill: "both" });
          if (this.held) anim.pause();
          this.anims[i] = anim;
        }
      } else if (!this.anims[i]) {
        const anim = w.animate([{ opacity: DIM }, { opacity: 1 }], { duration: 1000, fill: "both" });
        anim.pause();
        this.anims[i] = anim;
      }
    });
    if (!tl) this.sync(window.scrollY);
  }

  /** Every scroll frame: the fallback's progress, and completion once the
   *  window has been scrolled past. */
  sync(y: number): void {
    if (this.done || this.dead) return;
    if (y >= this.s1) return this.complete(true);
    if (docTimeline() || this.held) return;
    this.anims.forEach((anim, i) => {
      const [a, b] = this.ranges[i] ?? [0, 1];
      anim.currentTime = clamp01((y - a) / Math.max(1, b - a)) * 1000;
    });
  }

  /** The page has been still for 400 ms: a sentence in view completes. */
  idle(y: number, V: number): void {
    if (this.bottom > y && this.top < y + V) this.complete(true);
  }

  /** The spotlight's gate. `false`: a time star has the stage (or the
   *  window was left): the words hold still. `true` after that: the hold
   *  is over, so the words it kept back fade up now (no jump to the scroll
   *  position) and the sentence frees the spotlight. */
  private gate(owned: boolean): void {
    if (this.done || this.dead) return;
    if (owned) {
      if (this.held) this.complete(true);
      return;
    }
    if (this.held) return;
    this.held = true;
    for (const a of this.anims) {
      try {
        a.pause();
      } catch {
        /* an animation the engine already dropped */
      }
    }
  }

  /** Ends the scrub for this page view: every word at full opacity (dim
   *  ones fade up when `fade`), then the spotlight is freed. */
  private complete(fade: boolean): void {
    if (this.done || this.dead) return;
    this.done = true;
    // reads first (one style flush), then the writes
    const from = fade ? this.words.map((w) => parseFloat(getComputedStyle(w).opacity)) : [];
    for (const a of this.anims) a.cancel();
    this.anims = [];
    dropFromBus(this);
    let k = 0;
    this.words.forEach((w, i) => {
      const o = from[i];
      if (!(o < 0.98)) return;
      this.anims.push(
        w.animate([{ opacity: o }, { opacity: 1 }], { duration: FADE_MS, delay: Math.min(k++, FADE_STEPS) * FADE_STEP, easing: EASE_OUT }),
      );
    });
    const ms = k ? FADE_MS + Math.min(k - 1, FADE_STEPS) * FADE_STEP : 0;
    if (ms) this.timer = window.setTimeout(() => this.release(), ms);
    else this.release();
  }

  private release(): void {
    this.offStar?.();
    this.offStar = null;
  }

  /** Motion off / unbind: every word fully visible at once. */
  reset(): void {
    this.dead = true;
    window.clearTimeout(this.timer);
    this.io?.disconnect();
    this.io = null;
    for (const a of this.anims) a.cancel();
    this.anims = [];
    this.release();
    dropFromBus(this);
  }
}
