import type { ReactNode } from "react";
import { Mail } from "lucide-react";
import { footerLine, site } from "@/lib/content";
import { film } from "@/lib/film";
import { isUsable, mediaAssets, type MediaProvenance, type MediaStatus } from "@/lib/media";
import { quotes, type QuoteId } from "@/lib/quotes";
import { bookendWorld, copyVisible, credits, sectionById, topHref, worksInUse } from "@/lib/sections";
import { planeAttrs } from "@/lib/worlds";
import { GithubMark } from "@/components/ui/icons";
import { FilmQuote } from "@/components/site/film-quote";
import { HallowsMark, TimeTurnerLink } from "@/components/site/hp-ink";

/* ============================================================================
   CREDITS — the closing roll (SPEC v2 SM-13; ICONS §10), rendered as the page
   <footer id="credits"> while the manifest's `credits` entry is a stub (M1).
   Native scroll IS the roll: no pin, no auto-scroll. Centred rows: the role
   in Meta at left, the name in body at right. Every row is DERIVED and
   factual — works from the enabled acts, lines from the quote registry
   entries that actually render, imagery models from lib/media.ts
   provenance, faces from the shipped lettering — so disabling a world or a
   quote re-derives the roll. The H3 fan-tribute line renders VERBATIM
   whenever the film layer is on. House world (deep), carrying the
   prologue's HP bookend (Time-Turner, the Hallows end mark and the last
   line, Q-HP-2) only while the prologue is enabled.
   "GRADED" wording is never used (it could read as school grades).
   ========================================================================== */

/** Quote hosts that have no renderer yet in M1 (their lines must not be
 *  credited until they actually render): the eggs and the console line. */
const UNBUILT_HOST = (host: string) => host.startsWith("egg:") || host === "console";

function linesQuoted(): { work: string; ids: QuoteId[] }[] {
  const ids = new Set<QuoteId>(credits.quotes.filter((id) => !UNBUILT_HOST(quotes[id].host)));
  // M1: the chapters render INSIDE `work` (their entries are stubs), so the
  // Optuna figure's caption line renders there.
  if (film.enabled && sectionById("work") && !sectionById("optuna-screener")) ids.add("Q-3I-3");
  const visible = [...ids].filter((id) => copyVisible({ text: quotes[id].text, status: quotes[id].status }));
  // act order: the index of the work's world in worksInUse
  const rank = (id: QuoteId) => {
    const i = worksInUse.findIndex((w) => quotes[id].work.startsWith(w.title));
    return i < 0 ? worksInUse.length : i;
  };
  const groups = new Map<string, QuoteId[]>();
  for (const id of visible.sort((a, b) => rank(a) - rank(b))) {
    const key = `${quotes[id].work} (${quotes[id].year})`;
    groups.set(key, [...(groups.get(key) ?? []), id]);
  }
  return [...groups].map(([work, list]) => ({ work, ids: list }));
}

const MODEL_NAMES: Record<string, string> = {
  gpt_image_2_5: "GPT Image 2.5",
  kling3_0: "Kling 3.0",
  seedance_2_0: "Seedance 2.0",
  seedance_2_5: "Seedance 2.5",
  nano_banana_2: "Nano Banana 2",
};

/** Generation models of the accepted Higgsfield assets (provenance). */
function imageryModels(): string[] {
  const out = new Set<string>();
  for (const a of Object.values(mediaAssets) as { status: MediaStatus; provenance: MediaProvenance }[]) {
    if (a.provenance.source !== "higgsfield" || !isUsable(a.status) || !a.provenance.model) continue;
    const id = a.provenance.model.split(" ")[0] ?? "";
    if (!/^[a-z][a-z0-9_]*$/.test(id) || id === "frame") continue;
    out.add(MODEL_NAMES[id] ?? id);
  }
  return [...out];
}

/** Display faces actually shipped (self-hosted OFL subsets, mode A). */
function shippedFaces(): string[] {
  return [...new Set(film.lettering.filter((l) => l.shipped && l.mode === "A").map((l) => l.face))];
}

