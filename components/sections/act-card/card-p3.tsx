"use client";

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { getImageProps } from "next/image";
import { beatAttrs } from "@/lib/beats";
import { emit, on as onEvent } from "@/lib/events";
import { motionOffNow } from "@/lib/flags";
import type { GlTier } from "@/lib/gl/support";
import type { GlCardSpec } from "@/lib/gl/types";
import { impact } from "@/lib/impact";
import { loopFor } from "@/lib/loops";
import { isMediaId, resolveMedia } from "@/lib/media";
import { cardPin } from "@/lib/motion";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { spotlight } from "@/lib/spotlight";
import type { Variant, VariantChoice } from "@/lib/variants";
import { triggerEgg } from "@/components/eggs/egg-bus";
import { GlGate } from "@/components/gl/gl-gate";
import { MediaFrame } from "@/components/primitives/media-frame";
import { remap } from "@/components/primitives/loaders/line";
import { CarriedShape } from "@/components/stage/carried-shape";
import { WeatherLayer } from "@/components/stage/weather-layer";
import { useFrameSequence } from "@/components/worlds/pirates/use-frame-sequence";
import { useCard, type PinUi } from "@/components/sections/act-card/card-context";
import type { CardPinSpec, PinWeather, PushSpec } from "@/components/sections/act-card/pin-spec";

/* ============================================================================
   CARD P3 — the pinned act card's Phase-3 pieces (PHASE3-SPEC §6.2,
   §7.1–§7.7, §8.1, §8.4, §9.1 #6; PHASE3-PLAN §6.1 W2-CARDS). ONE lazy chunk
   (DP-13), mounted by CardShell on DESKTOP_FINE only, for a card with
   travel. Nothing here runs on phones, tablets or without JS.

   THE DIRECTOR (CardP3): one per card.
     damping   p += (p_raw − p)·(1 − e^(−λ·dt)), λ 8/s: ONE rAF loop per card,
               running only while |p_raw − p| > .002, snapping exactly to
               p_raw (so 0 and 1); an immediate `scroll:jump` (the cut, the
               chapter select, a hash) sets p = p_raw; under reduced motion
               or Pause p follows p_raw (the card is static anyway).
     phases    `data-card-phase` on the section (a < .50 ≤ b < .68 ≤ m <
               .92 ≤ e): the lower bar's state crossfades (cards.css): the h2
               and the caption during (a) and the settle, the act logline as
               a subtitle during (b), out as the mask opens the bars.
     push-in   star (b) scales the frame's content box about the push's
               focus (transform only): #1 the code push on L01 (1 → 1.3 about
               the stern; ALT rack + 1 → 1.15), #2 the camera on L08 toward
               the ICE board (1 → 1.35, FIG. 0 inside; ALT rack + 1 → 1.2),
               #3 SEQ-HALL on the card canvas (+ a 1.06 code scale; ALT the
               crane on L02), the tintype's push toward the sun (1 → 1.04).
     iris      the opening's css-tier aperture: a 12 % disc pre-opened on
               the stern (the hook) that opens to the far corner over star
               (a): a static radial mask on a scaled box, the plate counter-
               scaled inside it (mask-on-transform), a brass rim riding it.
     crossings the impact (§7.6; once per world per view) and the
               `transition:meet` sound cue fire when the damped p crosses
               them going forward — never on a jump, never under RM.
     stars     the card's two scroll stars (markers on the pin spacer) are
               registered with the spotlight.
     kraken    (seam) the upper-bar "HERE BE MONSTERS" button, or a 2.0 s
               still look at the pinned storm (p ≤ .05): the swell (GL
               `uKraken`, css a heave of the plate + a dark mass) and one
               tentacle tip (DOM, above the canvas) breaking the foam, 1.5 s.
               RM / Pause: the static tip. It counts once (pc-kraken).
   FRAME LAYERS (a portal into the card frame): the GL layer (GlGate), the
   SEQ canvas, the css title mask (DEFAULT) or the plain bars (ALT), the
   static carried shape, weather, the kraken. Layers the GL tier draws
   itself carry `data-gl-replaced` (hidden under `[data-gl="on"]`).
   ========================================================================== */

