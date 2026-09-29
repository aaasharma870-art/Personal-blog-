import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PrintAt, walkBetween } from "@/components/worlds/hp/footprints";
import { hash01 } from "@/components/worlds/hp/sprites";

/* ============================================================================
   MAP INK — the Marauder's-Map drawing kit (IC-HP-05 / IC-HP-06 grammar),
   OUR OWN construction for this page: hand-inked walls with a slight
   wobble, round towers with a spiral stair, straight flights hatched step
   by step, a name banner, and footprint trails. Never traced from the
   film's castle plan; the rooms are this page's own list.

   Every stroke is an SVG path on a CSS variable (--world-line / --world-
   emphasis), so it survives any colour override of text; never
   `currentColor`. Pure (no hooks): server- and client-safe, deterministic
   (integer hash), aria-hidden throughout. Nothing here glows (Law 1).
   ========================================================================== */

const f1 = (n: number) => n.toFixed(1);

/** A hand-inked line along one axis, `len` user units long, wobbling ±`amp`
 *  across it (smoothed; ends pinned so segments join cleanly). */
function wobble(len: number, at: number, amp: number, seed: number, axis: "h" | "v"): string {
  const n = Math.max(2, Math.round(len / 38));
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const along = (len * i) / n;
    const lo = hash01(Math.floor(i / 3), seed + 7) - 0.5; // slow drift
    const hi = hash01(i, seed) - 0.5; // the hand's tremor
    const off = i === 0 || i === n ? 0 : (lo * 1.4 + hi * 0.8) * amp;
    pts.push(axis === "h" ? [along, at + off] : [at + off, along]);
  }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += `Q${f1(x)} ${f1(y)} ${f1((x + nx) / 2)} ${f1((y + ny) / 2)}`;
  }
  const last = pts[pts.length - 1];
  return `${d}L${f1(last[0])} ${f1(last[1])}`;
}

/** Six pre-drawn double walls per axis (outer + inner line, 4 px apart). */
const H_WALLS = Array.from({ length: 6 }, (_, s) => ({
  a: wobble(1000, 2, 0.9, s * 2 + 1, "h"),
  b: wobble(1000, 6, 0.9, s * 2 + 2, "h"),
}));
const V_WALLS = Array.from({ length: 6 }, (_, s) => ({
  a: wobble(1000, 2, 0.9, s * 2 + 31, "v"),
  b: wobble(1000, 6, 0.9, s * 2 + 32, "v"),
}));

/**
 * InkWall — one wall of the Map, positioned by the host (`style`: top /
 * left / width or height, px or %). An 8 px band on its axis (the SVG is
 * stretched along the wall only, so the wobble keeps its px size); the
 * NOMINAL wall line is the band's centre: place it with `calc(… - 4px)`.
 * `double` draws the plan's thick wall (two lines 4 px apart).
 */
export function InkWall({
  dir,
  seed = 0,
  double = true,
  className,
  style,
}: {
  dir: "h" | "v";
  seed?: number;
  double?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const w = (dir === "h" ? H_WALLS : V_WALLS)[seed % 6];
  return (
    <svg
      viewBox={dir === "h" ? "0 0 1000 8" : "0 0 8 1000"}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "pointer-events-none absolute overflow-visible",
        dir === "h" ? "h-2" : "w-2",
        className ?? "stroke-(--world-line)",
      )}
      style={style}
      fill="none"
      data-motif="ink-wall"
    >
      <path d={w.a} strokeWidth={1.25} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      {double ? <path d={w.b} strokeWidth={1} strokeOpacity={0.8} vectorEffect="non-scaling-stroke" strokeLinecap="round" /> : null}
    </svg>
  );
}

/** A wobbly closed ring (radius r ± amp) — the tower's wall, open at `gap`
 *  (degrees, 0 = right, clockwise) for `gapDeg`. */
function ring(cx: number, cy: number, r: number, amp: number, seed: number, gap = -1, gapDeg = 0): string {
  const N = 36;
  let d = "";
  let pen = false;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * 360;
    const inGap = gap >= 0 && Math.abs(((a - gap + 540) % 360) - 180) < gapDeg / 2;
    if (inGap) {
      pen = false;
      continue;
    }
    const rr = r + (i === N ? hash01(0, seed) - 0.5 : hash01(i % N, seed) - 0.5) * 2 * amp;
    const x = cx + rr * Math.cos((a * Math.PI) / 180);
    const y = cy + rr * Math.sin((a * Math.PI) / 180);
    d += `${pen ? "L" : "M"}${f1(x)} ${f1(y)}`;
    pen = true;
  }
  return d;
}

