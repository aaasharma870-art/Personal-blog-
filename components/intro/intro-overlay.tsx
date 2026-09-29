import { Play } from "lucide-react";
import { captionOf } from "@/lib/sections";
import { FilmQuote } from "@/components/site/film-quote";
import { SceneCaption } from "@/components/primitives/scene-caption";
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
     the bracket its one aqua mark. M2 (RECOGNIZABILITY O-1, S01) adds the
     scene caption in the world's fan face: it outranks the style count.
   - SCENE CAPTIONS (M2, RECOGNIZABILITY S01/S02, T1; server-rendered,
     static markup the controller never writes to — WAAPI only):
       play    "HOGWARTS, ACROSS THE BLACK LAKE • HARRY POTTER" in the dark
               play zone (lower left; top left below 1024 / portrait). It is
               part of the dialog's text: it fades with the text on Play
               (.intro-fade) and clears in 80 ms on Skip / Esc / scroll.
       flight  #intro-caps, a SIBLING of #intro (so it outlives the overlay):
               "A BROOMSTICK OVER HOGWARTS • HARRY POTTER" for the first
               2.5 s of the 6 s flight, a 1 s cross-dissolve, then "TOWARD
               THE BLACK PEARL • PIRATES OF THE CARIBBEAN" through the
               landing and 2.5 s over the landed hero (≥ 640), then a
               600 ms fade, never to return. The code flight runs the same
               timeline scaled to its length. aria-hidden (it narrates a
               visual). Hidden by CSS until the controller animates it, so
               no JS / reduced motion / Pause / ?skip / Skip never show it.
   ========================================================================== */

export function IntroOverlay({ model }: { model: IntroModel }) {
  const json = JSON.stringify(model.config).replace(/</g, "\\u003c");
  const n = model.credits.length;
  const playCap = captionOf("cap.intro.play");
  const flightCaps = captionOf("cap.intro.flight.hp") && captionOf("cap.intro.flight.pc");
  return (
    <>
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
          {/* No Esc bookend here: it could never be read (content returns
              ≤ 400 ms, I9) and ghosted over the name. Q-HP-2 (the bookend)
              lives in the credits and the footer egg. */}
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

      {/* S01: the play screen names its moment and its film (rule (b)) */}
      {playCap ? (
        <div
          data-world="hp"
          data-tone="deep"
          className={
            // .intro-cap: the candles and the ink route keep off it (I18)
            // portrait / < 1024: top left, under the Skip row, in the night
            // sky left of the towers (the Play block owns the lower third);
            // landscape ≥ 1024: the dark lake, lower left, under Play
            "intro-cap intro-fade pointer-events-none absolute top-[calc(4.5rem+1svh)] left-(--spacing-gutter) max-w-[62%] " +
            "lg:landscape:top-auto lg:landscape:bottom-[max(8svh,3rem)] lg:landscape:max-w-[42rem] " +
            "[html.intro-leaving_&]:invisible [html.intro-leaving_&]:opacity-0"
          }
        >
          <SceneCaption k="cap.intro.play" place="under" className="mt-0 sm:mt-0" />
        </div>
      ) : null}

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

    {/* S02 / T1: the flight's caption hand-off, HP → Pirates (the controller
        animates it; hidden until then). Above the overlay and the header. */}
    {flightCaps ? (
      <div
        id="intro-caps"
        aria-hidden="true"
        className="pointer-events-none invisible fixed inset-0 z-[81] opacity-0 print:hidden"
      >
        <span className="absolute inset-x-0 bottom-0 h-[40svh] bg-[linear-gradient(to_top,rgb(2_14_28/0.72),rgb(2_14_28/0.3)_55%,transparent)]" />
        <div
          id="intro-cap-hp"
          data-world="hp"
          data-tone="deep"
          className="absolute right-(--spacing-gutter) bottom-[max(7svh,2.75rem)] left-(--spacing-gutter) opacity-0 sm:right-auto sm:max-w-[40rem]"
        >
          <SceneCaption k="cap.intro.flight.hp" place="under" className="mt-0 sm:mt-0" />
        </div>
        <div
          id="intro-cap-pc"
          data-world="pirates"
          data-tone="deep"
          className="absolute right-(--spacing-gutter) bottom-[max(7svh,2.75rem)] left-(--spacing-gutter) opacity-0 sm:left-auto sm:max-w-[40rem]"
        >
          <SceneCaption k="cap.intro.flight.pc" place="under" className="mt-0 sm:mt-0" />
        </div>
      </div>
    ) : null}
    </>
  );
}
