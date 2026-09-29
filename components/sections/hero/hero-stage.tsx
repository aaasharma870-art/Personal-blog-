"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import {
  parseSkipFlags,
  shouldSkip,
  useFinePointer,
  useMediaQuery,
  useReducedMotion,
  useSaveData,
  useSkipFlags,
} from "@/lib/flags";
import { hasRunThisSession, markRunThisSession } from "@/lib/session";
import { springSoft } from "@/lib/motion";
import type { MediaId } from "@/lib/media";
import { Lens, type LensState } from "@/components/primitives/lens";
import { MediaFrame } from "@/components/primitives/media-frame";
import {
  coverBox,
  sameBox,
  settleFrame,
  type Box01,
  type Size,
} from "@/components/sections/hero/focal";
import { FAILSAFE_SLOT } from "@/components/sections/hero/hero-boot";
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
 *              poster.decode() (desktop) or on the portrait's decode at ≥ 50 % in
 *              view (mobile), easeClip / dur.hero; decode failure or 1200 ms
 *              → open (S1′). While the prologue is up the Lens waits CLOSED
 *              under the opaque overlay: Play (html.intro-launched) opens it
 *              instantly, so the flight lands on an open Lens (S0i, H25);
 *              a dismissal before Play (intro:end, played=false) runs the
 *              aperture from that slit — never closing a plate the reader
 *              has already seen.
 *   velocity   VelocityNoise on the plate only (grain, chroma, wake).
 *   pointer    the plate shifts ≤ 6 px (fine pointer), reset on leave.
 *   exit       the D3 scroll-out map: scale 1 → 1.03 (p .2) → 1.08 (p .7),
 *              media y → −24 px and text y → −16 px over .2–.7, the plate
 *              darkens over .7–1 (R2, direct, no springs).
 *   mobile     < 640: name → lead → Meta → CTA → the portrait still (4:5) with
 *              its own Lens; no video, no noise, no shift, no exit.
 * Reduced motion / Pause: S2 from the first frame, poster only (0 video
 * requests), identity transforms (H18).
 */

const WIDE = "(min-width: 40rem)";
/** decode wait before the aperture gives up and opens (S1′). */
const APERTURE_TIMEOUT_MS = 1200;
/** Pointer shift cap (px) and the scroll-out map (hero-lens.BAR S4). */
const SHIFT_PX = 6;
const EXIT: Record<"scale" | "mediaY" | "textY" | "darken", { at: number[]; to: number[] }> = {
  scale: { at: [0, 0.2, 0.7], to: [1, 1.03, 1.08] },
  mediaY: { at: [0.2, 0.7], to: [0, -24] },
  textY: { at: [0.2, 0.7], to: [0, -16] },
  darken: { at: [0.7, 1], to: [0, 1] },
};

export type HeroPlate = {
  /** What MediaFrame plays: the loop when there is one, else the still. */
  media: MediaId;
  /** The still (the LCP poster / the mobile plate). */
  poster: MediaId;
  /** The still's intrinsic size (the cover fit). */
  size: Size;
  focal: readonly [number, number];
  /** The crest box in PLATE fractions. */
  box: Box01;
};

type Which = "desktop" | "mobile";
/** `hold`: closed but waiting for the prologue to leave (no aperture yet). */
type Run = { which: Which | null; state: LensState; hold?: boolean };

type Props = {
  id?: string;
  titleId: string;
  /** innerHTML of the pre-paint boot element (hero-boot.ts). */
  boot: string;
  onceKey: string;
  plate: HeroPlate;
  mobile: HeroPlate;
  /** The plate's crest box in frame fractions at the reference viewport. */
  initialFrame: Box01;
  children: ReactNode;
};

