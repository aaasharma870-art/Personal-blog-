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
  FURNITURE,
  HORSE,
  HORSE_AT,
  LANDSCAPE,
  VIGNETTES,
  VIGNETTE_AT,
  type Stroke,
} from "@/components/worlds/rdr2/journal-sketches";
import { GraphiteFilter, RD_PIECES, useFid } from "@/components/worlds/rdr2/kit";
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

/** The page's furniture: static pencil marks (never animated). */
function Furniture({ fid }: { fid: string }) {
  const c = FURNITURE.clipping;
  return (
    <svg viewBox="0 0 400 500" aria-hidden="true" focusable="false" className="absolute inset-0 size-full overflow-visible will-change-transform">
      <defs>
        <GraphiteFilter id={`jf-${fid}`} />
      </defs>
      <g filter={`url(#jf-${fid})`} fill="none" strokeLinecap="round" className="stroke-(--world-line)">
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

function Landscape({ phase, fid }: { phase: EnterPhase; fid: string }) {
  return (
    <svg viewBox="0 0 400 500" aria-hidden="true" focusable="false" className="size-full overflow-visible will-change-transform" data-motif="journal-landscape">
      <defs>
        <GraphiteFilter id={`jl-${fid}`} />
      </defs>
      <g filter={`url(#jl-${fid})`} fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-(--world-line)">
        {LANDSCAPE.map((l) => (
          <motion.path key={l.d} d={l.d} strokeWidth={l.w} strokeOpacity={l.o ?? 1} {...drawProps(phase, l)} />
        ))}
        <g transform={HORSE_AT}>
          {HORSE.map((l) => (
            <motion.path key={l.d} d={l.d} strokeWidth={l.w} strokeOpacity={l.o ?? 1} {...drawProps(phase, l)} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/** One entry's vignette at page scale, drawn the first time it shows. */
function PageVignette({ index, still }: { index: number; still: boolean }) {
  const fid = useFid();
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
    <svg viewBox="0 0 400 500" aria-hidden="true" focusable="false" className="size-full overflow-visible will-change-transform" data-motif="journal-vignette">
      <defs>
        <GraphiteFilter id={`jv-${fid}`} />
      </defs>
      <g filter={`url(#jv-${fid})`}>
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

function RightPage({ active, leafing, reduced }: { active: number | null; leafing: boolean; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useEnterOnce(ref, { amount: 0.4 });
  const fid = useFid();
  const leaf = active == null ? <Landscape phase={phase} fid={fid} /> : <PageVignette index={active} still={reduced} />;
  return (
    <div ref={ref} className={s.page} data-page-active={active ?? "landscape"}>
      <Furniture fid={fid} />
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
            <Landscape phase={phase} fid={fid} />
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
  );
}

export function JournalSpread({
  entries,
  choice,
  caption,
  head,
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
}) {
  const v = useVariant(choice, RD_PIECES.journal);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP);
  const listRef = useRef<HTMLOListElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [reading, setReading] = useState<number | null>(null);
  const leafing = v === "alt";

  // ALT: the entry crossing the reading line (45 % down the viewport) turns
  // the page; above the first entry the landscape is the open leaf.
  useEffect(() => {
    if (!leafing || reduced || !desktop) return;
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-entry]"));
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) {
          const i = Number((r.target as HTMLElement).dataset.entry);
          if (r.isIntersecting) setReading(i);
          else if (i === 0 && r.boundingClientRect.top > (r.rootBounds?.top ?? 0)) setReading(null);
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    rows.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [leafing, reduced, desktop]);

  const active = reduced || !desktop ? null : leafing ? reading : hovered;

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
                {/* one page (< 1024): the entry's sketch inline */}
                <div className="pt-1 lg:hidden">
                  <JournalVignette index={i} className="size-16" />
                </div>
              </div>
            </Rise>
          ))}
        </ol>
      </div>

      {/* the right page (≥ 1024): decorative; each entry's meaning is its title */}
      <div className="hidden lg:block" aria-hidden="true">
        <div className="sticky top-[calc(var(--header-h)+2rem)] pt-tier-group">
          <RightPage active={active} leafing={leafing} reduced={reduced} />
        </div>
      </div>
    </div>
  );
}
