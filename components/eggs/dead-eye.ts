/* ============================================================================
   DEAD EYE (IC-RD-02; SPEC v2 SM-17; rdr2-act.BAR §E; eggs.BAR) — the
   kill-list's opt-in egg, loaded on trigger only (a lazy chunk: E2).
   Mark first, fire once (RD-P2): pre-registration marks the targets and the
   blind holdout is the one shot.

   The run (≤ 3 s, motion on):
     1. time slows — every document animation and video to 0.25×, and
        --time-scale on <html> for canvases;
     2. the grade — the ledger's ground shifts to --rd-deadeye-bg and the
        iconic-deadeye plate shows at the section's EDGES as its media layer
        (a masked vignette behind the text; TEXT COLOURS NEVER CHANGE);
     3. the marks — an ember X (two 1.5 px strokes, 90 ms each) locks beside
        each KILLED row's recorded reason, 160 ms apart; survivors and
        EXCEPTION rows are never marked; the count is the DOM's (= content.ts
        killList);
     4. fire once — 400 ms after the last mark (or Enter) every killed row
        strikes at once, the X's fade, time returns to 1× over 300 ms;
     5. the end — the host shows the Dead Eye toast (Q-RD-2 + the status),
        and the page is left EXACTLY as it was (nothing behind).
   Reduced motion / Pause: no time-scale and no sequence — the static X's
   and the ground shift hold until Esc. Esc aborts at any step.
   NEVER a reticle, crosshair cursor, gun, sound or a mark on a survivor.

   DOM CONTRACT with the ledger (components/site/ledger-reckoning.tsx, the
   act2-idiots builder): inside #kill-list, each killed row carries
   data-verdict="killed", its reason data-reason and its name data-name.
   Until those land, the fallback reads the M1 ledger: an <li> whose verdict
   word is ember (.text-kill), reason = its 2nd <p>, name = its 1st.
   ========================================================================== */

import { getImageProps } from "next/image";
import { resolveMedia } from "@/lib/media";

export type DeadEyeRun = {
  /** Fire now (Enter), if the marks are down and it has not fired. */
  fire(): void;
  /** Esc: stop everything and restore the page at once. */
  abort(): void;
};

type Target = { row: HTMLElement; reason: HTMLElement; name: HTMLElement };

const SVG_NS = "http://www.w3.org/2000/svg";

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

function plateSrc(): string | null {
  const a = resolveMedia("iconic-deadeye");
  if (!a) return null;
  try {
    return getImageProps({ src: a.src, alt: "", width: 1200, height: 675, quality: 55, sizes: "100vw" }).props.src;
  } catch {
    return a.src;
  }
}

