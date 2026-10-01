/* ============================================================================
   WORDS ENGINE — shared helpers (W2-WORDS). Desktop-only: imported by the
   words binder (components/enhance/binders/words.ts) inside the lazy desktop
   enhancer chunk, and by /lab/p3/words. Never imported by a first-load file.

   Every effect here is WAAPI on transform / opacity (a clip-path is set once
   and RIDES a transform; it is never animated). Whatever an effect changes
   (inline styles, the fx layer's children, per-character spans) is recorded
   in its Run and put back when the Run ends, so the DOM after an effect is
   the server's DOM again.
   ========================================================================== */

import { DESKTOP_FINE, motionOffNow } from "@/lib/flags";
import { effectiveVariant, type Variant } from "@/lib/variants";

/** lib/motion.ts `ease` / `easeClip` / `easeDraw` as CSS strings. */
export const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_CLIP = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_DRAW = "cubic-bezier(0.65, 0, 0.35, 1)";

/** Motion may play right now: DESKTOP_FINE, no reduced motion, no Pause.
 *  The Pause attribute is read first (a matchMedia read right after a Pause
 *  click would force the whole-document restyle the click queued). */
export function liveNow(): boolean {
  if (typeof window === "undefined") return false;
  if (document.documentElement.dataset.motion === "paused") return false;
  if (motionOffNow()) return false;
  return window.matchMedia(DESKTOP_FINE).matches;
}

/** The variant a words piece plays: the server's choice
 *  (`data-words-variant`), then any `?variant=` preview. */
export function variantOf(el: HTMLElement, key: string): Variant {
  const base: Variant = el.dataset.wordsVariant === "alt" ? "alt" : "default";
  return effectiveVariant(base, key, window.location.search);
}

/* — debug (?debug=words): a log the words probe reads ———————————————— */

export type WordsLogEntry = { t: number; ev: string; id: string; why?: string };

const DEBUG = typeof window !== "undefined" && /(?:^|[?&])debug=[^&]*\bwords\b/.test(window.location.search);
const log: WordsLogEntry[] = [];

export function note(ev: string, id: string, why?: string): void {
  if (!DEBUG) return;
  const e: WordsLogEntry = { t: Math.round(performance.now()), ev, id, ...(why ? { why } : {}) };
  log.push(e);
  console.info(`[words] ${ev} ${id}${why ? ` (${why})` : ""}`);
}

/** Exposes `window.__words` under ?debug=words. */
export function exposeDebug(extra: Record<string, unknown>): void {
  if (!DEBUG) return;
  (window as unknown as { __words?: unknown }).__words = { log, ...extra };
}

/* — inline styles that put themselves back ——————————————————————————— */

export type Restore = () => void;

/** Sets inline styles (camelCase keys; null/undefined skips) and returns the
 *  undo. A style attribute that ends up empty is removed (the server DOM had
 *  none on the elements the engine touches). */
export function setStyle(el: HTMLElement | SVGElement, props: Record<string, string | null | undefined>): Restore {
  const prev: [string, string, string][] = [];
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    const css = k.startsWith("--") ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    prev.push([css, el.style.getPropertyValue(css), el.style.getPropertyPriority(css)]);
    el.style.setProperty(css, v);
  }
  return () => {
    for (const [css, v, p] of prev.reverse()) {
      if (v) el.style.setProperty(css, v, p);
      else el.style.removeProperty(css);
    }
    if (el.getAttribute("style") === "") el.removeAttribute("style");
  };
}

/* — a Run: one effect's animations, timers and undos ———————————————— */

export class Run {
  private anims: Animation[] = [];
  private timers: number[] = [];
  private undo: Restore[] = [];
  private ended = false;
  private resolve!: () => void;
  readonly finished: Promise<void> = new Promise<void>((r) => (this.resolve = r));

  get over(): boolean {
    return this.ended;
  }

  add(a: Animation): Animation {
    this.anims.push(a);
    return a;
  }

  /** Element.animate, recorded. */
  animate(el: Element, frames: Keyframe[] | PropertyIndexedKeyframes, o: KeyframeAnimationOptions): Animation {
    return this.add(el.animate(frames, o));
  }

  later(fn: () => void, ms: number): void {
    this.timers.push(window.setTimeout(fn, ms));
  }

  restore(fn: Restore): void {
    this.undo.push(fn);
  }

