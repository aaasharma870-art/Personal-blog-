/* ============================================================================
   THE DIRECTOR'S CUT — the player (PHASE3-SPEC §11.1, P3-10 #1) — OWNER:
   W3-CINEMA. The lazy half of ./api.ts (DP-13): loaded on the first start,
   on DESKTOP_FINE with motion on, on the home page.

   It plays the page as a film from the top to the post-credits scene.
   THE SHOT LIST is the manifest read from the page itself:
     - the items and their TEMPO come from the hero button's server markup
       (`data-dc-shots`, written by directors-cut-button.tsx from lib/page.ts
       and lib/film.ts: the tempo fields never reach the browser bundle,
       scripts/build/browser-data-loader.cjs);
     - the STARS and their weights are the page's own beat markers
       (`[data-beat-star][data-beat-weight]`, lib/beats.ts beatAttrs), and
       their positions are measured on the live layout at every step (the
       real geometry, not the `estVh` estimate it was written from).
   It chains one linear glide per segment, `lenis.scrollTo(y, { duration:
   dist / speed, easing: t => t })` (a rAF glide under `?skip=smooth`), at
   the tempo speed of the item at the reading line:
       act cards 140 px/s · slow 90 · medium 110 · brisk 150
   and DWELLS on the heavier stars: 1.2 s on weight 3, 0.6 s on weight 2,
   none on weight 1 (a time star centred; a scroll star where its range
   lets go of the spotlight: a card star's end, the house lights down). A segment is at most one
   viewport, so a layout change (a font swap, a section streaming in) is
   picked up on the next step. "2×" doubles every speed and halves every
   dwell. It ends on the post-credits scene (the end of the page).

   STOP: any wheel, touch, key or pointerdown (the stop pill's own presses
   excepted), Esc, Pause / reduced motion, the fast lane (`fastlane`), a
   game starting, the ■ Stop button, or the end. The pill — "■ Stop · 2× ·
   Act n/4" — is a fixed bottom-centre box in the stage's "stop" layer
   (components/stage/stage-layers.tsx, --z-stop 30: above the bars, below
   the toasts' corner and the cut, clear of the toasts' bottom-left column).
   Built as plain DOM (no React root): it exists only while a run does.

   SOUND: the click borrowed the sound (./api.ts); `dc:start` is emitted
   once the borrow resolves, `dc:stop` on stop, and the borrowed state is
   restored 1.6 s later so the reel run-out is heard. Toys and eggs never
   auto-play: the cut only scrolls (the Snitch and the post-credits scene
   play as they always do).
   ========================================================================== */

import { emit, on } from "@/lib/events";
import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { getLenis, haltGlide, scrollToTarget, type LenisLike, type LenisScrollOptions } from "@/lib/smooth-scroll";
import { copyText } from "@/lib/sections";
import { setDirectorsCutState } from "./api";
import { DWELL, SPEED } from "./timing";

export { DWELL, SPEED };

/** A tempo code (spec §11.1; speeds in ./timing); `c` = act cards. */
type TempoCode = keyof typeof SPEED;
/** Restore the borrowed sound this long after the stop (the run-out). */
const RESTORE_MS = 1600;
/** A segment never runs longer than this share of the viewport. */
const MAX_SEGMENT_VH = 1;
/** Scroll stars (their box is the spotlight range): the cards' pin-spacer
 *  markers, the films' markers, the scrubbed sentences. */
const SCROLL_STAR = "[data-card-beat], [data-beat-scroll], [data-words=\"scrub\"]";

type Item = { id: string; tempo: TempoCode };
type Run = {
  stopped: boolean;
  rate: 1 | 2;
  done: Set<Element>;
  restore: Promise<() => void>;
  undo: (() => void)[];
  pill: HTMLElement | null;
  act: HTMLElement | null;
  returnFocus: HTMLElement | null;
  wake: (() => void) | null;
};

let run: Run | null = null;

/* — the shot list ——————————————————————————————————————————————————— */

