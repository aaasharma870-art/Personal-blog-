"use client";

import { RotateCcw } from "lucide-react";
import { goTop, replayIntro } from "@/components/site/dock-actions";

/* ============================================================================
   PLAY IT AGAIN (Oct 16 fix, complaint 7): the clear button under the page's
   last line, "Mischief managed." It restarts the loop: with motion on it
   scrolls to the top and replays the intro from its Play card
   (window.__intro.replay(), components/site/dock-actions.ts); with motion
   off (Pause or OS reduced motion) it only goes to the top, through the cut.
   The quiet "↑ Back to the opening" link above stays the scroll-only way.
   A real <button> in the solid "try" look (app/p3/dock.css `.try-end`).
   The label is `mischief.again` (lib/film.ts, proposed, unsigned), resolved
   by the footer on the server.
   ========================================================================== */

export function PlayAgain({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="try-btn try-end inline-flex"
      data-play-again=""
      data-house-type=""
      onClick={() => {
        // "off": refused (motion is off): just go to the top
        if (replayIntro() === "off") goTop();
      }}
    >
      <RotateCcw aria-hidden="true" strokeWidth={2} />
      {label}
    </button>
  );
}
