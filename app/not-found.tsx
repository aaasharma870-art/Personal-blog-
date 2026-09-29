import Link from "next/link";
import { copyVisible } from "@/lib/sections";
import { planeAttrs } from "@/lib/worlds";
import { Loader } from "@/components/primitives/loader";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { FilmQuote, quoteAttribution } from "@/components/site/film-quote";
import { eggCopy, type EggCopyKey } from "@/components/eggs/egg-copy";
import { MapPlan, mapRooms } from "@/components/eggs/marauders-map";
import { NotFoundSwitch } from "@/components/eggs/not-found-switch";

/* ============================================================================
   404 — "You've wandered off the map." (SPEC v2 §10.2 `404`, §10.3; eggs.BAR
   E7; ICONS IC-HP-05/06). A server page inside the root layout (the header,
   menu and palette stay; their jumps become /#id off the home page).
   DEFAULT: the Marauder's Map of THIS site — rooms = the enabled sections in
   page order, every room a real link to /#id — so it works with NO JS (a
   static plan of links). "Mischief managed" (Q-HP-2, through FilmQuote)
   leads back to the opening (/#top). Captioned THE MARAUDER'S MAP • HARRY
   POTTER (the recognisability rule (b)).
   ALT (?variant=404.page:alt): the RDR2 journal — Arthur Morgan's journal
   (the LD-RD art, static), a TIP in the game's loading-screen idiom with
   OUR line ("This trail goes nowhere. Head back to camp.", never a game
   quote), and the way back to camp.
   One h1 on either side. The page <title> stays the site's, name-first
   (hygiene #9: no work titles in the title / description).
   ========================================================================== */

/** A proposed egg string, or its plain fallback when it may not render here. */
function t(k: EggCopyKey, fallback: string): string {
  return copyVisible(eggCopy[k]) ? eggCopy[k].text : fallback;
}

function MapPage() {
  const rooms = mapRooms();
  const home = t("404.home", "back to the opening");
  return (
    <div
      {...planeAttrs("deep", "hp")}
      className="min-h-svh bg-bg px-gutter pb-section pt-[calc(var(--header-h)+var(--spacing-tier-block))] text-fg"
      data-not-found="map"
    >
      <div className="mx-auto flex w-full max-w-page flex-col gap-tier-group">
        <p className="type-meta text-fg-muted">404</p>
        <h1 className="type-title max-w-title">{t("404.title", "Page not found.")}</h1>
        <p className="max-w-lead type-lead text-fg-muted">{t("404.sub", "Every section of the page is linked below.")}</p>
        <div id="not-found-map-title">
          <SceneCaption k="cap.loader.hp.alt" place="head" />
        </div>
        <MapPlan rooms={rooms} hrefPrefix="/" headingId="not-found-map-title" />
        <p>
          <Link
            href="/#top"
            className="inline-flex min-h-11 flex-wrap items-center gap-x-3 text-[clamp(1.25rem,1rem+0.8vw,1.75rem)] text-fg underline-offset-4 transition-colors hover:text-(--world-emphasis) hover:underline"
            data-not-found-home=""
          >
            <FilmQuote id="Q-HP-2" rendition="lettered" attribution="credits" />
            {/* the attribution, beside it (wraps on a phone; the lettered
                rendition's own is nowrap) */}
            <span className="type-meta text-fg-muted">— {quoteAttribution("Q-HP-2")}</span>
            <span className="type-small text-fg-muted">↑ {home}</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

function CampPage() {
  const rooms = mapRooms();
  return (
    <div
      {...planeAttrs("deep", "rdr2")}
      className="min-h-svh bg-bg px-gutter pb-section pt-[calc(var(--header-h)+var(--spacing-tier-block))] text-fg"
      data-not-found="camp"
    >
      <div className="mx-auto flex w-full max-w-page flex-col gap-tier-group">
        <p className="type-meta text-fg-muted">404</p>
        <h1 className="type-title max-w-title">{t("404.title", "Page not found.")}</h1>
        <div className="flex flex-col items-start">
          <Loader world="rdr2" size="stage" mode="static" variant="default" />
          <SceneCaption k="cap.loader.rdr2" place="under" />
        </div>
        <p className="max-w-lead type-lead text-fg">
          <span className="type-meta mr-3 text-fg-muted">Tip</span>
          {t("404.alt.tip", "This page doesn't exist.")}
        </p>
        <p>
          <Link
            href="/#top"
            className="inline-flex min-h-11 items-center type-body text-fg underline underline-offset-4 transition-colors hover:text-(--world-emphasis)"
          >
            {t("404.alt.home", "Back to the start")}
          </Link>
        </p>
        <nav aria-label="Sections">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {rooms.map((r) => (
              <li key={r.id}>
                <a href={`/#${r.id}`} className="inline-flex min-h-11 items-center type-small text-fg-muted transition-colors hover:text-fg">
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="flex-1 outline-none">
      <NotFoundSwitch main={<MapPage />} alt={<CampPage />} />
    </main>
  );
}
