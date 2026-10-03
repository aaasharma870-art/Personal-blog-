"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { getImageProps } from "next/image";
import { beatAttrs } from "@/lib/beats";
import { emit, on as onEvent } from "@/lib/events";
import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import type { GlTier } from "@/lib/gl/support";
import type { GlCardSpec } from "@/lib/gl/types";
import { impact, trackImpactAnim } from "@/lib/impact";
import { loopFor } from "@/lib/loops";
import { isMediaId, resolveMedia } from "@/lib/media";
import { cardPin } from "@/lib/motion";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { spotlight } from "@/lib/spotlight";
import { useVariant } from "@/lib/use-variant";
import type { Variant, VariantChoice } from "@/lib/variants";
import { eggEnabled, eggsSessionOff, triggerEgg } from "@/components/eggs/egg-bus";
import { GlGate } from "@/components/gl/gl-gate";
import { MediaFrame } from "@/components/primitives/media-frame";
import { remap } from "@/components/primitives/loaders/line";
import { CarriedShape } from "@/components/stage/carried-shape";
import { hideWhenFar } from "@/components/stage/far";
import { WeatherLayer } from "@/components/stage/weather-layer";
// the pin chunk's own layers (phases, GL-replaced layers, title mask, bars,
// shape, weather, SEQ canvas, puff, kraken mass + tip): loaded with this
// lazy chunk, not with the page (first-load CSS budget, W2 assembly)
import "@/app/p3/cards-pin.css";
import { useFrameSequence } from "@/components/worlds/pirates/use-frame-sequence";
import { useCard, type PinState, type PinUi } from "@/components/sections/act-card/card-context";
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
  /** p_raw over the travel, and the approach (the card's top entering →
   *  at the top), both CardShell's useScroll on the pin wrapper. */
  raw: MotionValue<number>;
  enter: MotionValue<number>;
  section: RefObject<HTMLElement | null>;
  pinEl: RefObject<HTMLDivElement | null>;
  /** The pin wrapper as a node (the stars' markers portal into it). */
  pinNode: HTMLDivElement | null;
  content: RefObject<HTMLDivElement | null>;
  frame: HTMLDivElement | null;
  choreo: Variant;
  choice: VariantChoice | null;
  /** Hands CardShell the pin's drivers (null on unmount / not pinned). */
  onPin: (pin: PinState | null) => void;
};

