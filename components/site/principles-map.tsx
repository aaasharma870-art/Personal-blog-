"use client";

import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
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
import { Lettered } from "@/components/primitives/scene-caption";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { Footprint } from "@/components/worlds/hp/footprints";
import { InkWall, MapBanner, MapTrail, Stairs, Turret } from "@/components/worlds/hp/map-ink";
import { CandleField, spotsIn } from "@/components/worlds/hp/hall-ceiling";

/* ============================================================================
   PRINCIPLES · DEFAULT "marauders-map" (RECOGNIZABILITY S18, T11; ICONS
   IC-HP-05 / IC-HP-06 / IC-HP-07 grammar; ART-DIRECTOR #10). The whole
   section — head included — is ONE sheet of the Map:

   - THE SHEET: aged parchment (data-tone="paper": the hp paper tokens, AA
     CALC'd; every text cell stays ≥ 5:1) folded in three panels with
     accordion shading, two vertical and three horizontal fold creases, a
     parchment grain and burnt edges. Out of the Great Hall it UNFOLDS FROM
     THE CENTRE: the outer panels scaleX 0 → 1 from the middle panel's
     edges (transform only, easeClip / dur.hero), then the ink and the text
     arrive (opacity). Above it the hall's last candles hang dim (T11: the
     hall darkens into the parchment).
   - THE TITLE: a swallow-tailed banner lettered in IM Fell ("THE MAP OF THE
     PRINCIPLES", proposed copy; registered lettering), flanked by round
     towers and other walkers' trails.
   - THE ROOMS: each principle is a room drawn in hand-inked double walls
     (a slight wobble, never CSS boxes) with a door on the left, joined by
     ONE corridor down the map's left edge. In each room's free corner a
     tower with its spiral stair or a hatched flight, and someone's trail
     walking to it (≥ lg).
   - THE WALK: a pair of 14 px footprints walks the corridor WITH the reader
     (scroll-driven: one useScroll per room, the reading line at 62 % of the
     viewport), turns in at each door, and fades behind (never below 40 %:
     the map keeps your trail). A YOU banner rides above the lead step
     (IC-HP-06: it follows only the visitor's own reading). The room you are
     in inks its walls darker: the active principle.
   - STATIC (server HTML, hydration, reduced motion / Pause, no JS, or the
     map already in view at mount): the sheet unfolded, the whole trail laid
     down with each door's two steps darker, the YOU banner at the first
     door.

   Our own drawing: rooms and corridors come from THIS page's list, never
   the film's castle plan; the prints are ours (worlds/hp/footprints). All
   ink is SVG on CSS variables (never currentColor). Everything here is
   aria-hidden except the head, the banner's words and the list.
   ========================================================================== */

/** The door (and the passage to it) sits at this fraction of a room's height. */
const DOOR = 0.3;
const PRINT = 14;

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
 *  the door, then on down the corridor (a 14 px print is 30 px long: the
 *  strides leave a gap between prints on the shortest room). */
const STEPS: readonly StepDef[] = (() => {
  const before = [0.06, 0.19];
  const after = [0.47, 0.62, 0.77, 0.92];
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
    { at: DOOR, kind: "door", top: `calc(${DOOR * 100}% - 6px)`, left: "calc(var(--wall-r) + 2px)", rot: 90, side: "left" },
    { at: DOOR + 0.05, kind: "door", top: `calc(${DOOR * 100}% + 6px)`, left: "calc(var(--wall-r) + 22px)", rot: 90, side: "right" },
    ...after.map((a, i) => hall(a, i + before.length)),
  ];
})();

/** Step opacity with the reading line at `v` of the room: absent ahead of
 *  the walker, full at the lead, fading behind to the trail's 40 %. */
function stepOpacity(v: number, at: number): number {
  if (v < at) return 0;
  return Math.max(0.4, 1 - (v - at) * 2);
}

