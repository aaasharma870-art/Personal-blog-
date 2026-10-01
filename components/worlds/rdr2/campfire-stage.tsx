"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { beatAttrs } from "@/lib/beats";
import { useMediaQuery, useReducedMotion } from "@/lib/flags";
import { markOf, resolveMedia, type MediaId } from "@/lib/media";
import { dur, easeClip } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import { Rise } from "@/components/site/world-motion";
import { FirelightRead } from "@/components/site/rdr2-graphite";
import { RD_PIECES } from "@/components/worlds/rdr2/kit";
import s from "@/components/worlds/rdr2/rdr2.module.css";

/* ============================================================================
   BY THE FIRE — SM-16 (RECOGNIZABILITY S16; rdr2-act.BAR §D). Night at the
   gang's camp: people are HEARD, not shown (RD-P6) — the three teacher
   quotes (verbatim content.ts, passed in) sit in the dark left foreground;
   the lead quote is read into firelight (FirelightRead: a one-shot mask
   muted → ink, no glow on text). No faces or figures anywhere (H1).

   DEFAULT "camp-at-dusk": the iconic camp plate (hitched horses, the lake
   at sunset, the tents, the covered wagon, the fire under its tripod pot)
   runs full-bleed and STAYS behind the quotes while you read them (a
   sticky backdrop; a deep scrim over its left half, where the quotes sit;
   the plate set right so the fire burns beyond the quotes' column). Out of
   the journal the camp fades up from --rd-deep (T9); then, as you read
   down, night falls on it EXCEPT around the fire (a deep veil with a hole
   at the plate's measured `marks.fire`), so the fire is the last light
   when card III→IV's embers rise from the same mark (T10). Caption
   cap.voices in the section HEAD, under the h2 (ART-DIRECTOR #14: the camp
   is named the moment the section opens, not at the sticky plate's foot).
   ALT "fireside-loop": a cutscene — the fire band (MV-11, whose 8 s loop
   MV-11L plays on desktop only while visible and the decoder is free) opens
   from a letterbox; the head and the lead quote sit in its dark left; the
   caption cap.voices.alt sits UNDER it (the loop moves), and each further
   voice is read into firelight in turn.

   Mobile (< 1024): a focal crop still above the quotes, the caption under,
   no loop. Reduced motion / Pause: the still plate(s), no veil, no clip,
   quotes in ink. The DOM order is the same in both (head → lead → rest).
   Colour changes are overlays on MEDIA only (opacity); no DOM glow.
   RASTER (P3-2, spec §12.1 #6): the sticky camp is never repainted while
   it scrolls — the plate's feather is a baked wash (no mask) and the two
   veils change opacity only, each on its own layer. B46 (the camp's
   fade-up out of the journal's dusk) is this stage.
   ========================================================================== */

const DESKTOP = "(min-width: 64rem)";
const LETTERBOX = "inset(14% 0% 14% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

export type Voice = { key: string; quote: ReactNode; cite: ReactNode };

/** Where the plate's fire lands inside the sticky host (px), given the
 *  object-fit: cover crop MediaFrame applies (object-position = focal). */
function useFirePoint(
  live: boolean,
  media: MediaId,
  hostRef: RefObject<HTMLDivElement | null>,
  plateRef: RefObject<HTMLDivElement | null>,
): { x: number; y: number } | null {
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!live) return;
    const host = hostRef.current;
    const plate = plateRef.current;
    const asset = resolveMedia(media);
    const mark = asset ? markOf(asset.id, "fire") : null;
    if (!host || !plate || !asset || !mark || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const h = host.getBoundingClientRect();
      const r = plate.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const k = Math.max(r.width / asset.width, r.height / asset.height);
      const w = asset.width * k;
      const ht = asset.height * k;
      const [fx, fy] = asset.focal ?? [0.5, 0.5];
      setPt({
        x: r.left - h.left + (r.width - w) * fx + mark[0] * w,
        y: r.top - h.top + (r.height - ht) * fy + mark[1] * ht,
      });
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, [live, media, hostRef, plateRef]);
  return live ? pt : null;
}

