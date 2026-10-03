"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode, RefObject } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { beatAttrs } from "@/lib/beats";
import { cn } from "@/lib/utils";
import {
  parseSkipFlags,
  shouldSkip,
  useFinePointer,
  useMediaQuery,
  useReducedMotion,
  useSaveData,
} from "@/lib/flags";
import { hasRunThisSession, markRunThisSession } from "@/lib/session";
import { on } from "@/lib/events";
import { dur, ease, easeClip, intro as introTiming, spanUnit, springSoft } from "@/lib/motion";
import type { MediaId } from "@/lib/media";
import { useVariant } from "@/lib/use-variant";
import type { Variant, VariantChoice } from "@/lib/variants";
import { Lens, type LensState } from "@/components/primitives/lens";
import { MediaFrame } from "@/components/primitives/media-frame";
import {
  coverPoint,
  marginFor,
  plateGeo,
  sameBox,
  settleFrame,
  zoomBox,
  type Box01,
  type Size,
} from "@/components/sections/hero/focal";
import { apertureKindOf, FAILSAFE_SLOT, type ApertureKind } from "@/components/sections/hero/hero-boot";
import { introSettled, onIntroEnd, useIntroPhase } from "@/components/sections/hero/intro-phase";
import { VelocityLayers } from "@/components/sections/hero/velocity-layers";

/**
 * HeroStage — the client half of the cold open (SPEC v2 §6, SM-2;
 * hero-lens.BAR). The text column arrives as server-rendered `children`
 * (the static h1, lead, identity Meta and the one CTA) and is never
 * re-rendered or hidden here; this owns only the planes around it:
 *
 *   plate      MediaFrame: the plate's poster (priority), swapping to its
 *              loop on `playing` — desktop fine pointer only, and only once
 *              the prologue has unmounted (H25: its decoder, then ours).
 *   Lens       the bracket on the crest (media.focalBox mapped through the
 *              cover fit, kept ≥ 16 px right of the h1: H7). The one aqua.
 *   aperture   once per session, only when the intro did not play: pre-set
 *              before paint by the boot script (hero-boot.ts), opened on
 *              poster.decode() (desktop ≥ 640 only: M5, the mobile portrait
 *              is the LCP image and is never pre-clipped, so a phone shows it
 *              open from first paint), easeClip / dur.hero; decode failure or 1200 ms
 *              → open (S1′). While the prologue is up the Lens waits CLOSED
 *              under the opaque overlay: Play (html.intro-launched) opens it
 *              instantly, so the flight lands on an open Lens (S0i, H25).
 *              A dismissal (Skip / Esc / scroll: html.intro-leaving) opens it
 *              the same way, with NO aperture: the overlay's text is gone in
 *              80 ms and its plate fades over dur.base onto the open hero
 *              (a closed Lens under a fading castle read as a stray box).
 *   velocity   VelocityNoise on the plate only (grain, chroma, wake).
 *   pointer    the plate shifts ≤ 6 px (fine pointer), reset on leave. After
 *              a played prologue its gain ramps 0 → 1 over
 *              intro.pointerGainMs from the end of the opening titles
 *              (`intro:quiet-end`), so no second motion competes with the
 *              reveal or the title cards (PHASE3-SPEC §4.2 "End").
 *   exit       the D3 scroll-out map: scale 1 → 1.03 (p .2) → 1.08 (p .7),
 *              media y → −24 px and text y → −16 px over .2–.7, the plate
 *              darkens over .7–1 (R2, direct, no springs).
 *   mobile     < 640: name → lead → Meta → CTA → the portrait still (4:5) with
 *              its own Lens; no video, no noise, no shift, no exit.
 * Reduced motion / Pause: S2 from the first frame, poster only (0 video
 * requests), identity transforms (H18).
 *
 * VARIANTS (M1.5; lib/variants.ts host "hero"; hero-section.tsx resolves
 * both sides, this picks with useVariant — the manifest through hydration,
 * `?variant=…` after mount; the DOM contract is identical on both sides):
 *   hero.plate     which still (and so which Lens frame and portrait)
 *   hero.loop      which loop plays over it (only a loop registered to it)
 *   hero.aperture  DEFAULT "bracket-clip" (the Lens slit above) | ALT
 *                  "film-gate": the plate opens as a horizontal letterbox
 *                  from the horizon — first to the act cards' 2.39:1 reel
 *                  band, a beat, then to the full frame — and only then the
 *                  bracket settles onto the crest (its halves grow from the
 *                  crest's centre line). The KIND comes from the pre-paint
 *                  attribute (hero-boot.ts), i.e. what the reader was shown.
 *   hero.velocity  DEFAULT grain + chroma + wake | ALT crest spray + wake
 *                  (velocity-layers.tsx).
 *
 * M2 FIX (ART-DIRECTOR #3 / #15; RECOGNIZABILITY S03, T1; hero-section.tsx):
 *   lens       the bracket frames the crest ∪ the Black Pearl (DEFAULT) or
 *              the Pearl alone (ALT "spyglass"), its margin relaxed where the
 *              gutter would cut the ship (focal.ts marginFor).
 *   spyglass   ALT only: the plate (and its velocity layers) sit in a zoom
 *              layer scaled ×zoom about the Pearl (×1 — the DEFAULT framing —
 *              where the cover fit crops the Pearl out). SSR / hydration /
 *              RM / Pause / a dismissal: the final (zoomed) composition.
 *              While the prologue is up (armed AND its hand-off hold) the
 *              layer waits at ×1 — the flight's last frame IS the plate at
 *              ×1, so the reveal meets it with no jump — and the bracket
 *              halves are held invisible; once the flight has landed the
 *              plate pushes in toward the ship (PUSH_S) and the halves grow
 *              onto it. Mobile: static ×zoom.
 *
 * P3-3 HAND-OFF (PHASE3-SPEC §4.2): the prologue's phase is read only by two
 * small children — <HeroLoopFrame> (the loop may take the decoder from the
 * hold, "handoff", and plays with no fade: loop frame 0 is the poster) and
 * <SpyglassDriver> (the ALT push-in) — so the hand-off re-renders the loop
 * frame alone, never this whole stage.
 *   caption    cap.hero (a server-rendered <SceneCaption>): ≥ 640 bottom-
 *              right on its own scrim, exactly where the flight's Pirates
 *              caption lingers (app/intro.css "T1": hidden while the prologue
 *              is up and during the linger, then a crossfade in place);
 *              < 640 under the portrait still. Static under RM / Pause.
 */