/** The latest step the walker has reached (for the YOU banner). */
function leadOf(v: number): StepDef {
  let lead = STEPS[0];
  for (const s of STEPS) if (s.at <= v) lead = s;
  return lead;
}

/* — parchment paint (paper tokens; darkening stays ≤ 5 % where text sits) — */
const LIGHT = (a: number) => `rgb(255 250 240 / ${a})`;
const DARK = (a: number) => `rgb(46 35 24 / ${a})`;
/** A low-frequency parchment grain (an SVG image, tileable; ≤ 7 % ink). */
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.018" numOctaves="3" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.36 0 0 0 0 0.25 0 0 0 0 0.12 0 0 0 0.1 -0.015"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>`,
)}")`;
const PAPER = "color-mix(in oklab, var(--paper) 45%, var(--paper-edge))";
/** The three panels of the accordion fold: each leans a different way. */
const PANELS: readonly CSSProperties[] = [
  `linear-gradient(to right, ${LIGHT(0.12)}, transparent 42%, ${DARK(0.045)})`,
  `linear-gradient(to right, ${LIGHT(0.34)}, ${LIGHT(0.08)} 36%, transparent 68%, ${DARK(0.05)})`,
  `linear-gradient(to right, ${LIGHT(0.26)}, transparent 48%, ${DARK(0.03)})`,
].map((g) => ({ backgroundColor: PAPER, backgroundImage: `${GRAIN}, ${g}` }));

const vCrease = (at: string) =>
  `linear-gradient(to right, transparent calc(${at} - 26px), ${DARK(0.045)} calc(${at} - 1px), ${DARK(0.26)} calc(${at} - 1px) ${at}, ${LIGHT(0.6)} ${at} calc(${at} + 1px), ${LIGHT(0.16)} calc(${at} + 2px), transparent calc(${at} + 34px))`;
const hCrease = (at: string) =>
  `linear-gradient(to bottom, transparent calc(${at} - 22px), ${DARK(0.035)} calc(${at} - 1px), ${DARK(0.16)} calc(${at} - 1px) ${at}, ${LIGHT(0.5)} ${at} calc(${at} + 1px), ${LIGHT(0.14)} calc(${at} + 2px), transparent calc(${at} + 30px))`;
const burn = (to: string) =>
  `linear-gradient(to ${to}, color-mix(in oklab, var(--paper-edge-deep) 62%, transparent), color-mix(in oklab, var(--paper-edge-deep) 18%, transparent) var(--burn), transparent calc(var(--burn) * 1.6))`;
const WEAR: CSSProperties = {
  backgroundImage: [
    vCrease("33.333%"),
    vCrease("66.667%"),
    hCrease("25%"),
    hCrease("50%"),
    hCrease("75%"),
    burn("right"),
    burn("left"),
    burn("bottom"),
    burn("top"),
    "radial-gradient(ellipse 92% 88% at 50% 46%, transparent 72%, color-mix(in oklab, var(--paper-edge-deep) 24%, transparent) 100%)",
  ].join(", "),
};

/** The hall's last candles over the sheet (T11): few, small, dim. */
const HALL_LAST = spotsIn(9, 71, { x0: 3, x1: 97, y0: 8, y1: 44 }, { w0: 6, w1: 11, o0: 0.22, o1: 0.45 });

