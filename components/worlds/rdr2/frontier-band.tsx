"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMediaQuery, useReducedMotion } from "@/lib/flags";
import { resolveVariant, type MediaId } from "@/lib/media";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { RD_PIECES } from "@/components/worlds/rdr2/kit";
import s from "@/components/worlds/rdr2/rdr2.module.css";

/* ============================================================================
   FRONTIER BAND — SM-15's opening band (RECOGNIZABILITY S14; rdr2-act.BAR
   §B1–B2, B10). The golden-hour Heartlands (MV-10: a riderless horse, the
   river, the low sun at x ≈ .78) runs full-bleed behind the section head,
   whose h2 and intro sit in the plate's dark left foreground (RD-P5; the
   plate's left-45% p95 is 0.0059, plus our deep feather). It is card
   II→III's developed plate continued: the band starts at the section's top
   edge on the card's deep, so the page never cuts (T8).

   DEFAULT "ride-in": the plate pushes toward the low sun as you read down
   (scale 1 → 1.08 on scroll, origin at the sun; transform only, desktop +
   motion on).
   ALT "dead-eye-release": the band arrives in the Dead Eye grade the ALT
   card settled on (iconic-deadeye, red-sepia, frozen) and releases into
   the golden hour (MV-10-alt) as it comes into view — mark first, fire
   once, and time returns to 1×. The caption hands over DEAD EYE → THE
   HEARTLANDS with the plates (the transitional one is aria-hidden).

   Mobile (< 1024): the head, then MV-10m (4:5) below it, the caption under
   (S14; no push, no grade). Reduced motion / Pause / SSR: the still plate,
   the settled caption. The caption is real HTML text in the SSR.
   ========================================================================== */

const DESKTOP = "(min-width: 64rem)";
/** The band's framing: closer than the card's plate (see `push`). */
const BAND_ZOOM = 1.2;

export function FrontierBand({
  media,
  mediaMobile,
  deadEye,
  choice,
  head,
  caption,
  deadEyeCaption,
}: {
  /** The band plate (MV-10); its registered alternate plays under the ALT. */
  media: MediaId;
  /** The 4:5 mobile plate (MV-10m). */
  mediaMobile?: MediaId;
  /** The Dead Eye still the ALT releases from (the world's cardAltStill). */
  deadEye?: MediaId;
  choice: VariantChoice;
  /** The section head (Meta · h2 · intro), server-rendered. */
  head: ReactNode;
  /** cap.beyond, server-rendered (place "under": in flow). */
  caption: ReactNode;
  /** cap.act-3.alt (DEAD EYE), aria-hidden, for the ALT hand-over. */
  deadEyeCaption?: ReactNode;
}) {
  const v = useVariant(choice, RD_PIECES.band);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // M2 critic 3 #9: the band is the card's plate CONTINUED, not repeated —
  // it opens already pushed in toward the river and the horse (×1.2), then
  // rides on (×1.28), so the reader never sees the card's picture twice
  const push = useTransform(scrollYProgress, [0, 1], [BAND_ZOOM, BAND_ZOOM + 0.08]);
  // full 0–1 range: an opacity map ending short of 1 is handed to a scroll-
  // driven WAAPI animation whose implicit last keyframe is the UNDERLYING
  // opacity (1) — the Dead Eye layer came back after .46 (see hero-stage)
  const grade = useTransform(scrollYProgress, [0, 0.1, 0.46, 1], [1, 1, 0, 0]);
  const released = useTransform(grade, (o) => 1 - o);

  const live = desktop && !reduced;
  const alt = v === "alt";
  const plate = resolveVariant(media, v)?.id ?? media;
  const mobile = mediaMobile ? (resolveVariant(mediaMobile, v)?.id ?? mediaMobile) : null;
  const deadEyeLive = alt && live && Boolean(deadEye);

  return (
    <div
      ref={ref}
      className={cn(s.band, "lg:mt-[calc(-1*var(--spacing-section))]")}
      data-piece={RD_PIECES.band}
      data-variant={v}
    >
      <div className={s.bandPlate} aria-hidden="true">
        <motion.div className={s.bandLayer} style={{ scale: live && !alt ? push : BAND_ZOOM }}>
          <MediaFrame media={plate} layout="fill" sizes="100vw" playOn="never" />
        </motion.div>
        {deadEyeLive && deadEye ? (
          <motion.div className={s.bandLayer} style={{ opacity: grade }}>
            <MediaFrame media={deadEye} layout="fill" sizes="100vw" playOn="never" loader={false} />
            <div className={s.deadeyeVignette} />
          </motion.div>
        ) : null}
        <div className={s.bandScrim} />
      </div>

      <div className={s.bandHead}>{head}</div>

      {mobile ? (
        <div className={cn(s.bandMobile, "sm:max-w-[30rem]")}>
          <MediaFrame
            media={mobile}
            ratio={4 / 5}
            radius="frame"
            playOn="never"
            sizes="(min-width: 40rem) 30rem, 100vw"
          />
        </div>
      ) : null}

      <div className={s.bandCaption}>
        <motion.div style={deadEyeLive ? { opacity: released } : undefined}>{caption}</motion.div>
        {deadEyeLive && deadEyeCaption ? (
          <motion.div className={s.bandCaptionDeadeye} style={{ opacity: grade }}>
            {deadEyeCaption}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