/** The items in page order with their tempo (the hero button's data). */
function readItems(): Item[] {
  const raw = document.querySelector<HTMLElement>("[data-dc-shots]")?.dataset.dcShots ?? "";
  const items: Item[] = [];
  for (const tok of raw.split(/\s+/)) {
    const i = tok.lastIndexOf(":");
    if (i < 1) continue;
    const t = tok.slice(i + 1);
    if (t in SPEED) items.push({ id: tok.slice(0, i), tempo: t as TempoCode });
  }
  if (items.length) return items;
  // no hero button on this page: cards by their marker, everything else medium
  return [...document.querySelectorAll<HTMLElement>("section[id], footer[id], [data-act-card][id]")].map((el) => ({
    id: el.id,
    tempo: el.hasAttribute("data-act-card") ? "c" : "m",
  }));
}

const pageTop = (el: Element): number => el.getBoundingClientRect().top + window.scrollY;
const maxScroll = (): number => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
const shown = (el: Element): boolean => el.getClientRects().length > 0;

/** The speed (px/s) of the item at the reading line (the viewport centre). */
function speedAt(items: Item[], y: number): number {
  const line = y + window.innerHeight / 2;
  let tempo: TempoCode = "m";
  for (const it of items) {
    const el = document.getElementById(it.id);
    if (!el || !shown(el)) continue;
    if (pageTop(el) <= line) tempo = it.tempo;
    else break;
  }
  return SPEED[tempo];
}

/** The next stop after `y`: an item boundary (the speed changes when its
 *  top reaches the reading line), a heavy star's dwell point (centred), at
 *  most one viewport ahead, never past the end. */
function nextStop(items: Item[], done: Set<Element>, y: number): { y: number; dwell: number; star: Element | null } {
  const vh = window.innerHeight;
  const max = maxScroll();
  let best = Math.min(max, y + MAX_SEGMENT_VH * vh);
  let dwell = 0;
  let star: Element | null = null;
  const consider = (cy: number, d: number, s: Element | null) => {
    if (cy <= y + 4 || cy > best + 0.5) return;
    if (cy < best - 0.5 || (d > dwell && Math.abs(cy - best) <= 0.5)) {
      best = cy;
      dwell = d;
      star = s;
    }
  };
  for (const it of items) {
    const el = document.getElementById(it.id);
    if (el && shown(el)) consider(pageTop(el) - vh / 2, 0, null);
  }
  for (const el of document.querySelectorAll<HTMLElement>("[data-beat-star][data-beat-weight]")) {
    const d = DWELL[Number(el.dataset.beatWeight)] ?? 0;
    if (!d || done.has(el) || !shown(el)) continue;
    const r = el.getBoundingClientRect();
    // a SCROLL star's box is its spotlight range: dwell where it lets go
    // (its bottom at 20% of the viewport: a card star's end, the house
    // lights fully down); a TIME star is centred while it plays
    const at = el.matches(SCROLL_STAR) ? r.bottom - 0.2 * vh : r.top + r.height / 2 - vh / 2;
    consider(Math.min(max, Math.max(0, at + window.scrollY)), d, el);
  }
  return { y: best, dwell, star };
}

/* — the glides ——————————————————————————————————————————————————————— */

const linear = (t: number) => t;

/** One linear glide to `y` over `s` seconds (Lenis, else a rAF glide).
 *  Resolves `true` on arrival (or the safety cap), `false` when woken early
 *  (a stop, or the 2× toggle re-timing the segment from where it is). */
function glide(r: Run, y: number, s: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const end = (arrived: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(cap);
      cancelAnimationFrame(raf);
      r.wake = null;
      resolve(arrived);
    };
    const finish = () => end(true);
    r.wake = () => end(false);
    const cap = window.setTimeout(finish, s * 1000 + 800);
    let raf = 0;
    const l: LenisLike | null = getLenis();
    if (l) {
      // Lenis 1.3 takes `easing` with `duration`; LenisLike types the subset the page uses
      const opts: LenisScrollOptions & { easing: (t: number) => number } = {
        duration: s,
        easing: linear,
        force: true,
        onComplete: finish,
      };
      l.scrollTo(y, opts);
      return;
    }
    const y0 = window.scrollY;
    const t0 = performance.now();
    const step = (now: number) => {
      if (r.stopped) return end(false);
      const k = Math.min(1, (now - t0) / (s * 1000));
      window.scrollTo({ top: y0 + (y - y0) * k, behavior: "instant" });
      if (k >= 1) finish();
      else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  });
}