const A = 2.39;
/** Write inline styles on a DOM node this chunk drives (refs, not state). */
function css(el: HTMLElement, styles: Record<string, string>): void {
  for (const [k, v] of Object.entries(styles)) el.style.setProperty(k, v);
}
const c01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ss = (v: number) => {
  const x = c01(v);
  return x * x * (3 - 2 * x);
};

type Props = {
  spec: CardPinSpec;
  /** Pin mode (DESKTOP_FINE, the boot gate, travel). false: a paused boot
   *  (the kraken button still works; nothing else runs). */
  pinned: boolean;
  live: boolean;
  raw: MotionValue<number>;
  t: MotionValue<number>;
  b: MotionValue<number>;
  kraken: MotionValue<number>;
  section: RefObject<HTMLElement | null>;
  pinEl: RefObject<HTMLDivElement | null>;
  content: RefObject<HTMLDivElement | null>;
  frame: HTMLDivElement | null;
  choreo: Variant;
  push: Variant;
  title: Variant;
  shape: Variant;
  choice: VariantChoice | null;
  onUi: (ui: PinUi) => void;
};

export function CardP3(props: Props) {
  const { spec, pinned, live, raw, t, b, kraken, section, pinEl, content, frame, choreo, push, title, choice, onUi } = props;
  const [tier, setTier] = useState<GlTier | null>(null);
  const tierRef = useRef<GlTier | null>(null);
  const liveRef = useRef(live);
  const frameRef = useRef<HTMLDivElement | null>(frame);
  const tipRef = useRef<HTMLDivElement>(null);
  const massRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    tierRef.current = tier;
    liveRef.current = live;
    frameRef.current = frame;
  });

  // the frames' pin-mode pieces (CardShell goes live once they are in)
  useEffect(() => {
    onUi(UI);
  }, [onUi]);

  const active = pinned && live;
  const pushSpec = spec.push[choreo][push];
  useDamping(raw, t, pinned);
  usePhase(t, section, active);
  usePush(b, content, active, pushSpec);
  useIris(t, content, active, spec);
  useCrossings(t, spec, pinned, liveRef, tierRef, frameRef);
  useStars(pinEl, pinned);
  useKraken(spec, pinned, liveRef, raw, t, kraken, section, pinEl, content, tipRef, massRef);

  const glSpec = useMemo<GlCardSpec | null>(() => {
    const d = spec.gl[choreo];
    return d ? { ...d, choice: choice ?? undefined, kraken: spec.kind === "seam" ? kraken : undefined } : null;
  }, [spec, choreo, choice, kraken]);

  if (!frame) return null;
  return createPortal(
    <>
      {pinned && glSpec ? <GlGate spec={glSpec} p={t} live={live} onTier={setTier} /> : null}
      {active && pushSpec.seq ? (
        <SeqCanvas seq={pushSpec.seq} b={b} push={pushSpec} mine={spec.toPlate[choreo] === pushSpec.seq.plate} />
      ) : null}
      {active && title === "default" ? <TitleMask t={t} text={spec.title.text} origin={spec.title.origin} /> : null}
      {active && title === "alt" ? <Bars t={t} /> : null}
      {active && spec.shape ? <ShapeLayer t={t} shape={spec.shape} /> : null}
      {pinned ? spec.weather.map((w) => <WeatherCue key={w.beat} w={w} t={t} live={live} />) : null}
      {spec.kind === "seam" ? <KrakenLayer tipRef={tipRef} massRef={massRef} at={spec.kraken?.at ?? [0.62, 0.62]} /> : null}
    </>,
    frame,
  );
}

/* — the director's hooks ———————————————————————————————————————————— */

function useDamping(raw: MotionValue<number>, t: MotionValue<number>, on: boolean) {
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    let last = 0;
    let snapUntil = 0;
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };
    const tick = (now: number) => {
      const r = raw.get();
      const dt = last ? Math.min(0.064, (now - last) / 1000) : 1 / 60;
      last = now;
      const v = t.get();
      let n = v + (r - v) * (1 - Math.exp(-cardPin.lambda * dt));
      if (Math.abs(r - n) <= cardPin.eps) n = r;
      t.set(n);
      if (n === r) stop();
      else raf = requestAnimationFrame(tick);
    };
    const follow = (r: number) => {
      if (motionOffNow() || performance.now() < snapUntil) {
        stop();
        t.set(r);
        return;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    t.set(raw.get());
    const offRaw = raw.on("change", follow);
    const offJump = onEvent("scroll:jump", (d) => {
      if (!d.immediate) return;
      // the jump scrolled synchronously; p_raw follows on the next scroll
      snapUntil = performance.now() + 400;
      follow(raw.get());
    });
    return () => {
      offRaw();
      offJump();
      stop();
    };
  }, [raw, t, on]);
}

