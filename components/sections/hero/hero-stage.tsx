"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  parseSkipFlags,
  shouldSkip,
  useFinePointer,
  useMediaQuery,
  useReducedMotion,
  useSaveData,
} from "@/lib/flags";
import { hasRunThisSession, markRunThisSession } from "@/lib/session";
import { dur, ease, easeClip, springSoft } from "@/lib/motion";
import type { MediaId } from "@/lib/media";
import { useVariant } from "@/lib/use-variant";
import type { Variant, VariantChoice } from "@/lib/variants";
import { Lens, type LensState } from "@/components/primitives/lens";
import { MediaFrame } from "@/components/primitives/media-frame";
import {
  coverBox,
  sameBox,
  settleFrame,
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
 *              poster.decode() (desktop) or on the portrait's decode at ≥ 50 % in
 *              view (mobile), easeClip / dur.hero; decode failure or 1200 ms
 *              → open (S1′). While the prologue is up the Lens waits CLOSED
 *              under the opaque overlay: Play (html.intro-launched) opens it
 *              instantly, so the flight lands on an open Lens (S0i, H25).
 *              A dismissal (Skip / Esc / scroll: html.intro-leaving) opens it
 *              the same way, with NO aperture: the overlay's text is gone in
 *              80 ms and its plate fades over dur.base onto the open hero
 *              (a closed Lens under a fading castle read as a stray box).
 *   velocity   VelocityNoise on the plate only (grain, chroma, wake).
 *   pointer    the plate shifts ≤ 6 px (fine pointer), reset on leave.
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
 */

const WIDE = "(min-width: 40rem)";
/** decode wait before the aperture gives up and opens (S1′). */
const APERTURE_TIMEOUT_MS = 1200;
/** The film gate (hero.aperture ALT): its first stop is the act cards'
 *  letterbox (--letterbox-ratio), and its edges are feathered like the
 *  Lens clip so no hard seam crosses the name. */
const LETTERBOX = 2.39;
const GATE_FEATHER = 48;
const GATE_CLOSED = "linear-gradient(transparent, transparent)";
/** Pointer shift cap (px) and the scroll-out map (hero-lens.BAR S4). */
const SHIFT_PX = 6;
const EXIT: Record<"scale" | "mediaY" | "textY" | "darken", { at: number[]; to: number[] }> = {
  scale: { at: [0, 0.2, 0.7], to: [1, 1.03, 1.08] },
  mediaY: { at: [0.2, 0.7], to: [0, -24] },
  textY: { at: [0.2, 0.7], to: [0, -16] },
  darken: { at: [0.7, 1], to: [0, 1] },
};

export type HeroPlate = {
  /** The still (the LCP poster / the mobile plate). */
  poster: MediaId;
  /** The still's intrinsic size (the cover fit). */
  size: Size;
  focal: readonly [number, number];
  /** The crest box in PLATE fractions. */
  box: Box01;
  /** The horizon's y (plate fraction): where the ALT film gate opens. */
  horizon: number;
  /** The loop each hero.loop variant plays over THIS still (a video
   *  registered to it), or null: the still stays. */
  loops: Record<Variant, MediaId | null>;
};
/** Both sides of hero.plate. */
export type HeroPlates = Record<Variant, HeroPlate>;

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
  /** Each plate's crest box in frame fractions at the reference viewport. */
  frames: Record<Variant, Box01>;
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
  choice,
  plates,
  mobiles,
  frames,
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
    const kind = apertureKindOf(el.getAttribute("data-aperture"));
    if (kind) {
      const slot = window as unknown as Record<string, number | undefined>;
      window.clearTimeout(slot[FAILSAFE_SLOT]);
      t = window.setTimeout(() => setRun({ which, state: "closed", kind }), 0);
      return () => window.clearTimeout(t);
    }
    if (!root.classList.contains("intro-armed")) return;
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

  /* — The bracket's frame: the crest box through the cover fit, ≥ 16 px
       right of the h1 (H7). Measured on resize and after the fonts land. — */
  const [frame, setFrame] = useState<Box01>(frames[plateV]);
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
      const margin = col ? parseFloat(getComputedStyle(col).paddingRight) || 8 : 8;
      const next = settleFrame(coverBox(plate.box, plate.size, { w, h }, plate.focal), {
        w,
        h,
        inset,
        margin,
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
    const cy = coverBox({ x0: 0, x1: 1, y0: p.horizon, y1: p.horizon }, p.size, { w, h }, p.focal).y0 * h;
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
    const frameBox = gateWhich === "desktop" ? frame : p.box;
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
          // the Lens root is `relative` (cn() does not merge, so an
          // `absolute inset-0` here lost to it and the box collapsed to 0 px
          // tall); its parent is absolute inset-0, so fill it by size.
          className="size-full"
        >
          <motion.div
            ref={plateRef}
            data-hero-plate=""
            className="absolute inset-0 origin-center"
            style={{
              maskImage: gateMask,
              WebkitMaskImage: gateMask,
              ...(moving ? { scale: plateScale, x: shiftX, y: plateY } : null),
            }}
          >
            <MediaFrame
              // a plate / loop switch (?variant=…) remounts: fresh poster
              // state and a fresh decoder claim
              key={`${plate.poster}:${media}`}
              media={media}
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
              <VelocityLayers
                key={plate.poster}
                hostRef={plateRef}
                wake={frame}
                objectPosition={pos(plate.focal)}
                dialect={velocityV === "alt" ? "spray" : "grain"}
              />
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
        ref={columnRef}
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
            <motion.div style={{ maskImage: gateMask, WebkitMaskImage: gateMask }}>
              <MediaFrame
                key={mobile.poster}
                media={mobile.poster}
                poster={mobile.poster}
                priority
                layout="intrinsic"
                sizes="(max-width: 639px) 92vw, 1vw"
                playOn="never"
              />
            </motion.div>
          </Lens>
        </div>
      </div>
    </section>
  );
}