function wait(r: Run, ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const t = window.setTimeout(done, ms);
    function done() {
      clearTimeout(t);
      r.wake = null;
      resolve();
    }
    r.wake = done;
  });
}

/* — the pill —————————————————————————————————————————————————————————— */

/** The copy without its leading ▶ / ■ glyph (accessible names). */
const unglyph = (t: string): string => t.replace(/^[▶■]\s*/u, "");

function buildPill(r: Run): HTMLElement {
  const box = document.createElement("div");
  box.setAttribute("role", "group");
  box.setAttribute("aria-label", unglyph(copyText("dc.button").text));
  box.dataset.dcPill = "";
  box.dataset.world = "house";
  box.dataset.tone = "deep";
  box.dataset.houseType = "";
  box.className =
    "pointer-events-auto inline-flex items-center gap-1 rounded-pill bg-bg px-2 type-meta text-fg shadow-[inset_0_0_0_1px_var(--rule)]";
  // bottom-centre, clear of the egg toasts' bottom-left column (≤ 27 rem)
  box.style.cssText = "position:absolute;pointer-events:auto;bottom:1rem;left:max(50%,37rem);transform:translateX(-50%);white-space:nowrap";

  const button = (text: string) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "inline-flex min-h-11 items-center rounded-pill px-3 text-fg-muted transition-colors hover:text-fg";
    b.textContent = text;
    return b;
  };
  const dot = () => {
    const s = document.createElement("span");
    s.setAttribute("aria-hidden", "true");
    s.className = "text-fg-ghost";
    s.textContent = "·";
    return s;
  };

  const stopText = copyText("dc.stop").text;
  const stopBtn = button(stopText);
  stopBtn.setAttribute("aria-label", unglyph(stopText));
  stopBtn.dataset.dcStop = "";
  stopBtn.addEventListener("click", () => stop("stop"));

  const speedBtn = button(copyText("dc.speed").text);
  speedBtn.dataset.dcSpeed = "";
  speedBtn.setAttribute("aria-pressed", "false");
  speedBtn.addEventListener("click", () => {
    r.rate = r.rate === 2 ? 1 : 2;
    speedBtn.setAttribute("aria-pressed", String(r.rate === 2));
    // re-time the running segment (or dwell) from here at the new speed
    r.wake?.();
  });

  const act = document.createElement("span");
  act.dataset.dcAct = "";
  act.className = "px-2 text-fg-muted";
  const actDot = dot();
  act.hidden = actDot.hidden = true;
  r.act = act;

  box.append(stopBtn, dot(), speedBtn, actDot, act);
  const layer = document.querySelector('[data-stage-layers="stop"]');
  if (layer) layer.append(box);
  else {
    box.style.position = "fixed";
    box.style.zIndex = "30";
    document.body.append(box);
  }
  return box;
}

/** "Act n/4" for the card the reading line has passed (hidden before Act I). */
function updateAct(r: Run): void {
  const el = r.act;
  if (!el) return;
  const line = window.scrollY + window.innerHeight / 2;
  const cards = [...document.querySelectorAll<HTMLElement>("[data-act-card]")].filter(shown);
  let n = 0;
  cards.forEach((c, i) => {
    if (pageTop(c) <= line) n = i + 1;
  });
  const hide = n === 0;
  el.hidden = hide;
  if (el.previousElementSibling instanceof HTMLElement) el.previousElementSibling.hidden = hide;
  if (!hide) el.textContent = copyText("dc.act", { n }).text;
}

/* — the run ——————————————————————————————————————————————————————————— */

