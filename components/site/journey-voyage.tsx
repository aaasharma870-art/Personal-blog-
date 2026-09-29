"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { journey } from "@/lib/content";
import { cn } from "@/lib/utils";
import { JackCompass, bearingFrom } from "@/components/site/pirates-instruments";

/* ============================================================================
   THE VOYAGE (SPEC v2 SM-4, desktop ≥ 1024 + fine pointer + motion on).
   Left: the four real steps in normal flow (verbatim content.ts). Right: a
   STICKY chart column (0 extra travel — the pinned 300vh track is retired):
   a portolan strip with a dashed brass course through four waypoint links,
   the cartouche THE CROSSING (the act's one display-face moment, SPEC §9.7),
   and Jack's compass, whose red arrow hunts and settles on the TRUE bearing
   from the compass to the active step's waypoint (IC-PC-02). Hovering or
   focusing a waypoint turns the needle toward it ("points to what you want
   most", IC-PC-03). At The break the course kinks with one ember tick: those
   Smart-Money patterns are on the kill-list (ember = killed). At Now, the
   brass X (IC-PC-06, brass never ember) and its caption.
   Everything the chart says is also in the DOM as text; the SVG is aria-hidden.
   ========================================================================== */

/** Chart geometry (viewBox 560 × 440). Shared with the carousel fallback so
 *  the needle points the same way in every mode. */
export const CHART = { w: 560, h: 440 } as const;
export const COMPASS_AT = [84, 334] as const;
export const WAYPOINTS: readonly (readonly [number, number])[] = [
  [150, 92],
  [298, 132],
  [330, 268],
  [482, 318],
];
/** The needle's heading toward waypoint i (degrees clockwise from north). */
export const headingOf = (i: number): number =>
  bearingFrom(COMPASS_AT, WAYPOINTS[i] ?? WAYPOINTS[0]!);

/** The course: harbour → open water → the kink at The break → the X. */
const COURSE =
  "M150 92 C204 78 250 104 298 132 C338 156 350 206 330 268 C368 282 420 314 482 318";
const BREAK_INDEX = 2; // "The break" — the course kinks, one ember tick
const NOW_INDEX = 3; // "Now" — the brass X

/* rhumb lines radiating from the compass rose (portolan grammar, figure only) */
const RHUMBS = Array.from({ length: 12 }, (_, k) => {
  const a = (k * 30 * Math.PI) / 180;
  const [cx, cy] = COMPASS_AT;
  return `M${cx} ${cy} L${(cx + 900 * Math.sin(a)).toFixed(1)} ${(cy - 900 * Math.cos(a)).toFixed(1)}`;
}).join(" ");

