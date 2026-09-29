import { Play } from "lucide-react";
import { FilmQuote } from "@/components/site/film-quote";
import { BROOM_SVG } from "./broom";
import type { IntroModel } from "./intro-model";

/* ============================================================================
   PROLOGUE OVERLAY (SPEC v2 §5; bars/intro.BAR.md) — server-rendered markup,
   driven by the vanilla controller public/intro/intro.js.

   - The FIRST child of <body>, a sibling of the whole page, so no frame can
     paint the hero before it. Hidden by default (app/intro.css); shown only
     under html.intro-armed, which the head script sets before the first
     paint. No JS / reduced motion / Pause / ?skip / #hash / Save-Data / seen
     this session → it never shows, and the SSR page underneath is complete
     either way.
   - HYDRATION CONTRACT (no React #418, no dev hydration diff): the
     controller never changes the child list, text or attributes of anything
     React hydrates. Its canvas and video live in #intro-stage, whose content
     React treats as opaque innerHTML (it ships only the code-flight broom
     SVG). Every state is a class on <html> (suppressHydrationWarning there);
     motion runs through the Web Animations API (no style attribute); the one
     text reset (#intro-status, so the real-loading status is announced) is
     suppressed. `inert` on the page behind is set only after hydration.
   - One dialog: role=dialog, aria-modal, labelled by the Meta title and
     described by the sr-only #intro-desc. Tab cycles Play ↔ Skip only; Play's
     description is the oath (quote Q-HP-1), rendered from the quote
     registry through FilmQuote.
   - Type: meta (title, credit line, Skip) + epigraph (the oath) + title
     (Play) — exactly three styles; the oath is the viewport's one italic and
     the bracket its one aqua mark.
   ========================================================================== */

export function IntroOverlay({ model }: { model: IntroModel }) {
  const json = JSON.stringify(model.config).replace(/</g, "\\u003c");
  const n = model.credits.length;
  return (
    <div
      id="intro"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      aria-describedby="intro-desc"
    >
      {/* Controller-owned: the canvas and the video are appended here. */}
      <div
        id="intro-stage"
        aria-hidden="true"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: BROOM_SVG }}
      />

      <div className="intro-block">
        <p id="intro-title" className="intro-meta intro-fade type-meta">
          {model.title}
        </p>
        {/* The four works, in act order; wraps only at the bullets (I36). */}
        <p className="intro-meta intro-credit intro-fade type-meta">
          {model.credits.map((title, i) => (
            <span key={title}>
              <span className="intro-nw">
                {i === 0 ? `${model.creditLead} ` : null}
                {title}
                {i < n - 1 ? <span aria-hidden="true">&nbsp;•</span> : null}
              </span>
              {i < n - 1 ? " " : null}
            </span>
          ))}
        </p>

        <div className="intro-lines">
          <div id="intro-oath" className="intro-line intro-oath intro-fade">
            <FilmQuote id={model.oath} rendition="epigraph" attribution="credits" />
          </div>
          {/* The Marauder's bookend: shown only while the overlay leaves on
              Skip / Esc / scroll from the play screen. A decorative
              duplicate of the credits' last line, hidden from assistive tech
              (focus is already on its way to the h1). */}
          <div className="intro-line intro-managed" aria-hidden="true">
            <FilmQuote id={model.managed} rendition="epigraph" attribution="credits" />
          </div>
        </div>

        <button
          type="button"
          id="intro-play"
          className="intro-play type-title"
          aria-describedby="intro-oath"
        >
          <span className="intro-lens intro-lens-l" aria-hidden="true">
            <i className="intro-arm-a" />
            <i className="intro-spine" />
            <i className="intro-arm-b" />
          </span>
          <span className="intro-play-face">
            <Play aria-hidden="true" focusable="false" className="intro-play-icon" size="1em" strokeWidth={1.5} />
            <span>{model.play}</span>
          </span>
          <span className="intro-lens intro-lens-r" aria-hidden="true">
            <i className="intro-arm-a" />
            <i className="intro-spine" />
            <i className="intro-arm-b" />
          </span>
        </button>
      </div>

      <div className="intro-top">
        <button type="button" id="intro-skip" className="intro-skip type-meta">
          {model.skip}
        </button>
      </div>

      <p id="intro-desc" className="sr-only">
        {model.desc}
      </p>

      {/* S1w only (Play pressed before the flight is playable): LD-HP draws
          in the canvas just above this line, with real buffered/duration
          progress. display:none (so not exposed) until then; the controller
          re-sets the text on show so it is announced. */}
      <div className="intro-wait">
        <p id="intro-status" role="status" className="type-meta" suppressHydrationWarning>
          {model.loading}
        </p>
      </div>

      <script
        type="application/json"
        id="intro-data"
        dangerouslySetInnerHTML={{ __html: json }}
      />
    </div>
  );
}
