import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { MetricTile } from "@/components/site/metric-tile";
import { ChalkDrone, RanchoCircle } from "@/components/site/idiots-chalk";
import { Meta } from "@/components/site/world-kit";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { Collapse } from "@/components/primitives/collapse";
import { ChalkboardFrame } from "@/components/worlds/idiots/chalk";
import { LedgeHeart } from "@/components/worlds/idiots/chalk-heart";
import { IdiotsSection } from "@/components/worlds/idiots/idiots-section";
import { MachineBoard } from "@/components/worlds/idiots/machine-board";
import { BlueprintSchematic, type SchematicSpec } from "@/components/worlds/idiots/schematic";
import { Rise } from "@/components/site/world-motion";
import { StageSplit } from "@/components/stage/stage-window";
import { PhysicalWord } from "@/components/words/physical-word";
import { ScrubSentence, splitAround } from "@/components/words/scrub-sentence";
import { PHYSICAL_WORDS, SCRUB_LINES } from "@/components/words/words-data";
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
import { copyText, copyVisible, variantChoiceOf } from "@/lib/sections";
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
   carries the cue anchors `<id>-approach` (its top) and `<id>-metrics` (a
   marker under the approach list: at 1440 the metrics sit BESIDE the list,
   so a cue on the metrics' top crossfaded the window while the FIG above
   was still inking, P3-11 r1 J1 #6; the marker keeps 1024's order — the
   draw ends, then the window turns — at every width). The
   data islands (metric tiles, reported figures, caveats and limitations)
   are `data-research`: Geist only, whatever the world's faces (B1-TYPE).
   PHASE 3 HOSTS (W3-IDIOTS; PHASE3-SPEC §8.3, §8.5, §9.1, §11.5, §2.3):
   - B20: the trading-algos blueprint's ink-on is a time star (spotlight);
     B23-fig: the optuna blueprint's, likewise (weight 1; P3-11 r1).
   - B21: Act II's scroll-scrubbed sentence, the second sentence of
     trading-algos "What I learned" (SCRUB_LINES.B21, verbatim; splitAround
     null → plain text). Rancho's circle on the caveat follows (B21-circle).
   - B23: the physical word "noise" in the optuna problem paragraph (one
     grain settle; absent token → plain text).
   - `3i-aal`: a chalk heart resting on the optuna board's ledge (an
     EggHotspot, DESKTOP_FINE only; press and hold 600 ms / Enter).
   - The optuna appendix collapses (native <details>, closed in SSR at
     ≥ 64rem, expanded on phones): Option Alpha as ONE whole block, its
     honest framing inside, under `optuna.appendix.summary` (which carries
     that framing when closed); the supporting list; the earlier repos.
     Never a metric, limitation or verdict; never a claim split from its
     caveat.
   - The chart-slot placeholders no longer render (spec §11.5; at every
     width: an intended 390 change).
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
  // the FIG's ink-on is a time star: trading-algos' B20 (the beat map), and
  // the pipeline's FIG, which performed undeclared (P3-11 r1 J1 #4; B23-fig
  // is an F1 handoff in lib/page.ts)
  const figStar = entry.id === "trading-algos" ? ({ id: "B20", weight: 2 } as const) : isOptuna ? ({ id: "B23-fig", weight: 1 } as const) : undefined;
  return (
    <div>
      {/* the claim, beside the problem it answers */}
      <div data-stage-block="" className="split-stack grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-7">
          <Meta fields={[number, p.status]} />
          <h2 id={titleId} className="mt-tier-pair max-w-title type-title text-fg motion-off:transition-none">
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
          <p className="mt-tier-pair max-w-body type-body text-fg-muted">
            {entry.id === PHYSICAL_WORDS.B23.host ? (
              <PhysicalWord text={p.problem} word={PHYSICAL_WORDS.B23.word} kind={PHYSICAL_WORDS.B23.kind} beat="B23" />
            ) : (
              p.problem
            )}
          </p>
        </div>
      </div>

      {/* the ICE board: the real system as a Rancho-style blueprint */}
      {s ? (
        <div
          data-stage-block=""
          data-stage-wide=""
          className="mt-tier-block"
          {...(figStar ? beatAttrs(figStar.id, { weight: figStar.weight }) : {})}
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
            {/* the optuna board's ledge holds the chalk heart (3i-aal) */}
            <ChalkboardFrame ledge={isOptuna ? <LedgeHeart /> : null}>
              <BlueprintSchematic
                fig={`FIG. ${figNo} • ${p.repo} • ${stagesOf(s)}`}
                spec={s}
                choice={variantChoiceOf(entry)}
                pieceKey={`${entry.id}.schematic`}
                star={figStar}
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
          {/* the second stage cue's anchor (see the header) */}
          <div id={`${entry.id}-metrics`} aria-hidden="true" />
        </div>
        <dl
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
          <Learned id={entry.id} text={p.learned} />
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
      {/* (the "[ chart slot … ]" placeholder no longer renders until a real
          exported chart exists: PHASE3-SPEC §11.5, D3-9) */}
    </div>
  );
}

/** "What I learned": Act II's scroll-scrubbed sentence (B21) lives in the
 *  trading-algos paragraph; the words around it, and every other chapter's
 *  paragraph, render as plain text. */
function Learned({ id, text }: { id: string; text: string }) {
  const parts = id === SCRUB_LINES.B21.host ? splitAround(text, SCRUB_LINES.B21.text) : null;
  return (
    <p className="mt-tier-pair max-w-body type-body text-fg-muted">
      {parts ? (
        <>
          {parts[0]}
          <ScrubSentence text={parts[1]} beat="B21" />
          {parts[2]}
        </>
      ) : (
        text
      )}
    </p>
  );
}

/* — the optuna appendix (spec §11.5: collapsed at ≥ 64rem, closed in SSR;
   phones keep today's expanded blocks, the summaries hidden) ——————————— */

/** The supporting list's heading and the earlier repos' label: existing
 *  strings, reused verbatim as their disclosures' summaries. */
const SUPPORTING_TITLE = "Tools, pipelines, automation.";
const EARLIER_LABEL = "Also on GitHub";

/** One appendix disclosure. `summary` null (its copy may not render here):
 *  the block renders open, as today, never hidden behind an empty line. */
function AppendixCollapse({
  summary,
  className,
  children,
}: {
  summary: string | null;
  /** The block's own spacing (the details box carries it at every width). */
  className: string;
  children: ReactNode;
}) {
  if (!summary) return <div className={className}>{children}</div>;
  return (
    <Collapse
      summary={summary}
      className={className}
      summaryClassName="max-w-body py-3 text-pretty"
    >
      {/* desktop: a breath between the summary and the opened block */}
      <div className="dw:pt-tier-pair">{children}</div>
    </Collapse>
  );
}

function OptionAlphaOrigin() {
  // the closed summary carries the block's honest framing itself (spec
  // §11.5: "paper … no-code platform; not a proven edge"), so the claim and
  // its caveat are never split; the whole block, caveat included, is inside
  const summary = copyText("optuna.appendix.summary");
  return (
    <AppendixCollapse summary={copyVisible(summary) ? summary.text : null} className="border-t border-rule pt-tier-block dw:pt-tier-group">
      <Rise as="article">
        <Meta fields={[optionAlpha.tag]} />
        <h3 className="mt-tier-pair max-w-title type-title text-fg motion-off:transition-none">{optionAlpha.name}</h3>
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
    </AppendixCollapse>
  );
}

function Supporting() {
  return (
    <div>
      <AppendixCollapse summary={SUPPORTING_TITLE} className="border-t border-rule pt-tier-block dw:pt-tier-group">
        <Meta fields={["Supporting work"]} />
        <h3 className="mt-tier-pair type-title text-fg motion-off:transition-none">{SUPPORTING_TITLE}</h3>
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
      </AppendixCollapse>
      <AppendixCollapse summary={EARLIER_LABEL} className="mt-tier-group">
        <p className="type-small text-fg-muted">
          <span className="type-meta">{EARLIER_LABEL}</span>{" "}
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
      </AppendixCollapse>
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