export function CardP3(props: Props) {
  const { spec, pinned, live, raw, enter, section, pinEl, pinNode, content, frame, choreo, choice, onPin } = props;
  // the DAMPED p (useDamping owns its one rAF), its stars, the kraken swell
  const t = useMotionValue(0);
  const kraken = useMotionValue(0);
  const a = useTransform(t, (v) => remap(v, spec.a[0], spec.a[1]));
  const b = useTransform(t, (v) => remap(v, cardPin.b[0], cardPin.b[1]));
  const push = useVariant(choice, `card-${spec.kind}.push`);
  const title = useVariant(choice, "title.mask");
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

  // the frames' drivers and pieces (CardShell goes live once they are in)
  useEffect(() => {
    onPin(pinned ? { kind: spec.kind, t, a, b, enter, kraken, ui: UI, push, title } : null);
    return () => onPin(null);
  }, [onPin, pinned, spec.kind, t, a, b, enter, kraken, push, title]);
  // the title-mask variant for the lower bar's states (cards.css)
  useEffect(() => {
    const el = section.current;
    if (!el || !pinned) return;
    el.setAttribute("data-title-mask", title);
    return () => el.removeAttribute("data-title-mask");
  }, [section, pinned, title]);

  const active = pinned && live;
  const pushSpec = spec.push[choreo][push];
  useDebugHandle(spec.kind, pinned, raw, t, tierRef);
  const stars = useMemo(
    () => spec.beats.filter((x) => x.weight != null).map((x) => [x.from, x.to] as const).sort((x, y) => x[0] - y[0]),
    [spec.beats],
  );
  useDamping(raw, t, pinned, stars);
  usePhase(t, section, active);
  usePush(b, content, active, pushSpec);
  useIris(t, content, active, spec, choreo);
  useCrossings(t, spec, pinned, liveRef, tierRef, frameRef);
  useStars(pinNode, pinned);
  useFarFrame(frame, pinned);
  useExitDip(pinEl, frame, active && spec.kind !== "opening");
  useHeroCover(spec.kind, pinned, enter);
  useKraken(spec, pinned, liveRef, raw, t, kraken, section, pinEl, content, tipRef, massRef);

  const glSpec = useMemo<GlCardSpec | null>(() => {
    const d = spec.gl[choreo];
    return d ? { ...d, choice: choice ?? undefined, kraken: spec.kind === "seam" ? kraken : undefined } : null;
  }, [spec, choreo, choice, kraken]);

  const layers = (
    <>
      {pinned && glSpec ? <GlGate spec={glSpec} p={t} live={live} onTier={setTier} /> : null}
      {active && pushSpec.seq ? (
        <SeqCanvas seq={pushSpec.seq} b={b} push={pushSpec} mine={spec.toPlate[choreo] === pushSpec.seq.plate} />
      ) : null}
      {active && title === "default" ? <TitleMask t={t} text={spec.title.text} zoom={spec.title.zoom ?? 1.3} /> : null}
      {active && title === "alt" ? <Bars t={t} /> : null}
      {active && spec.shape ? <ShapeLayer t={t} shape={spec.shape} /> : null}
      {pinned ? spec.weather.map((w) => <WeatherCue key={w.beat} w={w} t={t} live={live} />) : null}
      {spec.kind === "seam" ? <KrakenLayer tipRef={tipRef} massRef={massRef} at={spec.kraken?.at ?? [0.62, 0.62]} /> : null}
    </>
  );
  return (
    <>
      {pinned && pinNode ? createPortal(<BeatMarkers beats={spec.beats} />, pinNode) : null}
      {frame ? createPortal(layers, frame) : null}
    </>
  );
}

/** The two stars' (and the impact's) markers on the pin spacer: the boxes
 *  the beats probe and the spotlight measure (cards.css places them at
 *  50svh + p × travel, boot gate only). */
function BeatMarkers({ beats }: { beats: CardPinSpec["beats"] }) {
  return (
    <>
      {beats.map((b) => (
        <span
          key={b.id}
          aria-hidden="true"
          className="act-card-beat"
          data-card-beat=""
          style={{ "--b0": b.from, "--b1": b.to } as CSSProperties}
          {...beatAttrs(b.id, b.weight ? { weight: b.weight } : undefined)}
        />
      ))}
    </>
  );
}

/* — the director's hooks ———————————————————————————————————————————— */

/** `?debug=cards` (and /lab): window.__cards[kind] = { raw(), t(), tier() }
 *  for tools/capture/probes/cards.mjs. */
function useDebugHandle(kind: string, pinned: boolean, raw: MotionValue<number>, t: MotionValue<number>, tierRef: RefObject<GlTier | null>) {
  useEffect(() => {
    if (!pinned || !(/[?&]debug=[^&]*cards/.test(window.location.search) || window.location.pathname.startsWith("/lab"))) return;
    const w = window as Window & { __cards?: Record<string, { raw(): number; t(): number; tier(): GlTier | null }> };
    const all = (w.__cards ??= {});
    all[kind] = { raw: () => raw.get(), t: () => t.get(), tier: () => tierRef.current };
    return () => {
      delete all[kind];
    };
  }, [kind, pinned, raw, t, tierRef]);
}

/** Cap a damped step (v → n) inside the scroll stars: at most a star's span
 *  per `starMinS`, so a skimmer's fling still shows each star ≥ 400 ms
 *  (spec P3-6 #2). Stars are sorted by `from`; walked in the step's
 *  direction, the first one the step overlaps binds it. */
function starCap(v: number, n: number, dt: number, stars: readonly (readonly [number, number])[]): number {
  if (n === v || !stars.length) return n;
  const fwd = n > v;
  for (let k = 0; k < stars.length; k++) {
    const [s0, s1] = stars[fwd ? k : stars.length - 1 - k];
    const span = s1 - s0;
    if (!(span > 0) || Math.max(v, n) <= s0 || Math.min(v, n) >= s1) continue;
    const max = (span / cardPin.starMinS) * dt;
    return fwd ? Math.min(n, Math.max(v, s0) + max) : Math.max(n, Math.min(v, s1) - max);
  }
  return n;
}

