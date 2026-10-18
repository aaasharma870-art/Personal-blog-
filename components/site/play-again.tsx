"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";

/* ============================================================================
   MISCHIEF MANAGED, AS THE BUTTON (Oct 16 fix, complaint 7: "mischief managed
   should be a clear button at the end that restarts the loop"): the page's
   last line IS the button. One large, solid, aqua-ringed button whose face is
   the lettered line (`children`: the FilmQuote and the Hallows mark, rendered
   by the footer, so the quoted line is never written here) with a small
   "↻ Play it again" sub-line inside it (`label`); the ink fold-line (`fold`)
   sits between the two. It restarts the loop: with motion on it scrolls to
   the top and replays the intro from its Play card
   (window.__intro.replay(), components/site/dock-actions.ts); with motion off
   (Pause or OS reduced motion) it only goes to the top, focus on the hero
   title. The quiet "↑ Back to the opening" link above stays the scroll-only
   way back. `name` is the accessible name ("<line> <label>", built by the
   footer). A real <button> in the solid "try" look (app/p3/dock.css
   `.try-end`), 44 px+ tall, hover / focus / active states.
   The label is `mischief.again` (lib/film.ts, proposed, unsigned).
   Without JavaScript nothing can restart the loop, so the server markup
   looks like plain text (app/p3/dock.css `html:not(.js)`: no ring, no
   "Play it again") and carries no "Play it again" in its accessible name:
   `aria-label` is set once the page has hydrated.
   ========================================================================== */

/** true after hydration (server + hydration render = false). */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function PlayAgain({
  label,
  name,
  fold,
  children,
}: {
  label: string;
  name: string;
  fold?: ReactNode;
  children: ReactNode;
}) {
  const mounted = useMounted();
  return (
    <button
      type="button"
      className="try-btn try-end inline-flex"
      data-play-again=""
      aria-label={mounted ? name : undefined}
      onClick={() => {
        // dock-actions loads on the press (it is not in the first load);
        // "off": refused (motion is off): just go to the top
        void import("@/components/site/dock-actions").then((m) => {
          if (m.replayIntro() === "off") m.goTop();
        });
      }}
    >
      <span className="try-end-line">{children}</span>
      {fold ? <span className="try-end-fold">{fold}</span> : null}
      <span className="try-end-sub" aria-hidden="true">
        <RotateCcw aria-hidden="true" strokeWidth={2} />
        {label}
      </span>
    </button>
  );
}
