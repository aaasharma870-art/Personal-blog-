"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { beatAttrs } from "@/lib/beats";
import { useDesktopFine, useMediaQuery, useReducedMotion } from "@/lib/flags";
import { markOf, resolveVariant, type MediaId } from "@/lib/media";
import { spanUnit } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import type { CameraSpec } from "@/components/primitives/camera";
import { LivePlate } from "@/components/primitives/live-plate";
import { MediaFrame } from "@/components/primitives/media-frame";
import { RD_PIECES, coverPoint } from "@/components/worlds/rdr2/kit";
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
   PHASE 3 (P3-5, spec §6.1 row MV-10; B39 the breath after the card): the
   plate is a <LivePlate>. MV-10 has no passing loop (L04 failed), so it is
   the CODE path: the virtual camera CONTINUES the tintype card's push
   toward the sun from the card's end scale, 1.04 → 1.08 over the band's
   passage (about `marks.sun` mapped through the cover crop), with depth
   parallax on the registered horizon. Both variants (the ALT's Dead Eye
   layer sits over the moving plate and releases as before). The static
   framing for everyone else (phones, touch, reduced motion, no JS, the
   server) is unchanged: the P3-0 ×1.2 close-up; under the boot gate the
   band starts at ×1 and the camera owns the scale, so nothing pops.
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
/** The band's static framing (P3-0): closer than the card's plate (the
 *  plate's own copy lives in rdr2.module.css .bandZoom, where the boot gate
 *  hands the scale to the camera; the ALT's Dead Eye layer keeps it). */
const BAND_ZOOM = 1.2;
/** The card's end scale continued (spec §6.1): 1.04 → 1.08 toward the sun. */
const PUSH: readonly [number, number] = [1.04, 1.08];

/** The camera's focal: the plate's `sun` mark through the band's cover crop
 *  (box units; resize only, DESKTOP_FINE only). */
function useSunFocal(on: boolean, plate: MediaId, box: RefObject<HTMLDivElement | null>): readonly [number, number] | undefined {
  const [f, setF] = useState<readonly [number, number] | undefined>(undefined);
  useEffect(() => {
    const el = box.current;
    const a = resolveVariant(plate, "default");
    const sun = markOf(plate, "sun");
    if (!on || !el || !a || !sun || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const [x, y] = coverPoint(a, sun, width, height);
      const r = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 1000) / 1000;
      setF((o) => (o && o[0] === r(x) && o[1] === r(y) ? o : [r(x), r(y)]));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [on, plate, box]);
  return f;
}

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
  const fine = useDesktopFine();
  const ref = useRef<HTMLDivElement>(null);
  const plateBox = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // spanUnit (lib/motion.ts): unpadded, the Dead Eye layer came back after .46
  const grade = useTransform(scrollYProgress, ...spanUnit([0.1, 0.46], [1, 0]));
  const released = useTransform(grade, (o) => 1 - o);

  const live = desktop && !reduced;
  const alt = v === "alt";
  const plate = resolveVariant(media, v)?.id ?? media;
  const mobile = mediaMobile ? (resolveVariant(mediaMobile, v)?.id ?? mediaMobile) : null;
  const deadEyeLive = alt && live && Boolean(deadEye);
  // B39: the camera continues the card's push toward the sun (both variants)
  const sun = useSunFocal(fine && !reduced, media, plateBox);
  const camera: CameraSpec = { kind: "push", scale: PUSH, focal: sun ?? markOf(media, "sun") ?? undefined, driver: "flow" };

  return (
    <div
      ref={ref}
      className={cn(s.band, "lg:mt-[calc(-1*var(--spacing-section))]")}
      data-piece={RD_PIECES.band}
      data-variant={v}
    >
      <div ref={plateBox} className={s.bandPlate} aria-hidden="true" {...beatAttrs("B39-drift")}>
        <div className={cn(s.bandLayer, s.bandZoom)}>
          <LivePlate media={plate} camera={camera} sizes="100vw" className="size-full" />
        </div>
        {deadEyeLive && deadEye ? (
          <motion.div className={s.bandLayer} style={{ opacity: grade, scale: BAND_ZOOM }}>
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