const pos = (f: readonly [number, number]) =>
  `${(f[0] * 100).toFixed(2)}% ${(f[1] * 100).toFixed(2)}%`;

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
  plate,
  mobile,
  initialFrame,
  children,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const lensBoxRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const reduced = useReducedMotion();
  const saveData = useSaveData();
  const wide = useMediaQuery(WIDE);
  const fine = useFinePointer();
  const skip = useSkipFlags();
  const phase = useIntroPhase();

  const motionOn = !reduced;
  const moving = motionOn && wide; // exit + pointer: the full-bleed layout only
  const noisy = moving && fine && !saveData;

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
    if (el.getAttribute("data-aperture") === "pending") {
      const slot = window as unknown as Record<string, number | undefined>;
      window.clearTimeout(slot[FAILSAFE_SLOT]);
      t = window.setTimeout(() => setRun({ which, state: "closed" }), 0);
      return () => window.clearTimeout(t);
    }
    if (!root.classList.contains("intro-armed")) return;
    if (
      hasRunThisSession(onceKey) ||
      shouldSkip("hero", parseSkipFlags(window.location.search)) ||
      root.classList.contains("intro-launched")
    ) {
      return;
    }
    t = window.setTimeout(() => {
      // the prologue may have ended in between (it removes the class first)
      if (root.classList.contains("intro-armed") && !root.classList.contains("intro-launched")) {
        setRun({ which, state: "closed", hold: true });
      }
    }, 0);
    // Play → the flight: the Lens must be open before the landing reveals it
    const launched = () =>
      root.classList.contains("intro-launched") || root.classList.contains("intro-landing");
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

  // The prologue ended: a landed flight leaves the Lens open (its aperture
  // was spent on Play, S0i); a dismissal before the flight releases the
  // held slit into the hero's own aperture, once per session, where motion
  // allows it. (A Lens that was never closed under the overlay stays open:
  // closing a plate the reader has just seen would be a flash.)
  const onEnd = useEffectEvent((played: boolean) => {
    const allowed =
      !played &&
      !reduced &&
      !saveData &&
      !shouldSkip("hero", skip) &&
      !hasRunThisSession(onceKey);
    setRun((r) =>
      allowed && r.hold && r.state === "closed"
        ? { ...r, hold: false }
        : r.state === "open" && r.which === null
          ? r
          : { which: null, state: "open" },
    );
  });
  useEffect(() => onIntroEnd((played) => onEnd(played)), []);

  const onSettled = (s: "open" | "closed" | "track") => {
    if (s === "open") setRun((r) => (r.state === "aperture" ? { ...r, state: "open" } : r));
  };
  const lensState = (w: Which): LensState => (run.which === w ? run.state : "open");

  /* — The bracket's frame: the crest box through the cover fit, ≥ 16 px
       right of the h1 (H7). Measured on resize and after the fonts land. — */
  const [frame, setFrame] = useState<Box01>(initialFrame);
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
      const next = settleFrame(coverBox(plate.box, plate.size, { w, h }, plate.focal), {
        w,
        h,
        inset,
        avoidRight,
      });
      setFrame((prev) => (sameBox(prev, next) ? prev : next));
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
  }, [plate.box, plate.size, plate.focal, boxW, boxH]);

  /* — Pointer shift (≤ 6 px, springSoft; the plate scales just enough to
       never show its edge). — */
  const shiftX = useSpring(0, springSoft);
  const shiftY = useSpring(0, springSoft);
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!noisy || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    shiftX.set(((e.clientX - r.left) / r.width - 0.5) * 2 * SHIFT_PX);
    shiftY.set(((e.clientY - r.top) / r.height - 0.5) * 2 * SHIFT_PX);
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
  const exitScale = useTransform(exit, EXIT.scale.at, EXIT.scale.to);
  const exitY = useTransform(exit, EXIT.mediaY.at, EXIT.mediaY.to);
  const textY = useTransform(exit, EXIT.textY.at, EXIT.textY.to);
  const darken = useTransform(exit, EXIT.darken.at, EXIT.darken.to);
  const plateScale = useTransform(
    [exitScale, shiftX, shiftY, boxW, boxH],
    ([s, x, y, w, h]) =>
      (s as number) *
      (1 + 2 * Math.max(Math.abs(x as number) / (w as number), Math.abs(y as number) / (h as number))),
  );
  const plateY = useTransform([exitY, shiftY], ([a, b]) => (a as number) + (b as number));

  /* — The loop may take the decoder only once the overlay is gone (H25). — */
  const playOn = introSettled(phase) ? "desktop" : "never";

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={titleId}
      data-hero=""
      // the boot script may set data-aperture before hydration
      suppressHydrationWarning
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate flex flex-col overflow-hidden bg-bg text-fg sm:min-h-svh sm:justify-center"
    >
      <div hidden data-hero-boot="" dangerouslySetInnerHTML={{ __html: boot }} />

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
          className="absolute inset-0"
        >
          <motion.div
            ref={plateRef}
            data-hero-plate=""
            className="absolute inset-0 origin-center"
            style={moving ? { scale: plateScale, x: shiftX, y: plateY } : undefined}
          >
            <MediaFrame
              media={plate.media}
              poster={plate.poster}
              priority
              layout="fill"
              // art direction without a double download: below 640 this
              // frame is display:none, so its preload resolves to the 16 w
              // rung; the mobile frame does the inverse.
              sizes="(max-width: 639px) 1vw, 100vw"
              playOn={playOn}
            />
            {noisy ? (
              <VelocityLayers hostRef={plateRef} wake={frame} objectPosition={pos(plate.focal)} />
            ) : null}
            {moving ? (
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-bg"
                style={{ opacity: darken }}
              />
            ) : null}
          </motion.div>
        </Lens>
      </div>

      {/* — The text column (server-rendered; the h1 never animates) — */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-page px-gutter pt-[calc(var(--header-h)+var(--spacing-tier-block))] sm:py-(--header-h)"
        style={moving ? { y: textY } : undefined}
      >
        {children}
      </motion.div>

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
            frame={mobile.box}
            origin={mobile.focal[0]}
            onSettled={onSettled}
          >
            <MediaFrame
              media={mobile.media}
              poster={mobile.poster}
              priority
              layout="intrinsic"
              sizes="(max-width: 639px) 92vw, 1vw"
              playOn="never"
            />
          </Lens>
        </div>
      </div>
    </section>
  );
}
