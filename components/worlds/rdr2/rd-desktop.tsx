"use client";

import { useEffect, type RefObject } from "react";
import { EGG_EVENT } from "@/components/eggs/egg-bus";
import type { BeatWeight } from "@/lib/beats";
import { motionOffNow, onMotionOffChange, useReducedMotion } from "@/lib/flags";
import { spotlight } from "@/lib/spotlight";
import type { RdPart } from "@/components/worlds/rdr2/kit";

/* ============================================================================
   ACT III DESKTOP EXTRAS (impl) — the lazy half of kit.tsx <RdDesktop>
   (DP-13, rule 34: nothing here ships in the first load). Mounted on
   DESKTOP_FINE only, once per part, inside its section.

   SCROLL STARS (spec §3.8; plan §8): the part's scroll star registers with
   the spotlight while motion is on, so no time star plays over it —
     beyond  B41  the TrailMap figure (its fog lifts as it crosses: CSS view())
     writing B46  the journal's dusk (writing.tsx: the camp fades up out of it)
     voices  B47  the camp stage (the drift toward the fire, the night veil,
                  the lead quote read into firelight, the fireflies)

   HUNT EGGS (spec §9.1 #10–12; plan §7.4). The hotspot binder (components/
   enhance/binders/hotspots.ts) fires `triggerEgg(<registry id>)`; the egg
   runtime counts, toasts and voices it; THIS draws the effect, which never
   waits for the spotlight. Every effect is ≤ 4 s, transform / opacity only,
   on the media and art layers (never over text), and leaves nothing behind
   (the bone's pencilled note is the one mark that stays, as page art, for
   this view). Pause or reduced motion mid-effect ends it at once.
     rd-eagle (eagle-eye)       the Beyond media greys for 1.5 s (a
                                saturation layer, by opacity), while the
                                running-shoe prints and the trail map's
                                dashed trail brighten in sequence to the
                                tent (IC-RD-07). RM: the trail bright, static.
     rd-bone  (fossil-bone)     a pencilled note draws on under the bone
                                (copy egg.bone.note) with a small bone
                                sketch, 1.2 s (a clip riding a transform).
                                RM: the note drawn, static.
     rd-fire  (campfire-flare)  one flare: a brightness 1.2 copy of the
                                plate, masked to the fire (static filter and
                                mask, its opacity animated) and 14 ember
                                sprites rising 1.2 s from `marks.fire`
                                (IC-RD-04 cap 24). RM: no flare (the toast
                                is the runtime's).
   ========================================================================== */

type Fx = (sec: HTMLElement, still: boolean, note?: string) => () => void;

const STAR: Readonly<Record<RdPart, string>> = { beyond: "B41", writing: "B46", voices: "B47" };
const EGG: Readonly<Record<RdPart, string>> = { beyond: "eagle-eye", writing: "fossil-bone", voices: "campfire-flare" };
const NOOP = () => {};

function inView(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
}

/** A decorative element with inline styles (no first-load CSS). */
function make(tag: string, css: string): HTMLElement {
  const e = document.createElement(tag);
  e.setAttribute("aria-hidden", "true");
  e.style.cssText = css;
  return e;
}

/* — rd-eagle ——————————————————————————————————————————————————————————— */

const EAGLE_MS = 2700;
const STEP_MS = 110;
const OUTER = "[data-live-plate], [data-stage-window]";
const PLATES = `${OUTER}, [data-media]`;

