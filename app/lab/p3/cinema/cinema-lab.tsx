"use client";

/* /lab/p3/cinema client shell (W3-CINEMA). Workbench only — not product UI.
   The chapter select inline: a pick is logged here (the anchors live on the
   home page; the real menu closes and cuts to them). */

import { useState } from "react";
import { useDesktopFine } from "@/lib/flags";
import { ChapterSelect } from "@/components/site/chapter-select";

export function ChapterSelectLab() {
  const fine = useDesktopFine();
  const [picks, setPicks] = useState(0);
  if (!fine) {
    return <p className="type-small text-fg-muted">The chapter select is DESKTOP_FINE only (phones keep today&apos;s menu).</p>;
  }
  return (
    <div
      className="flex flex-col gap-3"
      onClickCapture={(e) => {
        // a lab: keep the page here (the select's own handler would cut to a home-page anchor)
        if (e.target instanceof Element && e.target.closest("a[href^='#']")) {
          e.preventDefault();
          e.stopPropagation();
          setPicks((n) => n + 1);
        }
      }}
    >
      <ChapterSelect onPick={() => undefined} />
      <p className="type-small text-fg-muted" aria-live="polite">
        {picks ? `${picks} pick${picks > 1 ? "s" : ""} (logged, not jumped)` : "Pick a tile: it is logged here, not jumped."}
      </p>
    </div>
  );
}
