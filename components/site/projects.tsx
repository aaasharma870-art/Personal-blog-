import { ArrowUpRight } from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { GauntletTabs } from "@/components/site/gauntlet-tabs";
import { BacktestDemo } from "@/components/visuals/backtest-demo";
import { MetricTile } from "@/components/site/metric-tile";
import { Ledger } from "@/components/site/ledger-reckoning";
import { FilmQuote } from "@/components/site/film-quote";
import { ChalkUnderline, RanchoCircle, Schematic, type SchematicNode } from "@/components/site/idiots-chalk";
import { Meta, SectionHead, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import {
  earlierRepos,
  featuredProjects,
  gauntlet,
  optionAlpha,
  supportingProjects,
  survivors,
  type Project,
} from "@/lib/content";
import { quotes } from "@/lib/quotes";
import { copyVisible, worldOf } from "@/lib/sections";
import { planeAttrs } from "@/lib/worlds";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   WORK — the gauntlet on the dawn board (Act II "The Workshop", idiots
   canvas; SPEC v2 §3 rows 3–8, SM-6/7/8). M1: the chapters, the experiment
   and the kill-list still render INSIDE this section (their manifest
   entries are data stubs, enabled:false); each keeps its SPEC anchor here
   (#trading-algos, #optuna-screener, #experiment, #kill-list). Whoever enables
   one of those entries removes its block from this file in the same change.

   The workshop at first light: the board's top margin carries one line from
   the film (FilmQuote, chalk-underlined), the seven real gates derive in
   chalk, each flagship's cover IS a true blueprint schematic (jugaad
   register) with Rancho's circle around the CAVEAT, never the number
   (≤ 3 chalk marks in this section: the underline + two circles). The
   graph-grid ground thins to nothing before the ledger (3I-07). Retired
   here: the backdrop video, spotlight cards, generated covers, count-ups,
   glow boxes, bordered tag pills and the simulated "live" ticker.
   ========================================================================== */

/** Each flagship's schematic: nodes ONLY from content.ts approach/stack
 *  (SPEC SM-7; "machine for show" is banned, H4). Counts are derived. */
function schematicOf(p: Project): { nodes: SchematicNode[]; fork?: readonly [SchematicNode, SchematicNode] } | null {
  if (p.id === "trading-algos") {
    return {
      nodes: [
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
      nodes: [
        { label: "Strategy file / discovery", note: "entry_fn • exit_fn" },
        { label: "Indicators", note: "computed per strategy" },
        { label: "Optuna TPE", note: "walk-forward" },
        { label: "Stress tests", note: "Monte Carlo • noise" },
        { label: "25% holdout", note: "never optimized on" },
        { label: "Report", note: "Plotly HTML" },
      ],
    };
  }
  return null;
}

function Chapter({ p, figNo }: { p: Project; figNo: number }) {
  const s = schematicOf(p);
  const stages = s ? s.nodes.length + (s.fork ? 1 : 0) : 0;
  const isOptuna = p.id === "optuna-screener";
  const titleId = `${p.id}-title`;
  return (
    <article id={p.id} aria-labelledby={titleId} className="scroll-mt-24 border-t border-rule pt-tier-block">
      <div className="grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:gap-x-6">
        {/* the facts column: claims with their limitations beside them */}
        <div className="lg:col-span-7">
          <Meta fields={[p.status]} />
          <h3 id={titleId} className="mt-tier-pair max-w-title type-title text-fg">
            {p.name}
          </h3>
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

          <div className="mt-tier-block space-y-tier-group">
            <div>
              <Meta fields={["The problem"]} />
              <p className="mt-tier-pair max-w-body type-body text-fg-muted">{p.problem}</p>
            </div>
            <div>
              <Meta fields={["Approach"]} />
              <ul className="mt-tier-pair max-w-body list-disc space-y-2 pl-5 type-body text-fg-muted marker:text-fg-ghost">
                {p.approach.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <dl className="mt-tier-block grid grid-cols-1 gap-tier-group sm:grid-cols-3">
            {p.metrics.map((m, i) => (
              <MetricTile key={m.label} m={m} circleNote={isOptuna && i === p.metrics.length - 1} />
            ))}
          </dl>

          <div className="mt-tier-block grid grid-cols-1 gap-tier-group sm:grid-cols-2">
            <div>
              <Meta fields={["What I learned"]} />
              <p className="mt-tier-pair type-body text-fg-muted">{p.learned}</p>
            </div>
            <div>
              <Meta fields={["Honest limitations"]} />
              {isOptuna ? (
                <p className="mt-tier-pair type-body text-fg-muted">{p.limitations}</p>
              ) : (
                <RanchoCircle block className="mt-tier-pair">
                  <p className="type-body text-fg-muted">{p.limitations}</p>
                </RanchoCircle>
              )}
            </div>
          </div>

          <div className="mt-tier-group">
            <Meta fields={["Stack", p.stack.join(" · ")]} />
          </div>
          {/* Honest chart slot: a marked placeholder, never a fabricated curve. */}
          <p className="mt-tier-group type-meta text-fg-ghost">
            [ chart slot — drop a real exported equity curve / report here ]
          </p>
        </div>

        {/* the cover IS the real system, drawn as a blueprint (≤ 40 %) */}
        <div className="lg:col-span-5">
          {s ? (
            <div className="lg:sticky lg:top-24">
              <Schematic
                fig={`FIG. ${figNo} • ${p.repo} • ${stages} stages`}
                nodes={s.nodes}
                fork={s.fork}
                caption={isOptuna ? <FilmQuote id="Q-3I-3" rendition="caption" /> : undefined}
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Experiment({ world }: { world: ReturnType<typeof worldOf> }) {
  return (
    // The experiment's own plane (manifest: tone raised): a full-bleed raised
    // band painted without widening the page (box-shadow + clip-path trick).
    <div
      id="experiment"
      {...planeAttrs("raised", world)}
      className="scroll-mt-24 bg-bg py-tier-block text-fg shadow-[0_0_0_100vmax_var(--bg)] [clip-path:inset(0_-100vmax)]"
    >
      <Meta fields={["Experiment"]} />
      <h3 className="mt-tier-pair max-w-title type-title text-fg">See the thesis, not just read it.</h3>
      <p className="mt-tier-group max-w-body type-body text-fg-muted">
        A working front-end concept — clearly labelled as illustrative / simulated, never real performance or a
        live feed. It shows the interface; real exported data plugs in later.
      </p>
      <div className="mt-tier-block max-w-[56rem]">
        <BacktestDemo />
      </div>
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
      <div className="mt-tier-group grid grid-cols-1 gap-tier-group lg:grid-cols-12 lg:gap-x-6">
        <p className="max-w-body type-body text-fg lg:col-span-6">{optionAlpha.summary}</p>
        <div className="space-y-tier-group lg:col-span-6">
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
          <li key={s.repo} className="grid grid-cols-1 gap-2 border-b border-rule py-5 sm:grid-cols-[16rem_1fr_auto] sm:items-baseline sm:gap-6">
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
            {i < earlierRepos.length - 1 ? <span aria-hidden="true" className="text-fg-ghost">{" • "}</span> : null}
          </span>
        ))}
      </p>
    </div>
  );
}

export function Projects({ entry, number }: SectionProps<"gauntlet">) {
  const titleId = `${entry.id}-title`;
  const world = worldOf(entry);
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

      {/* ── the chapters (their own SPEC sections from M2) ─────────────── */}
      <div className="mt-tier-block space-y-tier-block">
        {featuredProjects.map((p, i) => (
          <Chapter key={p.id} p={p} figNo={i + 1} />
        ))}
      </div>

      {/* ── the experiment: the quiet stretch (raised; no chalk, no icons) ── */}
      <div className="mt-tier-block">
        <Experiment world={world} />
      </div>

      {/* ── the reckoning ───────────────────────────────────────────── */}
      <div className="mt-tier-block border-t border-rule pt-tier-block">
        <Ledger />
      </div>

      <div className="mt-tier-block space-y-tier-block">
        <OptionAlphaOrigin />
        <Supporting />
      </div>
    </WorldSection>
  );
}
