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
  className,
  style,
  children,
}: {
  plate: Plate;
  aspect?: Aspects;
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
  } as CSSProperties;
  return (
    <div
      className={cn(
        "absolute top-(--pb-t) left-(--pb-l) h-(--pb-h) w-(--pb-w)",
        "sm:top-(--pb-t-sm) sm:left-(--pb-l-sm) sm:h-(--pb-h-sm) sm:w-(--pb-w-sm)",
        className,
      )}
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
