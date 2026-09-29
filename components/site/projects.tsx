import { GauntletTabs } from "@/components/site/gauntlet-tabs";
import { FilmQuote } from "@/components/site/film-quote";
import { ChalkUnderline } from "@/components/site/idiots-chalk";
import { Meta, SectionHead, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { gauntlet } from "@/lib/content";
import { quotes } from "@/lib/quotes";
import { copyVisible } from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   WORK — the gauntlet on the dawn board (Act II "The Workshop", idiots
   canvas; SPEC v2 §3 row 3, SM-6). M2: ONLY the gauntlet lives here now;
   the chapters (#trading-algos, #optuna-screener), #experiment and
   #kill-list are their own manifest sections (components/sections/**).
   The act2-idiots builder wires the MV-06 board (entry.props.board) under
   the chalk diagram, <SceneCaption k="cap.work" place="bl"> on the board
   frame, the Q-3I-2 header as <FilmQuote id="Q-3I-2" rendition="lettered">
   (Kalam chalk, O-1) and the aalIzzWell settle (RECOGNIZABILITY S08).

   The workshop at first light: the board's top margin carries one line from
   the film (FilmQuote, chalk-underlined), the seven real gates derive in
   chalk, each flagship's cover IS a true blueprint schematic (jugaad
   register) with Rancho's circle around the CAVEAT, never the number
   (≤ 3 chalk marks in this section: the underline + two circles). The
   graph-grid ground thins to nothing before the ledger (3I-07). Retired
   here: the backdrop video, spotlight cards, generated covers, count-ups,
   glow boxes, bordered tag pills and the simulated "live" ticker.
   ========================================================================== */

export function Projects({ entry, number }: SectionProps<"gauntlet">) {
  const titleId = `${entry.id}-title`;
  const board = quotes["Q-3I-2"];
  return (
    <WorldSection entry={entry} labelledBy={titleId} ground groundClassName="world-ground--fade">
      <SectionHead
        id={titleId}
        number={number}
        label={entry.nav?.label ?? "Work"}
        title="Led by what survived scrutiny."
        intro="The portfolio opens with the two projects I would defend in a room of people who know markets — the research and the pipeline behind it."
      />

      <Rise className="mt-tier-group max-w-body">
        <Meta fields={["Standing rule"]} />
        <p className="mt-tier-pair type-body text-fg-muted">
          Any trading result above roughly Sharpe 2.0 is treated as curve-fit or data-leak until proven otherwise. The
          figures below are the ones that earned their place under that rule.
        </p>
      </Rise>

      {/* ── the dawn board: the seven gates ─────────────────────────── */}
      <div className="mt-tier-block border-t border-rule pt-tier-block">
        {copyVisible({ text: board.text, status: board.status }) ? (
          <ChalkUnderline className="mb-tier-group">
            <FilmQuote id="Q-3I-2" rendition="caption" />
          </ChalkUnderline>
        ) : null}
        <Meta fields={["Inside the flagship"]} />
        <h3 className="mt-tier-pair max-w-title type-title text-fg">The seven-part validation gauntlet.</h3>
        <div className="mt-tier-block">
          <GauntletTabs steps={gauntlet} />
        </div>
      </div>

      {/* M2: the chapters, the experiment, the kill-list and the Option
          Alpha / supporting appendix are their own manifest sections now
          (components/sections/{chapter,experiment,ledger}). */}
    </WorldSection>
  );
}