const WIDE = "(min-width: 40rem)";
/** F2's contract (P3-11 r1, J8 #3): the Act I card sets this attribute on
 *  `section[data-hero]` (and its `[data-section]` wrapper) while its pinned
 *  stage covers the whole viewport, and removes it when it no longer does. */
const COVERED = "data-stage-covered";
/** decode wait before the aperture gives up and opens (S1′). */
const APERTURE_TIMEOUT_MS = 1200;
/** The film gate (hero.aperture ALT): its first stop is the act cards'
 *  letterbox (--letterbox-ratio), and its edges are feathered like the
 *  Lens clip so no hard seam crosses the name. */
const LETTERBOX = 2.39;
const GATE_FEATHER = 48;
const GATE_CLOSED = "linear-gradient(transparent, transparent)";
/** The ALT spyglass push-in after the flight lands (s): slow enough to read
 *  as the camera leaning toward the ship, done inside the caption linger. */
const PUSH_S = 2.2;
/** Pointer shift cap (px) and the scroll-out map (hero-lens.BAR S4). */
const SHIFT_PX = 6;
// Every map spans the WHOLE 0–1 range (spanUnit, lib/motion.ts: the caption
// "ghost" over the Act I card, M2 critic 3 #10).
const EXIT: Record<"scale" | "mediaY" | "textY" | "darken" | "caption", [number[], number[]]> = {
  scale: spanUnit([0, 0.2, 0.7], [1, 1.03, 1.08]),
  mediaY: spanUnit([0.2, 0.7], [0, -24]),
  textY: spanUnit([0.2, 0.7], [0, -16]),
  darken: spanUnit([0.7, 1], [0, 1]),
  // cap.hero leaves before the Act I card's film title arrives below it
  caption: spanUnit([0.1, 0.3], [1, 0]),
};

export type HeroPlate = {
  /** The still (the LCP poster / the mobile plate). */
  poster: MediaId;
  /** The still's intrinsic size (the cover fit). */
  size: Size;
  focal: readonly [number, number];
  /** The Lens box in PLATE fractions (the crest ∪ the Pearl; the ALT: the
   *  Pearl, padded). */
  box: Box01;
  /** The DEFAULT framing (crest ∪ Pearl): the ALT's fallback where the
   *  cover fit crops the Pearl out (focal.ts plateGeo). */
  wide: Box01;
  /** The crest band in PLATE fractions: the velocity wake / spray. */
  crest: Box01;
  /** What the bracket must enclose (the Pearl), or null. */
  keep: Box01 | null;
  /** The spyglass push-in (1 = none) and its anchor (PLATE fractions). */
  zoom: number;
  zoomAt: readonly [number, number];
  /** The horizon's y (plate fraction): where the ALT film gate opens. */
  horizon: number;
  /** The loop each hero.loop variant plays over THIS still (a video
   *  registered to it), or null: the still stays. */
  loops: Record<Variant, MediaId | null>;
};
/** Both sides of hero.plate. */
export type HeroPlates = Record<Variant, HeroPlate>;
/** One side's measured geometry (frame fractions): the bracket's settled
 *  frame, the zoom layer's transform-origin, the crest band at ×1. */