/**
 * Turret — a round tower in plan: a double wall with a doorway, merlons
 * ticked round the parapet, and a spiral stair (radial treads round a
 * newel). Fixed size (px); place it with `className` / `style`.
 */
export function Turret({
  size = 72,
  seed = 1,
  door: doorAt,
  className,
  style,
}: {
  size?: number;
  seed?: number;
  /** The doorway's angle (degrees; 0 = right, 90 = down). */
  door?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const door = doorAt ?? (110 + seed * 40) % 360;
  const rad = (d: number) => (d * Math.PI) / 180;
  const at = (r: number, d: number) => `${f1(50 + r * Math.cos(rad(d)))} ${f1(50 + r * Math.sin(rad(d)))}`;
  // the spiral stair: treads round a newel over 270° (the stair's quarter
  // left open by the doorway), bounded by its own inner wall
  const s0 = door + 45;
  const treads = Array.from({ length: 12 }, (_, i) => {
    const d = s0 + (i / 11) * 270;
    return `M${at(9, d)}L${at(29, d)}`;
  }).join("");
  const sweep = `M${at(19, s0 + 8)}A19 19 0 1 1 ${at(19, s0 + 262)}`;
  const tip = s0 + 262;
  const head = `M${at(15.5, tip - 9)}L${at(19, tip)}L${at(22.5, tip - 9)}`;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none overflow-visible", className)}
      style={style}
      fill="none"
      strokeLinecap="round"
      data-motif="map-turret"
    >
      <g className="stroke-(--world-line)">
        {/* the parapet, crenellated */}
        <circle cx={50} cy={50} r={45.5} strokeWidth={3.4} strokeDasharray="6.2 4.1" strokeLinecap="butt" strokeOpacity={0.85} />
        {/* the tower wall (double), open at the doorway */}
        <path d={ring(50, 50, 40, 0.7, seed + 3, door, 20)} strokeWidth={1.3} vectorEffect="non-scaling-stroke" />
        <path d={ring(50, 50, 35.5, 0.6, seed + 5, door, 24)} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={ring(50, 50, 30, 0.4, seed + 7, door, 90)} strokeWidth={1} strokeOpacity={0.8} vectorEffect="non-scaling-stroke" />
        <path d={treads} strokeWidth={1} strokeOpacity={0.75} vectorEffect="non-scaling-stroke" />
        {/* the walking line, up and round */}
        <path d={sweep + head} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <circle cx={50} cy={50} r={5} strokeWidth={1} vectorEffect="non-scaling-stroke" className="fill-(--world-line)" fillOpacity={0.35} />
      </g>
    </svg>
  );
}

/**
 * Stairs — a straight flight in plan: a double-walled well hatched tread by
 * tread, with the walking line and its arrowhead (no words). Fixed size.
 */
export function Stairs({
  width = 128,
  height = 56,
  treads = 11,
  seed = 2,
  className,
  style,
}: {
  width?: number;
  height?: number;
  treads?: number;
  seed?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const W = width;
  const H = height;
  const x0 = 4;
  const x1 = W - 4;
  const hatch = Array.from({ length: treads }, (_, i) => {
    const x = x0 + 10 + ((x1 - x0 - 20) * i) / (treads - 1) + (hash01(i, seed) - 0.5) * 1.2;
    return `M${f1(x)} ${f1(8 + (hash01(i, seed + 1) - 0.5))}L${f1(x + (hash01(i, seed + 2) - 0.5) * 1.4)} ${f1(H - 8)}`;
  }).join("");
  const mid = H / 2;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none overflow-visible", className)}
      style={style}
      fill="none"
      strokeLinecap="round"
      data-motif="map-stairs"
    >
      <g className="stroke-(--world-line)">
        <path d={wobble(W - 8, 4, 0.5, seed + 11, "h")} transform={`translate(${x0} 0)`} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={wobble(W - 8, H - 4, 0.5, seed + 12, "h")} transform={`translate(${x0} 0)`} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={`M${x0} 4V${H - 4}M${x1} 4V${H - 4}`} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={hatch} strokeWidth={1} strokeOpacity={0.8} vectorEffect="non-scaling-stroke" />
        {/* the walking line: up the flight */}
        <path
          d={`M${x0 + 6} ${f1(mid)}L${x1 - 10} ${f1(mid)}M${x1 - 16} ${f1(mid - 5)}L${x1 - 9} ${f1(mid)}L${x1 - 16} ${f1(mid + 5)}`}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={x0 + 6} cy={mid} r={1.8} className="fill-(--world-line)" stroke="none" />
      </g>
    </svg>
  );
}