const phaseOf = (v: number) => (v >= cardPin.titleOut ? "e" : v >= cardPin.titleIn ? "m" : v >= cardPin.b[0] ? "b" : "a");

function usePhase(t: MotionValue<number>, section: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    if (!active) {
      el.removeAttribute("data-card-phase");
      return;
    }
    let cur = "";
    const set = (v: number) => {
      const ph = phaseOf(v);
      if (ph === cur) return;
      cur = ph;
      el.setAttribute("data-card-phase", ph);
    };
    set(t.get());
    const off = t.on("change", set);
    return () => {
      off();
      el.removeAttribute("data-card-phase");
    };
  }, [t, section, active]);
}

function usePush(b: MotionValue<number>, content: RefObject<HTMLDivElement | null>, active: boolean, spec: PushSpec) {
  useEffect(() => {
    const el = content.current;
    if (!el || !active) return;
    const [s0, s1] = spec.scale;
    css(el, { "transform-origin": `${(spec.origin[0] * 100).toFixed(3)}% ${(spec.origin[1] * 100).toFixed(3)}%` });
    let moving = false;
    const write = (v: number) => {
      const s = s0 + (s1 - s0) * c01(v);
      css(el, { transform: s === 1 ? "" : `scale(${s.toFixed(5)})` });
      // promoted only while the camera moves (re-rastered crisp at rest)
      const m = v > 0 && v < 1;
      if (m !== moving) {
        moving = m;
        css(el, { "will-change": m ? "transform" : "" });
      }
    };
    write(b.get());
    const off = b.on("change", write);
    return () => {
      off();
      css(el, { transform: "", "transform-origin": "", "will-change": "" });
    };
  }, [b, content, active, spec]);
}

/** The opening's css-tier iris (mask-on-transform). opening-plate.tsx
 *  renders `[data-iris] > [data-iris-inner]` + `[data-iris-rim]` as plain
 *  frame-sized boxes; this writes their geometry while live. */
function useIris(t: MotionValue<number>, content: RefObject<HTMLDivElement | null>, active: boolean, spec: CardPinSpec) {
  useEffect(() => {
    const iris = spec.iris;
    const outer = content.current?.querySelector<HTMLElement>("[data-iris]");
    const inner = outer?.querySelector<HTMLElement>("[data-iris-inner]");
    const rim = content.current?.querySelector<HTMLElement>("[data-iris-rim]");
    if (!active || !iris || !outer || !inner) return;
    const [cx, cy] = iris.center;
    const R = iris.r1;
    const box = {
      left: `${((cx - R / A) * 100).toFixed(3)}%`,
      top: `${((cy - R) * 100).toFixed(3)}%`,
      width: `${(((2 * R) / A) * 100).toFixed(3)}%`,
      height: `${(2 * R * 100).toFixed(3)}%`,
      right: "auto",
      bottom: "auto",
      "transform-origin": "50% 50%",
      "will-change": "transform",
    };
    const disc = "radial-gradient(closest-side, #000 calc(100% - 1.5px), transparent 100%)";
    css(outer, { ...box, "mask-image": disc, "-webkit-mask-image": disc });
    css(inner, {
      left: `${((-(cx - R / A) / ((2 * R) / A)) * 100).toFixed(3)}%`,
      top: `${((-(cy - R) / (2 * R)) * 100).toFixed(3)}%`,
      width: `${((A / (2 * R)) * 100).toFixed(3)}%`,
      height: `${((1 / (2 * R)) * 100).toFixed(3)}%`,
      right: "auto",
      bottom: "auto",
      "transform-origin": `${(cx * 100).toFixed(3)}% ${(cy * 100).toFixed(3)}%`,
      "will-change": "transform",
    });
    if (rim) css(rim, { ...box, display: "block" });
    const write = (v: number) => {
      // the radius grows geometrically, eased (the GL iris' curve)
      const e = ss(v);
      const s = (iris.r0 * Math.pow(R / iris.r0, e)) / R;
      css(outer, { transform: `scale(${s.toFixed(5)})` });
      css(inner, { transform: `scale(${(1 / s).toFixed(5)})` });
      if (rim) css(rim, { transform: `scale(${s.toFixed(5)})`, opacity: v >= 1 ? "0" : "1" });
    };
    // the frames' p is star (a)'s progress (0 → 1 over p 0–.45)
    const pa = (v: number) => remap(v, spec.a[0], spec.a[1]);
    write(pa(t.get()));
    const off = t.on("change", (v) => write(pa(v)));
    return () => {
      off();
      for (const el of [outer, inner, rim]) el?.removeAttribute("style");
    };
  }, [t, content, active, spec]);
}

