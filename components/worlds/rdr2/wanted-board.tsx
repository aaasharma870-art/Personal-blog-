"use client";

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { beatAttrs } from "@/lib/beats";
import { rectOf, resolveVariant, type MediaId } from "@/lib/media";
import { dur, ease, easeClip, springSettle } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { CameraGroup, type CameraSpec } from "@/components/primitives/camera";
import { LivePlate } from "@/components/primitives/live-plate";
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

   PHASE 3 (P3-5 spec §6.1 row iconic-wanted; B43-wanted, a time star
   through the spotlight): the plate is a <LivePlate>, so the L15 street-
   dust loop (registered to iconic-wanted: loopFor) plays on DESKTOP_FINE
   with motion on; no camera, the HTML WANTED stays on the posterRect. When
   no loop plays (the ALT board, or the `plates.loops` ALT: code), the
   board drifts instead, and the plate, its feather and the bill move as
   ONE camera group (spec §6.1: registered overlays live inside the camera
   wrapper), so the bill never slides off its poster.
   ========================================================================== */

const NO_CLIP = "inset(-6% -6% -6% -6%)";
const ROLLED = "inset(0% 0% 100% 0%)";
const WANTED_STAR = { id: "B43-wanted", weight: 2 } as const;
/** The plate never moves on its own (the group moves it with the bill). */
const PLATE_HOLD: CameraSpec = { kind: "hold", scale: [1, 1], driver: "flow" };
/** A slow drift about the bill (the board's passage), when no loop plays. */
const BOARD_DRIFT: CameraSpec = { kind: "drift", scale: [1, 1.02], focal: [0.5, 0.45], driver: "flow" };

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
  const loops = useVariant(null, "plates.loops");
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.4, star: WANTED_STAR });
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

  // L15 is registered to iconic-wanted only: the ALT board (and the code
  // ALT of every loop) drifts the whole group instead
  const drift = alt || loops === "alt";

  return (
    <div
      ref={ref}
      className={s.board}
      style={vars}
      data-piece={RD_PIECES.handbill}
      data-variant={v}
      {...beatAttrs(WANTED_STAR.id, WANTED_STAR)}
    >
      <CameraGroup spec={drift ? BOARD_DRIFT : PLATE_HOLD} className={s.boardCam}>
        {rect ? (
          <div className={s.boardPlate} aria-hidden="true">
            <LivePlate media={plateId} camera={PLATE_HOLD} depth={false} sizes="(min-width: 40rem) 1700px, 1400px" className="size-full" />
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
      </CameraGroup>
    </div>
  );
}
