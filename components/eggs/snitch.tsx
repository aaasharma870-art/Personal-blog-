"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { easeDraw } from "@/lib/motion";
import { copyVisible } from "@/lib/sections";
import { hasRunThisSession, markRunThisSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useDrawPhase } from "@/components/site/world-motion";
import { eggCopy } from "@/components/eggs/egg-copy";
import {
  SNITCH_EVENT,
  catchSnitch,
  eggEnabled,
  eggsSessionOff,
  snitchCaught,
  subscribeEggs,
  triggerEgg,
} from "@/components/eggs/egg-bus";
import { HUNT_TOTAL, useHuntState } from "@/components/eggs/hunt-store";

/* ============================================================================
   THE SNITCH (IC-HP-12; SPEC v2 SM-13; eggs.BAR E8, E10, E14) — the credits'
   auto-egg. VISIBLE AT REST (RECOGNIZABILITY S19: F32 showed none): a small
   flat gold body with two wing strokes, resting beside "↑ Back to the
   opening". Once per session, when the credits fill ≥ 60 % of the viewport,
   it darts for ≤ 4 s on transform-only béziers in the empty space to the
   right of the link row (never following the cursor), then rests again. It
   is a real <button aria-label="Catch the snitch">: catching it adds the
   credits row SEEKER — you. No score, ever (RD-P8). Reduced motion / Pause /
   "Turn off easter eggs": it only rests (still catchable).
   Our own drawing (a gold sphere, two feathered wings): no crest, no mark.
   PHASE 3 (PHASE3-SPEC §3.6, §9.1 #3; W2-HUNT): the catch counts the hunt
   egg hp-snitch (lib/hunt.ts markFound, loaded on the catch); the SEEKER
   row reads the HUNT (localStorage), not this session's catch (B10), and
   steps aside at 12/12, where THE HUNT block names the Seeker. The dart
   fires `triggerEgg("snitch")` (the sound engine's wing flutter; the egg
   host ignores it: an appearance never counts). The dart's spotlight
   request (B57) belongs to the credits' wave-3 owner.
   ========================================================================== */

/** Count the find (idempotent); the hunt actions load on the catch. */
function countCatch(): void {
  void import("@/lib/hunt").then((m) => m.markFound("hp-snitch"));
}

const RUN_KEY = "egg:snitch";
/** The dart: offsets from the rest spot (px), right of the link row. */
const DART_X = [0, 150, 250, 120, 230, 90, 170, 0];
const DART_Y = [0, -46, -8, 28, -30, 14, -18, 0];
const DART_S = 3.2;

function subscribeCaught(onChange: () => void): () => void {
  window.addEventListener(SNITCH_EVENT, onChange);
  return () => window.removeEventListener(SNITCH_EVENT, onChange);
}

/** Caught this session (false on the server and during hydration). */
function useCaught(): boolean {
  return useSyncExternalStore(subscribeCaught, snitchCaught, () => false);
}

function SnitchArt({ flutter }: { flutter: boolean }) {
  return (
    <svg viewBox="0 0 40 22" width={40} height={22} aria-hidden="true" focusable="false" className="overflow-visible" data-motif="snitch">
      {/* the wings: three feathered strokes each (flutter only while darting) */}
      <motion.g
        fill="none"
        stroke="var(--fg-muted)"
        strokeWidth={1.2}
        strokeLinecap="round"
        initial={false}
        animate={{ scaleY: flutter ? [1, 0.45] : 1 }}
        transition={flutter ? { duration: 0.12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } : { duration: 0.1 }}
      >
        <path d="M15 11C11 6 6 4.6 1.4 5.4M15.4 12.4C11 9.4 6.4 9 2.6 10M15.6 13.6C12 12.6 8.4 13 5.4 14.6" />
        <path d="M25 11C29 6 34 4.6 38.6 5.4M24.6 12.4C29 9.4 33.6 9 37.4 10M24.4 13.6C28 12.6 31.6 13 34.6 14.6" />
      </motion.g>
      {/* the gold body and its seams */}
      <circle cx={20} cy={12.5} r={5.2} fill="var(--w-ink-contour)" />
      <path d="M15.6 10.6C18.4 12.4 21.6 12.4 24.4 10.6M16.4 15.4C18.8 14 21.2 14 23.6 15.4" fill="none" stroke="var(--color-deep)" strokeWidth={0.7} strokeOpacity={0.55} />
    </svg>
  );
}

