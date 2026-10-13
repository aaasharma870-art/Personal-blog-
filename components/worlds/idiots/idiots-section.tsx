import type { CSSProperties, ReactNode } from "react";
import type { SectionEntry } from "@/lib/page";
import { anchorId } from "@/lib/sections";
import { Seam } from "@/components/primitives/seam";
import { seamFromFor } from "@/components/site/world-kit";
import { cn } from "@/lib/utils";

/* ============================================================================
   IdiotsSection — the Act II <section> (world-kit's WorldSection, plus
   full-bleed LAYERS). Same contract: the #anchor, the plane (bg-bg /
   text-fg from SectionFrame's world × tone), the derived dome seam, and the
   page container. Adds aria-hidden layers painted between the plane and
   the content (they sit at -z-10 inside the isolated section):
     - "grid"      the 3I-07 graph grid (≤ 6 %, CSS per data-world), masked
                   by `gridMask` (a CSS mask-image value; default: none);
     - `fadeIn`    RECOGNIZABILITY T4: the incoming board's deep fades into
                   this plane over the first 30vh (board → board);
     - `fadeOut`   T5: this plane crossfades into the page's deep over the
                   last 30vh (idiots canvas → the intermission's deep);
     - `layers`    anything else (e.g. an egg's grade, portalled at run time).
   `lead` renders full-bleed (outside the page container) at the top of the
   content: the work section's head band (M2 finish).
   Nothing here names a world: moved to another act, the grid is whatever
   that world's .world-ground paints (none for most), and the fades read the
   world's own --world-deep.
   ========================================================================== */
export function IdiotsSection({
  entry,
  labelledBy,
  children,
  className,
  containerClassName,
  grid = false,
  gridMask,
  fadeIn = false,
  fadeOut = false,
  layers,
  lead,
  style,
}: {
  entry: SectionEntry;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  grid?: boolean;
  gridMask?: string;
  fadeIn?: boolean;
  fadeOut?: boolean;
  layers?: ReactNode;
  /** Full-bleed content before the page container (a head band). */
  lead?: ReactNode;
  style?: CSSProperties;
}) {
  const from = seamFromFor(entry);
  return (
    <section
      id={anchorId(entry)}
      aria-labelledby={labelledBy}
      data-world-section={entry.id}
      className={cn("relative isolate bg-bg py-section text-fg", className)}
      style={style}
    >
      {from ? <Seam from={from} /> : null}
      {grid ? (
        <div
          aria-hidden="true"
          className="world-ground pointer-events-none absolute inset-0 -z-10"
          style={gridMask ? { WebkitMaskImage: gridMask, maskImage: gridMask } : undefined}
        />
      ) : null}
      {fadeIn ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30vh] bg-linear-to-b from-(--world-deep) to-transparent"
        />
      ) : null}
      {fadeOut ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[30vh] bg-linear-to-b from-transparent to-(--color-deep)"
        />
      ) : null}
      {layers}
      {lead ? <div className="relative">{lead}</div> : null}
      <div className={cn("relative mx-auto w-full max-w-page px-gutter", containerClassName)}>{children}</div>
    </section>
  );
}