export function JourneyVoyage({ nowCaption }: { nowCaption?: ReactNode }) {
  const [active, setActive] = useState(0);
  const [intent, setIntent] = useState<number | null>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  // The active step = the article crossing the viewport's centre line.
  useEffect(() => {
    const root = stepsRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.step);
          if (!Number.isNaN(i)) setActive(i);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const pointAt = intent ?? active;
  const heading = headingOf(pointAt);
  const [bx, by] = WAYPOINTS[BREAK_INDEX] ?? [0, 0];
  const [xx, xy] = WAYPOINTS[NOW_INDEX] ?? [0, 0];

  return (
    <div className="mt-tier-block grid grid-cols-12 gap-x-6">
      {/* ── the four steps, in normal flow ───────────────────────────── */}
      <div ref={stepsRef} className="col-span-6 xl:col-span-5">
        {journey.map((s, i) => (
          <article
            key={s.marker}
            id={`journey-step-${i + 1}`}
            data-step={i}
            aria-labelledby={`journey-step-${i + 1}-title`}
            className="flex min-h-[62vh] scroll-mt-[30vh] flex-col justify-center border-t border-rule py-tier-block first:border-t-0"
          >
            <p className="type-meta text-fg-muted">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
              <span>{s.marker}</span>
            </p>
            <h3
              id={`journey-step-${i + 1}-title`}
              className={cn(
                "mt-tier-pair type-heading transition-colors duration-(--dur-micro)",
                i === active ? "text-fg" : "text-fg-muted",
              )}
            >
              {s.title}
            </h3>
            <p className="mt-tier-pair max-w-body type-body text-fg-muted">{s.body}</p>
          </article>
        ))}
      </div>

      {/* ── the chart: sticky beside the steps (0 extra travel) ───────── */}
      <div className="col-span-6 xl:col-span-6 xl:col-start-7">
        <div className="sticky top-[calc(var(--header-h)+3rem)]">
          <div className="relative" style={{ aspectRatio: `${CHART.w} / ${CHART.h}` }}>
            <svg
              viewBox={`0 0 ${CHART.w} ${CHART.h}`}
              aria-hidden="true"
              focusable="false"
              className="absolute inset-0 size-full overflow-visible"
            >
              <defs>
                <clipPath id="voyage-clip">
                  <rect width={CHART.w} height={CHART.h} />
                </clipPath>
              </defs>
              {/* the chart's neat line and the rhumb lines (figure, not ground) */}
              <rect
                x="0.5"
                y="0.5"
                width={CHART.w - 1}
                height={CHART.h - 1}
                className="fill-none stroke-(--w-storm)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={RHUMBS}
                clipPath="url(#voyage-clip)"
                className="fill-none stroke-(--w-storm)"
                strokeOpacity={0.45}
                strokeWidth={0.75}
                vectorEffect="non-scaling-stroke"
              />
              {/* the dashed brass course */}
              <path
                d={COURSE}
                className="fill-none stroke-(--w-brass)"
                strokeWidth={1.5}
                strokeDasharray="7 6"
                strokeLinecap="square"
                vectorEffect="non-scaling-stroke"
              />
              {/* The break: one ember tick across the kink (killed) */}
              <path
                d={`M${bx - 9} ${by - 7} L${bx + 9} ${by + 7}`}
                className="stroke-kill"
                strokeWidth={2}
                strokeLinecap="square"
                vectorEffect="non-scaling-stroke"
              />
              {/* Now: the brass X (one per page) */}
              <path
                d={`M${xx - 9} ${xy - 9} L${xx + 9} ${xy + 9} M${xx + 9} ${xy - 9} L${xx - 9} ${xy + 9}`}
                className="stroke-(--w-brass)"
                strokeWidth={2.25}
                strokeLinecap="square"
                vectorEffect="non-scaling-stroke"
              />
              {/* waypoints: the reached ones are filled */}
              {WAYPOINTS.map(([x, y], i) =>
                i === NOW_INDEX ? null : (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={i === pointAt ? 5.5 : 4.5}
                    className={cn(
                      "stroke-(--w-brass) transition-[r] duration-(--dur-micro)",
                      i <= active ? "fill-(--w-brass)" : "fill-bg",
                    )}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                ),
              )}
            </svg>

            {/* the cartouche: THE CROSSING in the act's lettering (Pirata One) */}
            <p
              aria-hidden="true"
              className="pointer-events-none absolute right-[4%] top-[3%] font-world-act text-title leading-none tracking-[0.02em] text-(--w-brass) uppercase"
            >
              The Crossing
            </p>

            {/* Jack's compass at the chart's rose */}
            <div
              className="pointer-events-none absolute"
              style={{
                left: `${(COMPASS_AT[0] / CHART.w) * 100}%`,
                top: `${(COMPASS_AT[1] / CHART.h) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <JackCompass heading={heading} size={120} />
            </div>

            {/* waypoint links: soundings in Meta; ≥ 44 px targets */}
            <ol aria-label="Voyage waypoints" className="absolute inset-0">
              {journey.map((s, i) => {
                const [x, y] = WAYPOINTS[i] ?? [0, 0];
                const below = i > 0; // W1 labels above; the rest below the course
                return (
                  <li
                    key={s.marker}
                    className="absolute"
                    style={{ left: `${(x / CHART.w) * 100}%`, top: `${(y / CHART.h) * 100}%` }}
                  >
                    <a
                      href={`#journey-step-${i + 1}`}
                      onPointerEnter={() => setIntent(i)}
                      onPointerLeave={() => setIntent(null)}
                      onFocus={() => setIntent(i)}
                      onBlur={() => setIntent(null)}
                      aria-current={i === active ? "step" : undefined}
                      className={cn(
                        "absolute flex min-h-11 min-w-11 items-center whitespace-nowrap px-2 type-meta transition-colors duration-(--dur-micro)",
                        below ? "left-0 top-3 -translate-x-1/2" : "-top-12 left-0 -translate-x-1/2",
                        i === active ? "text-fg" : "text-fg-muted hover:text-fg",
                      )}
                    >
                      <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
                      <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
                      <span>{s.marker}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
          {nowCaption ? <div className="mt-tier-group text-right">{nowCaption}</div> : null}
        </div>
      </div>
    </div>
  );
}
