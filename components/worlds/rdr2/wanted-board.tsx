"use client";

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { rectOf, resolveVariant, type MediaId } from "@/lib/media";
import { dur, ease, easeClip, springSettle } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { RD_PIECES } from "@/components/worlds/rdr2/kit";
import s from "@/components/worlds/rdr2/rdr2.module.css";

/* ============================================================================
   WANTED BOARD — the handbill nailed over the central blank poster of the
   notice-board plate (iconic-wanted; RECOGNIZABILITY S14, IC-RD-03,
   rdr2-act.BAR §B7–B9). The plate carries no text (H2): WANTED, the name
   and every fact are real HTML (the facts verbatim content.ts, B7), set on
   the handbill's paper inks (B8). The plate is scaled and offset so its
   measured `rects.posterRect` lands exactly under the handbill (CSS in
   rdr2.module.css "S14"); the ALT plate carries its own rect.

   DEFAULT "nailed-up": the bill drops onto the board and settles askew,
   then two nails strike, left then right.
   ALT "pasted-and-stamped" (iconic-wanted-alt): the bill is pasted down
   from the top edge, then WANTED is stamped in woodtype (a press: 1.3 → 1),
   then the tacks show.

   Both are one-shot on entry (useEnterOnce: the SSR, no-JS, reduced motion
   / Pause and anything already in view are the final state). The only
   focusable is the reply link (B9). Plate: aria-hidden.
   ========================================================================== */

const NO_CLIP = "inset(-6% -6% -6% -6%)";
const ROLLED = "inset(0% 0% 100% 0%)";

export function WantedBoard({
  board,
  choice,
  titleId,
  wanted,
  children,
}: {
  /** The notice-board plate (iconic-wanted); its alternate plays under the ALT. */
  board: MediaId;
  choice: VariantChoice;
  /** id of the WANTED heading (the aside's aria-labelledby). */
  titleId: string;
  /** The WANTED h3 (Rye, via <Lettered>), server-rendered. */
  wanted: ReactNode;
  /** Everything under WANTED (sub, name, facts, reply link), server-rendered. */
  children: ReactNode;
}) {
  const v = useVariant(choice, RD_PIECES.handbill);
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.4 });
  const armed = phase === "armed";
  const entered = phase === "entered";
  const alt = v === "alt";

  const asset = resolveVariant(board, v);
  const plateId = asset?.id ?? board;
  const rect = rectOf(plateId, "posterRect") ?? rectOf(board, "posterRect");
  const ratio = asset ? asset.height / asset.width : 9 / 16;
  const vars = rect
    ? ({
        "--x0": rect.x0,
        "--x1": rect.x1,
        "--y0": rect.y0,
        "--y1": rect.y1,
        "--ar": ratio,
      } as CSSProperties)
    : undefined;

  // DEFAULT: drop + settle, then the nails strike (0.45 s, 0.6 s).
  const drop = {
    initial: false as const,
    animate: armed ? { y: -44, rotate: -3.5, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 },
    transition: entered
      ? { y: { type: "spring" as const, ...springSettle }, rotate: { type: "spring" as const, ...springSettle }, opacity: { duration: dur.micro } }
      : { duration: 0 },
  };
  const nail = (delay: number) => ({
    initial: false as const,
    animate: armed ? { scale: 1.9, opacity: 0 } : { scale: 1, opacity: 1 },
    transition: entered ? { duration: dur.flash, ease, delay } : { duration: 0 },
  });
  // ALT: paste down from the top edge, then the stamp, then the tacks.
  const paste = {
    initial: false as const,
    animate: { clipPath: armed ? ROLLED : NO_CLIP },
    transition: entered ? { duration: 0.9, ease: easeClip } : { duration: 0 },
  };
  const stamp = {
    initial: false as const,
    animate: armed ? { scale: 1.3, opacity: 0 } : { scale: 1, opacity: 1 },
    transition: entered ? { duration: 0.18, ease, delay: 0.95 } : { duration: 0 },
  };

  return (
    <div
      ref={ref}
      className={s.board}
      style={vars}
      data-piece={RD_PIECES.handbill}
      data-variant={v}
      data-beat="B43-wanted"
      data-beat-star=""
      data-beat-weight="2"
    >
      {rect ? (
        <div className={s.boardPlate} aria-hidden="true">
          <MediaFrame media={plateId} layout="fill" playOn="never" sizes="(min-width: 40rem) 1700px, 1400px" />
        </div>
      ) : null}
      <div className={s.boardFeather} aria-hidden="true" />

      <motion.div className={s.billSlot} {...(alt ? paste : drop)}>
        <aside aria-labelledby={titleId} className={cn("handbill", s.bill)} data-motif="handbill">
          <motion.span aria-hidden="true" className={cn(s.nail, s.nailL)} {...nail(alt ? 1.2 : 0.45)} />
          <motion.span aria-hidden="true" className={cn(s.nail, s.nailR)} {...nail(alt ? 1.3 : 0.6)} />
          {alt ? <motion.div {...stamp}>{wanted}</motion.div> : wanted}
          {children}
          <span aria-hidden="true" className={s.billCurl} />
        </aside>
      </motion.div>
    </div>
  );
}
