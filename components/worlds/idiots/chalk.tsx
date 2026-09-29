"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { readSession } from "@/lib/session";
import { dur, ease, easeClip, easeDraw, springSettle } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useEnterOnce } from "@/components/primitives/use-enter-once";

/* ============================================================================
   ACT II CHALK KIT (components/worlds/idiots) — the drawn objects the 3 Idiots
   workshop shares (SPEC v2 SM-6/7/8, ICONS IC-3I-01…09, RECOGNIZABILITY
   S08–S11). Chalk is --w-chalk, 2 px, through one `chalkRough` displacement
   per SVG (our own filter). Everything here is aria-hidden art: the meaning
   always lives in HTML beside it. Motion: server HTML = the final frame; a
   mark hides only while offscreen (useEnterOnce) and draws once; reduced
   motion / Pause = static.
   ========================================================================== */

/** The shared chalk roughness filter (one per SVG; pass a unique id). */
export function ChalkFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-5%" y="-20%" width="110%" height="140%">
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
 * left (clip, easeClip / dur.hero) instead of settling.
 * Server / hydration / in view at mount / motion off: the final frame.
 */
const CLIP_OPEN = "inset(0% 0% 0% 0%)";
const CLIP_WIPED = "inset(0% 100% 0% 0%)";

export function SettleFrame({
  children,
  className,
  entrance = "settle",
  amount = 0.3,
}: {
  children: ReactNode;
  className?: string;
  entrance?: "settle" | "wipe";
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount });
  // motion values, never React style: the server renders the final frame
  // (opacity 1, no transform, no clip), and the swap to the armed state
  // happens offscreen before paint.
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);
  const clipPath = useMotionValue(CLIP_OPEN);

  useLayoutEffect(() => {
    if (phase === "static") {
      y.jump(0);
      scale.jump(1);
      opacity.jump(1);
      clipPath.jump(CLIP_OPEN);
      return;
    }
    if (phase === "armed") {
      if (entrance === "wipe") clipPath.jump(CLIP_WIPED);
      else {
        y.jump(8);
        scale.jump(0.96);
        opacity.jump(0);
      }
      return;
    }
    // entered
    if (entrance === "wipe") {
      const a = animate(clipPath, CLIP_OPEN, { duration: dur.hero, ease: easeClip });
      return () => a.stop();
    }
    const fade = animate(opacity, 1, { duration: dur.base, ease });
    const grow = animate(scale, 1, { type: "spring", ...springSettle });
    const pat1 = animate(y, 0, { type: "spring", ...springSettle });
    let pat2: { stop: () => void } | null = null;
    // the second soft pat: a small downward kick that settles again
    const t = window.setTimeout(() => {
      pat2 = animate(y, 0, { type: "spring", ...springSettle, velocity: 90 });
    }, 180);
    return () => {
      window.clearTimeout(t);
      fade.stop();
      grow.stop();
      pat1.stop();
      pat2?.stop();
    };
  }, [phase, entrance, y, scale, opacity, clipPath]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={entrance === "wipe" ? { clipPath } : { y, scale, opacity }}
      data-entrance={entrance}
    >
      {children}
    </motion.div>
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

/**
 * ChalkQuadcopter — a small unlabelled chalk doodle of a homemade
 * quadcopter (four rotors on crossed arms, a strapped battery, a board and
 * a camera stub; our own drawing, never a window, feed or sprite). It lifts
 * 8 px (≤ 400 ms) each time `liftKey` changes to a new positive value (a
 * Run that cleared all the gates), and settles back when it resets to 0.
 * aria-hidden; static under reduced motion. Sensitivity (IC-3I-08): no
 * label, no link to Aryan's own drone work.
 */
export function ChalkQuadcopter({ liftKey, className }: { liftKey: number; className?: string }) {
  const reduced = useReducedMotion();
  // the <svg> itself moves (its CSS px are screen px: an 8 px lift at any
  // rendered size)
  const ref = useRef<SVGSVGElement>(null);
  const fid = useSvgId("chalk-quad");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // "Turn off easter eggs" (the palette, session) stops the lift too
    if (reduced || (liftKey > 0 && readSession("eggs-off") === "1")) {
      el.style.transform = "";
      return;
    }
    const a = animate(el, { y: liftKey > 0 ? -8 : 0 }, { duration: liftKey > 0 ? 0.36 : dur.base, ease });
    return () => a.stop();
  }, [liftKey, reduced]);
  // rotors: centre points; arms cross at the body
  const rotors: [number, number][] = [
    [22, 26],
    [98, 26],
    [14, 50],
    [106, 50],
  ];
  return (
    <svg
      ref={ref}
      viewBox="0 0 120 84"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto overflow-visible", className)}
      data-egg="quadcopter"
    >
      <defs>
        <ChalkFilter id={fid} />
      </defs>
      <g filter={`url(#${fid})`} className="stroke-(--w-chalk)" fill="none" strokeWidth={2} strokeLinecap="round">
        {/* arms */}
        <path d="M22 30 L60 42 L98 30 M14 52 L60 42 L106 52" />
        {/* motors + rotor discs (ellipses read as spinning blades) */}
        {rotors.map(([x, y]) => (
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
  );
}

/* — O-5: Virus's astronaut pen (the kill-list header cue) ———————————— */

/**
 * AstronautPen — Virus's astronaut pen (3 Idiots; kept for the one student
 * who proves worthy) as a brass line drawing on a small lacquered stand,
 * 96 px, aria-hidden. Its site truth: only 3 ideas earned their place. A
 * header cue only (O-5): never on a row, never animated at rest.
 */
export function AstronautPen({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 64"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-24 overflow-visible", className)}
      data-motif="astronaut-pen"
    >
      <g fill="none" className="stroke-(--w-brass)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        {/* the stand: a lacquered plinth with a cradle */}
        <path d="M14 56 L82 56 L78 50 L18 50 Z" />
        <path d="M24 50 L28 44 M72 50 L68 44" />
        <path d="M22 44 C26 40 32 40 34 44 M62 44 C64 40 70 40 74 44" strokeOpacity={0.8} />
        {/* the pen, resting in the cradle: barrel, grip, cap, clip, nib */}
        <path d="M10 40 L80 30" strokeWidth={5.5} className="stroke-(--w-brass)" strokeOpacity={0.35} />
        <path d="M12 43 L80 33 M10 37.5 L78 27.5" />
        <path d="M78 27.5 L86 29.5 L80 33" />
        <path d="M34 34 L34.8 39.7 M52 31.3 L52.8 37" strokeOpacity={0.7} />
        <path d="M58 28 L74 25.6" strokeOpacity={0.9} />
        <path d="M10 37.5 C6 38.4 6 42.6 12 43" />
        {/* a star glint on the barrel: "it writes in space" */}
        <path d="M44 22 L44 28 M41 25 L47 25" strokeOpacity={0.7} strokeWidth={1.2} />
      </g>
    </svg>
  );
}

