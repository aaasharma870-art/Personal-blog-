"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import type { BeatWeight } from "@/lib/beats";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { dur, ease, easeClip, easeDraw, springSettle } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { eggsSessionOff, subscribeEggs } from "@/components/eggs/egg-bus";
import { useEnterOnce } from "@/components/primitives/use-enter-once";

/* ============================================================================
   ACT II CHALK KIT (components/worlds/idiots) — the drawn objects the 3 Idiots
   workshop shares (SPEC v2 SM-6/7/8, ICONS IC-3I-01…09, RECOGNIZABILITY
   S08–S11). Chalk is --w-chalk, 2 px, through one `chalkRough` displacement
   per SVG (our own filter). Everything here is aria-hidden art: the meaning
   always lives in HTML beside it. Motion: server HTML = the final frame; a
   mark hides only while offscreen (useEnterOnce) and draws once; reduced
   motion / Pause = static.
   RASTER (P3-2, spec §12.1 #8): the chalk filter never sits on a moving
   element. Whatever moves (the settling board, the lifting quadcopter)
   moves a PROMOTED wrapper, so the filtered chalk inside is drawn once into
   its layer and the layer moves; the promotion lasts only while it moves.
   This is the kit's CLIENT half; ./chalk.tsx (no "use client") holds the
   static ChalkboardFrame, which the server chapters render as plain HTML
   (no first-load JS, W3 budget), and re-exports everything here.
   ========================================================================== */

/** The shared chalk roughness filter (one per SVG; pass a unique id).
 *  `region` (user units) fixes the filter region instead of the default
 *  bbox-relative one — for a group whose bbox grows as it draws (a few
 *  small marks would otherwise clip their own stroke caps). */
export function ChalkFilter({
  id,
  region,
}: {
  id: string;
  region?: { x: number; y: number; width: number; height: number };
}) {
  const box = region
    ? { filterUnits: "userSpaceOnUse" as const, ...region }
    : { x: "-5%", y: "-20%", width: "110%", height: "140%" };
  return (
    <filter id={id} {...box}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
    </filter>
  );
}

/** A unique, CSS-safe id for SVG defs. */
export function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/* — the aalIzzWell settle: two soft pats (IC-3I-03, DESIGN v3 §6.1) ————— */

/**
 * SettleFrame — a NON-interactive entrance (the board frame, a chalkboard
 * panel): springSettle fired twice, 180 ms apart (y 8 → 0, then 4 → 0: "two
 * soft pats", hand on heart) with the frame's scale .96 → 1. Never on a
 * control (the frame has none of its own focus), never on an error.
 * `entrance="wipe"` is the ALT: a felt duster wipes the frame on from the
 * left (easeClip / dur.hero) instead of settling — the frame (clipped to
 * its box) slides in from the left while its content counter-slides, so
 * the edge moves by two transforms, never an animated clip-path.
 * Server / hydration / in view at mount / motion off: the final frame.
 * The IntersectionObserver watches an UNCLIPPED, untransformed wrapper; the
 * clip / transform live on the inner frame (ART-DIRECTOR #1: an observer on
 * the element carrying a zero-area clip-path may never report "entered").
 * `className` styles the inner frame. It is promoted (will-change) only
 * while armed or moving: the chalk inside is drawn once, then the layer
 * moves (spec §12.1 #8).
 * `star` (PHASE3-SPEC §3.8): the entrance is a time star of the beat map
 * (the gauntlet board, B17): on DESKTOP_FINE it waits for the spotlight and
 * a "skip" shows the settled frame. The host carries `beatAttrs(star.id)`.
 * `desktopWipe` (P3-11 r1, J1: "B17 never visibly performed": the 8 px
 * settle was too quiet to read as the board's star): on DESKTOP_FINE the
 * DEFAULT enters with the duster's wipe too; phones keep the settle. The
 * frame always renders the wipe's two layers then, so the switch at
 * hydration is a style change, never a remount of the board.
 */