const eagle: Fx = (sec, still) => {
  const anims: Animation[] = [];
  const temp: Element[] = [];
  if (!still) {
    // the media (not the text): a grey saturation layer over each plate in
    // view, on its outermost box (a live plate's depth band sits over its
    // still, so the layer goes on the plate, not inside it)
    sec.querySelectorAll(PLATES).forEach((m) => {
      if (!inView(m) || m.parentElement?.closest(OUTER)) return;
      const grey = make("i", "position:absolute;inset:0;z-index:4;pointer-events:none;background:#808080;mix-blend-mode:saturation;opacity:0");
      m.append(grey);
      temp.push(grey);
      anims.push(
        grey.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], {
          duration: 1500,
          easing: "ease-in-out",
        }),
      );
    });
  }
  // the prints (bone copies over the pencil), then the map's trail and tent
  const lit: SVGElement[] = [];
  sec.querySelectorAll<SVGGElement>('[data-motif="shoe-prints"] > g > g').forEach((p) => {
    const c = p.cloneNode(true) as SVGGElement;
    c.style.cssText = "stroke:var(--w-bone);stroke-width:1.8;opacity:0";
    p.parentNode?.append(c);
    temp.push(c);
    lit.push(c);
  });
  sec.querySelectorAll<SVGElement>("[data-eagle-seg]").forEach((s) => lit.push(s));
  lit.forEach((s, i) => {
    if (still) {
      s.style.opacity = "1";
      return;
    }
    const a = Math.min(0.7, (i * STEP_MS) / EAGLE_MS);
    anims.push(
      s.animate(
        [{ opacity: 0 }, { opacity: 0, offset: a }, { opacity: 1, offset: a + 0.07 }, { opacity: 1, offset: 0.82 }, { opacity: 0 }],
        { duration: EAGLE_MS, easing: "ease-out" },
      ),
    );
  });
  const done = () => {
    anims.forEach((x) => x.cancel());
    temp.forEach((t) => t.remove());
    lit.forEach((s) => s.style.removeProperty("opacity"));
  };
  const timer = window.setTimeout(done, EAGLE_MS + 50);
  return () => {
    window.clearTimeout(timer);
    done();
  };
};

/* — rd-bone ———————————————————————————————————————————————————————————— */

/** The small bone sketch after the note (our own two-knob bone). */
const BONE_SKETCH =
  '<svg viewBox="-23 -7 46 14" width="2.2em" height="0.7em" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M-14 -1.6H14M-14 1.6H14M-14 -1.6C-15 -5.5-21 -5.5-20 -2.2-21 -.5-21 .5-20 2.2-21 5.5-15 5.5-14 1.6M14 -1.6C15 -5.5 21 -5.5 20 -2.2 21 -.5 21 .5 20 2.2 21 5.5 15 5.5 14 1.6"/></svg>';

const bone: Fx = (sec, still, note) => {
  const host = sec.querySelector<HTMLElement>("[data-bone-note]");
  if (!host || !note) return NOOP;
  host.replaceChildren();
  const size = Math.max(10, host.clientWidth * 0.024).toFixed(1);
  // under the bone, between the hills and the lake (page art: aria-hidden)
  const outer = make("div", "position:absolute;left:30%;top:52.6%;overflow:hidden");
  const inner = make(
    "div",
    `display:flex;align-items:center;gap:.4em;white-space:nowrap;line-height:1.2;font-family:var(--font-serif);font-style:italic;font-size:${size}px;color:var(--world-line)`,
  );
  const text = document.createElement("span");
  text.textContent = note;
  const sketch = make("span", "display:inline-flex");
  sketch.innerHTML = BONE_SKETCH;
  inner.append(text, sketch);
  outer.append(inner);
  host.append(outer);
  if (still) return NOOP;
  // the pencil writes left → right: the clip slides, the words stay put
  const o: KeyframeAnimationOptions = { duration: 1200, easing: "cubic-bezier(.45,.05,.55,.95)" };
  const anims = [
    outer.animate([{ transform: "translateX(-100%)" }, { transform: "none" }], o),
    inner.animate([{ transform: "translateX(100%)" }, { transform: "none" }], o),
    sketch.animate([{ opacity: 0 }, { opacity: 0, offset: 0.65 }, { opacity: 1 }], { duration: 1200 }),
  ];
  return () => anims.forEach((a) => a.finish());
};

/* — rd-fire ———————————————————————————————————————————————————————————— */

const FLARE_MS = 1600;
const EMBERS = 14;

