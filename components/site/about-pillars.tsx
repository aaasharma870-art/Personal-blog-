"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { safeLazy } from "@/lib/safe-lazy";
import { motion } from "motion/react";
import { pillars } from "@/lib/content";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { dur, ease, easeDraw } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import { cn } from "@/lib/utils";
import type { VariantChoice } from "@/lib/variants";
import { useEnterOnce } from "@/components/primitives/use-enter-once";
import type { ReactNode, RefObject } from "react";
import { JackCompass, type CompassApi, type CompassLid } from "@/components/worlds/pirates/jack-compass";

/* ============================================================================
   The four pillars as four BEARINGS around JACK'S COMPASS (SPEC v2 §3 row 1,
   TA-06; RECOGNIZABILITY S05: "replace the faint rhumb rose at the pillar
   hub with Jack's compass at 120 px, lid open; the red arrow turns toward
   the hovered or focused pillar (IC-PC-03, 'points to what you want most')
   and settles on pillar 1 at rest"). Desktop: a 2 × 2 chart whose centre
   cross holds the compass; each pillar sits in its quadrant under its Meta
   bearing (NW · NE · SW · SE = the needle's true headings 315 · 45 · 225 ·
   135). Below lg the compass leads a plain list. Copy verbatim (content.ts
   `pillars`); the compass is aria-hidden (the facts are the text).

   TWO CHOREOGRAPHIES (lib/variants.ts `about.compass`):
     default "true-north"      — the lid is open on its star chart; the first
       time the compass scrolls into view it spins a full turn and settles
       on pillar 1; hovering or focusing a pillar turns the arrow to it and
       lights that pillar's bearing in brass.
     alt "taking-bearings"     — the compass arrives SHUT; on entry the lid
       swings open, then the arrow takes the four bearings in turn (NW → NE
       → SW → SE), each plotting a brass bearing line out toward its pillar
       (desktop) and lighting its bearing, then returns to NW. Afterwards,
       hover / focus behave as the default.
   Reduced motion / Pause / already in view: the final state, static.

   PHASE 3 (W3-PIRATES; PHASE3-SPEC §2.3 B08, §3.8, §9.2 #1):
   - Both entrances are a time star of the B08 row ("B08-compass"): on
     DESKTOP_FINE they ask the spotlight, which the scrubbed sentence (the
     row's scroll star) owns while it crosses the middle 60 %; "skip" = the
     final state, static. Phones and tablets enter as before.
   - Pillar 02's body carries the Act I scrubbed sentence (`bodies`, built
     on the server in about.tsx).
   - THE TOY, "Spin Jack's compass" (DESKTOP_FINE only, lazy: compass-toy
     .tsx + use-compass-spin.ts): a button over the compass (the SVG stays
     aria-hidden). It drives the drawing through JackCompass's `onApi`; the
     needle always comes to rest on a pillar bearing (`point`, lit in brass).
     Its invite (B08-invite) is one needle twitch on scroll-idle.
   ========================================================================== */

const BEARINGS = ["NW", "NE", "SW", "SE"] as const;
const HEADINGS = [315, 45, 225, 135] as const;
/** The alt's bearing sweep: lid opens at 0, bearings every 460 ms, home. */
const SWEEP = { lid: 0, first: 520, every: 460, home: 520 } as const;

/** The entrances' time star (the B08 row; not a declared beat of its own). */
const ENTRY_STAR = { id: "B08-compass", weight: 1 } as const;

/** The toy (desktop only): a lazy chunk, never on phones (DP-13). */
const CompassToy = safeLazy(() => import("@/components/worlds/pirates/compass-toy"));

/**
 * AboutRise — world-motion's Rise (a block rises 24 px and fades in once),
 * except on DESKTOP_FINE, where About's prose is simply there (P3-11 r1,
 * J1 #5): the bio and the pillars rising in a stagger while Jack's compass
 * spins on entry read as two stars at once. On the desktop the compass's
 * entry spin (B08-compass, through the spotlight) is this screen's one
 * motion; phones keep the rise. Same element type on both sides (no
 * remount when the media query settles after hydration).
 */