function useDamping(raw: MotionValue<number>, t: MotionValue<number>, on: boolean, stars: readonly (readonly [number, number])[]) {
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    let last = 0;
    let snapUntil = 0;
    let prevRaw = raw.get();
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };
    const snap = (r: number) => {
      stop();
      t.set(r);
    };
    const tick = (now: number) => {
      const r = raw.get();
      // real time, capped (a hidden tab's gap is not a fling)
      const dt = last ? Math.min(cardPin.dtMax, (now - last) / 1000) : 1 / 60;
      last = now;
      const v = t.get();
      let n = starCap(v, v + (r - v) * (1 - Math.exp(-cardPin.lambda * dt)), dt, stars);
      if (Math.abs(r - n) <= cardPin.eps) n = r;
      t.set(n);
      if (n === r) stop();
      else raf = requestAnimationFrame(tick);
    };
    const follow = (r: number) => {
      // a scrollbar drag, Home / End or a script's scrollTo: no catch-up
      const jumped = Math.abs(r - prevRaw) >= cardPin.jump;
      prevRaw = r;
      if (motionOffNow() || jumped || performance.now() < snapUntil) return snap(r);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    t.set(raw.get());
    const offRaw = raw.on("change", follow);
    const offJump = onEvent("scroll:jump", (d) => {
      if (!d.immediate) return;
      // the jump scrolled synchronously; p_raw follows on the next scroll
      snapUntil = performance.now() + 400;
      snap(raw.get());
    });
    // Pause / reduced motion mid-run: the loop stops in the same task
    const offMotion = onMotionOffChange(() => {
      if (motionOffNow()) snap(raw.get());
    });
    return () => {
      offRaw();
      offJump();
      offMotion();
      stop();
    };
  }, [raw, t, on, stars]);
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
function useIris(t: MotionValue<number>, content: RefObject<HTMLDivElement | null>, active: boolean, spec: CardPinSpec, choreo: Variant) {
  useEffect(() => {
    const iris = spec.iris?.[choreo];
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
  }, [t, content, active, spec, choreo]);
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
          // the bloom is drawn here with a slower decay (below)
          bloomEv: 0,
        });
        if (fired && i.puff && el) chalkPuff(el);
        if (fired && !gl && i.bloomEv && el) bloomPulse(el, i.bloomEv);
      }
      prev = v;
    });
    return () => {
      off();
      offJump();
    };
  }, [t, spec, pinned, liveRef, tierRef, frameRef]);
}

/** The ignite's impact on the css tier (§7.6 Lumos): an exposure bloom — a
 *  warm-white additive overlay pulse of ≈ the EV's brightness that rises in
 *  ~90 ms and DECAYS over ~400 ms (P3-11 r1, J8 #5: lib/impact.ts' 180 ms
 *  pulse dropped back to dark in one frame, a cut). One pulse, never red
 *  (WCAG 2.3.1); opacity on a layer that exists only for its run;
 *  cancelled with every impact animation on Pause. */
function bloomPulse(frame: HTMLElement, ev: number) {
  if (typeof document === "undefined") return;
  const o = document.createElement("span");
  o.setAttribute("aria-hidden", "true");
  o.setAttribute("data-impact-pulse", "bloom");
  o.className = "act-card-bloom";
  frame.appendChild(o);
  const done = () => o.remove();
  if (typeof o.animate !== "function") return done();
  // +0.35 EV ≈ ×1.27 brightness: a ≈ .3 additive warm-white peak
  const peak = Math.min(0.4, (2 ** ev - 1) * 1.1);
  const a = o.animate(
    [
      { opacity: 0, easing: "cubic-bezier(0.3, 0, 0.6, 1)" },
      { opacity: peak, offset: 0.18, easing: "cubic-bezier(0.25, 0.6, 0.35, 1)" },
      { opacity: 0 },
    ],
    { duration: 520 },
  );
  a.onfinish = done;
  a.oncancel = done;
  trackImpactAnim(a);
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
    trackImpactAnim(k);
  }
}

