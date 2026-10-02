/* ============================================================================
   DEAD EYE · the round (PHASE3-SPEC §9.2 #3, D3-4; P3-8 #5, #9 B5 B6) —
   OWNER: W3-GAMES. Lazy (the HUD chunk imports it). Replaces the old one-shot
   egg (components/eggs/dead-eye.ts, now a bridge to this) and keeps its DOM
   CONTRACT with the ledger: inside #kill-list each killed <li> carries
   data-verdict="killed", its recorded reason data-reason and its name
   data-name (components/site/ledger-reckoning.tsx); `killedRows` reads it.

   A ROUND (opt-in only; it never runs by itself):
   - AIM: `html[data-game="deadeye"]` (the typed-egg listener stands down,
     B9; no CSS keys on it, W2 rule 33), then `scrollToTarget` centres the
     killed block under the header and the round waits for the arrival.
   - DRAW (0.4 s): time → 0.25× for every running animation (WAAPI and CSS),
     every video, `gsap.globalTimeline.timeScale` (B5) and `--time-scale` on
     the section; the GRADE fades in as an opacity overlay on the section's
     media layer (the server's `[data-deadeye-layer="grade"]`, z −1: below
     every word; the 2,122 px section's background is never transitioned,
     B6): the Dead Eye ground, the iconic-deadeye plate only at the outer
     edges, a red vignette. Survivors and flagships step to --fg-muted (AA on
     the graded ground) and are never targets; `#kill-list[data-deadeye=on]`
     also grades the lens figure (the ledger's own piece).
   - PAINT (a 5.0 s core, the draining white ring of the HUD, IC-RD-09):
     clicking a killed row (the whole row is the target) locks an ember mark
     beside it (`game:mark`: a pencil scratch); clicking a survivor or a
     flagship costs 0.5 s and says "Survived: not a target". Mark first,
     fire once.
   - FIRE (Enter on "Fire", Shift+Enter on a row, or the core running out):
     every marked row strikes (`data-deadeye-struck`: the row's own ember
     strike, 180 ms; `game:fire`: one dry ink strike, never a gunshot); time
     returns to 1× over 300 ms. No shake, no flash.
   - READ: each struck row goes to full ink, its VERBATIM reason and its
     EXISTING post-mortem link with it (the reason describes the row's
     button). The score ("5/5 marked · 2.3 s of Dead Eye left") is kept as
     the best in aryan:games:v1; 5 of 5 also earns the pen
     (`recordDeadEyeWin`, egg 9). Replayable.
   - EXIT (Esc or "Release", at any step): the ledger is restored EXACTLY
     (D-6): every attribute, layer, mark, rate and scale put back.
   KEYBOARD: roving focus over the killed rows only (↑ / ↓, Home / End,
   Enter / Space mark, Shift+Enter fire), Esc releases; no page-wide single
   keys (WCAG 2.1.4). REDUCED MOTION: untimed, no time-scale, instant marks
   and strikes. PAUSE mid-round: the core stops (and resumes with motion);
   the time-scale lifts while paused.
   VARIANTS (`kill-list.deadeye`, handed to lib/variants.ts):
     default "ember-x"  an ember X locks beside the reason; every marked row
                        strikes at once;
     alt     "tally"    an ember tally stroke locks beside the row number;
                        fire resolves the marked rows in turn, top to bottom
                        (140 ms apart), like Dead Eye's shots.
   NEVER a gun, a reticle, a crosshair cursor, a gunshot, a heartbeat, blood,
   or a mark on a survivor; text colours stay readable (AA) throughout.
   ========================================================================== */

import { getImageProps } from "next/image";
import { emit } from "@/lib/events";
import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { gsapIfLoaded } from "@/lib/gsap";
import { resolveMedia } from "@/lib/media";
import { scrollToTarget } from "@/lib/smooth-scroll";
import type { Variant } from "@/lib/variants";
import { recordDeadEyeRound, type DeadEyeBest } from "@/components/games/store";

export type Target = { row: HTMLElement; reason: HTMLElement; name: HTMLElement };