export function runDeadEye({
  reduced,
  onFired,
  onEnd,
}: {
  reduced: boolean;
  /** The shot is fired (motion on) or the static marks are shown (RM): the
   *  host shows the toast with this count. */
  onFired: (n: number) => void;
  /** Everything restored (after the run, or on abort). */
  onEnd: () => void;
}): DeadEyeRun | null {
  const section = document.getElementById("kill-list");
  if (!section) return null;
  const targets = killedRows(section);
  if (!targets.length) return null;

  const timers: number[] = [];
  const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
  let ended = false;
  let fired = false;

  /* 1. time slows (motion on only) */
  const slowed: { a: Animation; rate: number }[] = [];
  const videos: { v: HTMLVideoElement; rate: number }[] = [];
  const root = document.documentElement;
  const setTime = (k: number) => {
    for (const s of slowed) s.a.playbackRate = s.rate * k;
    for (const s of videos) s.v.playbackRate = s.rate * k;
    if (k === 1) root.style.removeProperty("--time-scale");
    else root.style.setProperty("--time-scale", String(k));
  };
  if (!reduced) {
    for (const a of document.getAnimations()) slowed.push({ a, rate: a.playbackRate });
    for (const v of Array.from(document.querySelectorAll("video"))) videos.push({ v, rate: v.playbackRate });
    setTime(0.25);
  }

  /* 2. the grade: the ground shifts; the plate shows at the edges */
  const saved = {
    bg: section.style.backgroundColor,
    transition: section.style.transition,
    isolation: section.style.isolation,
    position: section.style.position,
  };
  section.dataset.deadeye = "on";
  section.style.transition = reduced ? "none" : "background-color 300ms ease-out";
  section.style.backgroundColor = "var(--rd-deadeye-bg)";
  section.style.isolation = "isolate";
  if (getComputedStyle(section).position === "static") section.style.position = "relative";
  const grade = document.createElement("div");
  grade.setAttribute("aria-hidden", "true");
  grade.dataset.deadeyeGrade = "";
  Object.assign(grade.style, {
    position: "absolute",
    inset: "0",
    zIndex: "-1",
    pointerEvents: "none",
    overflow: "hidden",
    opacity: reduced ? "1" : "0",
    transition: reduced ? "none" : "opacity 300ms ease-out",
  } satisfies Partial<CSSStyleDeclaration>);
  const src = plateSrc();
  if (src) {
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.src = src;
    Object.assign(img.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: "0.2",
      // the plate lives at the EDGES only: the reading column stays on the
      // plain ground (text colours never change; AA holds)
      maskImage: "linear-gradient(to right, black 0, transparent 20%, transparent 80%, black 100%)",
      webkitMaskImage: "linear-gradient(to right, black 0, transparent 20%, transparent 80%, black 100%)",
    } satisfies Partial<CSSStyleDeclaration>);
    grade.appendChild(img);
  }
  const vignette = document.createElement("div");
  Object.assign(vignette.style, {
    position: "absolute",
    inset: "0",
    background:
      "linear-gradient(to right, color-mix(in oklab, var(--w-deadeye) 22%, transparent), transparent 14%, transparent 86%, color-mix(in oklab, var(--w-deadeye) 22%, transparent))",
  } satisfies Partial<CSSStyleDeclaration>);
  grade.appendChild(vignette);
  section.prepend(grade);
  if (!reduced) requestAnimationFrame(() => (grade.style.opacity = "1"));

  /* 3. the marks, in an overlay in PAGE coordinates (scrolls with the page) */
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.dataset.deadeyeLayer = "";
  Object.assign(layer.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: "0",
    height: "0",
    zIndex: "30",
    pointerEvents: "none",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(layer);

  const X = 14;
  const marks = targets.map((t) => {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${X} ${X}`);
    svg.setAttribute("width", String(X));
    svg.setAttribute("height", String(X));
    svg.setAttribute("data-deadeye-mark", "");
    svg.style.position = "absolute";
    svg.style.overflow = "visible";
    svg.style.transition = reduced ? "none" : "opacity 300ms ease-out";
    const lines = [
      [1, 1, X - 1, X - 1],
      [X - 1, 1, 1, X - 1],
    ].map(([x1, y1, x2, y2]) => {
      const l = document.createElementNS(SVG_NS, "line");
      l.setAttribute("x1", String(x1));
      l.setAttribute("y1", String(y1));
      l.setAttribute("x2", String(x2));
      l.setAttribute("y2", String(y2));
      l.setAttribute("stroke", "var(--color-ember)");
      l.setAttribute("stroke-width", "1.5");
      l.setAttribute("stroke-linecap", "round");
      l.setAttribute("pathLength", "1");
      l.setAttribute("stroke-dasharray", "1 2");
      l.setAttribute("stroke-dashoffset", reduced ? "0" : "1");
      svg.appendChild(l);
      return l;
    });
    layer.appendChild(svg);
    const strike = document.createElement("div");
    Object.assign(strike.style, {
      position: "absolute",
      height: "1.5px",
      background: "var(--color-ember)",
      transformOrigin: "left center",
      transform: "scaleX(0)",
    } satisfies Partial<CSSStyleDeclaration>);
    layer.appendChild(strike);
    return { t, svg, lines, strike };
  });

  const layout = () => {
    const sx = window.scrollX;
    const sy = window.scrollY;
    for (const m of marks) {
      const r = m.t.reason.getBoundingClientRect();
      const line = Math.min(r.height, 26);
      // beside the reason's first line, in the gutter before it
      m.svg.style.left = `${r.left + sx - X - 10}px`;
      m.svg.style.top = `${r.top + sy + line / 2 - X / 2}px`;
      const n = m.t.name.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(m.t.name);
      const text = range.getBoundingClientRect();
      const w = text.width || n.width;
      m.strike.style.left = `${(text.width ? text.left : n.left) + sx}px`;
      m.strike.style.top = `${(text.height ? text.top + text.height / 2 : n.top + n.height / 2) + sy}px`;
      m.strike.style.width = `${w}px`;
    }
  };
  layout();
  window.addEventListener("resize", layout);

  const lock = (i: number) => {
    const m = marks[i];
    m.lines.forEach((l, k) => {
      l.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 90, delay: k * 90, fill: "forwards", easing: "linear" });
    });
  };

  /* 4. fire once */
  const fire = () => {
    if (fired || ended) return;
    fired = true;
    for (const m of marks) {
      m.strike.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 180, fill: "forwards", easing: "ease-out" });
      m.svg.style.opacity = "0";
    }
    // time returns to 1× over 300 ms
    [0.5, 0.75, 1].forEach((k, i) => later(100 * (i + 1), () => setTime(k)));
    onFired(targets.length);
    /* 5. leave nothing behind */
    later(1400, () => {
      for (const m of marks) m.strike.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
      grade.style.opacity = "0";
      section.style.backgroundColor = saved.bg;
    });
    later(1800, end);
  };

  const end = () => {
    if (ended) return;
    ended = true;
    timers.forEach((t) => window.clearTimeout(t));
    window.removeEventListener("resize", layout);
    if (!reduced) setTime(1);
    layer.remove();
    grade.remove();
    section.style.transition = saved.transition;
    section.style.backgroundColor = saved.bg;
    section.style.isolation = saved.isolation;
    section.style.position = saved.position;
    delete section.dataset.deadeye;
    onEnd();
  };

  if (reduced) {
    // the static version: every X and the ground shift, until Esc
    onFired(targets.length);
  } else {
    marks.forEach((_, i) => later(i * 160, () => lock(i)));
    later((marks.length - 1) * 160 + 180 + 400, fire);
  }

  return {
    fire: () => {
      if (!reduced) fire();
    },
    abort: end,
  };
}