export function SettleFrame({
  children,
  className,
  entrance = "settle",
  desktopWipe = false,
  amount = 0.3,
  star,
}: {
  children: ReactNode;
  className?: string;
  entrance?: "settle" | "wipe";
  desktopWipe?: boolean;
  amount?: number;
  star?: { id: string; weight: BeatWeight };
}) {
  const fine = useDesktopFine();
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount, star });
  // motion values, never React style: the server renders the final frame
  // (opacity 1, no transform, no clip), and the swap to the armed state
  // happens offscreen before paint.
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);
  /** wipe: 1 = wiped off (the frame a full width left of its box) → 0. */
  const wiped = useMotionValue(0);
  const frameX = useTransform(wiped, (w) => `${(-w * 100).toFixed(3)}%`);
  const contentX = useTransform(wiped, (w) => `${(w * 100).toFixed(3)}%`);
  const [done, setDone] = useState(false);
  const wipe = entrance === "wipe" || (desktopWipe && fine);
  /** The wipe's two layers (always, when the entrance can become a wipe). */
  const layered = entrance === "wipe" || desktopWipe;

  useLayoutEffect(() => {
    if (phase === "static") {
      y.jump(0);
      scale.jump(1);
      opacity.jump(1);
      wiped.jump(0);
      return;
    }
    if (phase === "armed") {
      // every value set, so an entrance that changes while armed (desktopWipe
      // resolving after hydration) never keeps the other one's armed state
      wiped.jump(wipe ? 1 : 0);
      y.jump(wipe ? 0 : 8);
      scale.jump(wipe ? 1 : 0.96);
      opacity.jump(wipe ? 1 : 0);
      return;
    }
    // entered
    let live = true;
    const settled = () => {
      if (live) setDone(true);
    };
    if (wipe) {
      const a = animate(wiped, 0, { duration: dur.hero, ease: easeClip });
      a.finished.then(settled);
      return () => {
        live = false;
        a.stop();
      };
    }
    const fade = animate(opacity, 1, { duration: dur.base, ease });
    const grow = animate(scale, 1, { type: "spring", ...springSettle });
    const pat1 = animate(y, 0, { type: "spring", ...springSettle });
    let pat2: { stop: () => void } | null = null;
    let t = 0;
    // the second soft pat: a small downward kick that settles again
    const second = new Promise<unknown>((resolve) => {
      t = window.setTimeout(() => {
        if (!live) return;
        const kick = animate(y, 0, { type: "spring", ...springSettle, velocity: 90 });
        pat2 = kick;
        kick.finished.then(resolve);
      }, 180);
    });
    Promise.all([fade.finished, grow.finished, pat1.finished, second]).then(settled);
    return () => {
      live = false;
      window.clearTimeout(t);
      fade.stop();
      grow.stop();
      pat1.stop();
      pat2?.stop();
    };
  }, [phase, wipe, y, scale, opacity, wiped]);

  const moving = phase === "armed" || (phase === "entered" && !done);
  return (
    <div ref={ref} data-entrance={wipe ? "wipe" : "settle"}>
      {layered ? (
        // the old inset(0) clip at rest, as an overflow clip on the frame
        <motion.div
          className={cn(className, wipe && "overflow-clip", moving && (wipe ? "will-change-transform" : "will-change-[transform,opacity]"))}
          style={wipe ? { x: frameX, opacity } : { y, scale, opacity }}
        >
          <motion.div className={cn(wipe && moving && "will-change-transform")} style={wipe ? { x: contentX } : undefined}>
            {children}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div className={cn(className, moving && "will-change-[transform,opacity]")} style={{ y, scale, opacity }}>
          {children}
        </motion.div>
      )}
    </div>
  );
}

/* — A chalk loop that draws on demand (the tally's Rancho circle) ———————— */

/**
 * ChalkLoop — Rancho's circle (IC-3I-02) around real HTML text, drawn when
 * `on` flips true (not on scroll): the gauntlet tally circles itself only
 * after a real Run settles. `on` false → nothing is drawn. Reduced motion →
 * the loop appears drawn at once. The loop is sized in `em` around the
 * inline text, so it needs no measurement and never shifts layout.
 */
export function ChalkLoop({ on, children, className }: { on: boolean; children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const fid = useSvgId("chalk-loop");
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      {on ? (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 200 60"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -inset-x-4 -inset-y-2.5 h-[calc(100%+1.25rem)] w-[calc(100%+2rem)] overflow-visible"
          data-chalk="circle"
        >
          <defs>
            <ChalkFilter id={fid} />
          </defs>
          <motion.path
            d="M26 9 C70 1 150 2 186 14 C204 22 198 46 164 53 C118 61 52 60 18 49 C-4 41 2 16 36 7 L48 5"
            fill="none"
            className="stroke-(--w-chalk)"
            strokeWidth={2}
            strokeLinecap="round"
            filter={`url(#${fid})`}
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduced ? 0 : dur.draw.short, ease: easeDraw }}
          />
        </svg>
      ) : null}
    </span>
  );
}

/* — IC-3I-08: the chalk quadcopter doodle (the gauntlet egg) ———————————— */

/** The rotors' centre points (the arms cross at the body). */
const ROTORS: readonly (readonly [number, number])[] = [
  [22, 26],
  [98, 26],
  [14, 50],
  [106, 50],
];

/**
 * ChalkQuadcopter — a small unlabelled chalk doodle of a homemade
 * quadcopter (four rotors on crossed arms, a strapped battery, a board and
 * a camera stub; our own drawing, never a window, feed or sprite). It lifts
 * 8 px (≤ 400 ms) each time `liftKey` changes to a new positive value (a
 * Run that cleared all the gates), its rotors blurring for 400 ms (PHASE3-
 * SPEC §9.1 #8: a pre-drawn motion-blur layer faded by opacity, never a
 * filter), and settles back when it resets to 0. aria-hidden; static under
 * reduced motion and while the visitor has turned the eggs off for the
 * session (egg-bus: the B1 fix, PHASE3-SPEC §13 P3-8 #9). Sensitivity
 * (IC-3I-08): no label, no link to Aryan's own drone work.
 */