export function Snitch({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const caught = useCaught();
  const eggsOff = useSyncExternalStore(subscribeEggs, eggsSessionOff, () => false);
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [darting, setDarting] = useState(false);

  // the one dart: credits ≥ 60 % of the viewport (or of themselves), once
  useEffect(() => {
    if (!eggEnabled("snitch") || reduced || eggsOff || caught) return;
    if (hasRunThisSession(RUN_KEY)) return;
    const host = ref.current?.closest("footer") ?? ref.current?.parentElement;
    if (!host || typeof IntersectionObserver === "undefined") return;
    let stop: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e || !e.isIntersecting) return;
        const vh = e.rootBounds?.height ?? window.innerHeight;
        if (e.intersectionRatio < 0.6 && e.intersectionRect.height < vh * 0.6) return;
        io.disconnect();
        // stay inside the viewport (a transform past the edge would add a
        // horizontal scroll): scale the dart to the room on the right
        const r = ref.current?.getBoundingClientRect();
        const room = r ? window.innerWidth - r.right - 16 : 0;
        const k = Math.max(0, Math.min(1, room / Math.max(...DART_X)));
        if (k < 0.35) return; // no room to fly (a phone): it just rests
        markRunThisSession(RUN_KEY);
        setDarting(true);
        triggerEgg("snitch");
        const cx = animate(x, DART_X.map((v) => v * k), { duration: DART_S, ease: easeDraw });
        const cy = animate(y, DART_Y, { duration: DART_S, ease: "easeInOut", onComplete: () => setDarting(false) });
        stop = () => {
          cx.stop();
          cy.stop();
        };
      },
      { threshold: Array.from({ length: 11 }, (_, i) => i / 10) },
    );
    io.observe(host);
    return () => {
      io.disconnect();
      stop?.();
    };
  }, [reduced, eggsOff, caught, x, y]);

  // motion off mid-dart (Pause) or caught: straight back to the rest spot
  useEffect(() => {
    if (!reduced && !caught) return;
    x.stop();
    y.stop();
    x.jump(0);
    y.jump(0);
  }, [reduced, caught, x, y]);

  if (!eggEnabled("snitch")) return null;
  const label = caught ? eggCopy["snitch.caught"] : eggCopy["snitch.label"];
  if (!copyVisible(label)) return null;

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label.text}
      onClick={() => {
        if (!caught) catchSnitch();
        // also after a reset of the hunt, when this session already caught it
        countCatch();
        setDarting(false);
      }}
      style={{ x, y }}
      className={cn(
        "relative inline-flex size-11 shrink-0 items-center justify-center rounded-control transition-opacity",
        caught ? "opacity-70" : "hover:opacity-90",
        className,
      )}
      data-egg="snitch"
      data-darting={darting ? "" : undefined}
    >
      <SnitchArt flutter={darting} />
    </motion.button>
  );
}

/** SEEKER — you: the credits row the caught Snitch adds (absent at rest and
 *  on the server: E1). It reads the hunt (B10), so it survives a reload and
 *  Obliviate; at 12/12 THE HUNT block carries "Seeker — you" instead.
 *  Mirrors the roll's row grid. */
export function SeekerRow() {
  const { count, found } = useHuntState();
  if (!found.has("hp-snitch") || count === HUNT_TOTAL || !eggEnabled("snitch")) return null;
  const role = eggCopy["credits.seeker.role"];
  const name = eggCopy["credits.seeker.name"];
  if (!copyVisible(role) || !copyVisible(name)) return null;
  return (
    <div
      className="grid grid-cols-1 gap-1 border-t border-rule py-tier-group sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-8"
      data-credits-row="seeker"
    >
      <dt className="type-meta text-fg-muted sm:pt-0.5 sm:text-right">{role.text}</dt>
      <dd className="type-body text-fg">{name.text}</dd>
    </div>
  );
}

/** The ink fold under the last line (S19 ④): a short ink line drawing CLOSED
 *  from both ends to the middle once it enters — the Map folding shut.
 *  aria-hidden; final state = closed (SSR, reduced motion, no JS). */
export function InkFold({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const phase = useDrawPhase(ref, 0.8);
  const t = (delay: number) => ({
    initial: false as const,
    animate: { pathLength: phase === "armed" ? 0 : 1 },
    transition: phase === "entered" ? { duration: 0.7, ease: easeDraw, delay } : { duration: 0 },
  });
  return (
    <svg
      ref={ref}
      viewBox="0 0 160 8"
      aria-hidden="true"
      focusable="false"
      className={cn("h-2 w-40 overflow-visible", className)}
      fill="none"
      data-motif="ink-fold"
    >
      <g stroke="var(--w-ink-contour)" strokeWidth={1.2} strokeLinecap="round" vectorEffect="non-scaling-stroke">
        <motion.path d="M2 4C30 2.6 56 5.2 80 4" {...t(0)} />
        <motion.path d="M158 4C130 5.4 104 2.8 80 4" {...t(0)} />
        <motion.path d="M80 1.2V6.8" {...t(0.6)} />
      </g>
    </svg>
  );
}