export function PrinciplesMap({ ribbons, head }: { ribbons: boolean; head: ReactNode }) {
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
        "relative isolate text-fg",
        "[--burn:1.125rem] [--hall-w:2.75rem] [--wall-l:0.5rem] [--wall-r:2.25rem]",
        "sm:[--burn:1.75rem] sm:[--hall-w:5.5rem] sm:[--wall-l:1.5rem] sm:[--wall-r:4rem]",
      )}
    >
      {/* T11: the Great Hall's candles, dimming above the sheet */}
      <CandleField spots={HALL_LAST} className="inset-x-0 bottom-full h-(--section-pad)" />

      {/* the parchment: three panels, the outer two unfold from the centre */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 grid grid-cols-3">
        <motion.div
          className="origin-right"
          style={PANELS[0]}
          initial={false}
          animate={{ scaleX: folded ? 0 : 1 }}
          transition={unfold}
        />
        <div style={PANELS[1]} />
        <motion.div
          className="origin-left"
          style={PANELS[2]}
          initial={false}
          animate={{ scaleX: folded ? 0 : 1 }}
          transition={unfold}
        />
      </div>
      {/* fold creases + burnt edges, once the sheet lies flat */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={WEAR}
        initial={false}
        animate={{ opacity: folded ? 0 : 1 }}
        transition={arrive(0.25)}
      />

      {/* the ink and the words arrive once the sheet lies flat */}
      <motion.div className="relative" initial={false} animate={{ opacity: folded ? 0 : 1 }} transition={arrive(0.35)}>
        <SheetFrame />
        <div className="relative px-2 pb-6 pt-5 sm:px-8 sm:pb-12 sm:pt-8 lg:px-10 lg:pb-14 lg:pt-10">
          <TitleRow />
          {/* the head is the Map's first room: the hall the corridor leaves from */}
          <div className="relative mt-6 px-3 py-7 sm:mt-8 sm:px-8 sm:py-9">
            <HallWalls />
            <HeadTrail />
            <div className="relative">{head}</div>
          </div>
          {/* the corridor's mouth, between the hall and the first room */}
          <div aria-hidden="true" className="relative h-8 sm:h-10">
            <InkWall dir="v" seed={5} style={{ left: "calc(var(--wall-l) - 4px)", top: 0, height: "100%" }} />
            <InkWall dir="v" seed={6} style={{ left: "calc(var(--wall-r) - 4px)", top: 0, height: "100%" }} />
          </div>
          <ol aria-label="Operating principles" className="relative">
            {principles.map((p, i) => (
              <MapRoom key={p.n} p={p} index={i} live={live} ribbons={ribbons} />
            ))}
          </ol>
        </div>
      </motion.div>
    </div>
  );
}

/* — the sheet's inked border (a double rule, inset) ——————————————————— */
function SheetFrame() {
  const inset = "0.875rem";
  const span = `calc(100% - 2 * ${inset})`;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
      <InkWall dir="h" seed={1} style={{ left: inset, top: `calc(${inset} - 4px)`, width: span }} />
      <InkWall dir="h" seed={2} style={{ left: inset, bottom: `calc(${inset} - 4px)`, width: span }} />
      <InkWall dir="v" seed={3} style={{ top: inset, left: `calc(${inset} - 4px)`, height: span }} />
      <InkWall dir="v" seed={4} style={{ top: inset, right: `calc(${inset} - 4px)`, height: span }} />
    </div>
  );
}

/* — the title: the lettered banner between two towers and two trails ———— */
const TITLE = film.copy["principles.map.title"];

function TitleRow() {
  return (
    <div className="relative">
      <Turret size={64} seed={1} className="absolute -left-6 -top-6 hidden lg:block" />
      <Turret size={64} seed={4} className="absolute -right-6 -top-6 hidden lg:block" />
      <MapTrail
        width={132}
        height={64}
        pts={[[6, 52], [52, 30], [92, 44], [128, 16]]}
        strides={[1, 1, 1]}
        className="absolute left-16 top-1 hidden xl:block"
      />
      <MapTrail
        width={132}
        height={64}
        pts={[[126, 54], [84, 26], [44, 40], [6, 14]]}
        strides={[1, 1, 1]}
        fade={0.25}
        className="absolute right-16 top-1 hidden xl:block"
      />
      {copyVisible(TITLE) ? (
        <MapBanner>
          <Lettered
            world="hp"
            text={TITLE.text}
            as="p"
            className="text-center text-[1rem] leading-[1.15] tracking-[0.05em] text-balance text-fg sm:text-[clamp(1.25rem,0.8rem+1.2vw,1.875rem)] sm:tracking-[0.06em]"
          />
        </MapBanner>
      ) : null}
    </div>
  );
}