const fire: Fx = (sec, still) => {
  if (still) return NOOP;
  const spot = sec.querySelector<HTMLElement>("[data-fire-spot]");
  const cam = sec.querySelector<HTMLElement>("[data-fire-plate] .plate-cam");
  if (!spot || !cam) return NOOP;
  const c = cam.getBoundingClientRect();
  const s = spot.getBoundingClientRect();
  if (!c.width || !c.height) return NOOP;
  // the fire in the camera's own box (its scale is about the fire: stays put)
  const x = (((s.left + s.width / 2 - c.left) / c.width) * 100).toFixed(2);
  const y = (((s.top + s.height / 2 - c.top) / c.height) * 100).toFixed(2);
  const anims: Animation[] = [];
  const temp: Element[] = [];
  // the near band when the depth runs (it is the identity layer), else the still
  const img = cam.querySelector(".plate-depth-near img") ?? cam.querySelector(".plate-depth-far img");
  if (img) {
    const mask = `radial-gradient(circle 9rem at ${x}% ${y}%, #000 0, #000 30%, transparent 100%)`;
    const flare = make(
      "div",
      `position:absolute;inset:0;pointer-events:none;opacity:0;filter:brightness(1.2);-webkit-mask-image:${mask};mask-image:${mask};will-change:opacity`,
    );
    flare.append(img.cloneNode());
    cam.append(flare);
    temp.push(flare);
    anims.push(
      flare.animate([{ opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], {
        duration: FLARE_MS,
        easing: "ease-out",
      }),
    );
  }
  for (let i = 0; i < EMBERS; i++) {
    const r = 1.5 + Math.random() * 2;
    const e = make(
      "i",
      `position:absolute;left:${x}%;top:${y}%;width:${(2 * r).toFixed(1)}px;height:${(2 * r).toFixed(1)}px;margin:${(-r).toFixed(1)}px 0 0 ${(-r).toFixed(1)}px;border-radius:50%;pointer-events:none;opacity:0;background:radial-gradient(circle,var(--w-dusk) 0,transparent 70%);will-change:transform,opacity`,
    );
    cam.append(e);
    temp.push(e);
    const dx = (Math.random() - 0.5) * 60;
    const dy = 70 + Math.random() * 110;
    anims.push(
      e.animate(
        [
          { transform: "translate(0,0)", opacity: 0 },
          { opacity: 0.95, offset: 0.15 },
          { transform: `translate(${dx.toFixed(1)}px,${(-dy).toFixed(1)}px)`, opacity: 0 },
        ],
        { duration: 900 + Math.random() * 300, delay: Math.random() * 300, easing: "cubic-bezier(.2,.6,.4,1)", fill: "both" },
      ),
    );
  }
  const done = () => {
    anims.forEach((a) => a.cancel());
    temp.forEach((t) => t.remove());
  };
  const timer = window.setTimeout(done, FLARE_MS + 100);
  return () => {
    window.clearTimeout(timer);
    done();
  };
};

const FX: Readonly<Record<RdPart, Fx>> = { beyond: eagle, writing: bone, voices: fire };

/* — writing: the dusk's horizon (P3-11 r1) ————————————————————————————
   writing.tsx's [data-dusk-trees] host (≥ lg): a pine treeline in the
   camp's deep (--bg of the host's plane) standing where the fade turns
   solid, drawn HERE so it costs the first load nothing. With motion on it
   rises as the dusk scrolls in — B46's visible performance: a translate on
   a ViewTimeline of its box (compositor only; no ViewTimeline → it simply
   stands). Pause / reduced motion: it stands. Deterministic shapes. */
const hash = (k: number) => {
  const v = Math.sin(k * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** One pine: four drooping tiers, tip to tip (viewBox units). */
function pine(x: number, h: number, base: number): string {
  const w = h * 0.24 + 4;
  const side: [number, number][] = [];
  for (let t = 0; t < 4; t++) {
    const f = t / 4;
    const wb = w * (1 - f * 0.8);
    side.push([wb, h * f * 0.92], [wb * 0.32, h * (f + 0.1375) * 0.92]);
  }
  const pt = ([dx, dy]: [number, number], s: number) => `${(x + s * dx).toFixed(0)} ${(base - dy).toFixed(0)}`;
  const left = side.map((p) => pt(p, -1));
  const right = side.reverse().map((p) => pt(p, 1));
  return `M${pt([w * 0.2, 0], -1)} L${[...left, pt([0, h], 1), ...right, pt([w * 0.2, 0], 1)].join(" L")}Z`;
}

function treeline(): string {
  let d = "M0 140V122H1600V140Z";
  for (let k = 0, x = 4; x < 1600; k++) {
    const h = hash(k + 101) > 0.15 ? 34 + hash(k) * 84 : 22 + hash(k) * 20;
    d += pine(x, h, 124 + Math.sin(x / 170) * 3);
    x += 12 + hash(k + 7) * 22;
  }
  return d;
}

function drawTrees(host: HTMLElement): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 1600 140");
  svg.setAttribute("preserveAspectRatio", "xMidYMax slice");
  svg.setAttribute("focusable", "false");
  svg.style.cssText = "position:absolute;left:0;bottom:13%;width:100%;height:44%;fill:var(--bg)";
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", treeline());
  svg.append(path);
  host.replaceChildren(svg);
  return svg;
}

type ViewTimelineCtor = new (o: { subject: Element }) => AnimationTimeline;

function riseTrees(trees: SVGSVGElement, box: Element): (() => void) | null {
  const VT = (window as unknown as { ViewTimeline?: ViewTimelineCtor }).ViewTimeline;
  if (!VT) return null;
  const a = trees.animate([{ transform: "translateY(38%)" }, { transform: "none" }], {
    timeline: new VT({ subject: box }),
    // B46's window (lib/spotlight-windows.ts "bottom 100%, bottom 30%"):
    // from the box fully in (its bottom at the viewport's) to ≈ its bottom at 30 %
    rangeStart: "contain 0%",
    rangeEnd: "cover 75%",
    fill: "both",
  } as KeyframeAnimationOptions);
  return () => a.cancel();
}

export default function RdDesktopImpl({
  part,
  anchor,
  note,
}: {
  part: RdPart;
  anchor: RefObject<HTMLElement | null>;
  note?: string;
}) {
  const reduced = useReducedMotion();

  // the part's scroll star (the spotlight's facade answers no-op when motion is off)
  useEffect(() => {
    const el = anchor.current?.closest("section")?.querySelector<HTMLElement>(`[data-beat="${STAR[part]}"][data-beat-star]`);
    if (reduced || !el) return;
    const w = Number(el.dataset.beatWeight);
    const weight: BeatWeight = w === 3 ? 3 : w === 2 ? 2 : 1;
    return spotlight.registerScrollStar(STAR[part], el, weight);
  }, [part, anchor, reduced]);

  // writing: the dusk's treeline (drawn always; it rises with motion on)
  useEffect(() => {
    const host = part === "writing" ? anchor.current?.closest("section")?.querySelector<HTMLElement>("[data-dusk-trees]") : null;
    if (!host) return;
    const trees = drawTrees(host);
    let stop = reduced || motionOffNow() ? null : riseTrees(trees, host);
    const offMotion = onMotionOffChange(() => {
      if (motionOffNow()) {
        stop?.();
        stop = null;
      } else if (!reduced) stop ??= riseTrees(trees, host);
    });
    return () => {
      offMotion();
      stop?.();
      host.replaceChildren();
    };
  }, [part, anchor, reduced]);

  // the part's egg: draw it when it fires; Pause / reduced motion ends it
  useEffect(() => {
    const sec = anchor.current?.closest<HTMLElement>("section");
    if (!sec) return;
    let stop: (() => void) | null = null;
    const end = () => {
      stop?.();
      stop = null;
    };
    const onEgg = (e: Event) => {
      if ((e as CustomEvent<{ id?: string }>).detail?.id !== EGG[part]) return;
      end();
      stop = FX[part](sec, motionOffNow(), note);
    };
    window.addEventListener(EGG_EVENT, onEgg);
    const offMotion = onMotionOffChange(() => {
      if (motionOffNow()) end();
    });
    return () => {
      window.removeEventListener(EGG_EVENT, onEgg);
      offMotion();
      end();
    };
  }, [part, anchor, note]);

  return null;
}
