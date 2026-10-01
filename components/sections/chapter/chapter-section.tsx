import { ArrowUpRight } from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { MetricTile } from "@/components/site/metric-tile";
import { ChalkDrone, RanchoCircle } from "@/components/site/idiots-chalk";
import { Meta } from "@/components/site/world-kit";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { ChalkboardFrame } from "@/components/worlds/idiots/chalk";
import { IdiotsSection } from "@/components/worlds/idiots/idiots-section";
import { MachineBoard } from "@/components/worlds/idiots/machine-board";
import { BlueprintSchematic, type SchematicSpec } from "@/components/worlds/idiots/schematic";
import { Rise } from "@/components/site/world-motion";
import { StageSplit } from "@/components/stage/stage-window";
import {
  earlierRepos,
  featuredProjects,
  gauntlet,
  optionAlpha,
  supportingProjects,
  survivors,
  type Project,
} from "@/lib/content";
import type { ChapterAppendix } from "@/lib/page";
import { beatAttrs } from "@/lib/beats";
import { variantChoiceOf } from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   CHAPTER — one flagship project as its own section (SPEC v2 §3 rows 4–5,
   SM-7 "Honest chalk"; RECOGNIZABILITY S09; Act II · idiots canvas).
   The chapter reads top → bottom: the claim (name, repo, summary) beside
   the problem; then the ICE CLASSROOM BOARD — a wooden frame, a slate
   margin, a chalk ledge with a chalk stub and a felt duster — holding the
   cyanotype blueprint of the REAL system in the jugaad register (every
   node from content.ts; left → right ≥ 1024, stacked below); under it the
   scene caption (A RANCHO-STYLE BLUEPRINT • 3 IDIOTS, or for the pipeline
   the lettered machine definition, Q-3I-3 • 3 IDIOTS). Only then the
   approach, the figures and the limitations: a caption never sits beside
   a metric (H4). Rancho's ONE chalk circle per chapter goes around the
   CAVEAT, never a number (TA-07): Trading_Algos' limitations sentence,
   Optuna's "anything > 2.0 is a red flag".
   The section's h2 is the project name (one h1 on the page: the name).
   `props.appendix` renders the Option Alpha origin and the supporting list
   after the LAST chapter (they lived at the end of `work`).
   Variants: `<id>.schematic` — default "draw" (the blueprint inks itself),
   alt "assemble" (the parts drop in, the tape slaps on).
   HEAD (M2 finish, `props.head`; IC-3I-05): a chapter may open on a plate
   band BEFORE its facts. Optuna-Screener's is the ICE lecture hall's board
   with the lecture's question chalked on it and Rancho's answer (Q-3I-3,
   lettered) under it — the pipeline is "anything that reduces human
   effort" — captioned WHAT IS A MACHINE? • 3 IDIOTS (machine-board.tsx;
   `<id>.head`: default chalk-write, alt rancho-circle). The line lives on
   the board now, so the pipeline FIG below carries no caption of its own.
   PHASE 3 SPLIT (PHASE3-SPEC §3.2; B1-STAGE): when the entry's StageSpec is
   `split`, <StageSplit> sets the body (and the appendix) beside a sticky
   stage window under the boot gate (anything else: today's DOM). Inside the
   split the research grids carry `split-stack` (they stack in a narrow
   column, ≈ 1024), the ICE board is `data-stage-wide` (it breaks out over
   the whole grid, so the horizontal schematic keeps its size), each text
   block is a `data-stage-block` (the window's rack focus) and the approach
   and metrics carry the cue anchors `<id>-approach` / `<id>-metrics`. The
   data islands (metric tiles, reported figures, caveats and limitations)
   are `data-research`: Geist only, whatever the world's faces (B1-TYPE).
   ========================================================================== */

/** Each flagship's schematic: nodes ONLY from content.ts approach/stack
 *  (SPEC SM-7; "machine for show" is banned, H4). Counts are derived. */
function schematicOf(p: Project): SchematicSpec | null {
  if (p.id === "trading-algos") {
    return {
      chain: [
        { label: "Pre-registration", note: "committed before any run" },
        { label: "LEAN backtest", note: "signal T close • fill T+1 open" },
        { label: `${gauntlet.length}-gate gauntlet`, note: "blind holdout spent once" },
      ],
      fork: [
        { label: "Survivors", note: `${survivors.length} strategies` },
        { label: "Kill-list", note: "post-mortems" },
      ],
    };
  }
  if (p.id === "optuna-screener") {
    return {
      chain: [
        { label: "Strategy file / discovery", note: "entry_fn • exit_fn" },
        { label: "Indicators", note: "computed per strategy" },
        { label: "Optuna TPE", note: "walk-forward" },
        { label: "Stress tests", note: "Monte Carlo • noise" },
        { label: "25% holdout", note: "never optimized on" },
        { label: "Report", note: "Plotly HTML" },
      ],
      branch: { label: "v3.0 ensemble", note: "risk-parity weighting • per-strategy + portfolio CPCV" },
    };
  }
  return null;
}

function stagesOf(s: SchematicSpec): string {
  const n = s.chain.length + (s.fork ? 1 : 0);
  return `${n} stages${s.branch ? " • 1 branch" : ""}`;
}

function ChapterBody({
  p,
  figNo,
  number,
  titleId,
  entry,
}: {
  p: Project;
  figNo: number;
  number?: string;
  titleId: string;
  entry: SectionProps<"chapter">["entry"];
}) {
  const s = schematicOf(p);
  const isOptuna = p.id === "optuna-screener";
  return (
    <div>
      {/* the claim, beside the problem it answers */}
      <div data-stage-block="" className="split-stack grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-7">
          <Meta fields={[number, p.status]} />
          <h2 id={titleId} className="mt-tier-pair max-w-title type-title text-fg">
            {p.name}
          </h2>
          <a
            href={p.href}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-tier-pair inline-flex min-h-11 items-center gap-2 type-meta text-fg-muted transition-colors hover:text-fg"
          >
            <GithubMark className="size-4" />
            <span className="normal-case">{p.repo}</span>
            <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          </a>
          <p className="mt-tier-group max-w-body type-body text-fg">{p.summary}</p>
        </div>
        <div className="lg:col-span-5 lg:pt-tier-block">
          <Meta fields={["The problem"]} />
          <p className="mt-tier-pair max-w-body type-body text-fg-muted">{p.problem}</p>
        </div>
      </div>

      {/* the ICE board: the real system as a Rancho-style blueprint */}
      {s ? (
        <div
          data-stage-block=""
          data-stage-wide=""
          className="mt-tier-block"
          {...(entry.id === "trading-algos" ? beatAttrs("B20", { weight: 2 }) : {})}
        >
          <Rise>
            {/* the board is NAMED as it comes into view — above it, not under
                it a screen later (M2 fix round 3, blind D26: the chapter's
                first view showed the board with no film cue); never beside a
                metric. A chapter with a `head` is named by its head band. */}
            {entry.props.head ? null : (
              <div className="relative">
                <SceneCaption k="cap.trading-algos" place="head" className="mb-tier-group" />
                {/* THE HOMEMADE DRONE in chalk, right of the caption (M5, blind
                    D26 3I .20–.25: "a generic diagram"). ≥ 1024 only, where the
                    claim grid leaves the right column clear above the board;
                    it rises into that gap, so the board never moves. */}
                <ChalkDrone className="absolute right-[4%] bottom-(--spacing-tier-group) hidden w-[clamp(11rem,16vw,15rem)] lg:block" />
              </div>
            )}
            <ChalkboardFrame>
              <BlueprintSchematic
                fig={`FIG. ${figNo} • ${p.repo} • ${stagesOf(s)}`}
                spec={s}
                choice={variantChoiceOf(entry)}
                pieceKey={`${entry.id}.schematic`}
              />
            </ChalkboardFrame>
            {/* (the pipeline's film cue is its head band, MachineBoard) */}
          </Rise>
        </div>
      ) : null}

      <div
        id={`${entry.id}-approach`}
        data-stage-block=""
        className="split-stack mt-tier-block grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:gap-x-6"
      >
        <div className="lg:col-span-7">
          <Meta fields={["Approach"]} />
          <ul className="mt-tier-pair max-w-body list-disc space-y-2 pl-5 type-body text-fg-muted marker:text-fg-ghost">
            {p.approach.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <dl
          id={`${entry.id}-metrics`}
          data-research=""
          className="grid grid-cols-1 gap-tier-group sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1"
        >
          {p.metrics.map((m, i) => (
            <MetricTile key={m.label} m={m} circleNote={isOptuna && i === p.metrics.length - 1} />
          ))}
        </dl>
      </div>

      <div data-stage-block="" className="split-stack mt-tier-block grid grid-cols-1 gap-tier-group sm:grid-cols-2 lg:gap-x-6">
        <div>
          <Meta fields={["What I learned"]} />
          <p className="mt-tier-pair max-w-body type-body text-fg-muted">{p.learned}</p>
        </div>
        <div data-research="">
          <Meta fields={["Honest limitations"]} />
          {isOptuna ? (
            <p className="mt-tier-pair max-w-body type-body text-fg-muted">{p.limitations}</p>
          ) : (
            <RanchoCircle
              block
              className="mt-tier-pair max-w-body"
              {...(entry.id === "trading-algos" ? beatAttrs("B21-circle", { weight: 1 }) : {})}
            >
              <p className="type-body text-fg-muted">{p.limitations}</p>
            </RanchoCircle>
          )}
        </div>
      </div>

      <div className="mt-tier-group">
        <Meta fields={["Stack", p.stack.join(" · ")]} />
      </div>
      {/* Honest chart slot: a marked placeholder, never a fabricated curve. */}
      <p className="mt-tier-group type-meta text-fg-ghost">[ chart slot — drop a real exported equity curve / report here ]</p>
    </div>
  );
}

function OptionAlphaOrigin() {
  return (
    <Rise as="article" className="border-t border-rule pt-tier-block">
      <Meta fields={[optionAlpha.tag]} />
      <h3 className="mt-tier-pair max-w-title type-title text-fg">{optionAlpha.name}</h3>
      <a
        href={optionAlpha.href}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-tier-pair inline-flex min-h-11 items-center gap-2 type-meta text-fg-muted transition-colors hover:text-fg"
      >
        <GithubMark className="size-4" />
        <span className="normal-case">{optionAlpha.repo}</span>
        <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
      </a>
      <div className="split-stack mt-tier-group grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:gap-x-6">
        <p className="max-w-body type-body text-fg lg:col-span-6">{optionAlpha.summary}</p>
        <div data-research="" className="space-y-tier-group lg:col-span-6">
          <div>
            <Meta fields={["Paper", "small sample"]} />
            <p className="tnum mt-tier-pair type-body text-fg-muted">{optionAlpha.reported}</p>
          </div>
          <div>
            <Meta fields={["Honest framing"]} />
            <p className="mt-tier-pair type-body text-fg-muted">{optionAlpha.honest}</p>
          </div>
        </div>
      </div>
    </Rise>
  );
}

function Supporting() {
  return (
    <div className="border-t border-rule pt-tier-block">
      <Meta fields={["Supporting work"]} />
      <h3 className="mt-tier-pair type-title text-fg">Tools, pipelines, automation.</h3>
      <ul aria-label="Supporting projects" className="mt-tier-block border-t border-rule">
        {supportingProjects.map((s) => (
          <li
            key={s.repo}
            className="grid grid-cols-1 gap-2 border-b border-rule py-5 sm:grid-cols-[16rem_1fr_auto] sm:items-baseline sm:gap-6"
          >
            <span className="font-mono text-meta tracking-[0.02em] text-fg">{s.repo}</span>
            <p className="type-body text-fg-muted">{s.blurb}</p>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${s.repo} on GitHub`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-fg-muted transition-colors hover:text-fg"
            >
              <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-tier-group type-small text-fg-muted">
        <span className="type-meta">Also on GitHub</span>{" "}
        {earlierRepos.map((r, i) => (
          <span key={r.repo}>
            <a
              href={r.href}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-fg underline decoration-rule underline-offset-4 transition-colors hover:decoration-current"
            >
              {r.repo}
            </a>
            <span> (early / idea-stage)</span>
            {i < earlierRepos.length - 1 ? (
              <span aria-hidden="true" className="text-fg-ghost">
                {" • "}
              </span>
            ) : null}
          </span>
        ))}
      </p>
    </div>
  );
}

function Appendix({ kind }: { kind: ChapterAppendix }) {
  return kind === "origin" ? <OptionAlphaOrigin /> : <Supporting />;
}

export function ChapterSection({ entry, number }: SectionProps<"chapter">) {
  const i = featuredProjects.findIndex((p) => p.id === entry.props.projectId);
  const p = featuredProjects[i];
  if (!p) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[sections] chapter "${entry.id}": no featuredProjects entry "${entry.props.projectId}"`);
    }
    return null;
  }
  const titleId = `${entry.id}-title`;
  const appendix = entry.props.appendix ?? [];
  return (
    <IdiotsSection entry={entry} labelledBy={titleId} className="scroll-mt-24">
      {/* the chapter head is the pipeline's machine board (IC-3I-05; only
          optuna-screener sets `head`): another chapter's `head` would need
          its own scene + caption */}
      {entry.props.head ? (
        <MachineBoard
          spec={entry.props.head}
          choice={variantChoiceOf(entry)}
          pieceKey={`${entry.id}.head`}
          captionKey="cap.optuna-screener"
          className="mb-tier-block"
        />
      ) : null}
      <StageSplit entry={entry}>
        <ChapterBody p={p} figNo={i + 1} number={number} titleId={titleId} entry={entry} />
        {appendix.length ? (
          <div data-stage-block="" className="mt-tier-block space-y-tier-block">
            {appendix.map((a) => (
              <Appendix key={a} kind={a} />
            ))}
          </div>
        ) : null}
      </StageSplit>
    </IdiotsSection>
  );
}
