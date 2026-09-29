import { quotes, type QuoteId } from "@/lib/quotes";
import { copyVisible, quoteLetteringWorld } from "@/lib/sections";
import { cn } from "@/lib/utils";
import { worldFaceClass } from "@/components/primitives/world-face";

/**
 * FilmQuote — the ONLY way a line from one of the works reaches the page
 * (SPEC v2 §9.6, DESIGN v3 §2.3). A server component: the text comes from
 * the registry at render time, so no component source ever contains a quoted
 * line (the validator's #7 lint), and the copy gate is evaluated once, on the
 * server (no client/server disagreement, no hydration mismatch).
 *
 * rendition
 *   caption  — a Meta block: TEXT • SPEAKER • WORK (YEAR). Data-adjacent or
 *              crowded viewports; never beside a metric.
 *   epigraph — Newsreader italic at the lead size (the viewport's one italic).
 *   line     — inherits the host block's style (credits, loader status).
 *   lettered — (M2, RECOGNIZABILITY O-1) the line in its world's fan face
 *              (the lettering entry with `quote: id` names the face; none →
 *              the host's type), attribution in Meta beside it. INLINE
 *              (a <span>): the host supplies the block (<p>, a caption, the
 *              board's top margin). Used for Q-PC-1 (journey step 4),
 *              Q-3I-2 (the board header, Kalam chalk), Q-3I-3 (under the
 *              Optuna FIG) and Q-HP-2 (the credits' last line).
 * attribution
 *   inline   — the speaker and work in Meta in the same block.
 *   speaker  — the speaker only (Meta); for a caption whose film span
 *              already names the work in the fan face.
 *   credits  — none here; the credits' LINES QUOTED row carries it (allowed
 *              only for the intro oath, card epigraphs and the credits' last
 *              line).
 *
 * Status: every registry line is `proposed` until Aryan signs (and COMMUNITY
 * lines are checked in the work): dev + preview render it; a production build
 * without sign-off renders nothing (and the validator fails the build first).
 */
export type QuoteRendition = "caption" | "epigraph" | "line" | "lettered";

/** "Pirates of the Caribbean: The Curse of the Black Pearl" → the franchise
 *  title before the colon; the year disambiguates the film. */
function shortWork(work: string): string {
  const i = work.indexOf(":");
  return i > 0 ? work.slice(0, i) : work;
}

export function quoteAttribution(id: QuoteId): string {
  const q = quotes[id];
  const speaker = "speaker" in q ? q.speaker : undefined;
  const work = `${shortWork(q.work)} (${q.year})`;
  return speaker ? `${speaker} • ${work}` : work;
}

export function FilmQuote({
  id,
  rendition,
  attribution = "inline",
  excerpt = false,
  className,
}: {
  id: QuoteId;
  rendition: QuoteRendition;
  attribution?: "inline" | "speaker" | "credits";
  /** Render the registry's marked excerpt (`excerptText`) when it has one. */
  excerpt?: boolean;
  className?: string;
}) {
  const q = quotes[id];
  if (!copyVisible({ text: q.text, status: q.status })) return null;
  const text = excerpt && "excerptText" in q && q.excerptText ? q.excerptText : q.text;
  const speaker = "speaker" in q ? q.speaker : undefined;

  if (rendition === "lettered") {
    const world = quoteLetteringWorld(id);
    const by =
      attribution === "inline" ? quoteAttribution(id) : attribution === "speaker" ? (speaker ?? quoteAttribution(id)) : null;
    return (
      <span className={cn("film-quote-lettered", className)} data-quote={id}>
        <q className={cn("[quotes:none]", world && worldFaceClass(world))}>{`“${text}”`}</q>
        {by ? (
          <span className="film-quote-lettered__by type-meta text-fg-muted">
            <span aria-hidden="true">{" — "}</span>
            <span className="sr-only">, </span>
            {by}
          </span>
        ) : null}
      </span>
    );
  }

  if (rendition === "caption") {
    return (
      <p className={cn("type-meta text-fg-muted", className)} data-quote={id}>
        <span>{text}</span>
        {attribution === "inline" ? (
          <>
            {speaker ? (
              <>
                <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
                <span className="sr-only">, </span>
                <span>{speaker}</span>
              </>
            ) : null}
            <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
            <span className="sr-only">, </span>
            <span>
              {shortWork(q.work)} ({q.year})
            </span>
          </>
        ) : null}
      </p>
    );
  }

  if (rendition === "epigraph") {
    return (
      <figure className={cn("max-w-lead", className)} data-quote={id}>
        <blockquote className="font-serif text-lead leading-[1.45] tracking-[-0.01em] italic text-fg">
          {`“${text}”`}
        </blockquote>
        {attribution === "inline" ? (
          <figcaption className="mt-tier-pair type-meta text-fg-muted">
            {quoteAttribution(id)}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  // line: the host's style
  return (
    <q className={cn("[quotes:none]", className)} data-quote={id}>
      {`“${text}”`}
      {attribution === "inline" ? (
        <span className="type-meta text-fg-muted"> — {quoteAttribution(id)}</span>
      ) : null}
    </q>
  );
}
