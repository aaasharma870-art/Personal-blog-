import { film } from "@/lib/film";
import { loader as loaderTiming } from "@/lib/motion";
import { actCards, copyVisible, letteringFor, sectionById, tipFor, worldOf } from "@/lib/sections";
import { planeAttrs, worlds, type WorldId } from "@/lib/worlds";
import { cn } from "@/lib/utils";
import { FilmQuote } from "@/components/site/film-quote";
import { Loader } from "@/components/primitives/loader";
import { FilmTitle } from "@/components/primitives/scene-caption";
import { RouteCaption } from "@/components/primitives/loaders/route-caption";
import { RouteStatus } from "@/components/primitives/loaders/route-status";

/**
 * RouteLoader — the REAL route-load use of the world loaders (SPEC v2 §8.1;
 * loaders.BAR §4, L14–L15, L19–L20), for a route's `loading.tsx`, e.g.
 *   app/writing/[slug]/loading.tsx →
 *     <RouteLoader owner="writing" status="Loading essay…" tipKey="/writing" />
 * A SERVER component: everything is derived from the OWNER section, so
 * moving that section re-derives the loader (fixture J: `writing` → act-4
 * gives LD-HP; → act-2 the idiots gauge):
 *   world    worldOf(owner) → its loader kind (worlds[world].loader)
 *   title    M2 (RECOGNIZABILITY S20): the FILM title in the world's fan face
 *            (28–32 px, <FilmTitle>) over the owner's act title in the
 *            world's lettering (a loader route card is a display-face slot,
 *            SPEC §9.7)
 *   art      the world loader at `stage` size (288 px, 416 px ≥ 1280; S20 "≥ 200 px"), with
 *            its MOMENT • FILM caption under it (RouteCaption: the variant
 *            the loader actually draws; HTML, never inside the SVG)
 *   status   visible Meta text in role="status" (RouteStatus), after the
 *            400 ms show delay; the motif is indeterminate and idle-stops
 *   TIP      plate-trail (LD-RD) only: ONE of Aryan's own rules, chosen
 *            deterministically by `tipKey` (hash % n, identical on server and
 *            client), rendered as plain text OUTSIDE the status (§8.3, L19)
 *   stall    gauge (LD-3I) only: after the idle stop the status updates once
 *            to the world's registered line (Q-3I-1, through FilmQuote), then
 *            "Still loading." — real loads only; an error unmounts it (L20)
 * Letterboxed on the world's deep ≥ 640 (the ground is the bars), stacked
 * below. No percentage, ever.
 */
export function RouteLoader({
  owner,
  status,
  tipKey,
  className,
}: {
  /** Section id whose world owns this route (e.g. "writing"). */
  owner: string;
  /** Visible status text, e.g. "Loading essay…". */
  status: string;
  /** Deterministic TIP key (the route's pathname). */
  tipKey: string;
  className?: string;
}) {
  const entry = sectionById(owner);
  const world: WorldId = entry ? worldOf(entry) : "house";
  const kind = worlds[world].loader;
  const spec = film.worlds[world];

  const card = entry?.act ? actCards.find((c) => c.act === entry.act) : undefined;
  const title = card && copyVisible(card.titleCopy) ? card.title : null;
  const face = title && card ? letteringFor(card.lettering, title) : { lettered: false, upper: false };

  const hidden = film.tips.filter((t) => !copyVisible(t)).map((t) => t.text);
  const tip = kind === "plate-trail" && film.enabled ? tipFor(tipKey, hidden) : null;
  const stall =
    kind === "gauge" && spec.line ? (
      <>
        <FilmQuote id={spec.line} rendition="line" attribution="inline" /> Still loading.
      </>
    ) : undefined;

  return (
    <div
      {...planeAttrs("deep", world)}
      className={cn(
        "flex min-h-svh flex-col justify-center gap-tier-group bg-bg px-gutter py-section text-fg",
        // grid-cols-1 = minmax(0,1fr): without a definite column, the
        // min-height-stretched auto row fed the aspect-ratio frame's width
        // back into the implicit column (1728 px at 1440×900; overflow).
        "sm:grid sm:grid-cols-1 sm:grid-rows-[1fr_auto_1fr] sm:gap-0 sm:px-0 sm:py-0",
        className,
      )}
    >
      <div className="flex flex-col items-start justify-end gap-2 sm:px-gutter sm:pb-4">
        {film.enabled && world !== "house" ? (
          <FilmTitle world={world} className="text-[clamp(1.75rem,1.45rem+0.9vw,2rem)] leading-[1.05] tracking-[0.04em] text-fg" />
        ) : null}
        {title ? (
          <p aria-hidden="true" className="type-title max-w-title">
            <span className={cn(face.lettered && "lettered-title font-world-act", face.upper && "uppercase")}>
              {title}
            </span>
          </p>
        ) : null}
      </div>
      <div className="grid place-items-center sm:aspect-(--letterbox-ratio) sm:w-full">
        <div className="flex max-w-full flex-col items-center sm:px-gutter">
          {/* the art's box is reserved (the tallest world art, LD-PC's
              160:156), so nothing moves when it appears after the delay */}
          <div className="grid aspect-[160/156] w-72 max-w-full place-items-center xl:w-[26rem]">
            <Loader world={world} size="stage" delayMs={loaderTiming.showDelayMs} />
          </div>
          {film.enabled && world !== "house" ? <RouteCaption world={world} /> : null}
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 sm:px-gutter sm:pt-4">
        <RouteStatus status={status} stall={stall} className="type-meta text-fg-muted" />
        {tip ? (
          <p className="type-small max-w-lead text-fg-muted">
            <span className="type-meta mr-3 text-fg-muted">Tip</span>
            {tip.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