/** The hall's walls: double, the corridor's mouth open in the bottom wall
 *  (between --wall-l and --wall-r, where the corridor runs on). */
function HallWalls() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      <InkWall dir="h" seed={0} style={{ left: 0, top: "-4px", width: "100%" }} />
      <InkWall dir="v" seed={1} style={{ left: "-4px", top: 0, height: "100%" }} />
      <InkWall dir="v" seed={2} style={{ right: "-4px", top: 0, height: "100%" }} />
      <InkWall dir="h" seed={3} style={{ left: 0, bottom: "-4px", width: "var(--wall-l)" }} />
      <InkWall dir="h" seed={4} style={{ left: "var(--wall-r)", bottom: "-4px", width: "calc(100% - var(--wall-r))" }} />
    </span>
  );
}

/** Someone's trail across the hall's free upper right (xl: the caption
 *  sits bottom-right, the h2 left), walking to the corridor. */
function HeadTrail() {
  return (
    <MapTrail
      width={300}
      height={120}
      pts={[[292, 10], [224, 46], [150, 40], [72, 92], [8, 108]]}
      strides={[2, 2, 2, 2]}
      fade={0.22}
      className="absolute right-8 top-3 hidden xl:block"
    />
  );
}

/* — a room ———————————————————————————————————————————————————————————— */
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
  const bannerTop = useTransform(walk, (v) => `calc(${leadOf(v).top} - 2.75rem)`);

  return (
    <li
      ref={ref}
      className="relative grid grid-cols-[var(--hall-w)_minmax(0,1fr)]"
      data-room={index + 1}
      data-active={active ? "" : undefined}
    >
      {/* the corridor, the passage to this room's door, and the walk */}
      <div aria-hidden="true" className="relative">
        <Corridor seed={index} />
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
        ) : index === 0 ? (
          // the static map: YOU stand at the first door
          <span
            className="pointer-events-none absolute z-10 -translate-x-1/2"
            style={{ left: HALL_MID, top: `calc(${DOOR * 100}% - 3rem)` }}
            data-motif="you-banner"
          >
            <YouBanner />
          </span>
        ) : null}
      </div>

      {/* the room */}
      <div className="relative px-3 py-8 sm:px-8 sm:py-10">
        <RoomWalls seed={index} className="stroke-(--world-line) opacity-85" />
        <RoomWalls
          seed={index}
          className={cn(
            "stroke-(--world-emphasis) transition-opacity duration-(--dur-base) motion-off:transition-none",
            active ? "opacity-90" : "opacity-0",
          )}
        />
        <RoomFeature index={index} />
        <div className="relative grid grid-cols-1 gap-tier-pair sm:grid-cols-12 sm:gap-x-6">
          <Meta className="sm:col-span-2" fields={[p.n]} />
          <div className="sm:col-span-7">
            <h3 className="type-title text-fg max-sm:hyphens-auto max-sm:[overflow-wrap:break-word]">{p.title}</h3>
            {ribbons ? <PatronusRibbons className="mt-tier-pair" /> : null}
            <p className="mt-tier-group max-w-body type-body text-fg-muted">{p.body}</p>
          </div>
          {p.thinker ? <Meta className="sm:col-span-3 sm:text-right" fields={[p.thinker]} /> : null}
        </div>
      </div>
    </li>
  );
}

/** The corridor's two walls through this row (the right one opens on the
 *  passage) and the passage's two walls to the room's door. */