function useStars(host: HTMLDivElement | null, pinned: boolean) {
  useEffect(() => {
    if (!host || !pinned) return;
    const offs = [...host.querySelectorAll<HTMLElement>("[data-card-beat][data-beat-star]")].map((el) => {
      const w = Number(el.getAttribute("data-beat-weight"));
      return spotlight.registerScrollStar(el.getAttribute("data-beat") ?? "", el, w === 3 ? 3 : w === 2 ? 2 : 1);
    });
    return () => offs.forEach((f) => f());
  }, [host, pinned]);
}

/** J8 #2 (P3-11 r1): a card that has not started or has finished costs
 *  nothing — its frame (aria-hidden art: plates, canvases, the GL host,
 *  weather) is out of paint while the sticky stage is more than a viewport
 *  away (components/stage/far.ts); the bars' text stays (accessible). */
function useFarFrame(frame: HTMLDivElement | null, pinned: boolean) {
  useEffect(() => (frame && pinned ? hideWhenFar(frame, 1) : undefined), [frame, pinned]);
}

/** The card's EXIT (P3-11 r1; panel J2 #4, J3 #5, J4 #7 and F5's hand-off:
 *  the lecture hall stacked over the pen, the tintype's sunset doubled by
 *  Beyond's band of the same photo): once the pin is done and the stage
 *  scrolls away, its frame dips to the card's deep while the next section's
 *  picture rises into view — gone by the time the pin's foot is at 70 % of
 *  the viewport — so one picture holds the screen at a time and the same
 *  photo is never on screen twice. Opacity only (promoted while it runs),
 *  by position (reverses exactly); not the opening, whose exit frame IS the
 *  stage's next cue. Pin mode, live only. */
function useExitDip(pinEl: RefObject<HTMLDivElement | null>, frame: HTMLDivElement | null, on: boolean) {
  const { scrollYProgress: exit } = useScroll({ target: pinEl, offset: ["end end", "end 70%"] });
  useEffect(() => {
    if (!frame || !on) return;
    let cur = -1;
    const write = (v: number) => {
      const o = v <= 0 ? 1 : 1 - ss(v);
      if (o === cur) return;
      cur = o;
      css(frame, { opacity: o >= 1 ? "" : o.toFixed(3), "will-change": o > 0 && o < 1 ? "opacity" : "" });
    };
    write(exit.get());
    const off = exit.on("change", write);
    return () => {
      off();
      css(frame, { opacity: "", "will-change": "" });
    };
  }, [exit, frame, on]);
}

/** The CONTRACT with the hero (F3, J8 #3): while the opening card's pinned
 *  stage covers the whole viewport — its pin has reached the top, so the
 *  hero is entirely above the reader — the hero carries
 *  `data-stage-covered`, and its ambient loops pause; the attribute goes
 *  the moment the pin's top comes back below the viewport's top (the hero's
 *  edge can show again). Set on the hero's `section[data-hero]` AND on its
 *  manifest wrapper (`[data-section]`, "top"): there is no
 *  `[data-section="hero"]` element. Pin mode only; removed on unmount. */