export function AboutRise({
  as = "div",
  children,
  className,
  delay = 0,
}: {
  as?: "div" | "li";
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const entered = useEnterOnce(ref);
  const still = useDesktopFine();
  const phase = still ? "static" : entered;
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag
      // motion's per-tag ref types differ; the element is always an HTMLElement
      ref={ref as RefObject<never>}
      className={className}
      initial={false}
      animate={phase === "armed" ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
      transition={phase === "entered" ? { duration: dur.reveal, ease, delay } : { duration: 0 }}
    >
      {children}
    </Tag>
  );
}

/** Bearing lines from the case rim outward (desktop hub SVG, 280 × 280). */
const RAYS = HEADINGS.map((deg) => {
  const a = (deg * Math.PI) / 180;
  const p = (r: number) => `${(140 + r * Math.sin(a)).toFixed(1)} ${(140 - r * Math.cos(a)).toFixed(1)}`;
  return { line: `M${p(66)} L${p(104)}`, dot: p(104).split(" ").map(Number) as [number, number] };
});

export function AboutPillars({
  choice,
  caption = null,
  bodies,
  toy = null,
}: {
  choice: VariantChoice;
  /** cap.about (server-rendered), shown under the compass below lg. */
  caption?: ReactNode;
  /** The pillar bodies as server nodes (pillar 02 holds the B08 scrub);
   *  default the plain `pillars[].body`. */
  bodies?: readonly ReactNode[];
  /** The toy's label (toy.compass.label); null = no toy. */
  toy?: string | null;
}) {
  const variant = useVariant(choice, "about.compass");
  const reduced = useReducedMotion();
  const fine = useDesktopFine();
  const alt = variant === "alt";
  const listRef = useRef<HTMLOListElement>(null);
  const phase = useEnterOnce(listRef, { amount: 0.45, star: alt ? ENTRY_STAR : undefined });
  const [aim, setAim] = useState<number | null>(null);
  // the alt's sweep: -1 = not started; 0–3 = taking bearing k; 4 = done
  const [sweep, setSweep] = useState(-1);
  // the toy: the pillar the needle rests on, and "spinning" (hover waits)
  const [point, setPoint] = useState(0);
  const [busy, setBusy] = useState(false);
  const [api, setApi] = useState<CompassApi | null>(null);

  const settled = reduced || phase === "static";

  useEffect(() => {
    if (!alt || phase !== "entered" || reduced) return;
    const timers = [0, 1, 2, 3, 4].map((k) =>
      window.setTimeout(
        () => setSweep(k),
        SWEEP.first + k * SWEEP.every + (k === 4 ? SWEEP.home - SWEEP.every : 0),
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [alt, phase, reduced]);

  // what the compass does now (a spin owns the needle: hover waits)
  const rest = busy ? point : (aim ?? point);
  let heading: number = HEADINGS[rest] ?? 0;
  let lid: CompassLid = "open";
  let plotted = 4; // bearing lines drawn (alt)
  let lit: number | null = rest; // the pillar whose bearing is brass
  if (alt && !settled) {
    if (phase === "armed" || sweep < 0) {
      lid = phase === "armed" ? "shut" : "open";
      heading = 0;
      plotted = 0;
      lit = null;
    } else if (sweep < 4) {
      heading = HEADINGS[sweep] ?? 0;
      plotted = sweep + 1;
      lit = sweep;
    }
  }

  const draw = reduced ? { duration: 0 } : { duration: 0.42, ease: easeDraw };

  return (
    <div className="relative">
      {/* the compass: in the centre cross on desktop, leading the list below */}
      <div className="mb-tier-group lg:pointer-events-none lg:absolute lg:left-1/2 lg:top-1/2 lg:mb-0 lg:size-0">
        {alt ? (
          <svg
            viewBox="0 0 280 280"
            aria-hidden="true"
            focusable="false"
            className="absolute left-0 top-0 hidden size-[280px] -translate-x-1/2 -translate-y-1/2 overflow-visible lg:block"
            fill="none"
          >
            {RAYS.map((r, k) => (
              <g key={r.line}>
                <motion.path
                  d={r.line}
                  className="stroke-(--w-brass)"
                  strokeWidth={1.25}
                  strokeLinecap="square"
                  initial={false}
                  animate={{ pathLength: k < plotted ? 1 : 0, opacity: k < plotted ? 1 : 0 }}
                  transition={draw}
                />
                <motion.circle
                  cx={r.dot[0]}
                  cy={r.dot[1]}
                  r={3}
                  className="fill-(--w-brass)"
                  initial={false}
                  animate={{ opacity: k < plotted ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.2, delay: 0.3 }}
                />
              </g>
            ))}
          </svg>
        ) : null}
        {/* the CASE centre on the cross: the lid rises above it
            (-63.89 % = CASE_CENTER of the compass box, 92 / 144) */}
        <div className="lg:absolute lg:left-0 lg:top-0 lg:-translate-x-1/2 lg:-translate-y-[63.89%]">
          {/* ≥ 140 px (M2 critic 3 #11: at 75–120 px the caption named a
              compass too small to find) */}
          <JackCompass
            heading={heading}
            lid={lid}
            huntOnEnter={!alt}
            star={ENTRY_STAR}
            onApi={fine && toy ? setApi : undefined}
            className="w-36"
          />
          {fine && toy && api ? (
            <Suspense fallback={null}>
              <CompassToy
                api={api}
                label={toy}
                bearings={HEADINGS}
                point={point}
                alt={alt}
                setPoint={setPoint}
                setBusy={setBusy}
              />
            </Suspense>
          ) : null}
        </div>
      </div>
      {/* below lg the compass leads the list, so its caption sits right
          UNDER it (the head's copy of it is lg only) */}
      {caption ? <div className="mb-tier-block lg:hidden">{caption}</div> : null}
      <ol
        ref={listRef}
        aria-label="Four operating pillars"
        data-pillars=""
        className="grid grid-cols-1 gap-y-tier-block sm:grid-cols-2 sm:gap-x-12 lg:gap-x-40 lg:gap-y-24"
      >
        {pillars.map((p, i) => (
          <AboutRise as="li" key={p.index} delay={i * 0.06} className="max-w-[34ch]">
            <div
              onPointerEnter={() => setAim(i)}
              onPointerLeave={() => setAim(null)}
              onFocus={() => setAim(i)}
              onBlur={() => setAim(null)}
            >
              <p className="type-meta text-fg-muted">
                <span className="tnum">{p.index}</span>
                <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
                <span
                  className={cn(
                    "transition-colors duration-(--dur-micro) motion-off:transition-none",
                    // lit in brass on a solid ground (phones, as before); on
                    // DESKTOP_FINE the live stage plate sits behind the
                    // scrim, where brass (a decorative ink, globals.css)
                    // dipped to 4.22:1 at 1024 (W3 gate AA): ink there
                    lit === i && (fine ? "text-fg" : "text-(--w-brass)"),
                  )}
                >
                  {BEARINGS[i]}
                </span>
              </p>
              <h3 className="mt-tier-pair type-heading text-fg">{p.title}</h3>
              <p className="mt-tier-pair type-body text-fg-muted">{bodies?.[i] ?? p.body}</p>
            </div>
          </AboutRise>
        ))}
      </ol>
    </div>
  );
}
