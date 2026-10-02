import { Fragment, type ReactNode } from "react";
import { Mail } from "lucide-react";
import { footerLine, site } from "@/lib/content";
import { film } from "@/lib/film";
import { isUsable, mediaAssets, type MediaProvenance, type MediaStatus } from "@/lib/media";
import { quotes, type QuoteId } from "@/lib/quotes";
import {
  anchorId,
  bookendWorld,
  copyText,
  copyVisible,
  credits,
  enabledSections,
  topHref,
  worksInUse,
  worldOf,
} from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";
import { planeAttrs } from "@/lib/worlds";
import { GithubMark } from "@/components/ui/icons";
import { FilmQuote } from "@/components/site/film-quote";
import { HallowsMark, TimeTurnerLink } from "@/components/site/hp-ink";
import { Lettered } from "@/components/primitives/scene-caption";
import { InkFold, SeekerRow, Snitch } from "@/components/eggs/snitch";
import { HuntCredits } from "@/components/eggs/hunt-credits";
import { PostCredits } from "@/components/site/post-credits";
import { StageScrim } from "@/components/stage/scrim";
import { Collapse } from "@/components/primitives/collapse";
import { typeCredits } from "@/lib/fonts";

/* ============================================================================
   CREDITS — the closing roll (SPEC v2 SM-13; ICONS §10), rendered as the page
   <footer id="credits"> by the manifest's `credits` section (M2:
   components/sections/credits/credits-section.tsx; app/page.tsx places it
   after </main>).
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

   M2 (loaders-eggs-chrome; RECOGNIZABILITY S19, T12, O-6):
   - T12: the roll opens on the previous section's world deep (Act IV's hp
     candle-night) and fades to house deep over 30vh — no hard edge.
   - WORLDS BORROWED FROM sets each work title in its OWN fan face (O-6:
     the credits are the one place all four worlds meet), via <Lettered>
     (registered strings only; the years stay in house type).
   - The Snitch (components/eggs/snitch.tsx) RESTS, visible, beside "↑ Back
     to the opening" (catchable; it darts once per session); catching it
     adds SEEKER — you. The Time-Turner is 24 px, the Hallows end mark 16 px.
   - The last line, Q-HP-2, is LETTERED in IM Fell at the heading size, and
     a short ink fold-line draws closed beneath it (the Map folding shut).

   PHASE 3 (PHASE3-SPEC §3.2, §12.1; B1-STAGE):
   - The footer is `relative z-(--z-main)` (above the fixed stage, below the
     fixed layers and the header), like <main>.
   - `backdrop` (the credits roll over the last shot, MV-08): with a
     backdrop StageSpec the footer carries `.stage-backdrop` and its static
     StageScrim; both do nothing until the live stage marks it (stage.css).
   - TYPE: every film face B1-TYPE ships (lib/fonts.ts `typeCredits`) at
     ≥ 64rem, where they load (DESKTOP_FACES below); below 64rem the row is
     today's.
   - LIBRARIES (new row, the boot gate only: GSAP and Lenis load only on a
     desktop with a fine pointer and motion on, so the row says so only
     where it is true).
   - COLLAPSE (spec §11.5, D3-9; W3-CINEMA): the long lists — lines quoted,
     the generated-imagery provenance, the type and libraries rows — sit in
     one native <details> ("credits.more.summary"), closed at ≥ 64rem and
     expanded in flow on phones (the 390 roll is unchanged, order
     included). The H3 fan-tribute line, "To be continued.", the last line
     and "Built with AI assistance" stay visible outside it (on desktop the
     AI row is lifted out of the disclosure; one copy per device).
   - THE SNITCH's dart is the credits' star B57 (snitch.tsx asks the
     spotlight on desktop).
   ========================================================================== */

/** The film faces the site ships (PHASE3-SPEC §5.2; `typeCredits` in
 *  lib/fonts.ts, B1-TYPE, house faces first), minus the house three this row
 *  already names. Shown ≥ 64rem, where the world faces load; below 64rem
 *  phones load none of the new ones, so the roll there keeps the shipped
 *  lettering faces (today's row). */
const HOUSE_FACES: ReadonlySet<string> = new Set(["Geist", "Geist Mono", "Newsreader"]);
const DESKTOP_FACES: readonly string[] = typeCredits.filter((f) => !HOUSE_FACES.has(f));

/** Quote hosts whose lines render only when someone triggers them (an egg's
 *  toast, the devtools console): they are not on the page at rest, so the
 *  roll does not list them (E13 "when they render on the page"); the
 *  console line carries its own attribution in the same string. */
const UNBUILT_HOST = (host: string) => host.startsWith("egg:") || host === "console";