function useCrossings(
  t: MotionValue<number>,
  spec: CardPinSpec,
  pinned: boolean,
  liveRef: RefObject<boolean>,
  tierRef: RefObject<GlTier | null>,
  frameRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!pinned) return;
    let prev = t.get();
    let snapUntil = 0;
    const offJump = onEvent("scroll:jump", (d) => {
      if (d.immediate) snapUntil = performance.now() + 400;
    });
    const off = t.on("change", (v) => {
      const go = liveRef.current && performance.now() >= snapUntil && !motionOffNow();
      if (go && prev < spec.meet && v >= spec.meet) emit("transition:meet", { card: spec.kind });
      if (go && prev < spec.impact.at && v >= spec.impact.at) {
        const el = frameRef.current ?? undefined;
        // the GL tier pulses its own flash / bloom (uFlash, on `impact`)
        const gl = tierRef.current === "gl";
        const i = spec.impact;
        const fired = impact(spec.world, {
          el,
          shake: i.shake,
          flash: gl ? 0 : i.flash,
          bloomEv: gl ? 0 : i.bloomEv,
        });
        if (fired && i.puff && el) chalkPuff(el);
      }
      prev = v;
    });
    return () => {
      off();
      offJump();
    };
  }, [t, spec, pinned, liveRef, tierRef, frameRef]);
}

/** The seam's impact: a chalk-dust puff where the duster slaps (no flash):
 *  ≤ 10 chalk specks burst from the meet row and settle, 600 ms, WAAPI
 *  transform / opacity, then removed. */
function chalkPuff(frame: HTMLElement) {
  if (typeof document === "undefined") return;
  const host = document.createElement("span");
  host.setAttribute("aria-hidden", "true");
  host.className = "act-card-puff";
  frame.appendChild(host);
  const n = 10;
  let left = n;
  const done = () => {
    if (--left <= 0) host.remove();
  };
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    const a = (i / n) * Math.PI * 2 + 0.4 * Math.sin(i * 7.1);
    const r = 26 + 22 * ((i * 37) % 7) / 6;
    s.style.left = `${50 + 6 * Math.cos(a)}%`;
    s.style.top = `${47 + 10 * Math.sin(a)}%`;
    host.appendChild(s);
    if (typeof s.animate !== "function") {
      done();
      continue;
    }
    const k = s.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.6)", opacity: 0 },
        { transform: `translate(calc(-50% + ${(Math.cos(a) * r).toFixed(1)}px), calc(-50% + ${(Math.sin(a) * r * 0.6).toFixed(1)}px)) scale(1)`, opacity: 0.8, offset: 0.3 },
        { transform: `translate(calc(-50% + ${(Math.cos(a) * r * 1.5).toFixed(1)}px), calc(-50% + ${(Math.sin(a) * r + 14).toFixed(1)}px)) scale(1.3)`, opacity: 0 },
      ],
      { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    k.onfinish = done;
    k.oncancel = done;
  }
}

function useStars(pinEl: RefObject<HTMLDivElement | null>, pinned: boolean) {
  useEffect(() => {
    const host = pinEl.current;
    if (!host || !pinned) return;
    const offs = [...host.querySelectorAll<HTMLElement>("[data-card-beat][data-beat-star]")].map((el) => {
      const w = Number(el.getAttribute("data-beat-weight"));
      return spotlight.registerScrollStar(el.getAttribute("data-beat") ?? "", el, w === 3 ? 3 : w === 2 ? 2 : 1);
    });
    return () => offs.forEach((f) => f());
  }, [pinEl, pinned]);
}

/* — the kraken (pc-kraken, §9.1 #6) ———————————————————————————————————— */