export function CampfireStage({
  choice,
  media,
  altMedia,
  loop,
  head,
  lead,
  rest,
  caption,
  captionUnder,
  altCaption,
}: {
  choice: VariantChoice;
  /** DEFAULT plate (iconic-camp). */
  media: MediaId;
  /** ALT still (MV-11). */
  altMedia?: MediaId;
  /** ALT loop (MV-11L, registered to MV-11). */
  loop?: MediaId;
  head: ReactNode;
  /** The lead figure (already read into firelight). */
  lead: ReactNode;
  rest: readonly Voice[];
  /** cap.voices, place "head": under the section head, desktop (the
   *  mobile still carries `captionUnder`). */
  caption?: ReactNode;
  /** cap.voices, place "under" (under the mobile still). */
  captionUnder?: ReactNode;
  /** cap.voices.alt, place "under". */
  altCaption?: ReactNode;
}) {
  const v = useVariant(choice, RD_PIECES.fire);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP);
  const live = desktop && !reduced;
  const alt = v === "alt" && Boolean(altMedia);

  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  // T9: the camp fades up from deep as the stage arrives …
  const { scrollYProgress: arrive } = useScroll({ target: stageRef, offset: ["start end", "start 30%"] });
  const fadeUp = useTransform(arrive, [0, 1], [1, 0]);
  // … then night falls on it as you read down, except around the fire.
  const { scrollYProgress: read } = useScroll({ target: stageRef, offset: ["start start", "end end"] });
  const night = useTransform(read, [0, 1], [0, 0.62]);
  const fire = useFirePoint(live && !alt, media, hostRef, plateRef);
  const nightGround = fire
    ? `radial-gradient(circle at ${fire.x.toFixed(0)}px ${fire.y.toFixed(0)}px, transparent 0, transparent 3.5rem, var(--bg) 17rem)`
    : null;

  const bandRef = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(bandRef, { amount: 0.3 });

  const restList = (
    <ul
      aria-label="More from teachers"
      className={cn("mt-tier-block space-y-tier-block border-t border-rule pt-tier-block", alt && "lg:max-w-[52%]")}
    >
      {rest.map((t, i) =>
        alt ? (
          <li key={t.key}>
            <figure>
              <FirelightRead>{t.quote}</FirelightRead>
              <figcaption className="mt-tier-pair">{t.cite}</figcaption>
            </figure>
          </li>
        ) : (
          <Rise as="li" key={t.key} delay={i * 0.08}>
            <figure>
              {t.quote}
              <figcaption className="mt-tier-pair">{t.cite}</figcaption>
            </figure>
          </Rise>
        ),
      )}
    </ul>
  );

  if (alt && altMedia) {
    return (
      <div ref={stageRef} className={s.campStage} data-piece={RD_PIECES.fire} data-variant={v} {...beatAttrs("B46", { weight: 1 })}>
        <div ref={bandRef} className={s.fireBand}>
          <motion.div
            className={s.fireMedia}
            aria-hidden="true"
            initial={false}
            animate={{ clipPath: phase === "armed" ? LETTERBOX : OPEN }}
            transition={phase === "entered" ? { duration: dur.hero, ease: easeClip } : { duration: 0 }}
          >
            <MediaFrame media={loop ?? altMedia} poster={altMedia} layout="fill" sizes="100vw" playOn="desktop" />
            <div className={s.fireScrim} />
          </motion.div>
          <div className={s.fireCopy}>
            {head}
            <div className={s.fireMobile}>
              <MediaFrame media={altMedia} ratio={4 / 3} radius="frame" playOn="never" sizes="100vw" />
              {altCaption}
            </div>
            <div className="mt-tier-block">{lead}</div>
          </div>
        </div>
        <div className={cn(s.fireCaption, "hidden lg:block")}>{altCaption}</div>
        {restList}
      </div>
    );
  }

  return (
    <div ref={stageRef} className={s.campStage} data-piece={RD_PIECES.fire} data-variant={v} {...beatAttrs("B46", { weight: 1 })}>
      <div className={s.campCopy}>
        {head}
        {caption ? <div className={s.campHeadCaption}>{caption}</div> : null}
        <div className={s.campMobile}>
          <MediaFrame media={media} ratio={4 / 3} radius="frame" playOn="never" sizes="100vw" />
          {captionUnder}
        </div>
        <div className="mt-tier-block">{lead}</div>
        {restList}
      </div>
      {/* the camp, behind the quotes (z -1; after them in reading order) */}
      <div className={s.campBackdrop}>
        <div ref={hostRef} className={s.campSticky}>
          <div ref={plateRef} className={s.campPlate}>
            <MediaFrame media={media} layout="fill" sizes="100vw" playOn="never" />
          </div>
          <div className={s.campScrim} aria-hidden="true" />
          {live ? (
            <>
              <motion.div
                className={s.duskVeil}
                aria-hidden="true"
                style={nightGround ? { opacity: night, backgroundImage: nightGround, backgroundColor: "transparent" } : { opacity: night }}
              />
              <motion.div className={s.duskVeil} aria-hidden="true" style={{ opacity: fadeUp }} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