function linesQuoted(): { work: string; ids: QuoteId[] }[] {
  const ids = new Set<QuoteId>(credits.quotes.filter((id) => !UNBUILT_HOST(quotes[id].host)));
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

function Row({ role, children, className }: { role: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={`grid grid-cols-1 gap-1 border-t border-rule py-tier-group sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-8${className ? ` ${className}` : ""}`}
    >
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

export function Footer({ entry }: SectionProps<"credits">) {
  const year = new Date().getFullYear(); // the build year (static page)
  const on = credits.enabled;
  const lines = on ? linesQuoted() : [];
  const models = on ? imageryModels() : [];
  const faces = on ? shippedFaces() : [];
  const hp = bookendWorld === "hp";
  // T12: the world the roll follows (Act IV's hp), faded into house deep
  const i = enabledSections.indexOf(entry);
  const prev = i > 0 ? enabledSections[i - 1] : undefined;
  const fromWorld = on && prev ? worldOf(prev) : "house";
  const scrim = entry.stage?.mode === "backdrop" ? entry.stage.scrim : undefined;
  const libraries = copyText("credits.libraries");
  const ai = on && copyVisible(credits.ai) ? credits.ai.text : null;
  const moreSummary = copyText("credits.more.summary");
  const more = copyVisible(moreSummary) ? moreSummary.text : null;
  const moreRows = (
    <dl className="mx-auto max-w-[56rem]">
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
      {/* phones: in its place inside the (expanded) disclosure */}
      {ai ? (
        <Row role="Built with AI assistance" className={more ? "dw:hidden" : undefined}>
          {ai}
        </Row>
      ) : null}
      <Row role="Type">
        Geist<Dot />Geist Mono<Dot />Newsreader
        {faces.length ? (
          <span className="dw:hidden">
            <Dot />
            {faces.join(", ")} (SIL Open Font License 1.1)
          </span>
        ) : null}
        {faces.length ? (
          <span className="hidden dw:inline">
            <Dot />
            {DESKTOP_FACES.join(", ")} (SIL Open Font License 1.1)
          </span>
        ) : null}
      </Row>
      {/* shown by the boot gate only (app/p3/stage.css); copy key
          "credits.libraries" (proposed, unsigned: validator #10) */}
      {copyVisible(libraries) ? (
        <Row role="Libraries" className="credits-libraries">
          {libraries.text.split(" · ").map((part, i) => (
            <Fragment key={part}>
              {i ? <Dot /> : null}
              {part}
            </Fragment>
          ))}
        </Row>
      ) : null}
    </dl>
  );

  return (
    <footer
      id={anchorId(entry)}
      aria-labelledby="credits-title"
      {...planeAttrs("deep", "house")}
      className={`relative isolate z-(--z-main) bg-bg py-section text-fg${scrim ? " stage-backdrop" : ""}`}
    >
      {scrim ? <StageScrim scrim={scrim} /> : null}
      {fromWorld !== "house" ? (
        <div
          aria-hidden="true"
          {...planeAttrs("deep", fromWorld)}
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30vh] bg-linear-to-b from-bg to-transparent"
          data-seam="credits"
        />
      ) : null}
      <div className="mx-auto w-full max-w-page px-gutter">
        <h2 id="credits-title" className="text-center type-meta text-fg-muted">
          Credits
        </h2>

        {/* PHASE 3 (spec §11.5, D3-9; W3-CINEMA): the long provenance /
            quote lists sit in ONE native <details>, closed at ≥ 64rem;
            phones show it expanded in flow (app/p3/words.css), so the 390
            roll keeps today's order. "Built with AI assistance" stays
            visible: on desktop it is lifted out of the disclosure (its
            own <dl>, `hidden dw:block`), on phones it keeps its place
            inside (`dw:hidden`) — one copy per device. The fan-tribute
            line (H3), "To be continued." and the last line stay outside. */}
        <dl className="mx-auto mt-tier-block max-w-[56rem]">
          <Row role="A personal research journal by">{site.name}</Row>
          <Row role="Research, systems & writing">{site.name}</Row>
          {on && worksInUse.length ? (
            <Row role="Worlds borrowed from">
              <span className="flex flex-col gap-2">
                {worksInUse.map((w) => (
                  <span key={w.world} className="block" data-credits-work={w.world}>
                    {w.world === "house" ? (
                      w.title
                    ) : (
                      <Lettered world={w.world} text={w.title} glue className="text-[1.375rem] leading-tight tracking-[0.03em]" />
                    )}{" "}
                    <span className="text-fg-muted">({w.years})</span>
                  </span>
                ))}
              </span>
            </Row>
          ) : null}
        </dl>
        {ai && more ? (
          <dl className="mx-auto hidden max-w-[56rem] dw:block">
            <Row role="Built with AI assistance">{ai}</Row>
          </dl>
        ) : null}
        {more ? (
          <Collapse
            summary={more}
            className="mx-auto max-w-[56rem] dw:border-t dw:border-rule"
            summaryClassName="mx-auto py-tier-group"
          >
            {moreRows}
          </Collapse>
        ) : (
          moreRows
        )}
        <dl className="mx-auto max-w-[56rem] border-b border-rule">
          <SeekerRow />
          <HuntCredits />
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
          <div className="flex items-center gap-2" data-credits-return="">
            {hp ? (
              <TimeTurnerLink
                href={topHref}
                className="type-small text-fg-muted transition-colors hover:text-fg [&_[data-motif=time-turner]]:size-6"
              >
                ↑ Back to the opening
              </TimeTurnerLink>
            ) : (
              <a href={topHref} className="inline-flex min-h-11 items-center type-small text-fg-muted transition-colors hover:text-fg">
                ↑ Back to the opening
              </a>
            )}
            {hp ? <Snitch /> : null}
          </div>
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
          <div className="mt-tier-block flex flex-col items-center gap-3 text-center" data-credits-last="">
            <p className="text-(length:--text-heading) leading-(--text-heading--line-height) text-fg">
              <FilmQuote id={credits.lastLine} rendition="lettered" attribution="credits" />
              {hp ? <HallowsMark className="ml-3 size-4 align-[-1px]" /> : null}
            </p>
            {hp ? <InkFold /> : null}
          </div>
        ) : null}
        <PostCredits />
      </div>
    </footer>
  );
}