/** The killed rows of the ledger (data contract first, M1 fallback second). */
export function killedRows(section: HTMLElement): Target[] {
  const tagged = Array.from(section.querySelectorAll<HTMLElement>('[data-verdict="killed"]'));
  const rows = tagged.length
    ? tagged
    : Array.from(section.querySelectorAll<HTMLElement>("li")).filter((li) => li.querySelector(".text-kill"));
  return rows.map((row) => {
    const ps = row.querySelectorAll<HTMLElement>("p");
    const reason = row.querySelector<HTMLElement>("[data-reason]") ?? ps[1] ?? ps[0] ?? row;
    const name = row.querySelector<HTMLElement>("[data-name]") ?? ps[0] ?? row;
    return { row, reason, name };
  });
}

export type RoundPhase = "aim" | "paint" | "read";

export type RoundResult = { n: number; left: number | null; best: DeadEyeBest; fresh: boolean };

/** What the HUD shows (pushed on every change, the clock at ≤ 10 Hz). */
export type RoundView = {
  phase: RoundPhase;
  marked: number;
  total: number;
  /** ms of Dead Eye left; null = untimed (reduced motion). */
  left: number | null;
  result: RoundResult | null;
};

export type RoundHooks = {
  view(v: RoundView): void;
  /** The core ring, every frame: the share of Dead Eye left (0–1). */
  core(left: number): void;
  /** "Survived: not a target" (a survivor or flagship was clicked). */
  note(text: string): void;
  /** The ledger is restored (not called for "unmount"). */
  ended(reason: string): void;
};

export type Round = { fire(): void; release(reason: string): void };

const CORE_MS = 5000;
const DRAW_MS = 400;
const PENALTY_MS = 500;
const RETURN_MS = 300;
const TURN_MS = 140;
const SLOW = 0.25;
/** The mark's box (px). */
const X = 14;

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** The deadeye plate's URL at a modest width (the grade shows it at .2). */
function plateSrc(): string | null {
  const a = resolveMedia("iconic-deadeye");
  if (!a || a.kind !== "image") return null;
  try {
    return getImageProps({ src: a.src, alt: "", width: 1200, height: 675, quality: 55, sizes: "100vw" }).props.src;
  } catch {
    return a.src;
  }
}

/** Fill the grade layer (once per round; emptied on exit). */
function fillGrade(host: HTMLElement): void {
  const ground = document.createElement("div");
  ground.className = "de-ground";
  host.appendChild(ground);
  const src = plateSrc();
  if (src) {
    const img = document.createElement("img");
    img.className = "de-plate";
    img.alt = "";
    img.decoding = "async";
    img.src = src;
    host.appendChild(img);
  }
  const vignette = document.createElement("div");
  vignette.className = "de-vignette";
  host.appendChild(vignette);
}