const KRAKEN_MS = 1500;
const DWELL_MS = 2000;

function useKraken(
  spec: CardPinSpec,
  pinned: boolean,
  liveRef: RefObject<boolean>,
  raw: MotionValue<number>,
  t: MotionValue<number>,
  kraken: MotionValue<number>,
  section: RefObject<HTMLElement | null>,
  pinEl: RefObject<HTMLDivElement | null>,
  content: RefObject<HTMLDivElement | null>,
  tipRef: RefObject<HTMLDivElement | null>,
  massRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (spec.kind !== "seam") return;
    const sec = section.current;
    const btn = sec?.querySelector<HTMLButtonElement>("[data-kraken]");
    let timer = 0;
    let running = false;
    let looked = false;

    const count = () => {
      triggerEgg("hidden-kraken");
      void import("@/lib/hunt").then((m) => m.markFound("pc-kraken")).catch(() => {});
    };

    const staticTip = () => {
      const tip = tipRef.current;
      if (!tip) return;
      tip.setAttribute("data-shown", "static");
      window.setTimeout(() => tip.removeAttribute("data-shown"), 4000);
    };

    const swell = () => {
      const tip = tipRef.current;
      const mass = massRef.current;
      const plate = content.current;
      const ms = KRAKEN_MS;
      void animate(kraken, [0, 1, 0], { duration: ms / 1000, ease: "easeInOut" });
      if (tip && typeof tip.animate === "function") {
        tip.setAttribute("data-shown", "");
        const a = tip.animate(
          [
            { transform: "translate(-50%, 40%) rotate(-6deg)", opacity: 0 },
            { transform: "translate(-50%, -18%) rotate(4deg)", opacity: 1, offset: 0.4 },
            { transform: "translate(-50%, -10%) rotate(-2deg)", opacity: 1, offset: 0.6 },
            { transform: "translate(-50%, 45%) rotate(-8deg)", opacity: 0 },
          ],
          { duration: ms, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
        );
        a.onfinish = a.oncancel = () => tip.removeAttribute("data-shown");
      }
      // css tier: the sea heaves (a transform on the frame's content) and
      // a dark mass rises under the foam (opacity); GL draws uKraken itself
      mass?.animate([{ opacity: 0 }, { opacity: 0.42, offset: 0.45 }, { opacity: 0 }], { duration: ms, easing: "ease-in-out" });
      if (plate && !plate.closest("[data-gl='on']")) {
        plate.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.022) translateY(-0.6%)", offset: 0.45 }, { transform: "scale(1)" }],
          { duration: ms, easing: "ease-in-out", composite: "add" },
        );
      }
    };

    const play = async () => {
      if (running) return;
      running = true;
      try {
        if (motionOffNow() || !pinned || !liveRef.current) {
          staticTip();
          count();
          return;
        }
        // past the storm: bring the card back to p .02 first, then play
        if (t.get() > cardPin.hook) {
          const pin = pinEl.current;
          const stage = pin?.querySelector<HTMLElement>("[data-card-stage]");
          if (pin && stage) {
            const travel = Math.max(0, pin.offsetHeight - stage.offsetHeight);
            const top = pin.getBoundingClientRect().top + window.scrollY;
            await scrollToTarget(top + 0.02 * travel);
          }
        }
        swell();
        count();
        await new Promise((r) => window.setTimeout(r, KRAKEN_MS));
      } finally {
        running = false;
      }
    };

    const onClick = () => void play();
    btn?.addEventListener("click", onClick);

    // a long look: pinned on the storm (p ≤ .05) and still for 2.0 s
    const watch = () => {
      window.clearTimeout(timer);
      if (looked || !pinned || !liveRef.current || motionOffNow()) return;
      if (raw.get() > cardPin.hook) return;
      const top = pinEl.current?.getBoundingClientRect().top ?? 1;
      if (top > 0.5) return;
      timer = window.setTimeout(() => {
        looked = true;
        void play();
      }, DWELL_MS);
    };
    const off = raw.on("change", watch);
    watch();
    return () => {
      off();
      window.clearTimeout(timer);
      btn?.removeEventListener("click", onClick);
    };
  }, [spec.kind, pinned, liveRef, raw, t, kraken, section, pinEl, content, tipRef, massRef]);
}

