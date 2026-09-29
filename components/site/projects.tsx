import { GauntletTabs } from "@/components/site/gauntlet-tabs";
import { FilmQuote } from "@/components/site/film-quote";
import { ChalkUnderline } from "@/components/site/idiots-chalk";
import { Meta, SectionHead } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { IdiotsSection } from "@/components/worlds/idiots/idiots-section";
import { HeadBand } from "@/components/worlds/idiots/plate-band";
import { gauntlet } from "@/lib/content";
import { film } from "@/lib/film";
import { quotes } from "@/lib/quotes";
import { copyVisible, variantChoiceOf } from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   WORK — the gauntlet on the dawn board (Act II "The Workshop", idiots
   canvas; SPEC v2 §3 row 3, SM-6; RECOGNIZABILITY S08, T4).

   The workshop at first light, and unmistakably the ICE lecture hall: the
   MV-06 plate IS the board (a wiped chalkboard under stone colonnade
   windows, a raking morning beam), and on it, in chalk: the board header
   (Q-3I-2, lettered in Kalam chalk, O-1, one chalk underline), the seven
   real gates deriving as you choose them, the Run you can make with
   labelled-illustrative hypotheses, the tally with Rancho's circle, and the
   quadcopter doodle. THE ICE CHALKBOARD • 3 IDIOTS names the scene at the
   board's lower left. ≤ 3 chalk marks: the underline + the tally circle.
   T4 (board → board): the act card's deep fades into this canvas over the
   first 30vh. The graph grid thins toward open air (3I-07).
   HEAD (M2 finish, BLIND-1 D24): before the h2, a full-bleed 21:9 band (4:3
   below 640) of the ICE campus — the long stone corridor under striped
   pergola sunlight (iconic-corridor; the lecture hall stands in while that
   plate is planned) — captioned THE CORRIDORS OF ICE • 3 IDIOTS on its calm
   left. Variants (`work.head`): default slow-settle, alt light-sweep (the
   pergola's bars of light rake across as it comes up). The board's caption
   now sits UNDER the board, so nothing darkens its frame or chalk ledge.
   Variants (lib/variants.ts `work.board`): default "rail-run" (the board
   settles in two soft pats, hand on heart), alt "marking-sheet" (a duster
   wipes the board on; the Run marks a chalk grading sheet).
   ========================================================================== */

export function Projects({ entry, number }: SectionProps<"gauntlet">) {
  const titleId = `${entry.id}-title`;
  const board = quotes["Q-3I-2"];
  const header = copyVisible({ text: board.text, status: board.status }) ? (
    <ChalkUnderline className="max-w-full">
      <p className="text-[clamp(0.95rem,0.55rem+1.1vw,1.6rem)] leading-[1.18] tracking-[0.01em] text-(--w-chalk)">
        <FilmQuote id="Q-3I-2" rendition="lettered" attribution="speaker" excerpt />
      </p>
    </ChalkUnderline>
  ) : null;

  // IC-3I-08: the quadcopter doodle is the `quadcopter-lift` egg's host art
  const quadcopter =
    film.enabled && film.eggs.enabled && film.eggs.list.some((e) => e.id === "quadcopter-lift" && e.enabled);

  const choice = variantChoiceOf(entry);
  const head = entry.props.head;

  return (
    <IdiotsSection
      entry={entry}
      labelledBy={titleId}
      grid
      gridMask="linear-gradient(to bottom, black 0%, black 18%, transparent 72%)"
      fadeIn
      lead={
        head ? (
          <HeadBand
            spec={head}
            choice={choice}
            pieceKey="work.head"
            captionKey="cap.work.head"
            standInCaptionKey="cap.work.head.standin"
            className="mb-tier-block"
          />
        ) : null
      }
    >
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
        <Meta fields={["Inside the flagship"]} />
        <h3 className="mt-tier-pair max-w-title type-title text-fg">The seven-part validation gauntlet.</h3>
        <div className="mt-tier-block">
          <GauntletTabs
            steps={gauntlet}
            board={entry.props.board}
            choice={choice}
            header={header}
            caption={<SceneCaption k="cap.work" place="under" />}
            quadcopter={quadcopter}
          />
        </div>
      </div>
    </IdiotsSection>
  );
}