export type HeroGeo = {
  frame: Box01;
  origin: readonly [number, number];
  wake: Box01;
  /** The zoom this view plays (the ALT's, or 1 where it falls back). */
  zoom: number;
};

type Which = "desktop" | "mobile";
/** `hold`: closed but waiting for the prologue to leave (no aperture yet).
 *  `kind`: which aperture the pre-paint script armed (slit | gate). */
type Run = { which: Which | null; state: LensState; hold?: boolean; kind?: ApertureKind };

type Props = {
  id?: string;
  titleId: string;
  /** innerHTML of the pre-paint boot element (hero-boot.ts). */
  boot: string;
  onceKey: string;
  /** The hero's variant choice (lib/sections.ts variantChoiceOf). */
  choice: VariantChoice;
  plates: HeroPlates;
  mobiles: HeroPlates;
  /** Each plate's geometry at the reference viewport (the SSR frame). */
  frames: Record<Variant, HeroGeo>;
  /** cap.hero, server-rendered (or null: its copy may not render). */
  caption?: ReactNode;
  /** The caption's world: its plane (colours = the flight caption's). */
  captionWorld?: string | null;
  /** A server-rendered mark set under the bracket (desktop only). */
  mark?: ReactNode;
  children: ReactNode;
};

const pos = (f: readonly [number, number]) =>
  `${(f[0] * 100).toFixed(2)}% ${(f[1] * 100).toFixed(2)}%`;

const samePoint = (a: readonly [number, number], b: readonly [number, number]) =>
  Math.abs(a[0] - b[0]) < 1e-4 && Math.abs(a[1] - b[1]) < 1e-4;
const sameGeo = (a: HeroGeo, b: HeroGeo) =>
  sameBox(a.frame, b.frame) && sameBox(a.wake, b.wake) && samePoint(a.origin, b.origin) && a.zoom === b.zoom;

const slitVars = (origin: number): CSSProperties =>
  ({
    "--hero-slit-l": `${(origin * 100).toFixed(3)}%`,
    "--hero-slit-r": `${((1 - origin) * 100).toFixed(3)}%`,
  }) as CSSProperties;