/** The tentacle tip (ours; it wraps nothing, IC-PC-05) above the canvas,
 *  and the css tier's dark mass under the foam (GL draws its own swell). */
function KrakenLayer({
  tipRef,
  massRef,
  at,
}: {
  tipRef: RefObject<HTMLDivElement | null>;
  massRef: RefObject<HTMLDivElement | null>;
  at: readonly [number, number];
}) {
  const pos = { left: `${(at[0] * 100).toFixed(2)}%`, top: `${(at[1] * 100).toFixed(2)}%` };
  return (
    <>
      <div ref={massRef} aria-hidden="true" className="act-card-kraken-mass" data-gl-replaced="" style={pos} />
      <div ref={tipRef} aria-hidden="true" className="act-card-kraken-tip" style={pos}>
        <svg viewBox="0 0 60 120" focusable="false">
          <path
            d="M30 120C22 96 14 78 18 58C22 38 36 30 40 18C43 9 38 2 31 3C26 4 25 10 29 12C33 14 34 9 32 8"
            fill="none"
            stroke="#1b2a2c"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d="M30 120C22 96 14 78 18 58C22 38 36 30 40 18C43 9 38 2 31 3C26 4 25 10 29 12"
            fill="none"
            stroke="#3d5552"
            strokeWidth={9}
            strokeLinecap="round"
          />
          {[86, 70, 54, 40].map((y, i) => (
            <circle key={y} cx={i % 2 ? 17 : 21} cy={y} r={2.4 - i * 0.3} fill="#9fb3ad" fillOpacity={0.7} />
          ))}
        </svg>
      </div>
    </>
  );
}

/* — frame layers ——————————————————————————————————————————————————————— */

/** The act title as a mask, css tier (§8.1): a deep rect with the title
 *  cut out, faded in at p .68 (the frame outside the letters collapses to
 *  the world deep) and zoomed ×1 → ×6 about the title's mask origin by
 *  transform (no will-change: Chrome re-rasters it crisp), then crossfaded
 *  to the full frame (.92–1). aria-hidden: the card's h2 carries the text.
 *  The SVG is stretched over the frame (preserveAspectRatio none): the
 *  pinned frame is always 2.39:1, the viewBox's own ratio. */
const VB_W = 2390;
const VB_H = 1000;
type TitleFit = { size: number; base: number; origin: readonly [number, number] };
/** The title's size and zoom origin, as the GL title sets it (lib/gl/plan.ts
 *  `titleXf`): cap = 20 % of the frame height, the ink ≤ 72 % of its width,
 *  centred; the origin is `maskOrigin` in the title's INK box (cap top →
 *  ink bottom), measured with the face's own metrics. */
function fitTitle(el: SVGTextElement, text: string, origin: readonly [number, number]): TitleFit | null {
  const cs = getComputedStyle(el);
  const c = document.createElement("canvas").getContext("2d");
  if (!c) return null;
  const face = (px: number) => `${cs.fontStyle} ${cs.fontWeight} ${px}px ${cs.fontFamily}`;
  c.font = face(100);
  const capR = (c.measureText("H").actualBoundingBoxAscent || 70) / 100;
  const m = c.measureText(text);
  const inkR = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / 100;
  if (!(inkR > 0)) return null;
  const size = Math.min((0.2 * VB_H) / capR, (0.72 * VB_W) / inkR);
  const cap = capR * size;
  const base = VB_H / 2 + cap / 2;
  // text-anchor middle centres the ADVANCE: the ink sits from its left bearing
  const x0 = VB_W / 2 - (m.width / 100) * size * 0.5 - (m.actualBoundingBoxLeft / 100) * size;
  const x1 = x0 + inkR * size;
  const y0 = base - cap;
  const y1 = base + (m.actualBoundingBoxDescent / 100) * size;
  return { size, base, origin: [(x0 + origin[0] * (x1 - x0)) / VB_W, (y0 + origin[1] * (y1 - y0)) / VB_H] };
}

