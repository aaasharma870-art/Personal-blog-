import { quotes, type QuoteId } from "@/lib/quotes";
import { copyVisible } from "@/lib/sections";
import { cn } from "@/lib/utils";

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
 * attribution
 *   inline   — the speaker and work in Meta in the same block.
 *   credits  — none here; the credits' LINES QUOTED row carries it (allowed
 *              only for the intro oath, card epigraphs and the credits' last
 *              line).
 *
 * Status: every registry line is `proposed` until Aryan signs (and COMMUNITY
 * lines are checked in the work): dev + preview render it; a production build
 * without sign-off renders nothing (and the validator fails the build first).
 */
export type QuoteRendition = "caption" | "epigraph" | "line";

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
  attribution?: "inline" | "credits";
  /** Render the registry's marked excerpt (`excerptText`) when it has one. */
  excerpt?: boolean;
  className?: string;
}) {
  const q = quotes[id];
  if (!copyVisible({ text: q.text, status: q.status })) return null;
  const text = excerpt && "excerptText" in q && q.excerptText ? q.excerptText : q.text;
  const speaker = "speaker" in q ? q.speaker : undefined;

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