/** A walker's trail through way-points (px, in a `w` × `h` box): one print
 *  per stride, oldest faintest. */
export function trailThrough(
  pts: readonly (readonly [number, number])[],
  strides: readonly number[],
  spread = 5,
): { x: number; y: number; deg: number; side: "left" | "right" }[] {
  const out: { x: number; y: number; deg: number; side: "left" | "right" }[] = [];
  for (let s = 0; s < pts.length - 1; s++) {
    const seg = walkBetween({ x: pts[s][0], y: pts[s][1] }, { x: pts[s + 1][0], y: pts[s + 1][1] }, strides[s] + 1, spread);
    // drop each segment's first print after the first (the joint)
    for (let k = s === 0 ? 0 : 1; k < seg.length; k++) {
      const p = seg[k];
      out.push({ ...p, side: out.length % 2 ? "right" : "left" });
    }
  }
  return out;
}

/**
 * MapTrail — someone else's footprints wandering the parchment (a fixed-size
 * box, so the prints never stretch). `fade` = the oldest print's opacity;
 * the newest is 0.9.
 */
export function MapTrail({
  width,
  height,
  pts,
  strides,
  print = 14,
  fade = 0.3,
  className,
  style,
}: {
  width: number;
  height: number;
  pts: readonly (readonly [number, number])[];
  strides: readonly number[];
  print?: number;
  fade?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const steps = trailThrough(pts, strides, print * 0.38);
  const n = steps.length;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none overflow-visible", className)}
      style={style}
      data-motif="map-trail"
    >
      {steps.map((s, k) => (
        <PrintAt
          key={k}
          x={s.x}
          y={s.y}
          deg={s.deg}
          w={print}
          side={s.side}
          fill="var(--world-line)"
          opacity={fade + ((0.9 - fade) * k) / Math.max(1, n - 1)}
        />
      ))}
    </svg>
  );
}

/**
 * MapBanner — the Map's lettered title ribbon: a band with swallow-tailed
 * ends folded behind it, inked on the parchment's lighter surface. The
 * words are real HTML (`children`), set by the host.
 */
export function MapBanner({ children, className }: { children: ReactNode; className?: string }) {
  const tail = (flip: boolean) => (
    <svg
      viewBox="0 0 56 72"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn("w-8 shrink-0 self-stretch overflow-visible sm:w-12", flip && "-scale-x-100")}
      fill="none"
    >
      <path
        d="M56 22 L3 22 L17 46 L3 70 L44 70 L56 60 Z"
        className="fill-(--surface-1) stroke-(--world-line)"
        strokeWidth={1}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* the fold, where the band turns behind itself */}
      <path d="M44 70 L56 60 L56 70 Z" className="fill-(--world-line)" fillOpacity={0.45} />
      <path d="M12 30 L44 30 M14 62 L42 62" className="stroke-(--world-line)" strokeOpacity={0.35} strokeWidth={1} vectorEffect="non-scaling-stroke" />
    </svg>
  );
  return (
    <div className={cn("mx-auto flex w-fit max-w-full items-stretch", className)} data-motif="map-banner">
      {tail(false)}
      <div className="relative -mx-px min-w-0 px-3 pb-[1.35rem] pt-[0.85rem] sm:px-6">
        <svg
          viewBox="0 0 100 72"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          className="absolute inset-0 size-full overflow-visible"
          fill="none"
        >
          <path
            d="M0 6 Q50 0 100 6 L100 58 Q50 52 0 58 Z"
            className="fill-(--surface-1) stroke-(--world-line)"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
          <path d="M3 11 Q50 5 97 11 M3 53 Q50 47 97 53" className="stroke-(--world-line)" strokeOpacity={0.4} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="relative">{children}</div>
      </div>
      {tail(true)}
    </div>
  );
}
