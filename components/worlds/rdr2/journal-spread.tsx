"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMediaQuery, useReducedMotion } from "@/lib/flags";
import { dur, ease, easeDraw } from "@/lib/motion";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { useEnterOnce, type EnterPhase } from "@/components/primitives/use-enter-once";
import { Rise } from "@/components/site/world-motion";
import { JournalVignette } from "@/components/site/rdr2-graphite";
import {
  BONE,
  BONE_AT,
  BONE_SPOT,
  FURNITURE,
  HORSE,
  HORSE_AT,
  LANDSCAPE,
  VIGNETTES,
  VIGNETTE_AT,
  type Stroke,
} from "@/components/worlds/rdr2/journal-sketches";
import { RD_PIECES, bakedGraphite } from "@/components/worlds/rdr2/kit";
import s from "@/components/worlds/rdr2/rdr2.module.css";

/* ============================================================================
   JOURNAL SPREAD — SM-11 (RECOGNIZABILITY S15; rdr2-act.BAR §C, writing-
   index.BAR v3). A page of Arthur Morgan's journal on the paper plane:
   left page = the five entries (Meta ENTRY I…V · the title · the angle ·
   a static DRAFT field; VERBATIM content.ts; drafts are NOT links, 0
   focusables); right page (≥ 1024) = the graphite page.

   The right page AT REST is a full-page frontier sketch (ridge, hachures,
   hills, a lake, pines, a small riderless saddled horse grazing, a dotted
   trail, grass, birds), with the page's furniture: a pencil-hatched margin
   rule, an illegible date scribble and a pasted clipping. That rest state
   is what a stranger reads as "Arthur's journal" (the F52 grammar, 0.60+).

   DEFAULT "sketch-at-rest": the landscape draws itself once as the page
   enters; pointing at an entry swaps the page to that entry's vignette
   (a crossfade; each vignette is drawn once per entry per visit), and
   leaving the list brings the landscape back.
   ALT "leafing": the SCROLL turns the pages — as each entry crosses the
   reading line the right page folds into the gutter and the next leaf
   opens on that entry's vignette (transform only); above the first entry
   the landscape is the open leaf.

   < 1024, reduced motion, Pause, no JS: one page, each entry's vignette
   inline at 64 px (drawn static); under reduced motion the desktop page
   keeps the landscape and never swaps (W16: hover frames identical).
   The right page is aria-hidden: its meaning is each entry's title.

   RASTER (P3-2, spec §12.1 #5): the right page's graphite is BAKED — plain
   strokes under the static paper-tooth mask (kit.tsx bakedGraphite), each
   SVG on its own layer — so a draw-on or a page turn never re-runs a live
   filter. The inline vignettes (< 1024) keep their live filter and are not
   rendered at all once a desktop page is up.

   PHASE 3 (PHASE3-PLAN §7.4; spec §2.3 B44–B45, §9.1 #11):
   - DEFAULT: the vignettes ALSO swap as entries cross the reading line
     (pointing at an entry still wins); the landscape is the page above
     the first entry.
   - B45: the graphite horse (Muybridge, 1878; components/words/sprites/
     horse-frames.ts) gallops along the page's BOTTOM EDGE once, on
     scroll-idle (the server's <FlyThrough>, passed in as `fly`, in a strip
     riding the sticky page). It mounts once the first entry has crossed
     the reading line, so it never plays over the head's NibTitle (B44).
   - rd-bone: the fossil bone is drawn into the landscape; its hotspot
     (the server's EggHotspot, `bone`) sits over it OUTSIDE the aria-hidden
     page art. Pointing at it or focusing it brings the landscape back.
     The pencilled note is drawn by the lazy desktop extras into
     [data-bone-note] (page art).
   - The vignette page carries its entry's head in the journal hand
     ("Entry III": font-world-hand, ≤ 4 words per page; spec §5.2).
   ========================================================================== */

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const DESKTOP = "(min-width: 64rem)";

export type JournalEntry = { title: string; angle: string; tag: string };

/** One Meta line (the world-kit Meta markup, inlined so this client leaf
 *  does not pull the manifest modules into the client bundle). */
function MetaLine({ fields }: { fields: readonly string[] }) {
  return (
    <p className="type-meta text-fg-muted">
      {fields.map((f, i) => (
        <span key={f}>
          {i > 0 ? (
            <span aria-hidden="true" className="text-fg-ghost">
              {" • "}
            </span>
          ) : null}
          {f}
        </span>
      ))}
    </p>
  );
}

/** Vignettes already drawn this visit (drawn once per entry per session). */
const drawnOnce = new Set<number>();

function drawProps(phase: EnterPhase, l: Pick<Stroke, "t" | "dur">) {
  return {
    initial: false as const,
    animate: { pathLength: phase === "armed" ? 0 : 1 },
    transition: phase === "entered" ? { duration: l.dur ?? dur.draw.short, ease: easeDraw, delay: l.t } : { duration: 0 },
  };
}

