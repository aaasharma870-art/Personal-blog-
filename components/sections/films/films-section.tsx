import { MediaFrame } from "@/components/primitives/media-frame";
import { FilmTitle, SceneCaption } from "@/components/primitives/scene-caption";
import { FilmQuote } from "@/components/site/film-quote";
import { Meta, SectionHead, WorldSection } from "@/components/site/world-kit";
import type { CaptionKey, CaptionWorld } from "@/lib/film";
import { film } from "@/lib/film";
import {
  acts,
  copyText,
  copyVisible,
  numeralOf,
  seenHereIn,
  worksInUse,
  worksWords,
} from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   FILMS — Intermission: "Three films and a game" (SPEC v2 §3 row 9, SM-9;
   house world, deep; one world per screen). M2 integrator STUB — a correct,
   accessible skeleton the act4-hp-films builder turns into SM-9 +
   RECOGNIZABILITY S12:
     - four <article> screens in act order (worksInUse), each: Meta
       `ACT n • VERB • YEARS`, a 2.39:1 MediaFrame of the world's
       `media.filmsStill` (hp: iconic-express; the ALT screen is
       `filmsAltStill` ?? resolveVariant(filmsStill, "alt")), the FILM TITLE
       as the h3 in the fan face (<FilmTitle as="h3">), the caption UNDER the
       frame (F-3I / F-RD skies are too bright for bl/br), the work's line
       (FilmQuote caption), the borrowed line, "Seen here in" links and the
       reason (a DRAFT line, visible via branchPreview; never a link).
     - still to build: the letterbox clip-open entry, the per-world finale
       motifs (compass / 7 gates / trail-to-fire / ink-light), each
       article's ground in its world deep with 24vh gradient seams (T6), and
       the last warm point that card II→III's low sun takes over (T7).
   ========================================================================== */

const CAPTION: Record<CaptionWorld, CaptionKey> = {
  pirates: "cap.films.pirates",
  idiots: "cap.films.idiots",
  rdr2: "cap.films.rdr2",
  hp: "cap.films.hp",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function FilmScreen({ world, years }: { world: CaptionWorld; years: string }) {
  const spec = film.worlds[world];
  const titleId = `films-${world}-title`;
  const act = acts.find((a) => a.world === world);
  const numeral = act ? numeralOf(act.id) : undefined;
  const links = seenHereIn(world).slice(0, 3);
  const still = spec.media.filmsStill;
  return (
    <article aria-labelledby={titleId} data-films-world={world} className="border-t border-rule pt-tier-block">
      <Meta fields={[numeral ? `Act ${numeral}` : null, spec.verb, years]} />
      {still ? (
        <div className="mt-tier-group">
          <MediaFrame media={still} ratio={2.39} radius="frame" playOn="never" sizes="(min-width: 90rem) 1360px, 100vw" />
          <SceneCaption k={CAPTION[world]} place="under" />
        </div>
      ) : null}
      <FilmTitle world={world} as="h3" id={titleId} className="mt-tier-group type-title text-fg" />
      {spec.line ? <FilmQuote id={spec.line} rendition="caption" className="mt-tier-pair" /> : null}
      {spec.borrowed && copyVisible(spec.borrowed) ? (
        <p className="mt-tier-group max-w-body type-body text-fg">{spec.borrowed.text}</p>
      ) : null}
      {links.length ? (
        <p className="mt-tier-pair type-meta text-fg-muted">
          <span>Seen here in</span>
          {links.map((s) => (
            <span key={s.id}>
              <span aria-hidden="true" className="text-fg-ghost">
                {" • "}
              </span>
              <a href={`#${s.id}`} className="inline-flex min-h-11 items-center transition-colors hover:text-fg">
                {s.nav?.label ?? s.id}
              </a>
            </span>
          ))}
        </p>
      ) : null}
      {spec.reason && copyVisible(spec.reason) ? (
        <p className="mt-tier-group max-w-body type-body text-fg-muted">{spec.reason.text}</p>
      ) : null}
    </article>
  );
}

export function FilmsSection({ entry }: SectionProps<"films">) {
  const titleId = `${entry.id}-title`;
  const h2 = copyText("films.h2");
  const lead = copyText("films.lead");
  const screens = worksInUse.filter((w): w is typeof w & { world: CaptionWorld } => w.world !== "house");
  if (!film.enabled || screens.length === 0) return null;
  return (
    <WorldSection entry={entry} labelledBy={titleId} className="scroll-mt-24">
      <SectionHead
        id={titleId}
        label="Intermission"
        title={copyVisible(h2) ? h2.text : capitalize(worksWords)}
        intro={copyVisible(lead) ? lead.text : undefined}
      />
      <div className="mt-tier-block space-y-tier-block">
        {screens.map((w) => (
          <FilmScreen key={w.world} world={w.world} years={w.years} />
        ))}
      </div>
    </WorldSection>
  );
}