  style(el: HTMLElement | SVGElement, props: Record<string, string | null | undefined>): void {
    this.undo.push(setStyle(el, props));
  }

  /** Ends now: every animation cancelled (back to the underlying style),
   *  every timer cleared, every change undone, in one task (no flash: every
   *  effect ends on the rest state anyway). Idempotent. */
  end(): void {
    if (this.ended) return;
    this.ended = true;
    for (const t of this.timers) window.clearTimeout(t);
    for (const a of this.anims) a.cancel();
    for (const u of this.undo.reverse()) {
      try {
        u();
      } catch {
        /* a node the host removed meanwhile */
      }
    }
    this.anims = [];
    this.undo = [];
    this.resolve();
  }

  /** Ends once every animation added so far has finished (or after `maxMs`). */
  endWhenDone(maxMs: number): void {
    void Promise.all(this.anims.map((a) => a.finished.catch(() => undefined))).then(() => this.end());
    this.later(() => this.end(), maxMs);
  }
}

/* — DOM pieces ————————————————————————————————————————————————————— */

/** A child span for the fx layer (absolutely positioned, aria-hidden by its
 *  parent). */
export function fxSpan(parent: HTMLElement, style: Record<string, string>): HTMLSpanElement {
  const s = document.createElement("span");
  for (const [k, v] of Object.entries(style)) {
    s.style.setProperty(k.startsWith("--") ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`), v);
  }
  s.style.position = "absolute";
  s.style.display = "block";
  s.style.pointerEvents = "none";
  parent.appendChild(s);
  return s;
}

/** Shows a `hidden` element for this run WITHOUT touching the attribute
 *  (an inline `!important` display beats the `[hidden]` rule; the markup
 *  stays byte-identical). */
export function unhide(run: Run, el: HTMLElement | SVGElement, display = "block"): void {
  const prev = el.style.getPropertyValue("display");
  const prio = el.style.getPropertyPriority("display");
  el.style.setProperty("display", display, "important");
  run.restore(() => {
    if (prev) el.style.setProperty("display", prev, prio);
    else el.style.removeProperty("display");
    if (el.getAttribute("style") === "") el.removeAttribute("style");
  });
}

/** Opens the hidden fx layer for this run (emptied and hidden again after). */
export function openFx(run: Run, fx: HTMLElement | null): HTMLElement | null {
  if (!fx) return null;
  run.restore(() => fx.replaceChildren());
  run.style(fx, { position: "absolute", inset: "0", pointerEvents: "none" });
  unhide(run, fx);
  return fx;
}

/** A visual copy of `src`'s content (aria-hidden by the fx layer; ids and
 *  data-words markers stripped). */
export function cloneContent(src: HTMLElement): HTMLElement {
  const c = src.cloneNode(true) as HTMLElement;
  c.removeAttribute("data-words-i");
  c.removeAttribute("id");
  c.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  return c;
}

export type SplitChars = { chars: HTMLSpanElement[]; restore: Restore };

/** Splits every text node inside `root` into one span per character (white
 *  space stays text). `block` gives each span an inline-block box (for
 *  transforms). `restore` puts the ORIGINAL text nodes back (React keeps
 *  references to them). */
export function splitChars(root: HTMLElement, block = false): SplitChars {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text);
  const chars: HTMLSpanElement[] = [];
  const undo: Restore[] = [];
  for (const node of nodes) {
    const parent = node.parentNode;
    if (!parent || !node.data) continue;
    const made: Node[] = [];
    const frag = document.createDocumentFragment();
    for (const ch of Array.from(node.data)) {
      if (/\s/.test(ch)) {
        const t = document.createTextNode(ch);
        made.push(t);
        frag.appendChild(t);
        continue;
      }
      const s = document.createElement("span");
      s.textContent = ch;
      if (block) s.style.display = "inline-block";
      made.push(s);
      chars.push(s);
      frag.appendChild(s);
    }
    parent.replaceChild(frag, node);
    undo.push(() => {
      const first = made[0];
      if (!first || !first.parentNode) return;
      first.parentNode.insertBefore(node, first);
      for (const m of made) m.parentNode?.removeChild(m);
    });
  }
  return {
    chars,
    restore: () => {
      for (const u of undo.reverse()) u();
    },
  };
}

/** A data: URL for an SVG string (for `background-image`). */
export function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** A small deterministic PRNG (so a replay jitters the same way). */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}