/** The page's graphite (viewBox 400 × 500): baked tooth, its own layer. */
const PAGE_GRAPHITE = bakedGraphite(400);
const PAGE_SVG = cn("overflow-visible will-change-transform", s.graphiteBaked);

/** The page's furniture: static pencil marks (never animated). */
function Furniture() {
  const c = FURNITURE.clipping;
  return (
    <svg viewBox="0 0 400 500" aria-hidden="true" focusable="false" className={cn("absolute inset-0 size-full", PAGE_SVG)} style={PAGE_GRAPHITE}>
      <g fill="none" strokeLinecap="round" className="stroke-(--world-line)">
        <path d={FURNITURE.margin} strokeWidth={0.8} strokeOpacity={0.55} />
        <path d={FURNITURE.marginHatch} strokeWidth={0.7} strokeOpacity={0.45} />
        <path d={FURNITURE.date} strokeWidth={1} strokeOpacity={0.7} />
      </g>
      {/* the pasted clipping: a scrap of print (ruled lines only) under two strips of tape */}
      <g transform="translate(304 82) rotate(4)">
        <path d={c.paper} className="fill-(--paper-s2) stroke-(--world-line)" strokeWidth={0.8} strokeOpacity={0.6} />
        <path d={c.print} fill="none" className="stroke-(--world-line)" strokeWidth={2.2} strokeOpacity={0.28} strokeLinecap="round" />
        <path d={c.tape} className="fill-(--paper-edge-deep)" fillOpacity={0.45} />
      </g>
    </svg>
  );
}

function Landscape({ phase }: { phase: EnterPhase }) {
  const strokes = (list: readonly Stroke[]) =>
    list.map((l) => <motion.path key={l.d} d={l.d} strokeWidth={l.w} strokeOpacity={l.o ?? 1} {...drawProps(phase, l)} />);
  return (
    <>
      <svg viewBox="0 0 400 500" aria-hidden="true" focusable="false" className={cn("size-full", PAGE_SVG)} style={PAGE_GRAPHITE} data-motif="journal-landscape">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-(--world-line)">
          {strokes(LANDSCAPE)}
          <g transform={HORSE_AT}>{strokes(HORSE)}</g>
          <g transform={BONE_AT} data-motif="fossil-bone">
            {strokes(BONE)}
          </g>
        </g>
      </svg>
      {/* rd-bone's pencilled note lands here (page art; rd-desktop.tsx) */}
      <div data-bone-note="" className="absolute inset-0" />
    </>
  );
}

/** One entry's vignette at page scale, drawn the first time it shows. */
function PageVignette({ index, still }: { index: number; still: boolean }) {
  const [fresh] = useState(() => !still && !drawnOnce.has(index));
  useEffect(() => {
    drawnOnce.add(index);
  }, [index]);
  const v = VIGNETTES[index % VIGNETTES.length] ?? VIGNETTES[0]!;
  const draw = (delay: number) =>
    fresh
      ? {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: dur.draw.short, ease: easeDraw, delay },
        }
      : { initial: false as const, animate: { pathLength: 1 } };
  return (
    <svg viewBox="0 0 400 500" aria-hidden="true" focusable="false" className={cn("size-full", PAGE_SVG)} style={PAGE_GRAPHITE} data-motif="journal-vignette">
      {/* the entry's head in the journal hand (≤ 4 words on the page) */}
      <text x={50} y={96} fontSize={24} className="font-world-hand fill-(--world-line)">
        {`Entry ${ROMAN[index] ?? index + 1}`}
      </text>
      <g>
        <g transform={VIGNETTE_AT}>
          {v.fill ? (
            <motion.path
              d={v.fill}
              className="fill-(--world-line)"
              fillOpacity={0.85}
              initial={fresh ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: dur.base, ease, delay: fresh ? 0.45 : 0 }}
            />
          ) : null}
          {v.strokes.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              className="stroke-(--world-line)"
              strokeWidth={0.42}
              strokeLinecap="round"
              strokeLinejoin="round"
              {...draw(i * 0.22)}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}

function RightPage({
  active,
  leafing,
  reduced,
  children,
}: {
  active: number | null;
  leafing: boolean;
  reduced: boolean;
  /** Over the page, OUTSIDE its aria-hidden art (the bone's hotspot). */
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.4 });
  const leaf = active == null ? <Landscape phase={phase} /> : <PageVignette index={active} still={reduced} />;
  return (
    <div ref={ref} className={s.page} data-page-active={active ?? "landscape"}>
      <div aria-hidden="true" className="absolute inset-0">
        <Furniture />
        {leafing ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active ?? "landscape"}
              className={s.pageLayer}
              initial={{ scaleX: 0.04, skewY: -2.5, opacity: 0.5 }}
              animate={{ scaleX: 1, skewY: 0, opacity: 1 }}
              exit={{ scaleX: 0.04, skewY: 2.5, opacity: 0.5 }}
              transition={{ duration: 0.3, ease }}
            >
              {leaf}
            </motion.div>
          </AnimatePresence>
        ) : (
          <>
            <motion.div
              className={s.pageLayer}
              initial={false}
              animate={{ opacity: active == null ? 1 : 0 }}
              transition={{ duration: dur.preview, ease }}
            >
              <Landscape phase={phase} />
            </motion.div>
            <AnimatePresence initial={false}>
              {active != null ? (
                <motion.div
                  key={active}
                  className={s.pageLayer}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: dur.preview, ease }}
                >
                  <PageVignette index={active} still={reduced} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>
      {children}
    </div>
  );
}