export function HeroStage({
  id,
  titleId,
  boot,
  onceKey,
  choice,
  plates,
  mobiles,
  frames,
  caption,
  captionWorld,
  mark,
  children,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const lensBoxRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  /* — Variants (hydration: the manifest's; then ?variant=…) ——————————— */
  const plateV = useVariant(choice, "hero.plate");
  const loopV = useVariant(choice, "hero.loop");
  const velocityV = useVariant(choice, "hero.velocity");
  const plate = plates[plateV];
  const mobile = mobiles[plateV];
  const media = plate.loops[loopV] ?? plate.poster;

  const reduced = useReducedMotion();
  const saveData = useSaveData();
  const wide = useMediaQuery(WIDE);
  const fine = useFinePointer();

  const motionOn = !reduced;
  const moving = motionOn && wide; // exit + pointer: the full-bleed layout only
  const noisy = moving && fine && !saveData;

  /* — Off stage (P3-11 r1, J8 #2 / #3): the hero's background loops cost
       nothing while nobody can see them — covered by the Act I card (F2's
       `data-stage-covered`) or scrolled out of view (with a quarter-viewport
       margin, so it is back before its edge shows). Then the decorative
       plate leaves paint (visibility, written here: no React work; the h1
       column stays, for the accessibility tree), and the velocity layers
       unmount: they follow the PAGE's scroll velocity, so they used to
       restyle the hero's layers on every fast scroll anywhere on the page.
       The loop gives its decoder back (the poster is its frame 0, so it
       resumes in place). — */
  const [live, setLive] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let seen = true;
    const sync = () => {
      const on = seen && !el.hasAttribute(COVERED);
      lensBoxRef.current?.style.setProperty("visibility", on ? null : "hidden");
      setLive(on);
    };
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: [COVERED] });
    const io = new IntersectionObserver(
      ([e]) => {
        seen = Boolean(e?.isIntersecting);
        sync();
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(el);
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  /* — The aperture (S0 → S1 → S2) ———————————————————————————————————— */
  const [run, setRun] = useState<Run>({ which: null, state: "open" });

  // S0: the boot script armed a slit before paint → take it over. Or the
  // prologue is up: close under it (unseen), open on Play (see above).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const root = document.documentElement;
    const which: Which = window.matchMedia(WIDE).matches ? "desktop" : "mobile";
    let t = 0;
    const kind = apertureKindOf(el.getAttribute("data-aperture"));
    if (kind) {
      const slot = window as unknown as Record<string, number | undefined>;
      window.clearTimeout(slot[FAILSAFE_SLOT]);
      t = window.setTimeout(() => setRun({ which, state: "closed", kind }), 0);
      return () => window.clearTimeout(t);
    }
    if (!root.classList.contains("intro-armed")) return;
    // < 640 the portrait still stays open under the prologue too: it is the
    // page's LCP image, and a phone never runs an aperture (M5)
    if (which === "mobile") return;
    if (
      hasRunThisSession(onceKey) ||
      shouldSkip("hero", parseSkipFlags(window.location.search)) ||
      root.classList.contains("intro-launched") ||
      root.classList.contains("intro-leaving")
    ) {
      return;
    }
    // Play → the flight, or a dismissal: the Lens must be open before the
    // overlay reveals the hero (S0i; SX has no aperture)
    const launched = () =>
      root.classList.contains("intro-launched") ||
      root.classList.contains("intro-landing") ||
      root.classList.contains("intro-leaving");
    t = window.setTimeout(() => {
      // the prologue may have ended in between (it removes the class first)
      if (root.classList.contains("intro-armed") && !launched()) {
        setRun({ which, state: "closed", hold: true });
      }
    }, 0);
    const mo = new MutationObserver(() => {
      if (launched()) {
        mo.disconnect();
        setRun((r) => (r.hold ? { which: null, state: "open" } : r));
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.clearTimeout(t);
      mo.disconnect();
    };
  }, [onceKey]);

  // The Lens now holds the slit itself: release the CSS pre-state (two
  // frames later, so the inline clip is painted before the override goes).
  // Keyed on the run being claimed — not on its state — so a fast decode
  // (closed → aperture within those frames) can't cancel the release.
  const claimed = run.which !== null;
  useEffect(() => {
    if (!claimed) return;
    let r2 = 0;
    const r1 = window.requestAnimationFrame(() => {
      r2 = window.requestAnimationFrame(() => {
        sectionRef.current?.removeAttribute("data-aperture");
      });
    });
    return () => {
      window.cancelAnimationFrame(r1);
      window.cancelAnimationFrame(r2);
    };
  }, [claimed]);

  // S1: open on the poster's decode (desktop) / at ≥ 50 % in view + decode
  // (mobile). Failure or the timeout jumps to S2.
  useEffect(() => {
    if (run.state !== "closed" || !run.which || run.hold) return;
    const host = run.which === "desktop" ? plateRef.current : mobileRef.current;
    let cancelled = false;
    let timer = 0;
    let io: IntersectionObserver | null = null;
    const finish = (ok: boolean) => {
      if (cancelled) return;
      if (ok) markRunThisSession(onceKey);
      setRun((r) => (r.state === "closed" ? { ...r, state: ok ? "aperture" : "open" } : r));
    };
    const decode = () => {
      const img = host?.querySelector("img");
      const timeout = new Promise<boolean>((resolve) => {
        timer = window.setTimeout(() => resolve(false), APERTURE_TIMEOUT_MS);
      });
      const decoded = img ? img.decode().then(() => true, () => false) : Promise.resolve(false);
      void Promise.race([decoded, timeout]).then(finish);
    };
    if (run.which === "mobile" && host && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([e]) => {
          if (e && e.intersectionRatio >= 0.5) {
            io?.disconnect();
            decode();
          }
        },
        { threshold: [0, 0.5] },
      );
      io.observe(host);
    } else {
      decode();
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      io?.disconnect();
    };
  }, [run.state, run.which, run.hold, onceKey]);

  // The prologue ended, played or dismissed: the Lens is open (S0i). Its
  // aperture was spent on Play, and a dismissal opens it without one (the
  // Esc path double-exposed the closing overlay over a still-closed Lens).
  useEffect(
    () =>
      onIntroEnd(() =>
        setRun((r) => (r.state === "open" && r.which === null ? r : { which: null, state: "open" })),
      ),
    [],
  );

  const onSettled = (s: "open" | "closed" | "track") => {
    if (s === "open") setRun((r) => (r.state === "aperture" && r.kind !== "gate" ? { ...r, state: "open" } : r));
  };
  // the film gate clips the plate itself (below); its Lens stays open
  const lensState = (w: Which): LensState => (run.which === w && run.kind !== "gate" ? run.state : "open");

  /* — The bracket's frame: the Lens box through the cover fit (and the
       spyglass zoom), ≥ 16 px right of the h1 (H7). Measured on resize and
       after the fonts land, with the zoom origin and the wake band. — */
  const [geo, setGeo] = useState<HeroGeo>(frames[plateV]);
  const frame = geo.frame;
  const boxW = useMotionValue(1440);
  const boxH = useMotionValue(900);
  useEffect(() => {
    const box = lensBoxRef.current;
    const section = sectionRef.current;
    if (!box || !section || typeof ResizeObserver === "undefined") return;
    const h1 = section.querySelector("h1");
    const measure = () => {
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      if (!w || !h) return;
      boxW.set(w);
      boxH.set(h);
      const inset = parseFloat(getComputedStyle(box).getPropertyValue("--lens-inset")) || 16;
      const avoidRight = h1
        ? h1.getBoundingClientRect().right - section.getBoundingClientRect().left
        : 0;
      // the page gutter (the text column's px-gutter, resolved): the right
      // spine rests on the page grid, not 8 px from the viewport edge
      const col = columnRef.current;
      const gutter = col ? parseFloat(getComputedStyle(col).paddingRight) || 8 : 8;
      const g = plateGeo(plate, { w, h });
      const next: HeroGeo = {
        frame: settleFrame(g.lens, {
          w,
          h,
          inset,
          margin: marginFor(g.keep, w, inset, gutter),
          avoidRight,
        }),
        origin: g.origin,
        wake: g.wake,
        zoom: g.zoom,
      };
      setGeo((prev) => (sameGeo(prev, next) ? prev : next));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    if (h1) ro.observe(h1);
    let alive = true;
    void document.fonts?.ready.then(() => {
      if (alive) measure();
    });
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, [plate, boxW, boxH]);

  /* — The ALT spyglass push-in (see the header; <SpyglassDriver>). — */
  const zoom = useMotionValue(geo.zoom);
  const frameRef = useRef(frame);
  useEffect(() => {
    frameRef.current = frame;
  });

  // the portrait's Lens frame (intrinsic layout: plate fractions = frame
  // fractions), through its static spyglass zoom
  const mobileFrame = zoomBox(mobile.box, mobile.zoom, mobile.zoomAt);

  /* — The film gate (hero.aperture ALT) ————————————————————————————————
       closed    the plate is masked to nothing; the bracket halves are held
                 invisible (WAAPI, so React's markup is untouched)
       aperture  the mask opens from the horizon: to the 2.39:1 band on
                 easeClip / dur.reveal, a dur.micro beat, then to the full
                 frame on easeClip / dur.hero; as the second stage starts
                 the halves grow onto the crest (dur.reveal, ease)
       open      mask none, halves released. Motion off (Pause) mid-gate
                 jumps here. */
  const gateMask = useMotionValue("none");
  const holdRef = useRef<Animation | null>(null);
  const gating = run.kind === "gate" && run.which !== null;
  const gateWhich = run.which;
  const gateState = run.state;
  useEffect(() => {
    if (!gating || !gateWhich) return;
    const wrap = gateWhich === "desktop" ? lensBoxRef.current : mobileRef.current;
    const halves = wrap?.querySelector<HTMLElement>(":scope > [data-lens] > div:last-child") ?? null;
    const release = () => {
      holdRef.current?.cancel();
      holdRef.current = null;
    };
    if (gateState === "closed" && !reduced) {
      gateMask.set(GATE_CLOSED);
      if (halves && !holdRef.current && typeof halves.animate === "function") {
        holdRef.current = halves.animate({ opacity: [0, 0] }, { duration: 1, fill: "forwards" });
      }
      return;
    }
    if (gateState !== "aperture" || reduced || !wrap) {
      gateMask.set("none");
      release();
      if (gateState !== "aperture") return;
      // motion went off before the gate could run: straight to open
      const t = window.setTimeout(() => setRun((r) => (r.state === "aperture" ? { ...r, state: "open" } : r)), 0);
      return () => window.clearTimeout(t);
    }
    const p = gateWhich === "desktop" ? plate : mobile;
    const w = wrap.offsetWidth;
    const h = wrap.offsetHeight;
    // the horizon through the cover fit and the spyglass zoom (final here)
    const hy = coverPoint([0, p.horizon], p.size, { w, h }, p.focal)[1];
    const oy = coverPoint(p.zoomAt, p.size, { w, h }, p.focal)[1];
    const cy = (oy + (hy - oy) * (gateWhich === "desktop" ? geo.zoom : p.zoom)) * h;
    const band = Math.min(h, w / LETTERBOX) / 2;
    const full = Math.max(cy, h - cy) + GATE_FEATHER;
    const setHalf = (half: number) => {
      const f = Math.min(GATE_FEATHER, half) / 2;
      const a = cy - half;
      const b = cy + half;
      gateMask.set(
        `linear-gradient(to bottom, transparent ${(a - f).toFixed(1)}px, #000 ${(a + f).toFixed(1)}px, #000 ${(b - f).toFixed(1)}px, transparent ${(b + f).toFixed(1)}px)`,
      );
    };
    const frameBox = gateWhich === "desktop" ? frame : mobileFrame;
    const origin = `50% ${(((frameBox.y0 + frameBox.y1) / 2) * 100).toFixed(2)}%`;
    const runs: ReturnType<typeof animate>[] = [];
    let settle: Animation | null = null;
    let beat = 0;
    let done = false;
    const complete = () => {
      if (done) return;
      done = true;
      gateMask.set("none");
      setRun((r) => (r.state === "aperture" ? { ...r, state: "open" } : r));
    };
    runs.push(
      animate(0, band, {
        duration: dur.reveal,
        ease: easeClip,
        onUpdate: setHalf,
        onComplete: () => {
          beat = window.setTimeout(() => {
            // the bracket settles as the gate leaves the reel band
            release();
            if (halves && typeof halves.animate === "function") {
              settle = halves.animate(
                [
                  { opacity: 0, transform: "scaleY(0.12)", transformOrigin: origin },
                  { opacity: 1, transform: "scaleY(1)", transformOrigin: origin },
                ],
                { duration: dur.reveal * 1000, easing: `cubic-bezier(${ease.join(",")})` },
              );
            }
            runs.push(
              animate(band, full, { duration: dur.hero, ease: easeClip, onUpdate: setHalf, onComplete: complete }),
            );
          }, dur.micro * 1000);
        },
      }),
    );
    return () => {
      window.clearTimeout(beat);
      runs.forEach((r) => r.stop());
      settle?.cancel();
      if (!done) {
        // interrupted (unmount, motion off, a variant switch): never leave
        // the plate masked or the bracket held
        gateMask.set("none");
        release();
      }
    };
    // `frame`, `plate` and `mobile` are read once when the gate starts: a
    // resize mid-gate keeps its geometry (it lasts ~1.7 s)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gating, gateWhich, gateState, reduced, gateMask]);
  useEffect(() => () => holdRef.current?.cancel(), []);

  /* — Pointer shift (≤ 6 px, springSoft; the plate scales just enough to
       never show its edge). Held at gain 0 while the prologue is up, then
       ramped 0 → 1 from the end of its titles (see the header). — */
  const shiftX = useSpring(0, springSoft);
  const shiftY = useSpring(0, springSoft);
  // performance.now() when the gain ramp starts; Infinity = held
  const gainFrom = useRef(0);
  useEffect(() => {
    if (!document.documentElement.classList.contains("intro-armed")) return;
    gainFrom.current = Number.POSITIVE_INFINITY;
    const start = () => {
      if (gainFrom.current === Number.POSITIVE_INFINITY) gainFrom.current = performance.now();
    };
    // the titles' end (or any exit) — and a backstop past their length
    let backstop = 0;
    const offQuiet = on("intro:quiet-end", start);
    const offEnd = onIntroEnd(() => {
      backstop = window.setTimeout(start, introTiming.titles.total * 1000 + 600);
    });
    return () => {
      offQuiet();
      offEnd();
      window.clearTimeout(backstop);
    };
  }, []);
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!noisy || e.pointerType !== "mouse") return;
    const g = Math.min(1, Math.max(0, (performance.now() - gainFrom.current) / introTiming.pointerGainMs));
    if (!(g > 0)) return;
    const r = e.currentTarget.getBoundingClientRect();
    shiftX.set(((e.clientX - r.left) / r.width - 0.5) * 2 * SHIFT_PX * g);
    shiftY.set(((e.clientY - r.top) / r.height - 0.5) * 2 * SHIFT_PX * g);
  };
  const onPointerLeave = () => {
    shiftX.set(0);
    shiftY.set(0);
  };

  /* — Scroll-out (S4, R2 direct). — */
  const { scrollYProgress: exit } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const exitScale = useTransform(exit, ...EXIT.scale);
  const exitY = useTransform(exit, ...EXIT.mediaY);
  const textY = useTransform(exit, ...EXIT.textY);
  const darken = useTransform(exit, ...EXIT.darken);
  const capOut = useTransform(exit, ...EXIT.caption);
  const plateScale = useTransform(
    [exitScale, shiftX, shiftY, boxW, boxH],
    ([s, x, y, w, h]) =>
      (s as number) *
      (1 + 2 * Math.max(Math.abs(x as number) / (w as number), Math.abs(y as number) / (h as number))),
  );
  const plateY = useTransform([exitY, shiftY], ([a, b]) => (a as number) + (b as number));

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={titleId}
      data-hero=""
      // B02: the hero (the loop, the pointer shift, the scroll-out push)
      {...beatAttrs("B02", { weight: 2 })}
      // the boot script may set data-aperture before hydration
      suppressHydrationWarning
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate flex flex-col overflow-hidden bg-bg text-fg sm:min-h-svh sm:justify-center"
    >
      <div hidden data-hero-boot="" dangerouslySetInnerHTML={{ __html: boot }} />
      <SpyglassDriver
        zoom={zoom}
        spyZoom={geo.zoom}
        reduced={reduced}
        wide={wide}
        lensBoxRef={lensBoxRef}
        frameRef={frameRef}
      />

      {/* — Desktop / tablet: the full-bleed plate behind the name — */}
      <div
        ref={lensBoxRef}
        aria-hidden="true"
        data-hero-lens="desktop"
        className="absolute inset-0 hidden sm:block"
        style={slitVars(plate.focal[0])}
      >
        <Lens
          state={lensState("desktop")}
          frame={frame}
          origin={plate.focal[0]}
          onSettled={onSettled}
          // the Lens root is `relative` (cn() does not merge, so an
          // `absolute inset-0` here lost to it and the box collapsed to 0 px
          // tall); its parent is absolute inset-0, so fill it by size.
          className="size-full"
        >
          <motion.div
            ref={plateRef}
            data-hero-plate=""
            // its own layer while the scroll-out scrubs it (no plate re-draw)
            className={cn("absolute inset-0 origin-center", moving && "will-change-transform")}
            style={{
              maskImage: gateMask,
              WebkitMaskImage: gateMask,
              ...(moving ? { scale: plateScale, x: shiftX, y: plateY } : null),
            }}
          >
            {/* the spyglass zoom layer (×1 on the DEFAULT side) */}
            <motion.div
              data-hero-zoom=""
              className={cn("absolute inset-0", moving && "will-change-transform")}
              style={{ scale: zoom, transformOrigin: pos(geo.origin) }}
            >
              <HeroLoopFrame
                // a plate / loop switch (?variant=…) remounts: fresh poster
                // state and a fresh decoder claim
                key={`${plate.poster}:${media}`}
                media={media}
                poster={plate.poster}
                live={live}
              />
              {noisy && live ? (
                <VelocityLayers
                  key={plate.poster}
                  hostRef={plateRef}
                  // the crest band at ×1: the layers ride inside the zoom
                  wake={geo.wake}
                  objectPosition={pos(plate.focal)}
                  dialect={velocityV === "alt" ? "spray" : "grain"}
                />
              ) : null}
            </motion.div>
            {moving ? (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-bg will-change-[opacity]"
                style={{ opacity: darken }}
              />
            ) : null}
          </motion.div>
        </Lens>
        {/* the hero sea sinks into the Act I card's deep over its last 18vh
            (the same plane): drawn HERE, under the text column and cap.hero,
            so the feather never dims the caption (M2 critic 3 #5 — it used to
            be painted by the card, over the whole hero stack) */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh] bg-[linear-gradient(to_bottom,transparent,var(--bg))]" />
        {/* the hero's mark (hero-section.tsx: Jack's compass), 12 px under
            the bracket's left arm, 64–96 px wide; ≥ 64rem only */}
        {mark ? (
          <div
            data-hero-mark=""
            className="pointer-events-none absolute hidden lg:block"
            style={{ left: `${frame.x0 * 100}%`, top: `calc(${frame.y1 * 100}% + 12px)`, width: "clamp(64px, 6vw, 96px)" }}
          >
            {mark}
          </div>
        ) : null}
      </div>

      {/* — The text column (server-rendered; the h1 never animates) — */}
      <motion.div
        ref={columnRef}
        className="relative z-10 mx-auto w-full max-w-page px-gutter pt-[calc(var(--header-h)+var(--spacing-tier-block))] sm:py-(--header-h)"
        style={moving ? { y: textY } : undefined}
      >
        {children}
      </motion.div>

      {/* — cap.hero ≥ 640 (T1): bottom-right, where the flight caption
           lingers; in flow below the column on short screens (intro.css) — */}
      {caption ? (
        <motion.div
          data-hero-cap=""
          data-world={captionWorld ?? undefined}
          data-tone={captionWorld ? "deep" : undefined}
          className="hero-cap relative z-10 hidden sm:block"
          // the scroll-out fade lives here; the T1 hand-off (a class on
          // <html>) on the inner box, so neither overrides the other
          style={moving ? { opacity: capOut } : undefined}
        >
          <div className="hero-cap__in">{caption}</div>
        </motion.div>
      ) : null}

      {/* — Mobile: the portrait still below the CTA, with its own bracket — */}
      <div className="relative px-gutter pt-tier-block pb-section sm:hidden">
        <div
          ref={mobileRef}
          aria-hidden="true"
          data-hero-lens="mobile"
          className="relative"
          style={slitVars(mobile.focal[0])}
        >
          <Lens
            state={lensState("mobile")}
            frame={mobileFrame}
            origin={mobile.focal[0]}
            onSettled={onSettled}
          >
            <motion.div
              // the still's OWN box crops the zoom at every moment (M2 code
              // review: during the bracket's opening the Lens clip is off and
              // the 1.18× spyglass overhung the CTA and the section padding)
              className="overflow-hidden"
              style={{ maskImage: gateMask, WebkitMaskImage: gateMask }}
            >
              {/* the spyglass framing, static (mobile gets stills); this box
                  crops it, the Lens clip on top */}
              <div
                style={
                  mobile.zoom !== 1
                    ? { transform: `scale(${mobile.zoom})`, transformOrigin: pos(mobile.zoomAt) }
                    : undefined
                }
              >
                <MediaFrame
                  key={mobile.poster}
                  media={mobile.poster}
                  poster={mobile.poster}
                  priority
                  layout="intrinsic"
                  sizes="(max-width: 639px) 92vw, 1vw"
                  playOn="never"
                />
              </div>
            </motion.div>
          </Lens>
        </div>
        {/* cap.hero < 640: under the still (static, in flow) */}
        {caption ? (
          <div data-world={captionWorld ?? undefined} data-tone={captionWorld ? "deep" : undefined}>
            {caption}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** The hero's desktop plate media: the poster, and the loop once the
 *  prologue lets it take the decoder (H25: its decoder, then ours). From
 *  the hand-off hold ("handoff") the loop mounts UNDER the overlay's held
 *  last frame and cuts in with no fade (its frame 0 is the poster), so the
 *  reveal uncovers a sea that is already moving. Only this frame re-renders
 *  on the prologue's phase changes. */
function HeroLoopFrame({ media, poster, live }: { media: MediaId; poster: MediaId; live: boolean }) {
  const phase = useIntroPhase();
  return (
    <MediaFrame
      media={media}
      poster={poster}
      priority
      layout="fill"
      // art direction without a double download: below 640 this frame is
      // display:none, so its preload resolves to the 16 w rung; the mobile
      // frame does the inverse.
      sizes="(max-width: 639px) 1vw, 100vw"
      // off stage (covered by the Act I card): the poster, no decoder
      playOn={introSettled(phase) && live ? "desktop" : "never"}
      fade={phase === "handoff" ? 0 : undefined}
    />
  );
}

/** The ALT spyglass push-in (see the header). The halves are held with
 *  WAAPI (React's markup untouched), like the film gate's. Renders nothing;
 *  it reads the prologue's phase so the stage itself never re-renders on it. */
function SpyglassDriver({
  zoom,
  spyZoom,
  reduced,
  wide,
  lensBoxRef,
  frameRef,
}: {
  zoom: MotionValue<number>;
  spyZoom: number;
  reduced: boolean;
  wide: boolean;
  lensBoxRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<Box01>;
}): null {
  const phase = useIntroPhase();
  const spyHold = useRef<Animation | null>(null);
  const spyWaits = useRef(false);
  useEffect(() => {
    const halves =
      lensBoxRef.current?.querySelector<HTMLElement>(":scope > [data-lens] > div:last-child") ?? null;
    const release = () => {
      spyHold.current?.cancel();
      spyHold.current = null;
    };
    const final = () => {
      spyWaits.current = false;
      zoom.jump(spyZoom);
      release();
    };
    if (spyZoom === 1 || reduced || !wide) {
      final();
      return;
    }
    // under the prologue: armed, and its hand-off hold (the loop starts
    // under the held frame; the push waits for the reveal to finish)
    if (phase === "armed" || phase === "handoff") {
      // under the opaque prologue: wait at ×1 (the flight lands on it)
      spyWaits.current = true;
      zoom.jump(1);
      if (halves && !spyHold.current && typeof halves.animate === "function") {
        spyHold.current = halves.animate({ opacity: [0, 0] }, { duration: 1, fill: "forwards" });
      }
      return;
    }
    if (!spyWaits.current || phase !== "played") {
      // never held (no prologue, SSR / hydration) or dismissed: final
      final();
      return;
    }
    spyWaits.current = false;
    const f = frameRef.current;
    const origin = `50% ${(((f.y0 + f.y1) / 2) * 100).toFixed(2)}%`;
    let settle: Animation | null = null;
    const run = animate(zoom, spyZoom, {
      duration: PUSH_S,
      ease,
      onComplete: () => {
        release();
        if (halves && typeof halves.animate === "function") {
          settle = halves.animate(
            [
              { opacity: 0, transform: "scaleY(0.12)", transformOrigin: origin },
              { opacity: 1, transform: "scaleY(1)", transformOrigin: origin },
            ],
            { duration: dur.reveal * 1000, easing: `cubic-bezier(${ease.join(",")})` },
          );
        }
      },
    });
    return () => {
      // interrupted (motion off, a variant switch, unmount): the final frame
      run.stop();
      settle?.cancel();
      zoom.jump(spyZoom);
      release();
    };
  }, [spyZoom, phase, reduced, wide, zoom, lensBoxRef, frameRef]);
  useEffect(() => () => spyHold.current?.cancel(), []);
  return null;
}

