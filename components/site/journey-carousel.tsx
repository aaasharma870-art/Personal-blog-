"use client";

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { journey } from "@/lib/content";
import { useReducedMotion } from "@/lib/flags";
import type { MediaId } from "@/lib/media";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Variant } from "@/lib/variants";
import { MediaFrame } from "@/components/primitives/media-frame";
import { JourneyChart, Waypoint, WaypointLabel } from "@/components/site/journey-chart";
import { BREAK_INDEX, NOW_INDEX, bearingTo, legHeading } from "@/components/worlds/pirates/voyage-chart";
import { beatAttrs } from "@/lib/beats";

/** The voyage's two beats on the step tabs (spec §2.3 B10 step 1, B11 step 3). */
const STEP_BEATS: Readonly<Record<number, string>> = { 0: "B10", 2: "B11" };

/* ============================================================================
   JourneyCarousel — the voyage's touch / reduced-motion / Save-Data path
   (SPEC v2 SM-4 fallbacks; journey-voyage.BAR §4, J13; RECOGNIZABILITY S06):
   the same chart strip, whose four waypoints ARE the tabs (role=tablist:
   arrow keys, Home/End, roving tabindex), Jack's compass on the selected
   leg's heading (static under reduced motion), the step's STILL (MV-05a–d;
   0 sequence requests) with its caption — "PORT ROYAL HARBOUR AT NIGHT •
   PIRATES OF THE CARIBBEAN" bottom-left over the still (≥ 640) or under it —
   and the verbatim step text in the tabpanel.
   ALT ("sail-on-cue"): the course plots leg by leg as slides are visited
   and the X inks at Now (instant under reduced motion). Save-Data: the
   smallest still. ≥ 1024 (reduced motion on desktop): chart + text on the
   left, the still on the right.
   ========================================================================== */

type Props = {
  variant: Variant;
  /** The still per step (this variant's set). */
  stills: readonly MediaId[];
  captions: readonly ReactNode[];
  cartouche: ReactNode;
  saveData?: boolean;
};

export function JourneyCarousel({ variant, stills, captions, cartouche, saveData = false }: Props) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [seen, setSeen] = useState(0); // the furthest slide visited
  const [intent, setIntent] = useState<number | null>(null);
  const n = journey.length;
  const cur = journey[i];
  const alt = variant === "alt";

  const goto = (idx: number) => {
    const clamped = Math.max(0, Math.min(n - 1, idx));
    setDir(clamped >= i ? 1 : -1);
    setI(clamped);
    setSeen((s) => Math.max(s, clamped));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 };
    const next = keys[e.key];
    if (next === undefined) return;
    e.preventDefault();
    goto(next);
    // roving focus follows the selection
    const tabs = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[Math.max(0, Math.min(n - 1, next))]?.focus();
  };

  if (!cur) return null;

  return (
    <div className="mt-tier-block grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:gap-x-6" data-voyage={variant} data-carousel="">
      <div className="lg:col-span-5 lg:col-start-1">{cartouche}</div>

      {/* the chart strip: its waypoints are the tabs */}
      <div
        role="tablist"
        aria-label="Journey timeline"
        aria-orientation="horizontal"
        onKeyDown={onKey}
        className="lg:col-span-5 lg:col-start-1"
      >
        <JourneyChart
          className="max-w-[40rem] pb-12 pt-6"
          heading={intent !== null ? bearingTo(intent) : legHeading(i)}
          lid={intent !== null ? "open" : "ajar"}
          active={i}
          reached={alt ? seen : i}
          plot={alt ? "legs" : "full"}
          cursed={reduce || seen >= BREAK_INDEX}
          xInked={!alt || seen >= NOW_INDEX}
          hunt
          compassClassName="w-12 sm:w-14"
          medallionClassName="w-8 sm:w-11"
        >
          {journey.map((s, idx) => {
            const sel = idx === i;
            return (
              <Waypoint key={s.marker} index={idx} as="div">
                <button
                  type="button"
                  role="tab"
                  id={`journey-tab-${idx + 1}`}
                  {...(STEP_BEATS[idx] ? beatAttrs(STEP_BEATS[idx], { weight: 2 }) : {})}
                  aria-selected={sel}
                  aria-controls="journey-panel"
                  tabIndex={sel ? 0 : -1}
                  onClick={() => goto(idx)}
                  onPointerEnter={() => setIntent(idx)}
                  onPointerLeave={() => setIntent(null)}
                  onFocus={() => setIntent(idx)}
                  onBlur={() => setIntent(null)}
                  className={cn(
                    "flex min-h-11 min-w-11 items-center justify-center rounded-control px-1 type-meta transition-colors duration-(--dur-micro) motion-off:transition-none",
                    sel ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  <WaypointLabel index={idx} compact />
                </button>
              </Waypoint>
            );
          })}
        </JourneyChart>
      </div>

      {/* the step's still + its caption */}
      <div className="scene-caption-host relative lg:col-span-7 lg:col-start-6 lg:row-span-3 lg:row-start-1 lg:self-start">
        <div className="relative aspect-video w-full overflow-hidden rounded-frame bg-(--world-deep)">
          {stills.map((id, k) =>
            k <= Math.max(seen, i) ? (
              <div
                key={id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-(--dur-preview) motion-off:transition-none",
                  k === i ? "opacity-100" : "opacity-0",
                )}
              >
                <MediaFrame
                  media={id}
                  layout="fill"
                  sizes={saveData ? "360px" : "(min-width: 1024px) 55vw, 100vw"}
                  loader={k === i}
                  world="pirates"
                />
              </div>
            ) : null,
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] hidden h-1/2 bg-linear-to-t from-(--world-deep)/85 to-transparent sm:block"
          />
        </div>
        <div key={i} data-step-caption={i + 1}>
          {captions[i]}
        </div>
      </div>

      {/* the verbatim step */}
      <div
        id="journey-panel"
        role="tabpanel"
        aria-labelledby={`journey-tab-${i + 1}`}
        className="border-t border-rule pt-tier-group lg:col-span-5 lg:col-start-1"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="type-meta text-fg-muted">
            <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
            <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
            <span>{cur.marker}</span>
            <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
            <span className="tnum">{`${i + 1} / ${n}`}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goto(i - 1)}
              disabled={i === 0}
              aria-label="Previous step"
              className="flex size-11 items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goto(i + 1)}
              disabled={i === n - 1}
              aria-label="Next step"
              className="flex size-11 items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={cur.marker}
            className="mt-tier-group"
            initial={reduce ? false : { opacity: 0, x: dir * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: dir * -32 }}
            transition={{ duration: reduce ? 0 : dur.base, ease }}
          >
            <h3 className="type-heading text-fg">{cur.title}</h3>
            <p className="mt-tier-pair max-w-body type-body text-fg-muted">{cur.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