export function JournalSpread({
  entries,
  choice,
  caption,
  head,
  fly,
  bone,
}: {
  entries: readonly JournalEntry[];
  choice: VariantChoice;
  /** cap.writing (place "head"), server-rendered: on the left page above ENTRY I. */
  caption?: ReactNode;
  /** The section head (Meta + h2 + lead), set at the top of the LEFT page so
   *  the right page — the frontier sketch — opens beside it, in the
   *  section's first view (M2 fix round 3, blind D36: the sketch sat a
   *  screen lower, the first view was blank paper). */
  head?: ReactNode;
  /** B45: the server's <FlyThrough kind="horse">, along the page's bottom edge. */
  fly?: ReactNode;
  /** rd-bone: the server's EggHotspot, placed over the bone. */
  bone?: ReactNode;
}) {
  const v = useVariant(choice, RD_PIECES.journal);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP);
  const listRef = useRef<HTMLOListElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [reading, setReading] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [atBone, setAtBone] = useState(false);
  const leafing = v === "alt";

  // The entry crossing the reading line (45 % down the viewport) turns the
  // page (ALT) or swaps the vignette (DEFAULT, B45 quiet); above the first
  // entry the landscape is the open page.
  useEffect(() => {
    if (reduced || !desktop) return;
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-entry]"));
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          const i = Number((r.target as HTMLElement).dataset.entry);
          if (r.isIntersecting) {
            setReading(i);
            setEntered(true);
          } else if (i === 0 && r.boundingClientRect.top > (r.rootBounds?.top ?? 0)) setReading(null);
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    rows.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced, desktop]);

  const active = reduced || !desktop || atBone ? null : leafing ? reading : (hovered ?? reading);

  return (
    <div
      className={cn("lg:grid lg:grid-cols-2 lg:gap-x-[calc(var(--spacing-gutter)*2)]", !head && "mt-tier-block")}
      data-piece={RD_PIECES.journal}
      data-variant={v}
    >
      <div className="min-w-0">
        {head ? <div className="mb-tier-block">{head}</div> : null}
        {caption ? <div className={s.journalCaption}>{caption}</div> : null}
        <ol
          ref={listRef}
          aria-label="Journal entries"
          className="mt-tier-group border-t border-rule"
          onPointerLeave={leafing ? undefined : () => setHovered(null)}
        >
          {entries.map((post, i) => (
            <Rise as="li" key={post.title} delay={Math.min(i, 3) * 0.06} className="border-b border-rule">
              <div
                data-entry={i}
                className="grid grid-cols-[1fr_auto] items-start gap-x-6 py-tier-block lg:block"
                onPointerEnter={leafing ? undefined : () => setHovered(i)}
              >
                <div className="min-w-0">
                  <MetaLine fields={[`Entry ${ROMAN[i] ?? i + 1}`, post.tag, "Draft"]} />
                  <h3 className="mt-tier-pair type-title text-fg">{post.title}</h3>
                  <p className="mt-tier-group max-w-body type-body text-fg-muted">{post.angle}</p>
                </div>
                {/* one page (< 1024): the entry's sketch inline (hidden on
                    the desktop spread, so not rendered once it is up) */}
                <div className="pt-1 lg:hidden">
                  {desktop ? null : <JournalVignette index={i} className="size-16" />}
                </div>
              </div>
            </Rise>
          ))}
        </ol>
      </div>

      {/* the right page (≥ 1024): decorative (its art is aria-hidden; each
          entry's meaning is its title); the bone's hotspot is the one real
          control on it */}
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+2rem)] pt-tier-group">
          <RightPage active={active} leafing={leafing} reduced={reduced}>
            {bone ? (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${BONE_SPOT[0] * 100}%`, top: `${BONE_SPOT[1] * 100}%` }}
                onPointerEnter={() => setAtBone(true)}
                onPointerLeave={() => setAtBone(false)}
                onFocus={() => setAtBone(true)}
                onBlur={() => setAtBone(false)}
              >
                {bone}
              </div>
            ) : null}
          </RightPage>
          {/* B45: the horse runs along the page's bottom edge (once the
              reader is into the entries) */}
          {fly && entered ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24">{fly}</div> : null}
        </div>
      </div>
    </div>
  );
}
