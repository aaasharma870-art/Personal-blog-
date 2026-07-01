import { ArrowUpRight } from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { GauntletTabs } from "@/components/site/gauntlet-tabs";
import { SpotlightCard } from "@/components/visuals/spotlight-card";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { BacktestDemo } from "@/components/visuals/backtest-demo";
import { ConceptTicker } from "@/components/visuals/concept-ticker";
import { QuantCover } from "@/components/visuals/quant-cover";
import { MetricTile } from "@/components/site/metric-tile";
import { SurvivorsPanel, KillList } from "@/components/site/ledger-reckoning";
import { Tag } from "@/components/ui/tag";
import {
  earlierRepos,
  featuredProjects,
  gauntlet,
  optionAlpha,
  supportingProjects,
  type Project,
} from "@/lib/content";

function SubHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal>
      <div className="flex items-center gap-3">
        <span className="eyebrow text-gold/80">{kicker}</span>
        <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
      </div>
      <h3 className="mt-3 font-serif text-2xl font-medium tracking-tight text-ink">
        {title}
      </h3>
    </Reveal>
  );
}

function FeaturedProject({ p }: { p: Project }) {
  return (
    <SpotlightCard accent={p.accent} tier="showcase" className="p-6 sm:p-8">
      <QuantCover src={p.cover} />
      <div className="relative z-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <code className="font-mono text-sm text-gold">{p.repo}</code>
            <Tag accent="gold">{p.status}</Tag>
          </div>
          <h3 className="mt-3 font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl">
            {p.name}
          </h3>
        </div>
        <a
          href={p.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${p.repo} on GitHub`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line text-stone transition-colors hover:border-gold/40 hover:text-ink"
        >
          <GithubMark className="h-4 w-4" />
        </a>
      </div>

      <p className="measure mt-5 text-base leading-relaxed text-stone">
        {p.summary}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div>
            <p className="eyebrow mb-2">The problem</p>
            <p className="text-sm leading-relaxed text-stone">{p.problem}</p>
          </div>
          <div>
            <p className="eyebrow mb-3">Approach</p>
            <ul className="space-y-2.5">
              {p.approach.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-stone">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold/70"
                    aria-hidden="true"
                  />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-2">What I learned</p>
              <p className="text-sm leading-relaxed text-stone">{p.learned}</p>
            </div>
            <div>
              <p className="eyebrow mb-2 text-ember/80">Honest limitations</p>
              <p className="text-sm leading-relaxed text-stone">{p.limitations}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <Reveal
            stagger
            role="list"
            ariaLabel={`${p.name} — key figures`}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1"
          >
            {p.metrics.map((m) => (
              <RevealItem key={m.label} role="listitem">
                <MetricTile m={m} />
              </RevealItem>
            ))}
          </Reveal>

          <div className="mt-5">
            <p className="eyebrow mb-3">Stack</p>
            <div className="flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <Tag key={s} interactive>
                  {s}
                </Tag>
              ))}
            </div>
          </div>

          <a
            href={p.href}
            target="_blank"
            rel="noreferrer noopener"
            className="group mt-6 inline-flex items-center gap-1.5 text-sm text-gold transition-colors hover:text-gold-bright"
          >
            View on GitHub
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* Honest, real-data chart slot — left as a clearly-marked placeholder
              rather than a fabricated equity curve (see CLAUDE.md guardrail). */}
          <div className="mt-5 flex h-24 items-center justify-center rounded-lg border border-dashed border-line text-center">
            <span className="px-4 font-mono text-[0.68rem] leading-relaxed text-muted">
              [ chart slot — drop a real exported equity curve / report here ]
            </span>
          </div>
        </div>
      </div>
      </div>
    </SpotlightCard>
  );
}

function Gauntlet() {
  return (
    <div className="relative mt-20 isolate">
      {/* Decorative "data through the gauntlet" atmosphere — abstract, text-free,
          heavily scrimmed so the tab text stays AA-legible. aria-hidden. */}
      <AmbientBackground
        image="/media/methodology.webp"
        opacity={0.16}
        overlayClassName="bg-gradient-to-b from-canvas/82 via-canvas/86 to-canvas/92"
        className="rounded-3xl"
      />
      <div className="relative z-10">
        <SubHeading
          kicker="Inside the flagship"
          title="The seven-part validation gauntlet."
        />
        <Reveal>
          <GauntletTabs steps={gauntlet} />
        </Reveal>
      </div>
    </div>
  );
}

function SurvivorsKillList() {
  return (
    <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
      <SurvivorsPanel />
      <KillList />
    </div>
  );
}

function OptionAlphaOrigin() {
  return (
    <div className="mt-20">
      <Reveal className="rounded-xl border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Tag accent="cyan">{optionAlpha.tag}</Tag>
            <h3 className="mt-3 font-serif text-2xl font-medium tracking-tight text-ink">
              {optionAlpha.name}
            </h3>
            <code className="mt-1 block font-mono text-xs text-muted">
              {optionAlpha.repo}
            </code>
          </div>
          <a
            href={optionAlpha.href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${optionAlpha.repo} on GitHub`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line text-stone transition-colors hover:border-cyan/40 hover:text-ink"
          >
            <GithubMark className="h-4 w-4" />
          </a>
        </div>

        <p className="measure mt-5 text-base leading-relaxed text-stone">
          {optionAlpha.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-elevated/50 p-4">
          <Tag accent="muted">Paper · small sample</Tag>
          <p className="tnum text-sm text-stone">{optionAlpha.reported}</p>
        </div>

        <div className="mt-5 rounded-lg border-l-2 border-cyan/50 bg-elevated/30 p-5">
          <p className="eyebrow mb-2 text-cyan/80">Honest framing</p>
          <p className="text-sm leading-relaxed text-stone">{optionAlpha.honest}</p>
        </div>
      </Reveal>
    </div>
  );
}

function InteractiveConcepts() {
  return (
    <div className="mt-20">
      <SubHeading
        kicker="Interactive · concepts"
        title="See the thesis, not just read it."
      />
      <Reveal className="mt-4">
        <p className="measure text-sm leading-relaxed text-muted">
          Two working front-end concepts — clearly labelled as illustrative /
          simulated, never real performance or a live feed. They show the
          interface; real exported data and a serverless feed plug in later.
        </p>
      </Reveal>
      <Reveal className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <BacktestDemo />
        </div>
        <div className="lg:col-span-4">
          <ConceptTicker />
        </div>
      </Reveal>
    </div>
  );
}

function SupportingGrid() {
  return (
    <div className="mt-20">
      <SubHeading kicker="Supporting work" title="Tools, pipelines, automation." />
      <Reveal
        stagger
        role="list"
        ariaLabel="Supporting projects"
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {supportingProjects.map((s) => (
          <RevealItem key={s.repo} role="listitem">
            <SpotlightCard accent="cyan" tier="flat" className="h-full p-6">
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono text-sm text-cyan">{s.repo}</code>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${s.repo} on GitHub`}
                  className="text-stone transition-colors hover:text-ink"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone">{s.blurb}</p>
            </SpotlightCard>
          </RevealItem>
        ))}
      </Reveal>

      <Reveal className="mt-6">
        <p className="text-sm text-muted">
          <span className="eyebrow mr-2">Also on GitHub</span>
          {earlierRepos.map((r, i) => (
            <span key={r.repo}>
              <a
                href={r.href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-stone underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-gold/60"
              >
                {r.repo}
              </a>
              <span className="text-muted"> (early / idea-stage)</span>
              {i < earlierRepos.length - 1 ? <span> · </span> : null}
            </span>
          ))}
        </p>
      </Reveal>
    </div>
  );
}

export function Projects() {
  return (
    <Section
      id="work"
      seam="signature"
      rhythm="spacious"
      backdrop={
        <AmbientBackground
          image="/media/still-terminal.png"
          video="/media/v-terminal.mp4"
          opacity={0.5}
          overlayClassName="bg-gradient-to-b from-canvas/66 via-canvas/76 to-canvas/88"
        />
      }
    >
      <SectionHeading
        index="03"
        eyebrow="Work · Quant Portfolio"
        title="Led by what survived scrutiny."
        intro="The portfolio opens with the two projects I would defend in a room of people who know markets — the research and the pipeline behind it."
      />

      <Reveal variant="scale" className="mt-8">
        <p className="rounded-lg border border-line border-l-2 border-l-gold/60 bg-elevated/40 p-4 text-sm leading-relaxed text-stone shadow-[0_0_30px_-18px_rgba(45,212,191,0.6)]">
          <span className="eyebrow mr-2 text-gold/80">Standing rule</span>
          Any trading result above roughly Sharpe 2.0 is treated as curve-fit or
          data-leak until proven otherwise. The figures below are the ones that
          earned their place under that rule.
        </p>
      </Reveal>

      <div className="mt-10 space-y-8">
        {featuredProjects.map((p) => (
          <FeaturedProject key={p.id} p={p} />
        ))}
      </div>

      <Gauntlet />
      <InteractiveConcepts />
      <SurvivorsKillList />
      <OptionAlphaOrigin />
      <SupportingGrid />
    </Section>
  );
}