export function startRound(o: { variant: Variant; survivor: string; hooks: RoundHooks }): Round | null {
  const found = document.getElementById("kill-list");
  if (!found) return null;
  const section: HTMLElement = found;
  const targets = killedRows(section);
  if (!targets.length) return null;
  const list = section.querySelector<HTMLElement>("[data-ledger] ol") ?? section;
  const rows = Array.from(list.querySelectorAll<HTMLElement>("li[data-row]"));
  const gradeHost = section.querySelector<HTMLElement>('[data-deadeye-layer="grade"]');
  const marksHost = section.querySelector<HTMLElement>('[data-deadeye-layer="marks"]');
  const root = document.documentElement;
  /** The section had no style attribute: leave none behind (D-6). */
  const bareStyle = !section.hasAttribute("style");
  /** The grade host's server style, put back verbatim on exit. */
  const gradeStyle = gradeHost?.getAttribute("style") ?? null;
  const alt = o.variant === "alt";
  const { hooks } = o;

  let phase: RoundPhase = "aim";
  let ended = false;
  let untimed = motionOffNow();
  const marked = new Set<number>();
  const marks = new Map<number, HTMLElement>();
  const timers = new Set<number>();
  let result: RoundResult | null = null;
  const later = (ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* — time (B5) ———————————————————————————————————————————————————— */
  const slowed: { a: Animation; rate: number }[] = [];
  const videos: { v: HTMLVideoElement; rate: number }[] = [];
  let gsapBase: number | null = null;
  let k = 1;
  let ramp = 0;
  const applyTime = (next: number) => {
    k = next;
    for (const s of slowed) {
      try {
        s.a.playbackRate = s.rate * next;
      } catch {
        /* a finished / removed animation */
      }
    }
    for (const s of videos) s.v.playbackRate = s.rate * next;
    const g = gsapIfLoaded()?.gsap;
    if (g) {
      if (gsapBase === null) gsapBase = g.globalTimeline.timeScale();
      g.globalTimeline.timeScale(gsapBase * next);
    }
  };
  /** Ease the time factor to `to` over `ms` (rAF; instant when ms is 0). */
  const rampTime = (to: number, ms: number) => {
    cancelAnimationFrame(ramp);
    ramp = 0;
    const from = k;
    if (ms <= 0 || from === to) {
      applyTime(to);
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const q = Math.min(1, (now - t0) / ms);
      applyTime(from + (to - from) * q);
      ramp = q < 1 ? requestAnimationFrame(tick) : 0;
    };
    ramp = requestAnimationFrame(tick);
  };
  /** What is running when time slows (taken once, BEFORE the round's own
   *  fades and marks exist: they keep real time). */
  let taken = false;
  const snapshot = () => {
    if (taken) return;
    taken = true;
    for (const a of document.getAnimations()) slowed.push({ a, rate: a.playbackRate });
    for (const v of Array.from(document.querySelectorAll("video"))) videos.push({ v, rate: v.playbackRate });
  };
  const slowDown = () => {
    snapshot();
    // the canvases' scale, scoped to the section (a var on <html> would
    // restyle the whole document: W2 rule 33)
    section.style.setProperty("--time-scale", String(SLOW));
    rampTime(SLOW, DRAW_MS);
  };
  const speedUp = (ms: number) => {
    section.style.removeProperty("--time-scale");
    rampTime(1, ms);
  };

  /* — the core (5.0 s; paused with motion; −0.5 s per wrong row) ———————— */
  let coreStart = 0;
  let penalty = 0;
  let pausedAt: number | null = null;
  let pausedTotal = 0;
  let loopRaf = 0;
  let lastPush = 0;
  const leftNow = (now = performance.now()): number | null => {
    if (untimed) return null;
    const at = pausedAt ?? now;
    return Math.max(0, CORE_MS - Math.max(0, at - coreStart - pausedTotal) - penalty);
  };
  const push = () =>
    hooks.view({ phase, marked: marked.size, total: targets.length, left: phase === "read" ? (result?.left ?? null) : leftNow(), result });
  const loop = (now: number) => {
    loopRaf = 0;
    if (phase !== "paint" || untimed || pausedAt !== null || ended) return;
    const left = leftNow(now) ?? CORE_MS;
    hooks.core(left / CORE_MS);
    if (now - lastPush > 100) {
      lastPush = now;
      push();
    }
    if (left <= 0) {
      fire();
      return;
    }
    loopRaf = requestAnimationFrame(loop);
  };
  const startLoop = () => {
    if (!loopRaf) loopRaf = requestAnimationFrame(loop);
  };

  /* — marks ———————————————————————————————————————————————————————— */
  const numberOf = (row: HTMLElement): HTMLElement => row.querySelector<HTMLElement>(":scope > span") ?? row;
  /** Where target i's mark sits (section px): beside its reason's first
   *  line (DEFAULT) or its row number (ALT), in the gutter before it. */
  const poseOf = (i: number, s: DOMRect): string => {
    const t = targets[i];
    if (!t) return "";
    const r = (alt ? numberOf(t.row) : t.reason).getBoundingClientRect();
    const line = Math.min(r.height, 26);
    const x = r.left - s.left - X - 10;
    const y = r.top - s.top + line / 2 - X / 2;
    return `${x.toFixed(1)}px ${y.toFixed(1)}px`;
  };
  /** Re-place every mark (resize, font swap): all reads, then all writes. */
  const place = () => {
    const s = section.getBoundingClientRect();
    const poses = [...marks.keys()].map((i) => [i, poseOf(i, s)] as const);
    for (const [i, tf] of poses) {
      const el = marks.get(i);
      if (el) el.style.translate = tf;
    }
  };
  const mark = (i: number) => {
    if (phase !== "paint" || marked.has(i) || !marksHost) return;
    const t = targets[i];
    if (!t) return;
    marked.add(i);
    const tf = poseOf(i, section.getBoundingClientRect());
    const el = document.createElement("span");
    el.className = alt ? "de-tally" : "de-mark";
    if (!alt) el.append(document.createElement("i"), document.createElement("i"));
    // placed by `translate` (the lock's `scale` composes after it)
    el.style.translate = tf;
    marksHost.appendChild(el);
    marks.set(i, el);
    if (!motionOffNow()) {
      if (alt) el.animate([{ scale: "1 0" }, { scale: "1 1" }], { duration: 120, easing: EASE });
      else
        Array.from(el.children).forEach((bar, j) =>
          (bar as HTMLElement).animate([{ scale: "0 1" }, { scale: "1 1" }], { duration: 90, delay: j * 90, easing: "linear", fill: "backwards" }),
        );
    }
    emit("game:mark", { row: t.name.textContent?.trim() || String(i + 1) });
    push();
  };
  const wrong = () => {
    if (phase !== "paint") return;
    if (!untimed) penalty += PENALTY_MS;
    hooks.note(o.survivor);
    push();
  };

  /* — fire once ————————————————————————————————————————————————————— */
  const strike = (i: number) => {
    const t = targets[i];
    if (!t) return;
    t.row.setAttribute("data-deadeye-struck", "");
    // the disclosure: the struck row's button is described by its verbatim
    // reason (an id the round adds and removes)
    if (!t.reason.id) {
      t.reason.id = `deadeye-reason-${i}`;
      t.reason.setAttribute("data-deadeye-id", "");
    }
    t.name.closest("button")?.setAttribute("aria-describedby", t.reason.id);
  };
  function fire() {
    if (phase !== "paint" || ended) return;
    cancelAnimationFrame(loopRaf);
    loopRaf = 0;
    const left = leftNow();
    phase = "read";
    const hit = [...marked].sort((a, b) => a - b);
    emit("game:fire");
    if (alt && !motionOffNow()) hit.forEach((i, j) => later(j * TURN_MS, () => strike(i)));
    else hit.forEach(strike);
    // the marks have done their work: they fade (instantly without motion)
    for (const el of marks.values()) {
      if (motionOffNow()) el.style.opacity = "0";
      else el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 180, fill: "forwards" });
    }
    if (k !== 1) speedUp(RETURN_MS);
    const n = hit.length;
    const rec = recordDeadEyeRound(n, left ?? 0);
    result = { n, left, best: rec.best, fresh: rec.fresh };
    if (n === targets.length) void import("@/lib/hunt").then((m) => m.recordDeadEyeWin(), () => {});
    emit("game:finish", { game: "deadeye", score: n });
    hooks.core(left === null ? 1 : left / CORE_MS);
    push();
  }

  /* — input ———————————————————————————————————————————————————————— */
  const targetIndex = (el: Element | null): number => {
    const li = el?.closest("li[data-row]");
    return li ? targets.findIndex((t) => t.row === li) : -1;
  };
  const buttonOf = (i: number) => targets[i]?.name.closest("button") ?? null;
  const onClick = (e: MouseEvent) => {
    if (phase !== "paint") return;
    const el = e.target instanceof Element ? e.target : null;
    const li = el?.closest("li[data-row]");
    if (!li || !list.contains(li)) return;
    // during the paint a row is one target: its link waits for the read
    if (el?.closest("a")) e.preventDefault();
    const i = targetIndex(li);
    if (i >= 0) mark(i);
    else wrong();
  };
  const onKey = (e: KeyboardEvent) => {
    if (phase === "aim" || e.altKey || e.ctrlKey || e.metaKey) return;
    const i = targetIndex(e.target instanceof Element ? e.target : null);
    if (i < 0) return;
    const go = (j: number) => {
      e.preventDefault();
      e.stopPropagation(); // the ledger's own ↑ / ↓ walk every row; Dead Eye's walk only the killed ones
      buttonOf(j)?.focus();
    };
    const last = targets.length - 1;
    if (e.key === "ArrowDown") go(Math.min(last, i + 1));
    else if (e.key === "ArrowUp") go(Math.max(0, i - 1));
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(last);
    else if (phase === "paint" && e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      fire();
    } else if (phase === "paint" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      e.stopPropagation();
      mark(i);
    }
  };
  const onEsc = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || e.defaultPrevented) return;
    // a dialog over the page (the palette, the Map) owns its own Esc
    if (e.target instanceof Element && e.target.closest("dialog, [role=dialog]")) return;
    e.preventDefault();
    release("esc");
  };

  const ro = new ResizeObserver(() => place());
  const offMotion = onMotionOffChange(() => {
    if (ended) return;
    if (motionOffNow()) {
      if (k !== 1 || ramp) speedUp(0);
      if (phase !== "paint" || untimed) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // the OS asked for reduced motion: the round goes untimed
        untimed = true;
        cancelAnimationFrame(loopRaf);
        loopRaf = 0;
        hooks.core(1);
      } else if (pausedAt === null) pausedAt = performance.now();
      push();
      return;
    }
    if (phase === "paint" && !untimed && pausedAt !== null) {
      pausedTotal += performance.now() - pausedAt;
      pausedAt = null;
      slowDown();
      startLoop();
      push();
    }
  });

  /* — draw ———————————————————————————————————————————————————————— */
  const draw = () => {
    if (ended) return;
    phase = "paint";
    untimed = motionOffNow();
    if (!untimed) snapshot();
    section.dataset.deadeye = "on";
    const isTarget = new Set(targets.map((t) => t.row));
    for (const li of rows) li.setAttribute("data-de", isTarget.has(li) ? "target" : "dim");
    if (gradeHost) {
      if (!gradeHost.childElementCount) fillGrade(gradeHost);
      gradeHost.hidden = false;
      gradeHost.style.opacity = "1";
      if (!untimed) gradeHost.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DRAW_MS, easing: "ease-out" });
    }
    if (marksHost) marksHost.hidden = false;
    list.addEventListener("click", onClick, true);
    list.addEventListener("keydown", onKey, true);
    ro.observe(section);
    emit("game:start", { game: "deadeye" });
    if (!untimed) slowDown();
    coreStart = performance.now() + (untimed ? 0 : DRAW_MS);
    hooks.core(1);
    buttonOf(0)?.focus({ preventScroll: true });
    push();
    if (!untimed) startLoop();
  };

  /* — exit: the ledger exactly as it was (D-6) —————————————————————————— */
  function release(reason: string) {
    if (ended) return;
    ended = true;
    cancelAnimationFrame(loopRaf);
    loopRaf = 0;
    cancelAnimationFrame(ramp);
    ramp = 0;
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
    applyTime(1);
    const g = gsapIfLoaded()?.gsap;
    if (g && gsapBase !== null) g.globalTimeline.timeScale(gsapBase);
    section.style.removeProperty("--time-scale");
    list.removeEventListener("click", onClick, true);
    list.removeEventListener("keydown", onKey, true);
    document.removeEventListener("keydown", onEsc, true);
    ro.disconnect();
    offMotion();
    for (const el of marks.values()) el.remove();
    marks.clear();
    if (marksHost) marksHost.hidden = true;
    for (const li of rows) {
      li.removeAttribute("data-de");
      li.removeAttribute("data-deadeye-struck");
    }
    for (const t of targets) {
      const b = t.name.closest("button");
      if (b?.getAttribute("aria-describedby") === t.reason.id) b.removeAttribute("aria-describedby");
      if (t.reason.hasAttribute("data-deadeye-id")) {
        t.reason.removeAttribute("id");
        t.reason.removeAttribute("data-deadeye-id");
      }
    }
    delete section.dataset.deadeye;
    if (bareStyle && !section.getAttribute("style")) section.removeAttribute("style");
    if (gradeHost) {
      const clear = () => {
        gradeHost.hidden = true;
        if (gradeStyle === null) gradeHost.removeAttribute("style");
        else gradeHost.setAttribute("style", gradeStyle);
        gradeHost.replaceChildren();
      };
      if (!gradeHost.hidden && !motionOffNow() && reason !== "unmount") {
        gradeHost.style.opacity = "0";
        gradeHost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-out" }).finished.then(clear, clear);
      } else clear();
    }
    if (root.getAttribute("data-game") === "deadeye") root.removeAttribute("data-game");
    emit("game:stop", { game: "deadeye", reason });
    if (reason !== "unmount") hooks.ended(reason);
  }

  /* — aim ————————————————————————————————————————————————————————— */
  root.setAttribute("data-game", "deadeye");
  document.addEventListener("keydown", onEsc, true);
  hooks.view({ phase, marked: 0, total: targets.length, left: untimed ? null : CORE_MS, result: null });
  hooks.core(1);
  const first = targets[0]?.row.getBoundingClientRect();
  const lastRow = targets[targets.length - 1]?.row.getBoundingClientRect();
  if (first && lastRow) {
    const top = first.top + window.scrollY;
    const bottom = lastRow.bottom + window.scrollY;
    const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const room = window.innerHeight - pad;
    // centred under the header when the block fits, else its top under it
    const y = bottom - top <= room ? (top + bottom) / 2 - (pad + room / 2) : top - pad - 16;
    void scrollToTarget(Math.max(0, y)).then(draw, draw);
  } else draw();

  return {
    fire: () => fire(),
    release,
  };
}
