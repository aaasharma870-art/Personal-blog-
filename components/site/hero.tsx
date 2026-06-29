import { ArrowUpRight } from "lucide-react";
import { DotGrid } from "@/components/visuals/dot-grid";
import { QuantPanel } from "@/components/visuals/quant-panel";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { Parallax } from "@/components/visuals/parallax";
import { RevealText } from "@/components/ui/reveal-text";
import { DecryptText } from "@/components/ui/decrypt-text";
import { Magnetic } from "@/components/ui/magnetic";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { GithubMark } from "@/components/ui/icons";
import { microTags, site } from "@/lib/content";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pt-28 pb-20 sm:pt-32 lg:pt-40 lg:pb-28"
    >
      {/* Generative ambient layer (Higgsfield): video on desktop, still elsewhere. */}
      <AmbientBackground
        image="/media/hero-still.png"
        video="/media/hero-loop.mp4"
        opacity={0.55}
        priority
        overlayClassName="bg-gradient-to-b from-canvas/68 via-canvas/78 to-canvas"
        className="-z-20"
      />
      {/* Signal lattice + grain on top of the media. */}
      <DotGrid className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      <div className="grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent"
        aria-hidden="true"
      />

      <div className="container-edge grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="eyebrow flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              <DecryptText text={site.heroLeadIn} />
            </p>
          </Reveal>

          <RevealText
            as="h1"
            text={site.throughline}
            className="mt-6 max-w-[18ch] text-balance font-sans text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl xl:text-[3.6rem]"
            stagger={0.045}
            delay={0.05}
          />

          <Reveal stagger className="mt-7">
            <RevealItem>
              <p className="text-sm font-medium uppercase tracking-wider text-stone">
                {site.identity} · {site.location}
              </p>
            </RevealItem>

            <RevealItem>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Magnetic strength={0.3}>
                  <a
                    href="#work"
                    className="glow-accent group inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 text-sm font-medium text-canvas transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-gold-bright hover:shadow-[0_0_0_1px_rgba(94,234,212,0.5),0_16px_50px_-12px_rgba(45,212,191,0.7)]"
                  >
                    View the quant portfolio
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </Magnetic>
                <Magnetic strength={0.3}>
                  <a
                    href={site.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-md border border-line-strong px-5 py-3 text-sm text-ink transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-gold/40"
                  >
                    <GithubMark className="h-4 w-4" />
                    GitHub
                  </a>
                </Magnetic>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-2 py-3 text-sm text-stone underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-gold/60"
                >
                  Get in touch
                </a>
              </div>
            </RevealItem>

            <RevealItem>
              <div className="mt-9 inline-flex items-center gap-3 rounded-full border border-line bg-surface/50 px-4 py-2 backdrop-blur-sm">
                <span className="eyebrow text-gold/80">Principle</span>
                <span className="editorial text-sm italic text-stone">
                  {site.principleCapsule}
                </span>
              </div>
            </RevealItem>

            <RevealItem>
              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.72rem] text-muted">
                {microTags.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>
            </RevealItem>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal>
            <Parallax amount={18}>
              <QuantPanel />
            </Parallax>
            <p className="mt-3 text-center font-mono text-[0.68rem] text-muted lg:text-right">
              A research posture, not a performance claim.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