/* — The ICE chalkboard frame (S09: the chapter panels) ———————————————— */

/**
 * ChalkboardFrame — frames a blueprint panel as an ICE classroom board: a
 * wooden frame, a slate-green margin with the ghost of old chalk, and a
 * chalk ledge holding one chalk stub and a felt duster. Pure CSS/SVG from
 * the world tokens (wood = brass into the board's deep). Decorative: the
 * panel inside carries the meaning.
 */
export function ChalkboardFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)} data-motif="ice-board">
      {/* the wooden frame */}
      <div
        className="rounded-[10px] p-2.5 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--w-brass)_30%,transparent)] sm:p-3"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--w-brass) 46%, var(--idi-deep)) 0%, color-mix(in oklab, var(--w-brass) 34%, var(--idi-deep)) 100%)",
        }}
      >
        {/* the slate margin (green-black, the ghost of yesterday's chalk) */}
        <div
          className="rounded-[4px] p-3 sm:p-5"
          style={{
            backgroundColor: "var(--idi-overlay)",
            backgroundImage:
              "radial-gradient(ellipse 40% 18% at 22% 30%, color-mix(in oklab, var(--w-chalk) 5%, transparent), transparent 70%), radial-gradient(ellipse 34% 14% at 74% 70%, color-mix(in oklab, var(--w-chalk) 4%, transparent), transparent 70%)",
          }}
        >
          {children}
        </div>
      </div>
      {/* the chalk ledge: a wood strip the width of the board … */}
      <div
        aria-hidden="true"
        className="relative mx-1.5 -mt-1 h-2 rounded-b-[3px]"
        style={{ background: "color-mix(in oklab, var(--w-brass) 40%, var(--idi-deep))" }}
      >
        {/* … holding one chalk stub and a felt duster (right third) */}
        <svg
          viewBox="0 0 90 16"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute bottom-full right-[14%] h-4 w-[5.6rem] overflow-visible"
        >
          <rect x="2" y="10" width="15" height="5.5" rx="2.4" className="fill-(--w-chalk)" fillOpacity={0.92} />
          <rect x="34" y="3" width="50" height="8" rx="1.6" style={{ fill: "color-mix(in oklab, var(--w-brass) 58%, var(--idi-deep))" }} />
          <rect x="35" y="11" width="48" height="5" rx="1" className="fill-(--w-storm)" />
        </svg>
      </div>
    </div>
  );
}