export function ChalkQuadcopter({ liftKey, className }: { liftKey: number; className?: string }) {
  const reduced = useReducedMotion();
  // "Turn off easter eggs" (the palette / hunt panel, session), live
  const eggsOff = useSyncExternalStore(subscribeEggs, eggsSessionOff, () => false);
  // a WRAPPER moves (its CSS px are screen px: an 8 px lift at any rendered
  // size), never the filtered <svg>: promoted while it lifts or settles, the
  // chalk is drawn once into its layer (spec §12.1 #8)
  const ref = useRef<HTMLSpanElement>(null);
  const blurRef = useRef<SVGSVGElement>(null);
  /** Lifted (or on its way up)? A reset at rest moves nothing. */
  const up = useRef(false);
  const fid = useSvgId("chalk-quad");
  useEffect(() => {
    const el = ref.current;
    const blur = blurRef.current;
    if (!el) return;
    if (reduced || (liftKey > 0 && eggsOff)) {
      el.style.transform = "";
      el.style.willChange = "";
      up.current = false;
      return;
    }
    const lift = liftKey > 0;
    if (!lift && !up.current) return;
    up.current = lift;
    // promoted for the move only (React never sets this span's style)
    el.style.willChange = "transform";
    const a = animate(el, { y: lift ? -8 : 0 }, { duration: lift ? 0.36 : dur.base, ease });
    // the rotors spin up: their blur layer (its own, unfiltered SVG) shows
    // for 400 ms, opacity only
    const spin =
      lift && blur && typeof blur.animate === "function"
        ? blur.animate([{ opacity: 0 }, { opacity: 0.9, offset: 0.25 }, { opacity: 0.9, offset: 0.7 }, { opacity: 0 }], {
            duration: 400,
            easing: "linear",
          })
        : null;
    a.finished.then(() => {
      if (ref.current === el) el.style.willChange = "";
    });
    return () => {
      a.stop();
      spin?.cancel();
    };
  }, [liftKey, reduced, eggsOff]);
  return (
    <span ref={ref} className={cn("inline-block", className)}>
      <span className="relative block">
        <svg
          viewBox="0 0 120 84"
          aria-hidden="true"
          focusable="false"
          className="block h-auto w-full overflow-visible"
          data-egg="quadcopter"
        >
          <defs>
            <ChalkFilter id={fid} />
          </defs>
          <g filter={`url(#${fid})`} className="stroke-(--w-chalk)" fill="none" strokeWidth={2} strokeLinecap="round">
            {/* arms */}
            <path d="M22 30 L60 42 L98 30 M14 52 L60 42 L106 52" />
            {/* motors + rotor discs (ellipses read as spinning blades) */}
            {ROTORS.map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <path d={`M${x} ${y + 2} L${x} ${y + 7}`} />
                <ellipse cx={x} cy={y} rx={15} ry={3.4} strokeOpacity={0.85} />
              </g>
            ))}
            {/* the body: a board with a strapped battery on top */}
            <rect x={46} y={36} width={28} height={12} rx={2} />
            <path d="M49 36 L49 30 L71 30 L71 36 M56 30 L56 36 M64 30 L64 36" strokeOpacity={0.9} />
            {/* the camera stub and landing legs */}
            <rect x={56} y={50} width={8} height={6} rx={1} />
            <path d="M48 48 L44 60 M72 48 L76 60 M40 60 L48 60 M72 60 L80 60" strokeOpacity={0.8} />
            {/* a loose wire, the jugaad tell */}
            <path d="M74 40 C82 44 80 50 86 50" strokeOpacity={0.6} strokeWidth={1.4} />
          </g>
        </svg>
        {/* the rotor blur (hidden at rest): wider, broken discs in chalk */}
        <svg
          ref={blurRef}
          viewBox="0 0 120 84"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute inset-0 size-full overflow-visible opacity-0"
          data-egg="quadcopter-blur"
        >
          <g className="stroke-(--w-chalk)" fill="none" strokeLinecap="round">
            {ROTORS.map(([x, y]) => (
              <g key={`b-${x}-${y}`}>
                <ellipse cx={x} cy={y} rx={18} ry={2.6} strokeWidth={1.2} strokeOpacity={0.55} strokeDasharray="7 4" />
                <ellipse cx={x} cy={y} rx={12} ry={1.8} strokeWidth={0.9} strokeOpacity={0.35} strokeDasharray="4 5" />
              </g>
            ))}
          </g>
        </svg>
      </span>
    </span>
  );
}
