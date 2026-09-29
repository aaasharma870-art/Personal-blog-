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
 * The IntersectionObserver watches an UNCLIPPED, untransformed wrapper; the
 * clip / transform live on the inner frame (ART-DIRECTOR #1: an observer on
 * the element carrying a zero-area clip-path may never report "entered").
 * `className` styles the inner frame (as before); `wrapperClassName` the
 * observed box.
 */
const CLIP_OPEN = "inset(0% 0% 0% 0%)";
const CLIP_WIPED = "inset(0% 100% 0% 0%)";

export function SettleFrame({
  children,
  className,
  wrapperClassName,
  entrance = "settle",
  amount = 0.3,
}: {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
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
    <div ref={ref} className={wrapperClassName} data-entrance={entrance}>
      <motion.div className={className} style={entrance === "wipe" ? { clipPath } : { y, scale, opacity }}>
        {children}
      </motion.div>
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
 * PenCase — the CODE stand-in for the kill-list's head plate (iconic-pen)
 * while that plate is still "planned": Virus's astronaut pen (3 Idiots; kept
 * for the one student who proves worthy) lying in the groove of an open
 * velvet presentation case, lid up, on a dark desk under a warm side light.
 * Drawn large (it fills the inset, ≥ 45 % of the content width at 1440) so
 * it reads as a pen in its case — the 56 px stand doodle read as a sled
 * (ART-DIRECTOR #9). Our own drawing: no text, no figure, no stopwatch (not
 * verified in the film, RECOGNIZABILITY S11). aria-hidden: the caption
 * VIRUS'S ASTRONAUT PEN • 3 IDIOTS carries the meaning. Static at rest.
 */
export function PenCase({ className }: { className?: string }) {
  const id = useSvgId("pen-case");
  const knurl = Array.from({ length: 10 }, (_, i) => 216 + i * 5);
  return (
    <svg
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("block size-full", className)}
      data-motif="astronaut-pen"
    >
      <defs>
        <radialGradient id={`${id}-desk`} cx="64%" cy="56%" r="78%">
          <stop offset="0" stopColor="#1c232b" />
          <stop offset="0.55" stopColor="#0d1115" />
          <stop offset="1" stopColor="#05070a" />
        </radialGradient>
        <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a321b" />
          <stop offset="1" stopColor="#1e140a" />
        </linearGradient>
        <linearGradient id={`${id}-lining`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3f6c" />
          <stop offset="0.5" stopColor="#18264a" />
          <stop offset="1" stopColor="#0d1630" />
        </linearGradient>
        <radialGradient id={`${id}-velvet`} cx="56%" cy="40%" r="72%">
          <stop offset="0" stopColor="#24386c" />
          <stop offset="0.65" stopColor="#131f40" />
          <stop offset="1" stopColor="#0a1126" />
        </radialGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5f7f8" />
          <stop offset="0.35" stopColor="#cdd4d9" />
          <stop offset="0.72" stopColor="#8e989f" />
          <stop offset="1" stopColor="#4c555c" />
        </linearGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2d38e" />
          <stop offset="0.5" stopColor="#b98e4d" />
          <stop offset="1" stopColor="#6d4f27" />
        </linearGradient>
        <radialGradient id={`${id}-glint`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* the desk, lit from the right */}
      <rect width="640" height="360" fill={`url(#${id}-desk)`} />
      <ellipse cx="362" cy="322" rx="282" ry="20" fill="#000" fillOpacity={0.5} />

      {/* the lid, open behind the case: lacquered shell, satin lining, sheen */}
      <path d="M150 30 L570 30 L602 150 L118 150 Z" fill={`url(#${id}-shell)`} />
      <path d="M150 30 L570 30 L602 150 L118 150 Z" fill="none" stroke="#a8834a" strokeOpacity={0.75} strokeWidth={2} strokeLinejoin="round" />
      <path d="M166 43 L554 43 L582 142 L138 142 Z" fill={`url(#${id}-lining)`} />
      <path d="M330 43 L404 43 L352 142 L262 142 Z" fill="#ffffff" fillOpacity={0.05} />

      {/* the body: shell, front face, hinge */}
      <path d="M118 150 L602 150 L630 298 L90 298 Z" fill={`url(#${id}-shell)`} />
      <path d="M90 298 L630 298 L630 320 L90 320 Z" fill="#24180c" />
      <path d="M90 298 L630 298" stroke="#a8834a" strokeOpacity={0.6} strokeWidth={1.5} />
      <path d="M118 150 L602 150" stroke="#c9a15d" strokeWidth={3} strokeLinecap="round" />
      <rect x="330" y="300" width="60" height="9" rx="2" fill={`url(#${id}-brass)`} />

      {/* the velvet bed and the groove the pen lies in */}
      <path d="M138 162 L582 162 L608 286 L112 286 Z" fill={`url(#${id}-velvet)`} />
      <g transform="rotate(-7 362 226)">
        <rect x="168" y="210" width="386" height="32" rx="16" fill="#050914" />
        <rect x="186" y="226" width="350" height="14" rx="7" fill="#000" fillOpacity={0.55} />
        {/* the pen: nib, knurled grip, ring, barrel, cap band, cap + clip, button */}
        <path d="M182 226 L212 218.5 L212 233.5 Z" fill={`url(#${id}-steel)`} />
        <path d="M182 226 L190 224" stroke="#2f353a" strokeWidth={1.4} strokeLinecap="round" />
        <rect x="212" y="218" width="54" height="16" rx="2" fill={`url(#${id}-steel)`} />
        {knurl.map((x) => (
          <path key={x} d={`M${x} 219.5 L${x} 232.5`} stroke="#59636b" strokeOpacity={0.75} strokeWidth={1} />
        ))}
        <rect x="266" y="216.5" width="7" height="19" fill={`url(#${id}-brass)`} />
        <rect x="273" y="217" width="202" height="18" rx="3" fill={`url(#${id}-steel)`} />
        <path d="M280 220.6 L470 220.6" stroke="#ffffff" strokeOpacity={0.75} strokeWidth={1.6} strokeLinecap="round" />
        <rect x="475" y="215.5" width="8" height="21" fill={`url(#${id}-brass)`} />
        <rect x="483" y="216.5" width="46" height="19" rx="4" fill={`url(#${id}-steel)`} />
        <path d="M490 212.5 L447 212.5 Q441 212.5 441 217 L441 219.5 L448 219.5 L448 216.5 L490 216.5 Z" fill={`url(#${id}-brass)`} />
        <rect x="529" y="220" width="12" height="12" rx="5" fill={`url(#${id}-brass)`} />
      </g>

      {/* a star glint on the barrel: "it writes in space" */}
      <circle cx="398" cy="206" r="14" fill={`url(#${id}-glint)`} />
      <path d="M398 194 L398 218 M386 206 L410 206" stroke="#ffffff" strokeOpacity={0.85} strokeWidth={1.4} strokeLinecap="round" />
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
