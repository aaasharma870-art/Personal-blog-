import { ArrowUpRight } from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { MetricTile } from "@/components/site/metric-tile";
import { FilmQuote } from "@/components/site/film-quote";
import { RanchoCircle, Schematic, type SchematicNode } from "@/components/site/idiots-chalk";
import { Meta, WorldSection } from "@/components/site/world-kit";
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
import type { ChapterAppendix } from "@/lib/page";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   CHAPTER — one flagship project as its own section (SPEC v2 §3 rows 4–5,
   SM-7 "Honest chalk"; Act II · idiots canvas). M2 integrator STUB: the M1
   chapter markup moved here verbatim from the retired `work` monolith
   (components/site/projects.tsx), so the page reads exactly as before while
   the act2-idiots builder fills SM-7 + RECOGNIZABILITY S09:
     - frame the blueprint panel as an ICE chalkboard (wood frame, chalk
       ledge with a chalk stub and a felt duster, slate-green margin);
     - <SceneCaption k="cap.trading-algos" place="under"> under the panel;
       for optuna-screener the caption IS the lettered machine line:
       <SceneCaption k="cap.optuna-screener"> (Q-3I-3 in Kalam chalk) —
       it replaces the Meta FilmQuote caption below. NEVER beside a metric.
     - the one chalk circle around the CAVEAT, never the number (kept).
   The section's h2 is the project name (one h1 on the page: the name).
   `props.appendix` renders the Option Alpha origin and the supporting list
   after the LAST chapter (they lived at the end of `work`).
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

function ChapterBody({ p, figNo, number, titleId }: { p: Project; figNo: number; number?: string; titleId: string }) {
  const s = schematicOf(p);
  const stages = s ? s.nodes.length + (s.fork ? 1 : 0) : 0;
  const isOptuna = p.id === "optuna-screener";
  return (
    <div className="grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:gap-x-6">
      {/* the facts column: claims with their limitations beside them */}
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
        <p className="mt-tier-group type-meta text-fg-ghost">[ chart slot — drop a real exported equity curve / report here ]</p>
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
    <WorldSection entry={entry} labelledBy={titleId} className="scroll-mt-24">
      <ChapterBody p={p} figNo={i + 1} number={number} titleId={titleId} />
      {appendix.length ? (
        <div className="mt-tier-block space-y-tier-block">
          {appendix.map((a) => (
            <Appendix key={a} kind={a} />
          ))}
        </div>
      ) : null}
    </WorldSection>
  );
}
