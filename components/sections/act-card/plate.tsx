import type { CSSProperties, ReactNode } from "react";
import { resolveMedia, markOf, rectOf, type FocalBox, type MediaAsset, type MediaId } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * PLATE GEOMETRY for the act cards (M2, RECOGNIZABILITY §7.2 "code against
 * the data, never against magic numbers"). Pure (no hooks, no DOM): the
 * server and the client compute the same boxes, so SSR frames register.
 *
 * A card frame is 3:2 below 640 px and 2.39:1 from 640 (CardShell). A plate
 * shown `object-fit: cover` in it is cropped; everything a card draws ON a
 * plate (chalk FIG. 0 on the ICE board, the Dead Eye marks, the camp's
 * fire the embers rise from) must land on the same pixels at both shapes.
 * So instead of letting the <img> crop itself, <PlateBox> positions the
 * plate's WHOLE box (its own aspect, so cover = no crop) inside the frame
 * for both shapes (CSS vars, no JS), and the frame's overflow crops it.
 * Overlays inside the box then use plate coordinates directly: an SVG with
 * viewBox "0 0 <w> <h>" of the plate (uniform scale), or % of the box.
 */

export type Pos = readonly [x: number, y: number];
/** Container aspect (w / h) below 640 and from 640. */
export type Aspects = { base: number; sm: number };

/** CardShell's frame: 3:2 below 640 px, the 2.39:1 letterbox from 640. */
export const FRAME_ASPECT: Aspects = { base: 3 / 2, sm: 2.39 };

/** A plate's box inside a container, as fractions of the container
 *  (l / w of its width, t / h of its height). */
export type Box = { l: number; t: number; w: number; h: number };

/** `object-fit: cover` + `object-position: pos` as the image's own box. */
export function coverBox(container: number, plate: number, pos: Pos): Box {
  if (container >= plate) {
    const h = container / plate;
    return { l: 0, t: -(h - 1) * clamp01(pos[1]), w: 1, h };
  }
  const w = plate / container;
  return { l: -(w - 1) * clamp01(pos[0]), t: 0, w, h: 1 };
}

/** A plate point (0–1 of the plate) in container fractions. */
export function inBox(b: Box, pt: Pos): Pos {
  return [b.l + pt[0] * b.w, b.t + pt[1] * b.h];
}

/** The crop position (0–1) that puts plate row `plateY` at container row
 *  `at` — how a plate is REGISTERED to another (the storm's horizon on the
 *  ICE board's ledge). Clamped: the crop never leaves the plate. */
export function registerY(container: number, plate: number, plateY: number, at: number): number {
  if (container < plate) return 0.5; // cropped by width: every row is visible
  const h = container / plate;
  return h <= 1 ? 0.5 : clamp01((plateY * h - at) / (h - 1));
}

/** Phase 3 (PHASE3-SPEC §7.2): the CARRIED LINE. Both halves of a pinned
 *  card's transition register their line mark (horizon, ICE ledge, lake,
 *  high table) to this row of the 2.39:1 letterbox frame (y 480 px @1440,
 *  410 @1024), so the line crosses the meet without a jump. */
export const MATCH_ROW = 0.47;

/** `b` zoomed by `z` about the container point `at` (the point stays put). */
export function zoomBox(b: Box, at: Pos, z: number): Box {
  return { l: at[0] + (b.l - at[0]) * z, t: at[1] + (b.t - at[1]) * z, w: b.w * z, h: b.h * z };
}

/** A registered crop: the plate's whole box, its crop position and zoom. */
export type Registered = { box: Box; pos: Pos; zoom: number };

/**
 * Generalised `registerY` (PHASE3-SPEC §7.2): the crop that puts the plate's
 * line (`mark`: a lib/media.ts mark name, its y; or a plate y) on container
 * row `row`. Cover first (the crop slides, zoom 1); when the crop cannot
 * reach the row (the line is too near the plate's edge), the plate ZOOMS
 * about the frame edge it is pinned to, up to `maxZoom` (iconic-hall's
 * table at .638 needs 1.089). The zoom only grows the box about a point of
 * the container, so the frame stays covered. `aspect` = the container's
 * aspect (the 2.39 letterbox, or the tintype's inset plate box). null when
 * the plate has no such mark.
 */
export function registerLine(
  p: Plate,
  mark: string | number,
  row: number = MATCH_ROW,
  maxZoom = 1,
  aspect: number = FRAME_ASPECT.sm,
): Registered | null {
  const L = typeof mark === "number" ? mark : anchor(p, mark)?.[1];
  if (L === undefined || L === null || !Number.isFinite(L)) return null;
  const x = p.pos[0];
  if (aspect < p.ratio) {
    // cropped by width: every row is visible, the line sits at its own y
    return { box: coverBox(aspect, p.ratio, p.pos), pos: p.pos, zoom: 1 };
  }
  const h = aspect / p.ratio;
  const want = h > 1 ? (L * h - row) / (h - 1) : 0.5;
  const y = clamp01(want);
  const box = coverBox(aspect, p.ratio, [x, y]);
  if (y === want || h <= 1) return { box, pos: [x, y], zoom: 1 };
  // the crop is pinned to the top (y 0) or bottom (y 1) edge: zoom about it
  const edge = y >= 1 ? 1 : 0;
  const r0 = box.t + L * box.h;
  const z = Math.min(Math.max(1, (row - edge) / (r0 - edge)), Math.max(1, maxZoom));
  return { box: zoomBox(box, [x, edge], z), pos: [x, y], zoom: z };
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

const pct = (f: number) => `${(f * 100).toFixed(4)}%`;

/** The resolved plate for a card: its asset, aspect and crop position
 *  (the asset's focal unless the card registers it otherwise). */
export type Plate = { asset: MediaAsset; ratio: number; pos: Pos };

export function plateOf(id: MediaId | null | undefined, pos?: Pos): Plate | null {
  const asset = id ? resolveMedia(id) : null;
  if (!asset || asset.kind !== "image") return null;
  const f = (asset.focal as Pos | undefined) ?? [0.5, 0.5];
  return { asset, ratio: asset.width / asset.height, pos: pos ?? f };
}

/** A named plate anchor (lib/media.ts marks) of the asset ACTUALLY
 *  rendered (an ALT plate carries its own), else `fallback`. */
export function anchor(p: Plate, name: string, fallback: Pos | null = null): Pos | null {
  return (markOf(p.asset.id, name) as Pos | null) ?? fallback;
}

export function anchorRect(p: Plate, name: string): FocalBox | null {
  return rectOf(p.asset.id, name);
}

/**
 * The plate's whole box, positioned in its container for both frame
 * shapes (so an overlay in plate coordinates registers at 3:2 and 2.39:1).
 * The parent must be `position: relative | absolute` with `overflow:
 * hidden`. Children: the MediaFrame (layout "fill") and any overlay.
 */
export function PlateBox({
  plate,
  aspect = FRAME_ASPECT,
  reg,
  className,
  style,
  children,
}: {
  plate: Plate;
  aspect?: Aspects;
  /** Phase 3: the REGISTERED crop (registerLine) the pinned card draws under
   *  the boot gate only (app/p3/cards.css `[data-plate-reg]`): the carried
   *  line on MATCH_ROW. Below the gate the box is the plain crop above. */
  reg?: Box | null;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const a = coverBox(aspect.base, plate.ratio, plate.pos);
  const b = coverBox(aspect.sm, plate.ratio, plate.pos);
  const vars = {
    "--pb-l": pct(a.l),
    "--pb-t": pct(a.t),
    "--pb-w": pct(a.w),
    "--pb-h": pct(a.h),
    "--pb-l-sm": pct(b.l),
    "--pb-t-sm": pct(b.t),
    "--pb-w-sm": pct(b.w),
    "--pb-h-sm": pct(b.h),
    ...(reg
      ? { "--pb-l-reg": pct(reg.l), "--pb-t-reg": pct(reg.t), "--pb-w-reg": pct(reg.w), "--pb-h-reg": pct(reg.h) }
      : null),
  } as CSSProperties;
  return (
    <div
      className={cn(
        "absolute top-(--pb-t) left-(--pb-l) h-(--pb-h) w-(--pb-w)",
        "sm:top-(--pb-t-sm) sm:left-(--pb-l-sm) sm:h-(--pb-h-sm) sm:w-(--pb-w-sm)",
        className,
      )}
      data-plate-reg={reg ? "" : undefined}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  );
}

/** viewBox of an overlay SVG drawn in plate pixels (uniform scale inside a
 *  PlateBox: the box has the plate's own aspect). */
export function plateViewBox(p: Plate): string {
  return `0 0 ${p.asset.width} ${p.asset.height}`;
}