async function loop(r: Run): Promise<void> {
  // the film starts at the top (a hard cut there when the page is elsewhere).
  // Either way scrollToTarget first waits for a closing menu / palette to
  // release its scroll lock (Lenis's start() would cancel a glide begun
  // while it was stopped).
  // Still in the opening screen (the hero button): it plays from there.
  const far = window.scrollY > window.innerHeight;
  await scrollToTarget(far ? 0 : window.scrollY, far ? { cut: true } : { immediate: true });
  if (r.stopped) return;
  const items = readItems();
  while (!r.stopped) {
    updateAct(r);
    const y = window.scrollY;
    const max = maxScroll();
    if (y >= max - 2) return stop("end");
    const next = nextStop(items, r.done, y);
    const dist = next.y - y;
    let arrived = true;
    if (dist > 1) {
      const speed = speedAt(items, y) * r.rate;
      arrived = await glide(r, next.y, Math.max(0.05, dist / speed));
    }
    if (r.stopped) return;
    if (!arrived) continue; // re-timed (2×): carry on from here
    if (next.star) {
      r.done.add(next.star);
      if (next.dwell) await wait(r, next.dwell / r.rate);
    }
    // a glide that did not move (a lock, a layout jump): never spin
    if (Math.abs(window.scrollY - y) < 1 && !next.star && dist > 1) {
      await wait(r, 120);
      if (Math.abs(window.scrollY - y) < 1) return stop("stuck");
    }
  }
}

/** Start a run (./api.ts calls it from the click, with the borrowed sound). */
export function play(borrowed: Promise<() => void>): void {
  if (run) return;
  if (motionOffNow()) {
    setDirectorsCutState(false);
    void borrowed.then((restore) => restore());
    return;
  }
  const r: Run = {
    stopped: false,
    rate: 1,
    done: new Set(),
    restore: borrowed.catch(() => () => {}),
    undo: [],
    pill: null,
    act: null,
    returnFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    wake: null,
  };
  run = r;
  r.pill = buildPill(r);
  // keyboard users land on ■ Stop (a fixed pill: no scroll)
  r.pill.querySelector<HTMLElement>("[data-dc-stop]")?.focus({ preventScroll: true });

  const inPill = (e: Event) => e.target instanceof Node && Boolean(r.pill?.contains(e.target));
  const opts = { capture: true, passive: true } as const;
  const onInput = (e: Event) => {
    if (inPill(e)) return;
    stop(e.type);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") return stop("escape");
    if (inPill(e)) return;
    stop("key");
  };
  for (const ev of ["wheel", "touchstart", "pointerdown"] as const) {
    window.addEventListener(ev, onInput, opts);
    r.undo.push(() => window.removeEventListener(ev, onInput, opts));
  }
  window.addEventListener("keydown", onKey, opts);
  r.undo.push(() => window.removeEventListener("keydown", onKey, opts));
  r.undo.push(onMotionOffChange(() => motionOffNow() && stop("pause")));
  r.undo.push(on("fastlane", () => stop("fastlane")));
  r.undo.push(on("game:start", () => stop("game")));

  void r.restore.then(() => {
    if (!r.stopped) emit("dc:start");
  });
  void loop(r).catch(() => stop("error"));
}

/** End the run (idempotent). */
export function stop(reason: string): void {
  const r = run;
  if (!r || r.stopped) return;
  r.stopped = true;
  run = null;
  // halt the programmatic glide in place: the input that stopped us (a
  // wheel, a key) owns the scroll from here
  const l = getLenis();
  if (l && l.isScrolling === "smooth") haltGlide();
  r.wake?.();
  for (const u of r.undo) u();
  const focusWasIn = Boolean(r.pill?.contains(document.activeElement));
  r.pill?.remove();
  if (focusWasIn && r.returnFocus?.isConnected) r.returnFocus.focus({ preventScroll: true });
  const max = maxScroll();
  const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 100;
  emit("dc:stop", { reason, pct });
  setDirectorsCutState(false);
  void r.restore.then((restore) => window.setTimeout(restore, RESTORE_MS));
}
