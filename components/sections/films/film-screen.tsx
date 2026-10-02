import type { CSSProperties } from "react";
import { gauntlet } from "@/lib/content";
import { film, type CaptionWorld } from "@/lib/film";
import { actCards, acts, copyVisible, numeralOf, seenHereIn } from "@/lib/sections";
import type { VariantChoice } from "@/lib/variants";
import { planeAttrs, type WorldId } from "@/lib/worlds";
import { FilmTitle } from "@/components/primitives/scene-caption";
import { FilmQuote } from "@/components/site/film-quote";
import { Meta, Sep } from "@/components/site/world-kit";
import { FILM_BEATS } from "@/components/sections/films/film-beats";
import { FilmFrame } from "@/components/sections/films/film-frame";

/* ============================================================================
   FILM SCREEN — one <article> of the Intermission (SPEC SM-9; bar
   films-chapter §3; RECOGNIZABILITY S12, T6). Server-rendered text; the
   picture is <FilmFrame> (client: entry, finale, variant still).

   Order on the screen:
     Meta  ACT I • NAVIGATION • 2003–2017
     h3    the FILM TITLE, big, in the world's fan face (RECOGNIZABILITY O-1
           overrides the bar's "house type" for film titles: <FilmTitle>)
     the letterboxed still + its finale; the caption UNDER it
     left:  the line — one verbatim quote, LETTERED in the world's fan face
            (lib/film.ts lettering q-pc-2 / q-3i-1 / q-rd-1 / q-hp-4), its
            speaker and work in Meta on the line below (never Aryan's
            words, never beside a metric)
     right: what this page BORROWED (a site fact) · Aryan's REASON (his
            one-liner from lib/film.ts: a Claude draft he will rewrite,
            visible on this branch via branchPreview, no badge) · "Seen here
            in" (the act card + ≤ 3 sections of that world: real anchors)
   The line and the reason never share a block (bar F23).

   GROUND (T6): the article sits on ITS world's deep (data-tone deep ×
   data-world), painted full-bleed; its top 24vh blends from the previous
   screen's deep (the first from the intermission's house deep), and the
   last screen's bottom 24vh returns to house deep — a smooth PC → 3I → RD
   → HP run, and a clean hand-off into the tintype card.
   ========================================================================== */

const DEEP: Record<WorldId, string> = {
  house: "var(--house-deep)",
  pirates: "var(--pir-deep)",
  idiots: "var(--idi-deep)",
  rdr2: "var(--rd-deep)",
  hp: "var(--hp-deep)",
};

function groundOf(prev: WorldId, last: boolean): CSSProperties {
  const layers = [`linear-gradient(to bottom, ${DEEP[prev]} 0, transparent 24vh)`];
  if (last) layers.push(`linear-gradient(to top, ${DEEP.house} 0, transparent 24vh)`);
  return { backgroundImage: layers.join(", ") };
}

export function FilmScreen({
  world,
  years,
  prev,
  first,
  last,
  choice,
  bearing,
}: {
  world: CaptionWorld;
  years: string;
  prev: WorldId;
  /** The first screen: the house lights go down on it (B30). */
  first: boolean;
  last: boolean;
  choice: VariantChoice;
  bearing: number;
}) {
  const spec = film.worlds[world];
  const titleId = `films-${world}-title`;
  const act = acts.find((a) => a.world === world);
  const numeral = act ? numeralOf(act.id) : undefined;
  const card = act ? actCards.find((c) => c.act === act.id) : undefined;
  const links = seenHereIn(world).slice(0, 3);
  const reason = spec.reason && copyVisible(spec.reason) ? spec.reason : null;
  const borrowed = spec.borrowed && copyVisible(spec.borrowed) ? spec.borrowed : null;

  return (
    <article
      aria-labelledby={titleId}
      data-films-world={world}
      {...planeAttrs("deep", world)}
      className="relative py-[clamp(4rem,11vh,7.5rem)] text-fg"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-bg"
        style={groundOf(prev, last)}
      />

      <Meta fields={[numeral ? `Act ${numeral}` : null, spec.verb, years]} />
      {/* the film title arrives in character (spec §8.2; B31–B34, a time
          star through the spotlight on desktop; static elsewhere) */}
      <FilmTitle
        world={world}
        as="h3"
        id={titleId}
        className="mt-tier-pair type-title text-fg"
        inCharacter
        beat={FILM_BEATS[world].title}
      />

      <FilmFrame
        world={world}
        choice={choice}
        bearing={bearing}
        gates={gauntlet.length}
        lights={first}
        carry={last}
        className="mt-tier-group"
      />

      {world === "idiots" ? (
        // the 3 Idiots finale's text equivalent: the gates it draws, in order
        <ol className="sr-only">
          {gauntlet.map((g) => (
            <li key={g.n}>{g.title}</li>
          ))}
        </ol>
      ) : null}

      <div className="mt-tier-block grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-5">
          {spec.line ? (
            // the film's most famous line, LETTERED in its world face (ART-DIRECTOR #11:
            // it was 10 px mono); the speaker and work stay beside it in Meta
            <p className="films-line max-w-[34rem] text-[clamp(1.75rem,1.15rem+1.7vw,2.75rem)] leading-[1.12] tracking-[0.01em] text-fg" data-films-line={world}>
              <FilmQuote id={spec.line} rendition="lettered" />
            </p>
          ) : null}
        </div>
        <div className="lg:col-span-7">
          {borrowed ? <p className="max-w-body type-body text-fg">{borrowed.text}</p> : null}
          {reason ? (
            <p className="mt-tier-group max-w-body type-body text-fg-muted" data-copy-status={reason.status}>
              {reason.text}
            </p>
          ) : null}
          {links.length || card ? (
            <p className="mt-tier-group flex flex-wrap items-center type-meta text-fg-muted">
              <span>Seen here in</span>
              {card ? (
                <span className="inline-flex items-center">
                  <Sep />
                  <a
                    href={`#${card.id}`}
                    className="inline-flex min-h-11 items-center px-0.5 transition-colors hover:text-fg"
                  >
                    {`Act ${card.numeral}`}
                  </a>
                </span>
              ) : null}
              {links.map((s) => (
                <span key={s.id} className="inline-flex items-center">
                  <Sep />
                  <a href={`#${s.id}`} className="inline-flex min-h-11 items-center px-0.5 transition-colors hover:text-fg">
                    {s.nav?.label ?? s.id}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
