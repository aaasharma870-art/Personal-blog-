"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { principles, type Principle } from "@/lib/content";
import { film } from "@/lib/film";
import { copyVisible } from "@/lib/sections";
import { dur, ease, easeClip } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Meta } from "@/components/site/world-kit";
import { PatronusRibbons } from "@/components/site/hp-ink";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { Footprint } from "@/components/worlds/hp/footprints";

/* ============================================================================
   PRINCIPLES · DEFAULT "marauders-map" (RECOGNIZABILITY S18, T11; ICONS
   IC-HP-05 / IC-HP-06 / IC-HP-07 grammar, re-hosted as this section's map).

   - THE SHEET: an aged-parchment plane (data-tone="paper", hp: the paper
     tokens, AA already CALC'd) with a gold wash, two vertical and one
     horizontal fold crease (≤ 4 % ink) and faint edge wear. Out of the
     Great Hall it UNFOLDS FROM THE CENTRE: three panels, the outer two
     scaleX 0 → 1 from the middle panel's edges (transform only, easeClip /
     dur.hero), then the ink and the text arrive (opacity).
   - THE ROOMS: each principle is a room drawn in ink — four walls with a
     door on the left — joined by ONE corridor running down the map's left
     edge. A short passage leads from the corridor to every door.
   - THE WALK: a pair of footprints walks the corridor WITH the reader
     (scroll-driven: one useScroll per room, the reading line at 62 % of
     the viewport), turns in at each door, and fades behind (never below
     26 %: the map keeps your trail). A small YOU banner rides above the
     lead step (IC-HP-06: it follows only the visitor's own reading). The
     room you are in inks its walls darker: the active principle.
   - STATIC (server HTML, hydration, reduced motion / Pause, no JS, or the
     map already in view at mount): the sheet unfolded, the whole trail
     laid down faintly with each door's two steps darker, no banner.

   Our own drawing: rooms and corridors come from THIS page's list, never
   the film's castle plan; the prints are ours (worlds/hp/footprints).
   Everything here is aria-hidden except the list itself.
   ========================================================================== */

/** The door (and the passage to it) sits at this fraction of a room's height. */
const DOOR = 0.3;

type StepDef = {
  at: number;
  kind: "hall" | "door";
  top: string;
  left: string;
  rot: number;
  side: "left" | "right";
};

const HALL_MID = "calc((var(--wall-l) + var(--wall-r)) / 2)";

/** One room's steps, in walking order: down the corridor, two steps in at
 *  the door, then on down the corridor. */
const STEPS: readonly StepDef[] = (() => {
  const before = [0.05, 0.15, 0.24];
  const after = [0.42, 0.53, 0.64, 0.75, 0.86, 0.96];
  const hall = (at: number, i: number): StepDef => {
    const side: "left" | "right" = i % 2 ? "right" : "left";
    return {
      at,
      kind: "hall",
      top: `${(at * 100).toFixed(2)}%`,
      left: `calc(${HALL_MID} ${side === "left" ? "-" : "+"} 5px)`,
      rot: 180,
      side,
    };
  };
  return [
    ...before.map((a, i) => hall(a, i)),
    { at: DOOR, kind: "door", top: `calc(${DOOR * 100}% - 5px)`, left: "calc(var(--wall-r) - 2px)", rot: 90, side: "left" },
    { at: DOOR + 0.035, kind: "door", top: `calc(${DOOR * 100}% + 5px)`, left: "calc(var(--wall-r) + 14px)", rot: 90, side: "right" },
    ...after.map((a, i) => hall(a, i + before.length)),
  ];
})();

/** Step opacity with the reading line at `v` of the room: absent ahead of
 *  the walker, full at the lead, fading behind to the trail's 26 %. */
function stepOpacity(v: number, at: number): number {
  if (v < at) return 0;
  return Math.max(0.26, 1 - (v - at) * 2.2);
}

/** The latest step the walker has reached (for the YOU banner). */
function leadOf(v: number): StepDef {
  let lead = STEPS[0];
  for (const s of STEPS) if (s.at <= v) lead = s;
  return lead;
}