function TitleMask({ t, text, origin }: { t: MotionValue<number>; text: string; origin: readonly [number, number] }) {
  const id = useId();
  const textRef = useRef<SVGTextElement>(null);
  const [fit, setFit] = useState<TitleFit>({ size: 280, base: VB_H / 2 + 100, origin: [0.5, 0.5] });
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const f = fitTitle(el, text, origin);
      if (f) setFit(f);
    };
    measure();
    // the world face may still be swapping in (lib/world-fonts.ts)
    void document.fonts?.ready.then(measure);
    return () => {
      cancelled = true;
    };
  }, [origin, text]);
  const opacity = useTransform(t, (v) => Math.min(remap(v, cardPin.titleIn, cardPin.titleIn + 0.06), 1 - remap(v, cardPin.titleOut, 1)));
  const scale = useTransform(t, (v) => {
    const k = remap(v, cardPin.titleIn, 1);
    // legible first, then the zoom accelerates (the GL title's t³ curve)
    return Math.pow(6, k * k * k);
  });
  return (
    <motion.svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="act-card-title-mask"
      data-gl-replaced=""
      style={{
        opacity,
        scale,
        transformOrigin: `${(fit.origin[0] * 100).toFixed(2)}% ${(fit.origin[1] * 100).toFixed(2)}%`,
      }}
    >
      <defs>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={0} y={0} width={VB_W} height={VB_H}>
          <rect width={VB_W} height={VB_H} fill="#fff" />
          <text
            ref={textRef}
            x={VB_W / 2}
            y={fit.base}
            textAnchor="middle"
            fontSize={fit.size}
            fill="#000"
            className="act-card-title-mask-text"
          >
            {text}
          </text>
        </mask>
      </defs>
      <rect width={VB_W} height={VB_H} fill="var(--bg)" mask={`url(#${id}m)`} />
    </motion.svg>
  );
}

/** title.mask ALT: plain bars opening (no mask) — two deep bands inside the
 *  frame close in over .60–.68 and open off the frame by p 1 (scaleY,
 *  transform only); the lower bar's h2 rises again (cards.css). */
function Bars({ t }: { t: MotionValue<number> }) {
  const opacity = useTransform(t, (v) => remap(v, cardPin.titleIn - 0.08, cardPin.titleIn));
  const scaleY = useTransform(t, (v) => 1 - ss(remap(v, cardPin.titleIn, 1)));
  return (
    <motion.div aria-hidden="true" className="act-card-bars" style={{ opacity }}>
      <motion.span className="act-card-bar" data-bar="top" style={{ scaleY }} />
      <motion.span className="act-card-bar" data-bar="bottom" style={{ scaleY }} />
    </motion.div>
  );
}

/** The css tier's carried shape (§7.3): the static SVG of the incoming
 *  shape on the meet row, shown over its range (never animated: it is
 *  simply there, by state). */
function ShapeLayer({ t, shape }: { t: MotionValue<number>; shape: NonNullable<CardPinSpec["shape"]> }) {
  const [on, setOn] = useState(false);
  useMotionValueEvent(t, "change", (v) => setOn(v >= shape.range[0] && v < shape.range[1]));
  const w = (shape.size / A) * 100;
  return (
    <div
      aria-hidden="true"
      className="act-card-shape"
      data-gl-replaced=""
      data-on={on ? "" : undefined}
      style={{
        left: `${(shape.at[0] * 100 - w / 2).toFixed(2)}%`,
        top: `${((shape.at[1] - shape.size / 2) * 100).toFixed(2)}%`,
        width: `${w.toFixed(2)}%`,
      }}
    >
      <CarriedShape shape={shape.id} className="size-full" />
    </div>
  );
}

/** Weather in the card frame (§7.7; WeatherLayer is W2-PLATES'): on over
 *  its beat's range, confined to the frame (never over text). */
function WeatherCue({ w, t, live }: { w: PinWeather; t: MotionValue<number>; live: boolean }) {
  const inRange = (v: number) => v >= w.range[0] && v <= w.range[1];
  const [on, setOn] = useState(() => inRange(t.get()));
  useMotionValueEvent(t, "change", (v) => setOn(inRange(v)));
  return (
    <div aria-hidden="true" className="act-card-weather" data-on={on && live ? "" : undefined} {...beatAttrs(w.beat)}>
      {live ? <WeatherLayer kind={w.kind} zone="frame" /> : null}
    </div>
  );
}

/** Push-in #3 DEFAULT: SEQ-HALL on the card canvas (§6.2): its frames
 *  (blobs + a decoded window, useFrameSequence's window mode) fetched once
 *  the card is within one viewport, drawn in the hall's registered crop
 *  (frame 0 = that still) by star (b)'s progress, under the same code scale
 *  as the frame's content. Shown only over its own still; a frame that is
 *  not decoded yet leaves the still showing. */
