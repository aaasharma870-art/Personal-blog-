"use client";

import { memo, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import {
  motion,
  motionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { beatAttrs } from "@/lib/beats";
import { principles, type Principle } from "@/lib/content";
import { film } from "@/lib/film";
import { useMediaQuery, useReducedMotion } from "@/lib/flags";
import { copyVisible } from "@/lib/sections";
import { dur, ease, easeClip } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Meta } from "@/components/site/world-kit";
import { PatronusRibbons } from "@/components/site/hp-ink";
import { Lettered } from "@/components/primitives/scene-caption";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { Footprint } from "@/components/worlds/hp/footprints";
import type { ScrubBody } from "@/components/worlds/hp/principle-body";
import { InkWall, MapBanner, MapTrail, Turret } from "@/components/worlds/hp/map-ink";
import { CandleField, spotsIn } from "@/components/worlds/hp/hall-ceiling";
import { PARCHMENT_GRAIN } from "@/components/site/parchment-grain";

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
     (scroll-driven: ONE useScroll for the whole list, split per room by the
     rooms' measured rows — the reading line at 62 % of the viewport), turns
     in at each door, and fades behind (never below 40 %:
     the map keeps your trail). A YOU banner rides above the lead step
     (IC-HP-06: it follows only the visitor's own reading). The room you are
     in inks its walls darker: the active principle.
   - STATIC (server HTML, hydration, reduced motion / Pause, no JS, or the
     map already in view at mount): the sheet unfolded, the whole trail laid
     down with each door's two steps darker, the YOU banner at the first
     door.

   PHASE 3 (W3-HP): the unfold is the B52 time star (weight 1, a breath)
   and asks the spotlight first (`skip` = the sheet simply lies flat; the
   walk stays scroll-driven either way); room 05's body arrives
   server-rendered with the B55 scrubbed sentence (worlds/hp/principle-body);
   the `hp-map` egg's hint ("I solemnly swear…", aria-hidden, desktop only,
   absolute: no layout; worlds/hp/map-hint) hangs under the banner. On
   desktop the wand cursor's bloom gets its own layer on this sheet, under
   the ink and the words (components/worlds/hp/wand-cursor.tsx, lazy).

   P3-11 r1 (panel J4 #6, J2 #10; J1 #4):
   - While it waits to unfold, the sheet is a FOLDED MAP, not a blank cream
     box: the ink and the words show on the middle panel (clipped to it)
     and open with the outer panels (one clip-path, in step with their
     scaleX), instead of arriving after them.
   - The five rooms are no longer one box five times: each has its own
     furniture in its free corner and its own visitor's trail
     (worlds/hp/room-features.tsx, rendered on the server and passed in:
     no drawing code in the client bundle).
   - The walk is B54's scroll star: its host is now room 1 (was room 3's
     ribbons), so its window (lib/spotlight-windows.ts: "top 62%,
     [data-room='4'] bottom 62%", registered by the words binder) covers
     rooms 1–4; room 5 is B55's scrubbed sentence.

   Our own drawing: rooms and corridors come from THIS page's list, never
   the film's castle plan; the prints are ours (worlds/hp/footprints). All
   ink is SVG on CSS variables (never currentColor). Everything here is
   aria-hidden except the head, the banner's words and the list.

   RASTER (P3-2, spec §12.1 #1): 7 promoted layers at rest — the 5 YOU
   banners (transform) while the walk is live, and two STATIC ones: the
   parchment sheet (its three panels) and the wear. They are the costly
   paint (grain + ten gradients) and never change once flat, so they raster
   once instead of with every print's repaint; the two outer panels add a
   layer each only while armed / unfolding (≈ 1 s), so the unfold is a
   compositor change, not a repaint of the sheet (the W1 gate's principles
   stall: 0.2–0.6 fps headless, both after a scroll-through and after a
   jump). The 40 prints and the active room's ink carry no will-change: a
   print is a 14 px opacity write (a tiny repaint).
   ========================================================================== */

/** The unfold's time star (spec §2.3 B52: "map unfold", signature · t · 1). */
const B52 = { id: "B52", weight: 1 } as const;
/** The ink while the sheet is folded: the middle panel only; then open. */
const FOLDED = "inset(0% 33.333% 0% 33.333%)";
const OPENED = "inset(0% 0% 0% 0%)";

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
/** A low-frequency parchment grain (tileable, 280 px; ≤ 7 % ink): baked
 *  ONCE from its feTurbulence filter (seed 7) by tools/bake/textures.js, so
 *  no noise filter is recomputed while the walk scrolls. */
const GRAIN = `url("${PARCHMENT_GRAIN}")`;
const PAPER = "color-mix(in oklab, var(--paper) 45%, var(--paper-edge))";
/** The three panels of the accordion fold: each leans a different way. */
const PANELS: readonly CSSProperties[] = [
  `linear-gradient(to right, ${LIGHT(0.12)}, transparent 42%, ${DARK(0.045)})`,
  `linear-gradient(to right, ${LIGHT(0.34)}, ${LIGHT(0.08)} 36%, transparent 68%, ${DARK(0.05)})`,
  `linear-gradient(to right, ${LIGHT(0.26)}, transparent 48%, ${DARK(0.03)})`,
].map((g) => ({ backgroundColor: PAPER, backgroundImage: `${GRAIN}, ${g}` }));

/* The wear: every crease and burn is a BAND (background-size/position,
   no-repeat), never a full-sheet gradient that is transparent but for a
   few px: the same pixels, a fraction of the raster (the W1 gate's
   principles stall: ten full-sheet gradients cost ≈ 400 ms a playback in
   headless software raster). Band stops are the old ones re-based on the
   band's own edge; `calc(p% + c)` places a band's left / top edge at p of
   the sheet (a percentage there refers to sheet − band). */
const vCrease = (at: number) => ({
  image: `linear-gradient(to right, transparent, ${DARK(0.045)} 25px, ${DARK(0.26)} 25px 26px, ${LIGHT(0.6)} 26px 27px, ${LIGHT(0.16)} 28px, transparent)`,
  size: "60px 100%",
  position: `calc(${(at * 100).toFixed(3)}% + ${Math.round(60 * at - 26)}px) 0`,
});
const hCrease = (at: number) => ({
  image: `linear-gradient(to bottom, transparent, ${DARK(0.035)} 21px, ${DARK(0.16)} 21px 22px, ${LIGHT(0.5)} 22px 23px, ${LIGHT(0.14)} 24px, transparent)`,
  size: "100% 52px",
  position: `0 calc(${at * 100}% + ${Math.round(52 * at - 22)}px)`,
});
const BURN_IN = "color-mix(in oklab, var(--paper-edge-deep) 62%, transparent)";
const BURN_MID = "color-mix(in oklab, var(--paper-edge-deep) 18%, transparent) var(--burn)";
const burn = (to: "right" | "left" | "bottom" | "top") => ({
  image: `linear-gradient(to ${to}, ${BURN_IN}, ${BURN_MID}, transparent)`,
  size: to === "right" || to === "left" ? "calc(var(--burn) * 1.6) 100%" : "100% calc(var(--burn) * 1.6)",
  position: { right: "0 0", left: "100% 0", bottom: "0 0", top: "0 100%" }[to],
});
const WEAR_LAYERS = [
  vCrease(1 / 3),
  vCrease(2 / 3),
  hCrease(0.25),
  hCrease(0.5),
  hCrease(0.75),
  burn("right"),
  burn("left"),
  burn("bottom"),
  burn("top"),
  {
    image: "radial-gradient(ellipse 92% 88% at 50% 46%, transparent 72%, color-mix(in oklab, var(--paper-edge-deep) 24%, transparent) 100%)",
    size: "100% 100%",
    position: "0 0",
  },
];
const WEAR: CSSProperties = {
  backgroundImage: WEAR_LAYERS.map((l) => l.image).join(", "),
  backgroundSize: WEAR_LAYERS.map((l) => l.size).join(", "),
  backgroundPosition: WEAR_LAYERS.map((l) => l.position).join(", "),
  backgroundRepeat: "no-repeat",
};

/** The hall's last candles over the sheet (T11): few, small, dim. */
const HALL_LAST = spotsIn(9, 71, { x0: 3, x1: 97, y0: 8, y1: 44 }, { w0: 6, w1: 11, o0: 0.22, o1: 0.45 });

/** Room i's walk (0–1) from the list's: the reading line's position in the
 *  list (`p` × the list's height) re-based on the room's row. Identical to a
 *  per-room useScroll with the same offsets (both clamp to 0–1). */
function roomWalk(p: number, listH: number, row: { top: number; h: number } | undefined): number {
  if (!row || row.h <= 0) return 0;
  return Math.min(1, Math.max(0, (p * listH - row.top) / row.h));
}

/** ONE scroll tracker for the whole Map (spec §12.1 #1: was one per room):
 *  the list's progress with the reading line at 62 %, split into one walk
 *  per room by the rooms' rows, measured on resize (a font swap or a reflow
 *  resizes the list), never per frame. */
function useRoomWalks(listRef: RefObject<HTMLOListElement | null>, n: number): readonly MotionValue<number>[] {
  const [walks] = useState(() => Array.from({ length: n }, () => motionValue(0)));
  const geo = useRef<{ h: number; rows: { top: number; h: number }[] }>({ h: 0, rows: [] });
  const { scrollYProgress: list } = useScroll({ target: listRef, offset: ["start 62%", "end 62%"] });
  const apply = (p: number) => {
    const g = geo.current;
    walks.forEach((w, i) => w.set(roomWalk(p, g.h, g.rows[i])));
  };
  useMotionValueEvent(list, "change", apply);
  useLayoutEffect(() => {
    const ol = listRef.current;
    if (!ol) return;
    const measure = () => {
      const items = Array.from(ol.children) as HTMLElement[];
      geo.current = {
        h: ol.offsetHeight,
        rows: items.map((li) => ({ top: li.offsetTop, h: li.offsetHeight })),
      };
      apply(list.get());
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
    // `apply` reads refs and the stable motion values only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listRef, list]);
  return walks;
}

export function PrinciplesMap({
  ribbons,
  head,
  scrub,
  hint,
  features,
}: {
  ribbons: boolean;
  head: ReactNode;
  scrub?: ScrubBody;
  hint?: ReactNode;
  /** Each room's furniture (server-rendered: worlds/hp/room-features). */
  features?: readonly ReactNode[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  // B52 (spec §2.3): the unfold is a weight-1 time star — on DESKTOP_FINE it
  // waits for the spotlight (≤ 1.5 s); "skip" lays the sheet flat at once
  const phase = useEnterOnce(ref, { amount: 0.15, star: B52 });
  const folded = phase === "armed";
  // Mounted offscreen with motion on → the walk is scroll-driven, whatever
  // the spotlight answered for the unfold. Otherwise (server, hydration,
  // reduced motion / Pause, in view at mount) → static.
  const [wasArmed, setWasArmed] = useState(false);
  if (phase === "armed" && !wasArmed) setWasArmed(true);
  const live = !reduced && (phase !== "static" || wasArmed);
  const walks = useRoomWalks(listRef, principles.length);
  // the folded-map ink is desktop's (phones keep the fade after the unfold)
  const desktop = useMediaQuery("(min-width: 64rem)");
  // the two outer panels are their own layers only while they can move
  // (armed, then the unfold): their scaleX is then a compositor property
  // change, never a repaint of the sheet's layer; flat, they paint into it
  const [flat, setFlat] = useState(false);
  const unfolding = phase === "armed" || (phase === "entered" && !flat);
  const unfold = phase === "entered" ? { duration: dur.hero, ease: easeClip } : { duration: 0 };
  const arrive = (delay: number) =>
    phase === "entered" ? { duration: dur.reveal, ease, delay } : { duration: 0 };
  const onUnfolded = () => {
    if (phase === "entered") setFlat(true);
  };

  return (
    <div
      ref={ref}
      {...beatAttrs(B52.id, { weight: B52.weight })}
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
      <CandleField spots={HALL_LAST} className="inset-x-0 bottom-full" style={{ height: "var(--section-pad)" }} />

      {/* the parchment: three panels, the outer two unfold from the centre.
          The sheet (grain + gradients) and the wear below are STATIC
          layers (W1 gate: painted into the section, every footprint's
          repaint re-rastered their ten-gradient tiles, ≈ 0.3 fps idle at
          1440 headless after a scroll-through); they raster once */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 grid grid-cols-3 will-change-transform">
        <motion.div
          className={cn("origin-right", unfolding && "will-change-transform")}
          style={PANELS[0]}
          initial={false}
          animate={{ scaleX: folded ? 0 : 1 }}
          transition={unfold}
          onAnimationComplete={onUnfolded}
        />
        <div style={PANELS[1]} />
        <motion.div
          className={cn("origin-left", unfolding && "will-change-transform")}
          style={PANELS[2]}
          initial={false}
          animate={{ scaleX: folded ? 0 : 1 }}
          transition={unfold}
        />
      </div>
      {/* fold creases + burnt edges, once the sheet lies flat (a one-shot
          opacity fade on its own static layer) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 will-change-transform"
        style={WEAR}
        initial={false}
        animate={{ opacity: folded ? 0 : 1 }}
        transition={arrive(0.25)}
      />

      {/* the ink and the words: ≥ 64rem on the middle panel while folded (no
          blank sheet), opening with the outer panels (one clip, in step
          with their scaleX; never clipped unless the sheet was ever
          folded); phones: as before, they arrive once the sheet lies flat */}
      <motion.div
        className={cn("relative", unfolding && "will-change-transform")}
        initial={false}
        animate={!desktop ? { opacity: folded ? 0 : 1 } : wasArmed ? { clipPath: folded ? FOLDED : OPENED } : undefined}
        transition={desktop ? unfold : arrive(0.35)}
      >
        <SheetFrame />
        <div className="relative px-2 pb-6 pt-5 sm:px-8 sm:pb-12 sm:pt-8 lg:px-10 lg:pb-14 lg:pt-10">
          <TitleRow hint={hint} />
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
          <ol ref={listRef} aria-label="Operating principles" className="relative">
            {principles.map((p, i) => (
              <MapRoom
                key={p.n}
                p={p}
                index={i}
                walk={walks[i]!}
                live={live}
                ribbons={ribbons}
                body={scrub?.at === i ? scrub.node : undefined}
                feature={features?.[i]}
              />
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

function TitleRow({ hint }: { hint?: ReactNode }) {
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
      {hint}
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
/** B54, the walk (a scroll star): room 1 hosts it, so its window
 *  (lib/spotlight-windows.ts) runs from room 1 to room 4. */
const WALK_BEAT_ROOM = 0;

function MapRoom({
  p,
  index,
  walk,
  live,
  ribbons,
  body,
  feature,
}: {
  p: Principle;
  index: number;
  /** This room's share of the Map's one scroll tracker (useRoomWalks). */
  walk: MotionValue<number>;
  live: boolean;
  ribbons: boolean;
  /** A server-rendered body (room 05: the B55 scrub), else the plain text. */
  body?: ReactNode;
  /** The room's furniture (server-rendered, ≥ lg). */
  feature?: ReactNode;
}) {
  const [inRoom, setInRoom] = useState(false);
  useMotionValueEvent(walk, "change", (v) => setInRoom(v >= DOOR && v < 0.999));
  const active = live && inRoom;
  const bannerOpacity = useTransform(walk, (v) => (v > 0.01 && v < 0.999 ? 1 : 0));
  // the banner rides on a transform (never `top`: no layout per step, no
  // layout shift): a full-height track translated to the lead step's line
  const bannerY = useTransform(walk, (v) => `translateY(${leadOf(v).top})`);

  return (
    <li
      {...(index === WALK_BEAT_ROOM ? beatAttrs("B54", { weight: 2 }) : {})}
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
            className="pointer-events-none absolute inset-y-0 z-10 w-0 transition-[opacity,transform] ease-(--ease-out) will-change-[transform,opacity] motion-off:transition-none"
            // it glides between steps (180 ms) instead of jumping
            style={{ left: HALL_MID, transform: bannerY, opacity: bannerOpacity, transitionDuration: "var(--dur-base), 180ms" }}
          >
            <span className="absolute -top-11 left-0 -translate-x-1/2" data-motif="you-banner">
              <YouBanner />
            </span>
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
          // a CSS transition: the compositor promotes it only while it runs
          className={cn(
            "stroke-(--world-emphasis) transition-opacity duration-(--dur-base) motion-off:transition-none",
            active ? "opacity-90" : "opacity-0",
          )}
        />
        {feature}
        <div className="relative grid grid-cols-1 gap-tier-pair sm:grid-cols-12 sm:gap-x-6">
          <Meta className="sm:col-span-2" fields={[p.n]} />
          <div className="sm:col-span-7">
            <h3 className="type-title text-fg max-sm:hyphens-auto max-sm:[overflow-wrap:break-word]">{p.title}</h3>
            {ribbons ? <PatronusRibbons className="mt-tier-pair" /> : null}
            {body ?? <p className="mt-tier-group max-w-body type-body text-fg-muted">{p.body}</p>}
          </div>
          {p.thinker ? <Meta className="sm:col-span-3 sm:text-right" fields={[p.thinker]} /> : null}
        </div>
      </div>
    </li>
  );
}

/** The corridor's two walls through this row (the right one opens on the
 *  passage) and the passage's two walls to the room's door. */
const Corridor = memo(function Corridor({ seed }: { seed: number }) {
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
});

/** A room's four hand-inked double walls with the door gap on the left,
 *  inset from the row so neighbouring rooms stay separate while the
 *  corridor runs on. `className` sets the ink (stroke) and opacity. */
const RoomWalls = memo(function RoomWalls({ seed, className }: { seed: number; className: string }) {
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
});

const Step = memo(function Step({ def, walk, live }: { def: StepDef; walk: MotionValue<number>; live: boolean }) {
  const opacity = useTransform(walk, (v) => stepOpacity(v, def.at));
  const rest = def.kind === "door" ? 0.85 : 0.5;
  return (
    <motion.span
      // the turn in at the door needs the wider passage (≥ sm): on phones the walk runs straight on.
      // No will-change (spec §12.1 #1): a print's opacity write repaints only its own 14 px box.
      className={cn("pointer-events-none absolute", def.kind === "door" && "hidden sm:block")}
      style={{ top: def.top, left: def.left, x: "-50%", y: "-50%", rotate: def.rot, opacity: live ? opacity : rest }}
    >
      <Footprint side={def.side} size={PRINT} fill="var(--world-emphasis)" />
    </motion.span>
  );
});

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