/* — parchment paint (paper tokens only; no text sits on the wear) — */
const PARCHMENT: CSSProperties = {
  backgroundColor: "color-mix(in oklab, var(--paper) 58%, var(--paper-edge))",
};
const CREASE_DARK = "rgb(46 35 24 / 0.04)";
const CREASE_LIGHT = "rgb(255 250 240 / 0.28)";
const WEAR: CSSProperties = {
  backgroundImage: [
    `linear-gradient(to right, transparent calc(33.333% - 1px), ${CREASE_DARK} calc(33.333% - 1px) 33.333%, ${CREASE_LIGHT} 33.333% calc(33.333% + 1px), transparent calc(33.333% + 1px) calc(66.667% - 1px), ${CREASE_DARK} calc(66.667% - 1px) 66.667%, ${CREASE_LIGHT} 66.667% calc(66.667% + 1px), transparent calc(66.667% + 1px))`,
    `linear-gradient(to bottom, transparent calc(50% - 1px), ${CREASE_DARK} calc(50% - 1px) 50%, ${CREASE_LIGHT} 50% calc(50% + 1px), transparent calc(50% + 1px))`,
    "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 62%, color-mix(in oklab, var(--paper-edge-deep) 30%, transparent) 100%)",
  ].join(", "),
};

export function PrinciplesMap({ ribbons }: { ribbons: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.15 });
  const folded = phase === "armed";
  // Mounted offscreen with motion on → the walk is scroll-driven. Otherwise
  // (server, hydration, reduced motion / Pause, in view at mount) → static.
  const live = phase !== "static";
  const unfold = phase === "entered" ? { duration: dur.hero, ease: easeClip } : { duration: 0 };
  const arrive = (delay: number) =>
    phase === "entered" ? { duration: dur.reveal, ease, delay } : { duration: 0 };

  return (
    <div
      ref={ref}
      data-tone="paper"
      data-world="hp"
      data-motif="marauders-map"
      data-map-phase={phase}
      className={cn(
        "relative isolate mt-tier-block text-fg",
        "[--hall-w:3.5rem] [--wall-l:0.75rem] [--wall-r:2.75rem]",
        "sm:[--hall-w:5.5rem] sm:[--wall-l:1.5rem] sm:[--wall-r:4rem]",
      )}
    >
      {/* the parchment: three panels, the outer two unfold from the centre */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 grid grid-cols-3">
        <motion.div
          className="origin-right"
          style={PARCHMENT}
          initial={false}
          animate={{ scaleX: folded ? 0 : 1 }}
          transition={unfold}
        />
        <div style={PARCHMENT} />
        <motion.div
          className="origin-left"
          style={PARCHMENT}
          initial={false}
          animate={{ scaleX: folded ? 0 : 1 }}
          transition={unfold}
        />
      </div>
      {/* fold creases + edge wear, once the sheet lies flat */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={WEAR}
        initial={false}
        animate={{ opacity: folded ? 0 : 1 }}
        transition={arrive(0.25)}
      />

      <motion.ol
        aria-label="Operating principles"
        className="relative px-2 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-12"
        initial={false}
        animate={{ opacity: folded ? 0 : 1 }}
        transition={arrive(0.35)}
      >
        {principles.map((p, i) => (
          <MapRoom key={p.n} p={p} index={i} live={live} ribbons={ribbons} />
        ))}
      </motion.ol>
    </div>
  );
}

function MapRoom({
  p,
  index,
  live,
  ribbons,
}: {
  p: Principle;
  index: number;
  live: boolean;
  ribbons: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress: walk } = useScroll({ target: ref, offset: ["start 62%", "end 62%"] });
  const [inRoom, setInRoom] = useState(false);
  useMotionValueEvent(walk, "change", (v) => setInRoom(v >= DOOR && v < 0.999));
  const active = live && inRoom;
  const bannerOpacity = useTransform(walk, (v) => (v > 0.01 && v < 0.999 ? 1 : 0));
  const bannerTop = useTransform(walk, (v) => `calc(${leadOf(v).top} - 2.5rem)`);

  return (
    <li
      ref={ref}
      className="relative grid grid-cols-[var(--hall-w)_minmax(0,1fr)]"
      data-room={index + 1}
      data-active={active ? "" : undefined}
    >
      {/* the corridor, the passage to this room's door, and the walk */}
      <div aria-hidden="true" className="relative">
        <span className="absolute inset-y-0 w-px bg-world-line/55" style={{ left: "var(--wall-l)" }} />
        <span
          className="absolute top-0 w-px bg-world-line/55"
          style={{ left: "var(--wall-r)", height: `calc(${DOOR * 100}% - 1rem)` }}
        />
        <span
          className="absolute bottom-0 w-px bg-world-line/55"
          style={{ left: "var(--wall-r)", top: `calc(${DOOR * 100}% + 1rem)` }}
        />
        <span
          className="absolute right-0 h-px bg-world-line/55"
          style={{ left: "var(--wall-r)", top: `calc(${DOOR * 100}% - 1rem)` }}
        />
        <span
          className="absolute right-0 h-px bg-world-line/55"
          style={{ left: "var(--wall-r)", top: `calc(${DOOR * 100}% + 1rem)` }}
        />
        {STEPS.map((s, k) => (
          <Step key={k} def={s} walk={walk} live={live} />
        ))}
        {live ? (
          <motion.span
            className="pointer-events-none absolute z-10 -translate-x-1/2 transition-opacity duration-(--dur-base) motion-off:transition-none"
            style={{ left: HALL_MID, top: bannerTop, opacity: bannerOpacity }}
            data-motif="you-banner"
          >
            <YouBanner />
          </motion.span>
        ) : null}
      </div>

      {/* the room */}
      <div className="relative px-4 py-8 sm:px-8 sm:py-10">
        <RoomWalls className="bg-world-line/45" />
        <RoomWalls
          className={cn(
            "bg-world-emphasis transition-opacity duration-(--dur-base) motion-off:transition-none",
            active ? "opacity-90" : "opacity-0",
          )}
        />
        <div className="relative grid grid-cols-1 gap-tier-pair sm:grid-cols-12 sm:gap-x-6">
          <Meta className="sm:col-span-2" fields={[p.n]} />
          <div className="sm:col-span-7">
            <h3 className="type-title text-fg">{p.title}</h3>
            {ribbons ? <PatronusRibbons className="mt-tier-pair" /> : null}
            <p className="mt-tier-group max-w-body type-body text-fg-muted">{p.body}</p>
          </div>
          {p.thinker ? <Meta className="sm:col-span-3 sm:text-right" fields={[p.thinker]} /> : null}
        </div>
      </div>
    </li>
  );
}

/** A room's four walls with a door gap on the left, inset from the row so
 *  neighbouring rooms stay separate while the corridor runs on. */
function RoomWalls({ className }: { className: string }) {
  const inset = "0.625rem";
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className={cn("absolute inset-x-0 h-px", className)} style={{ top: inset }} />
      <span className={cn("absolute inset-x-0 h-px", className)} style={{ bottom: inset }} />
      <span className={cn("absolute right-0 w-px", className)} style={{ top: inset, bottom: inset }} />
      <span
        className={cn("absolute left-0 w-px", className)}
        style={{ top: inset, height: `calc(${DOOR * 100}% - 1rem - ${inset})` }}
      />
      <span
        className={cn("absolute left-0 w-px", className)}
        style={{ top: `calc(${DOOR * 100}% + 1rem)`, bottom: inset }}
      />
    </span>
  );
}