function Row({ role, children }: { role: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-t border-rule py-tier-group sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-8">
      <dt className="type-meta text-fg-muted sm:pt-0.5 sm:text-right">{role}</dt>
      <dd className="type-body text-fg">{children}</dd>
    </div>
  );
}

const Dot = () => (
  <span aria-hidden="true" className="text-fg-ghost">
    {" · "}
  </span>
);

export function Footer() {
  const year = new Date().getFullYear(); // the build year (static page)
  const on = credits.enabled;
  const lines = on ? linesQuoted() : [];
  const models = on ? imageryModels() : [];
  const faces = on ? shippedFaces() : [];
  const hp = bookendWorld === "hp";

  return (
    <footer
      id="credits"
      aria-labelledby="credits-title"
      {...planeAttrs("deep", "house")}
      className="relative bg-bg py-section text-fg"
    >
      <div className="mx-auto w-full max-w-page px-gutter">
        <h2 id="credits-title" className="text-center type-meta text-fg-muted">
          Credits
        </h2>

        <dl className="mx-auto mt-tier-block max-w-[56rem] border-b border-rule">
          <Row role="A personal research journal by">{site.name}</Row>
          <Row role="Research, systems & writing">{site.name}</Row>
          {on && credits.worlds.length ? (
            <Row role="Worlds borrowed from">
              {credits.worlds.map((w, i) => (
                <span key={w}>
                  {i > 0 ? <Dot /> : null}
                  {w}
                </span>
              ))}
            </Row>
          ) : null}
          {lines.length ? (
            <Row role="Lines quoted">
              <span className="block space-y-tier-pair">
                {lines.map((g) => (
                  <span key={g.work} className="block">
                    <span className="text-fg-muted">{g.work}: </span>
                    {g.ids.map((id, i) => (
                      <span key={id}>
                        {i > 0 ? <Dot /> : null}
                        <FilmQuote id={id} rendition="line" attribution="credits" />
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            </Row>
          ) : null}
          {models.length ? (
            <Row role="Original generated imagery">
              Higgsfield ({models.join(", ")})<Dot />our own prompts; the only image inputs were frames made for this
              page<Dot />no film stills or game screenshots
            </Row>
          ) : null}
          {on && copyVisible(credits.ai) ? <Row role="Built with AI assistance">{credits.ai.text}</Row> : null}
          <Row role="Type">
            Geist<Dot />Geist Mono<Dot />Newsreader
            {faces.length ? (
              <>
                <Dot />
                {faces.join(", ")} (SIL Open Font License 1.1)
              </>
            ) : null}
          </Row>
        </dl>

        {on ? (
          <p className="mx-auto mt-tier-block max-w-[56rem] text-center type-small text-fg-muted">
            {credits.legal}
            {copyVisible(credits.legalMore) ? ` ${credits.legalMore.text}` : null}
          </p>
        ) : null}

        <div className="mt-tier-block flex flex-col items-center gap-tier-pair text-center">
          <p className="max-w-lead type-small text-fg-muted">{footerLine}</p>
          {on && copyVisible(credits.end) ? <p className="type-body text-fg">{credits.end.text}</p> : null}
          {hp ? (
            <TimeTurnerLink href={topHref} className="type-small text-fg-muted transition-colors hover:text-fg">
              ↑ Back to the opening
            </TimeTurnerLink>
          ) : (
            <a href={topHref} className="inline-flex min-h-11 items-center type-small text-fg-muted transition-colors hover:text-fg">
              ↑ Back to the opening
            </a>
          )}
          <div className="flex items-center gap-2">
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub profile"
              className="inline-flex size-11 items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg"
            >
              <GithubMark className="size-4" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label={`Email ${site.name}`}
              className="inline-flex size-11 items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg"
            >
              <Mail className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>
          <p className="type-small text-fg-muted">
            © {year} {site.name}
          </p>
        </div>

        {on && credits.lastLine ? (
          <p className="mt-tier-block text-center type-body text-fg">
            <FilmQuote id={credits.lastLine} rendition="line" attribution="credits" />
            {hp ? <HallowsMark className="ml-3 align-[-1px]" /> : null}
          </p>
        ) : null}
      </div>
    </footer>
  );
}