function useHeroCover(kind: CardPinSpec["kind"], pinned: boolean, enter: MotionValue<number>) {
  useEffect(() => {
    if (kind !== "opening" || !pinned) return;
    const hero = document.querySelector<HTMLElement>("section[data-hero]");
    if (!hero) return;
    const els = [hero, hero.closest<HTMLElement>("[data-section]")].filter((e): e is HTMLElement => e !== null);
    let cur = false;
    const set = (on: boolean) => {
      if (on === cur) return;
      cur = on;
      for (const el of els) {
        if (on) el.setAttribute("data-stage-covered", "");
        else el.removeAttribute("data-stage-covered");
      }
    };
    // `enter` is 1 once the pin's top is at (or above) the viewport's top
    const check = (v: number) => set(v >= 0.999);
    check(enter.get());
    const off = enter.on("change", check);
    return () => {
      off();
      set(false);
    };
  }, [kind, pinned, enter]);
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
    let timer = 0;
    let running = false;
    let looked = false;
    // every live swell piece, cancelled the moment motion goes off (§12.2)
    const anims = new Set<Animation>();
    let stopKraken: (() => void) | null = null;
    let staticTimer = 0;
    const track = (a: Animation | undefined): Animation | undefined => {
      if (!a) return a;
      anims.add(a);
      const drop = () => anims.delete(a);
      a.finished.then(drop, drop);
      return a;
    };

    const count = () => {
      // eggs off for the session (or off in the registry): the kraken still
      // shows itself, but nothing is triggered or counted (as the hotspots)
      if (eggsSessionOff() || !eggEnabled("hidden-kraken")) return;
      triggerEgg("hidden-kraken");
      void import("@/lib/hunt").then((m) => m.markFound("pc-kraken")).catch(() => {});
    };

    const staticTip = () => {
      const tip = tipRef.current;
      if (!tip) return;
      tip.setAttribute("data-shown", "static");
      window.clearTimeout(staticTimer);
      staticTimer = window.setTimeout(() => tip.removeAttribute("data-shown"), 4000);
    };

    const swell = () => {
      const tip = tipRef.current;
      const mass = massRef.current;
      const plate = content.current;
      const ms = KRAKEN_MS;
      const ctl = animate(kraken, [0, 1, 0], { duration: ms / 1000, ease: "easeInOut" });
      stopKraken = () => {
        ctl.stop();
        kraken.set(0);
      };
      if (tip && typeof tip.animate === "function") {
        tip.setAttribute("data-shown", "");
        const a = track(tip.animate(
          [
            { transform: "translate(-50%, 40%) rotate(-6deg)", opacity: 0 },
            { transform: "translate(-50%, -18%) rotate(4deg)", opacity: 1, offset: 0.4 },
            { transform: "translate(-50%, -10%) rotate(-2deg)", opacity: 1, offset: 0.6 },
            { transform: "translate(-50%, 45%) rotate(-8deg)", opacity: 0 },
          ],
          { duration: ms, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
        ));
        if (a) a.onfinish = a.oncancel = () => tip.removeAttribute("data-shown");
      }
      // css tier: the sea heaves (a transform on the frame's content) and
      // a dark mass rises under the foam (opacity); GL draws uKraken itself
      track(mass?.animate([{ opacity: 0 }, { opacity: 0.42, offset: 0.45 }, { opacity: 0 }], { duration: ms, easing: "ease-in-out" }));
      if (plate && !plate.closest("[data-gl='on']")) {
        track(
          plate.animate(
            [{ transform: "scale(1)" }, { transform: "scale(1.022) translateY(-0.6%)", offset: 0.45 }, { transform: "scale(1)" }],
            { duration: ms, easing: "ease-in-out", composite: "add" },
          ),
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
          if (pin) {
            // p_raw's own range (the pin beyond one viewport)
            const travel = Math.max(0, pin.offsetHeight - window.innerHeight);
            const top = pin.getBoundingClientRect().top + window.scrollY;
            await scrollToTarget(top + 0.02 * travel);
          }
        }
        // a Pause during the scroll-back: the static tip, as above
        if (motionOffNow()) {
          staticTip();
          count();
          return;
        }
        swell();
        count();
        await new Promise((r) => window.setTimeout(r, KRAKEN_MS));
      } finally {
        running = false;
      }
    };

    // by delegation on the section: the button (inside an EggHint) may
    // remount after this effect ran
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-kraken]")) void play();
    };
    sec?.addEventListener("click", onClick);

    // a long look: pinned on the storm (p ≤ .05) and still for 2.0 s
    const watch = () => {
      window.clearTimeout(timer);
      if (looked || !pinned || !liveRef.current || motionOffNow() || eggsSessionOff()) return;
      if (raw.get() > cardPin.hook) return;
      const top = pinEl.current?.getBoundingClientRect().top ?? 1;
      if (top > 0.5) return;
      timer = window.setTimeout(() => {
        // still eligible two seconds later (a Pause, the eggs turned off)
        if (motionOffNow() || !liveRef.current || eggsSessionOff()) return;
        looked = true;
        void play();
      }, DWELL_MS);
    };
    const off = raw.on("change", watch);
    watch();
    // Pause / reduced motion: every swell piece stops within the task
    const offMotion = onMotionOffChange(() => {
      if (!motionOffNow()) return;
      window.clearTimeout(timer);
      anims.forEach((a) => a.cancel());
      anims.clear();
      stopKraken?.();
      stopKraken = null;
      tipRef.current?.removeAttribute("data-shown");
    });
    return () => {
      off();
      offMotion();
      window.clearTimeout(timer);
      window.clearTimeout(staticTimer);
      anims.forEach((a) => a.cancel());
      stopKraken?.();
      sec?.removeEventListener("click", onClick);
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
 *  cut out. P3-11 r1 (panel J3 #1 / J4 #3, J8 #5): the old ×6 dive showed
 *  half-words ("Wor", "THE LIGH") and near-black middles, and snapped in
 *  and out in one frame. Now it dissolves IN by state at p .68 (250 ms),
 *  holds the whole title legible while it grows by ≤ `zoom` about the ink
 *  centre (ink ≤ 96 % of the frame; the tintype's does not grow: a still
 *  stencil over the moving push), and dissolves OUT by state from
 *  TITLE_DONE (300 ms) to the clean push frame, as the GL `title` does
 *  (lib/gl/plan.ts TITLE_OUT). The world outside the letters dims to
 *  .7 of the deep, never black. aria-hidden: the h2 carries it. The SVG
 *  is stretched over the frame (preserveAspectRatio none): the pinned
 *  frame is always 2.39:1, the viewBox's own ratio. */
const VB_W = 2390;
const VB_H = 1000;
/** The css title's masked middle ends here (= GL title t .55). */
const TITLE_DONE = 0.856;
type TitleFit = { size: number; base: number; centre: readonly [number, number]; ink: number };
/** The title's size, as the GL title sets it (lib/gl/plan.ts `titleXf`):
 *  cap = 20 % of the frame height, the ink ≤ 72 % of its width, centred;
 *  `centre` = its ink box's centre and `ink` its width (viewBox fractions),
 *  measured with the face's own metrics. */
function fitTitle(el: SVGTextElement, text: string): TitleFit | null {
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
  return { size, base, centre: [(x0 + x1) / 2 / VB_W, (y0 + y1) / 2 / VB_H], ink: (x1 - x0) / VB_W };
}

function TitleMask({ t, text, zoom }: { t: MotionValue<number>; text: string; zoom: number }) {
  const id = useId();
  const textRef = useRef<SVGTextElement>(null);
  const [fit, setFit] = useState<TitleFit>({ size: 280, base: VB_H / 2 + 100, centre: [0.5, 0.5], ink: 0.72 });
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const f = fitTitle(el, text);
      if (f) setFit(f);
    };
    measure();
    // the world face may still be swapping in (lib/world-fonts.ts)
    void document.fonts?.ready.then(measure);
    return () => {
      cancelled = true;
    };
  }, [text]);
  const zmax = Math.max(1, Math.min(zoom, 0.96 / Math.max(0.1, fit.ink)));
  const scale = useTransform(t, (v) => 1 + (zmax - 1) * ss(remap(v, cardPin.titleIn, TITLE_DONE)));
  // in and out are STATES, not scrubs (W2 gate; P3-11 r1 J8 #5): a reader
  // who stops never keeps a half-faded or giant half-letter over the plate
  const phase = (v: number) => (v >= TITLE_DONE ? 2 : v >= cardPin.titleIn ? 1 : 0);
  const [ph, setPh] = useState(() => phase(t.get()));
  useMotionValueEvent(t, "change", (v) => setPh(phase(v)));
  return (
    <div className="act-card-title-mask-wrap" data-gl-replaced="" data-in={ph === 1 ? "" : undefined}>
      <motion.svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        className="act-card-title-mask"
        style={{
          scale,
          transformOrigin: `${(fit.centre[0] * 100).toFixed(2)}% ${(fit.centre[1] * 100).toFixed(2)}%`,
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
        {/* the world outside the letters dims, never to black: the push
            keeps moving behind the title (W2 judge; P3-11 r1) */}
        <rect width={VB_W} height={VB_H} fill="var(--bg)" fillOpacity={0.7} mask={`url(#${id}m)`} />
        {/* a faint warm lift inside the letters: legible over a dark plate
            (the candlelit hall), as the GL title does */}
        <text
          x={VB_W / 2}
          y={fit.base}
          textAnchor="middle"
          fontSize={fit.size}
          fill="#fff8e6"
          fillOpacity={0.24}
          className="act-card-title-mask-text"
        >
          {text}
        </text>
      </motion.svg>
    </div>
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
  // inside the pin only (p > 0): a card still below the fold, or the hero
  // above it, never pays for the frame's sprites (W2 gate: idle at the top)
  const inRange = (v: number) => v > 0 && v >= w.range[0] && v <= w.range[1];
  const [on, setOn] = useState(() => inRange(t.get()));
  useMotionValueEvent(t, "change", (v) => setOn(inRange(v)));
  return (
    <div aria-hidden="true" className="act-card-weather" data-on={on && live ? "" : undefined} {...beatAttrs(w.beat)}>
      {/* paused (not unmounted) outside its range: the 400 ms fade keeps its dots */}
      {live ? <WeatherLayer kind={w.kind} zone="frame" run={on} /> : null}
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
  // window mode (spec §6.2): blobs + ±12 decoded frames around the index
  const opts = useMemo(() => ({ window: 12, index }), []);
  const fs = useFrameSequence(urls, near && urls.length > 0, opts);
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
  }, [b, push, seq.box, urls, frameAt, fs.decoded, fs.ready, fs.tick]);
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

/** The ignite's css-tier film burn (frames/ignite.tsx, pin mode; P3-11 r1
 *  hooks), as ONE pre-rendered sprite (Law 1: 0 gradients per frame): a
 *  ragged disc of the card's deep, its rim orange-white, a soft glow out.
 *  The hole's edge sits at .7 of the sprite's radius. */
function burnSprite(deep: string): HTMLCanvasElement | null {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  if (!g) return null;
  const R = S / 2;
  const edge = (k: number) => {
    g.beginPath();
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      // a deterministic ragged edge (no Math.random: same burn every view)
      const j = 1 + 0.035 * Math.sin(a * 5 + 1.3) + 0.025 * Math.sin(a * 11 + 0.4) + 0.015 * Math.sin(a * 23);
      const r = R * k * j;
      const x = R + r * Math.cos(a);
      const y = R + r * Math.sin(a);
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    }
    g.closePath();
  };
  const glow = g.createRadialGradient(R, R, R * 0.6, R, R, R);
  glow.addColorStop(0, "rgba(255,150,60,0.55)");
  glow.addColorStop(0.45, "rgba(255,110,30,0.22)");
  glow.addColorStop(1, "rgba(255,90,20,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, S, S);
  const rim = g.createRadialGradient(R, R, R * 0.66, R, R, R * 0.8);
  rim.addColorStop(0, "#fff3d6");
  rim.addColorStop(0.45, "#ffb15a");
  rim.addColorStop(1, "rgba(255,106,20,0)");
  g.fillStyle = rim;
  edge(0.8);
  g.fill();
  g.fillStyle = deep;
  edge(0.7);
  g.fill();
  return c;
}

/** The burn's growth: r ≈ .04 → past the frame (frame heights, like the GL
 *  `burn`) over star (a) 0–.5, fading under the hall over .3–.5. */
const BURN = { r0: 0.04, grow: 2, out: [0.3, 0.5] as const };

/** The ignite's css-tier film burn (P3-11 r1 hooks: the GL tier's order):
 *  already eating the camp from its fire as the card pins — a deep hole
 *  with an orange-white rim, growing, gone under the hall as it comes up. */
const burn: PinUi["burn"] = (deep) => {
  const hole = burnSprite(deep);
  if (!hole) return null;
  return (ctx, v, x, y, h) => {
    if (v >= BURN.out[1]) return;
    const k = v / BURN.out[1];
    const R = ((BURN.r0 + BURN.grow * k * k) * h) / 0.7;
    ctx.globalAlpha = 1 - remap(v, BURN.out[0], BURN.out[1]);
    ctx.drawImage(hole, x - R, y - R, 2 * R, 2 * R);
  };
};

const UI: PinUi = { PlateLayers, burn };