function Step({ def, walk, live }: { def: StepDef; walk: MotionValue<number>; live: boolean }) {
  const opacity = useTransform(walk, (v) => stepOpacity(v, def.at));
  const rest = def.kind === "door" ? 0.62 : 0.3;
  return (
    <motion.span
      className="pointer-events-none absolute text-world-emphasis"
      style={{ top: def.top, left: def.left, x: "-50%", y: "-50%", rotate: def.rot, opacity: live ? opacity : rest }}
    >
      <Footprint side={def.side} size={9} />
    </motion.span>
  );
}

/** The Map's name banner, reading YOU (IC-HP-06): a parchment ribbon with
 *  notched ends, inked; the word is real text (aria-hidden: decorative). */
const YOU = film.copy["principles.you"];

function YouBanner() {
  if (!copyVisible(YOU)) return null;
  return (
    <span className="relative inline-flex h-6 min-w-[3.25rem] items-center justify-center px-2.5">
      <svg
        viewBox="0 0 48 18"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 size-full overflow-visible"
      >
        <path
          d="M0.5 1 L47.5 1 L43.5 9 L47.5 17 L0.5 17 L4.5 9 Z"
          className="fill-bg stroke-(--world-emphasis)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="relative type-meta leading-none text-fg">{YOU.text}</span>
    </span>
  );
}
