import type { ReactNode } from "react";
import type { LoaderSize } from "@/components/primitives/loader";
import { cn } from "@/lib/utils";
import { SIZE_CLASS } from "@/components/primitives/loaders/kit";

/**
 * The ICE chalkboard in miniature (3 Idiots; RECOGNIZABILITY S20, IC-3I-01):
 * a slate-green board in a wooden frame, a chalk ledge with a stub of chalk
 * and a felt duster, the ghost of an earlier lesson wiped across it. Both
 * LD-3I loaders draw ON it (the default's gear gauge in chalk, the ALT's
 * derivation), so blind the loader reads as a classroom board at a glance.
 *
 * Our own drawing of a generic lecture-hall board (no crest, no lettering,
 * no film still). aria-hidden, focusable=false, no text (loaders L7);
 * colours are tokens only (L17) — the slate and the wood are mixed from the
 * palette's own inks. The drawing is the frame; `children` (an SVG that fills
 * its width) sits on the slate.
 *
 * viewBox 0 0 160 112: frame 2–158 × 2–96, slate 8–152 × 8–90, ledge 96–103.
 */
/** The slate (exported: a drawing on the board can occlude with it). */
export const SLATE = "color-mix(in oklab, color-mix(in oklab, var(--paper-accent) 40%, var(--w-sage)) 34%, var(--idi-deep))";
const WOOD = "color-mix(in oklab, var(--w-leather) 58%, var(--idi-deep))";
const WOOD_LIGHT = "color-mix(in oklab, var(--w-leather) 72%, var(--idi-deep))";
const GRAIN = "color-mix(in oklab, var(--w-leather) 34%, var(--idi-deep))";

/** Where the content box sits on the slate, as fractions of the board
 *  (`top` is a fraction of the board's HEIGHT). The content is an SVG that
 *  fills the box's width. */
export const BOARD_CONTENT = { left: "10%", top: "18%", width: "80%" } as const;
/** mini: a narrower box, so the gear pair stays on the slate. */
export const BOARD_CONTENT_MINI = { left: "19%", top: "12%", width: "62%" } as const;

type ContentBox = { left: string; top: string; width: string };

export function ChalkBoard({
  size,
  children,
  content,
  className,
}: {
  size: LoaderSize;
  children: ReactNode;
  /** Override the content box (fractions of the board). */
  content?: ContentBox;
  className?: string;
}) {
  const mini = size === "mini";
  return (
    <span className={cn("relative block", SIZE_CLASS[size], className)} data-loader-art="ice-chalkboard">
      <svg viewBox="0 0 160 112" aria-hidden="true" focusable="false" className="block h-auto w-full overflow-visible">
        {/* the wooden frame, with a little grain */}
        <rect x={2} y={2} width={156} height={94} rx={2.5} style={{ fill: WOOD }} />
        {mini ? null : (
          <path
            d="M6 4.6H150M10 93.4H154M4.4 20V80M155.6 14V70"
            fill="none"
            strokeWidth={0.6}
            strokeLinecap="round"
            style={{ stroke: GRAIN }}
          />
        )}
        {/* the slate */}
        <rect x={8} y={8} width={144} height={82} rx={1} style={{ fill: SLATE }} />
        {mini ? null : (
          <g fill="none" stroke="var(--w-chalk)" strokeLinecap="round">
            {/* yesterday's lesson, wiped: faint duster arcs and a smudge */}
            <path d="M16 28C40 20 70 22 96 30M22 70C50 62 86 64 120 74M104 18C122 16 136 20 146 26" strokeWidth={5} strokeOpacity={0.05} />
            <path d="M120 60C130 58 140 62 146 68" strokeWidth={3} strokeOpacity={0.06} />
          </g>
        )}
        {/* the chalk ledge (a shelf proud of the frame) */}
        <rect x={0} y={95} width={160} height={7} rx={1.2} style={{ fill: WOOD_LIGHT }} />
        <path d="M1 101.4H159" fill="none" strokeWidth={0.6} style={{ stroke: GRAIN }} />
        {/* a stub of chalk and the felt duster, resting on the ledge */}
        <rect x={26} y={92.2} width={10} height={3} rx={1.4} fill="var(--w-chalk)" />
        {mini ? null : (
          <>
            <rect x={40} y={93.4} width={4.5} height={1.8} rx={0.9} fill="var(--w-chalk)" opacity={0.85} />
            <g>
              <rect x={108} y={87.4} width={24} height={5} rx={1} style={{ fill: WOOD_LIGHT }} />
              <rect x={108.6} y={92.2} width={22.8} height={2.8} rx={0.6} fill="var(--w-graphite)" />
              <path d="M109.6 93.6H130.4" fill="none" stroke="var(--w-chalk)" strokeWidth={0.5} strokeOpacity={0.5} />
            </g>
          </>
        )}
      </svg>
      <span className="absolute" style={content ?? (mini ? BOARD_CONTENT_MINI : BOARD_CONTENT)}>
        {children}
      </span>
    </span>
  );
}