function SeqCanvas({
  seq,
  b,
  push,
  mine,
}: {
  seq: NonNullable<PushSpec["seq"]>;
  b: MotionValue<number>;
  push: PushSpec;
  /** The frame settles on the sequence's own first-frame still. */
  mine: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const index = useRef(0);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setNear(Boolean(e?.isIntersecting)), { rootMargin: "100% 0px 100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const urls = mine ? seq.frames : EMPTY;
  const fs = useFrameSequence(urls, near && urls.length > 0, { window: 12, index });
  const frameAt = fs.frameAt;
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !urls.length) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    const [s0, s1] = push.scale;
    c.style.transformOrigin = `${push.origin[0] * 100}% ${push.origin[1] * 100}%`;
    const draw = () => {
      raf = 0;
      const v = b.get();
      const i = Math.round(c01(v) * (urls.length - 1));
      index.current = i;
      const img = v > 0 ? frameAt(i) : null;
      c.style.opacity = img ? "1" : "0";
      c.style.transform = `scale(${(s0 + (s1 - s0) * c01(v)).toFixed(5)})`;
      if (!img) return;
      const W = c.width;
      const H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, seq.box.l * W, seq.box.t * H, seq.box.w * W, seq.box.h * H);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const fit = () => {
      c.width = Math.max(1, Math.round(c.clientWidth * dpr));
      c.height = Math.max(1, Math.round(c.clientHeight * dpr));
      schedule();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    const off = b.on("change", schedule);
    return () => {
      off();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [b, push, seq.box, urls, frameAt, fs.decoded]);
  return <canvas ref={ref} aria-hidden="true" className="act-card-seq" data-seq={seq.id} />;
}
const EMPTY: readonly string[] = [];

/* — the frames' pin-mode pieces (pin.ui) ———————————————————————————— */

/** Inside a frame's settled PlateBox: the rack-focus soft copy (the ALT
 *  pushes of the opening and the seam: the soft rung crossfades to the
 *  sharp plate over p .44–.64, never a blur) and, from star (b), the
 *  plate's registered loop (MediaFrame shows its poster — the plate itself
 *  — until the video plays, so it is seamless). The loop never plays under
 *  the GL settle (p < .50; W2-GL), and plays under the DecoderLock. */
function PlateLayers({ plate, loop = true }: { plate: string; loop?: boolean }) {
  const { live, pin } = useCard();
  const t = pin?.t;
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!t) return;
    const f = (v: number) => setOn((prev) => (v >= cardPin.b[0] ? true : v < cardPin.settle[0] ? false : prev));
    f(t.get());
    return t.on("change", f);
  }, [t]);
  if (!pin || !isMediaId(plate)) return null;
  const rack = pin.push === "alt" && (pin.kind === "opening" || pin.kind === "seam");
  const loops = loop && (pin.kind === "opening" || pin.kind === "seam" || (pin.kind === "ignite" && pin.push === "alt"));
  const loopId = loops ? loopFor(plate) : null;
  return (
    <>
      {loopId && live && on ? (
        <div className="absolute inset-0" data-plate-loop="">
          <MediaFrame media={loopId} layout="fill" playOn="desktop" loader={false} sizes="100vw" />
        </div>
      ) : null}
      {rack && live ? <RackSoft plate={plate} t={pin.t} /> : null}
    </>
  );
}

function RackSoft({ plate, t }: { plate: string; t: MotionValue<number> }) {
  const asset = isMediaId(plate) ? resolveMedia(plate) : null;
  const opacity = useTransform(t, (v) => Math.min(remap(v, 0.44, 0.5), 1 - remap(v, 0.5, 0.64)));
  if (!asset || asset.kind !== "image") return null;
  const h = Math.max(1, Math.round((384 * asset.height) / asset.width));
  const { props } = getImageProps({ src: asset.src, alt: "", width: 384, height: h, quality: 50 });
  const src = props.srcSet?.split(", ")[0]?.split(" ")[0] || props.src;
  return (
    // the 384 px rung stretched over the sharp plate (never `filter`)
    <motion.img src={src} alt="" aria-hidden="true" className="absolute inset-0 size-full max-w-none" style={{ opacity }} />
  );
}

const UI: PinUi = { PlateLayers };
