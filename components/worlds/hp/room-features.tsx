import type { ReactNode } from "react";
import { MapTrail, Stairs, Turret } from "@/components/worlds/hp/map-ink";

/* ============================================================================
   ROOM FEATURES — the Map's five rooms each get their own piece of the
   castle in the free lower-right corner (≥ lg, never under text) and a
   visitor's trail walking to it (P3-11 r1, panel J2 #10: "five identical
   boxes"): a round tower with its spiral stair · a straight flight · the
   moving staircases caught mid-swing · the great tower with someone pacing
   round it · a stair down to the dungeons with a visitor pacing at its
   head. Our own drawing (map-ink), never the film's castle plan.
   SERVER-RENDERED (components/site/principles.tsx passes the five nodes to
   the client map), so none of this ships in the first-load JS. Pure, no
   hooks; aria-hidden decoration.
   ========================================================================== */

/** Each room's free lower-right corner (≥ lg, never under text): its own
 *  piece of the castle and someone's trail walking to it — no two rooms
 *  alike (P3-11 r1, panel J2 #10 "five identical boxes"). Box 160 × 150. */
type Feature = {
  /** a visitor's trail (box px) */
  trail: readonly (readonly [number, number])[];
  draw: (index: number) => ReactNode;
};
const FEATURES: readonly Feature[] = [
  // a round tower with its spiral stair
  { trail: [[8, 26], [40, 60], [66, 90], [86, 100]], draw: (i) => <Turret size={72} seed={i + 2} door={200} className="absolute bottom-0 right-1" /> },
  // a straight flight
  { trail: [[132, 8], [94, 42], [52, 64], [36, 96]], draw: (i) => <Stairs width={132} height={52} seed={i} className="absolute bottom-0.5 right-0" /> },
  // the moving staircases: two flights crossing, caught mid-swing
  {
    trail: [[150, 6], [118, 30], [92, 44]],
    draw: (i) => (
      <>
        <Stairs width={118} height={40} seed={i} treads={10} className="absolute" style={{ right: 4, bottom: 46, rotate: "-22deg" }} />
        <Stairs width={104} height={36} seed={i + 5} treads={9} className="absolute" style={{ right: 22, bottom: 4, rotate: "14deg" }} />
      </>
    ),
  },
  // the great tower, someone pacing round it
  {
    trail: [[10, 120], [20, 70], [58, 40], [104, 30], [150, 52]],
    draw: (i) => <Turret size={96} seed={i + 4} door={150} className="absolute" style={{ right: 6, bottom: -8 }} />,
  },
  // a stair down to the dungeons, a visitor pacing at its head
  {
    trail: [[24, 20], [96, 26], [30, 40], [92, 50]],
    draw: (i) => <Stairs width={110} height={46} seed={i + 2} treads={8} className="absolute" style={{ right: 10, bottom: 18, rotate: "90deg" }} />,
  },
];

export function RoomFeature({ index }: { index: number }) {
  const f = FEATURES[index % FEATURES.length]!;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-[9%] right-[3%] hidden h-[150px] w-[160px] lg:block"
      data-motif="room-feature"
    >
      <MapTrail
        width={160}
        height={150}
        pts={f.trail}
        strides={f.trail.slice(1).map(() => 1)}
        fade={0.28}
        className="absolute inset-0"
      />
      {f.draw(index)}
    </span>
  );
}