function Corridor({ seed }: { seed: number }) {
  const gapTop = `calc(${DOOR * 100}% - 1rem)`;
  const gapBottom = `calc(${DOOR * 100}% + 1rem)`;
  return (
    <>
      <InkWall dir="v" seed={seed} style={{ left: "calc(var(--wall-l) - 4px)", top: 0, height: "100%" }} />
      <InkWall dir="v" seed={seed + 2} style={{ left: "calc(var(--wall-r) - 4px)", top: 0, height: gapTop }} />
      <InkWall
        dir="v"
        seed={seed + 3}
        style={{ left: "calc(var(--wall-r) - 4px)", top: gapBottom, height: `calc(100% - ${DOOR * 100}% - 1rem)` }}
      />
      <InkWall
        dir="h"
        seed={seed + 1}
        double={false}
        style={{ left: "var(--wall-r)", top: `calc(${gapTop} - 4px)`, width: "calc(var(--hall-w) - var(--wall-r))" }}
      />
      <InkWall
        dir="h"
        seed={seed + 4}
        double={false}
        style={{ left: "var(--wall-r)", top: `calc(${gapBottom} - 4px)`, width: "calc(var(--hall-w) - var(--wall-r))" }}
      />
    </>
  );
}

/** A room's four hand-inked double walls with the door gap on the left,
 *  inset from the row so neighbouring rooms stay separate while the
 *  corridor runs on. `className` sets the ink (stroke) and opacity. */
function RoomWalls({ seed, className }: { seed: number; className: string }) {
  const inset = "0.625rem";
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <InkWall dir="h" seed={seed + 1} className="" style={{ left: 0, top: `calc(${inset} - 4px)`, width: "100%" }} />
      <InkWall dir="h" seed={seed + 3} className="" style={{ left: 0, bottom: `calc(${inset} - 4px)`, width: "100%" }} />
      <InkWall dir="v" seed={seed + 5} className="" style={{ right: "-4px", top: inset, height: `calc(100% - 2 * ${inset})` }} />
      <InkWall
        dir="v"
        seed={seed + 1}
        className=""
        style={{ left: "-4px", top: inset, height: `calc(${DOOR * 100}% - 1rem - ${inset})` }}
      />
      <InkWall
        dir="v"
        seed={seed + 2}
        className=""
        style={{ left: "-4px", top: `calc(${DOOR * 100}% + 1rem)`, height: `calc(${100 - DOOR * 100}% - 1rem - ${inset})` }}
      />
    </span>
  );
}

/** Each room's free lower-right corner (≥ lg, never under text): a round
 *  tower with its spiral stair, or a hatched flight — and someone's trail
 *  walking to it. */
function RoomFeature({ index }: { index: number }) {
  const tower = index % 2 === 0;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-[9%] right-[3%] hidden h-[150px] w-[160px] lg:block"
      data-motif="room-feature"
    >
      {tower ? (
        <>
          <MapTrail
            width={160}
            height={150}
            pts={[[8, 26], [40, 60], [66, 90], [86, 100]]}
            strides={[1, 1, 1]}
            fade={0.28}
            className="absolute inset-0"
          />
          <Turret size={72} seed={index + 2} door={200} className="absolute bottom-0 right-1" />
        </>
      ) : (
        <>
          <MapTrail
            width={160}
            height={150}
            pts={[[132, 8], [94, 42], [52, 64], [36, 96]]}
            strides={[1, 1, 1]}
            fade={0.28}
            className="absolute inset-0"
          />
          <Stairs width={132} height={52} seed={index} className="absolute bottom-0.5 right-0" />
        </>
      )}
    </span>
  );
}

function Step({ def, walk, live }: { def: StepDef; walk: MotionValue<number>; live: boolean }) {
  const opacity = useTransform(walk, (v) => stepOpacity(v, def.at));
  const rest = def.kind === "door" ? 0.85 : 0.5;
  return (
    <motion.span
      // the turn in at the door needs the wider passage (≥ sm): on phones the walk runs straight on
      className={cn("pointer-events-none absolute", def.kind === "door" && "hidden sm:block")}
      style={{ top: def.top, left: def.left, x: "-50%", y: "-50%", rotate: def.rot, opacity: live ? opacity : rest }}
    >
      <Footprint side={def.side} size={PRINT} fill="var(--world-emphasis)" />
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
          className="fill-(--surface-1) stroke-(--world-emphasis)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="relative type-meta leading-none text-fg">{YOU.text}</span>
    </span>
  );
}
