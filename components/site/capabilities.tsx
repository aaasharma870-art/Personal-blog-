import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { ScanLine } from "@/components/visuals/scan-line";
import { capabilities } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Microscope, Activity, Cpu, ShieldCheck, Languages } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Split a delimited spec string ("a, b · c") into trimmed, non-empty chips.
 * Paren-aware: commas/dots INSIDE parentheses are not delimiters, so a value like
 * "…Mandarin (6 yrs, advanced)" yields one clean chip, not "Mandarin (6 yrs" +
 * "advanced)". Only top-level "," and "·" split.
 */
function toChips(value: string): string[] {
  const chips: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === "·") && depth === 0) {
      chips.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  chips.push(current);
  return chips.map((t) => t.trim()).filter((t) => t.length > 0);
}

/** One lucide glyph per capability row, in data order (aria-hidden, aqua). */
const ICONS: LucideIcon[] = [Microscope, Activity, Cpu, ShieldCheck, Languages];

/** Asymmetric bento spans: cell 0 is the large hero cell. */
const SPANS: string[] = [
  "sm:col-span-2 lg:col-span-2 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "sm:col-span-2 lg:col-span-2",
];

function Chips({ label, value }: { label: string; value: string }) {
  const chips = toChips(value);
  return (
    <div>
      <span className="eyebrow mb-2 block text-muted">{label}</span>
      <ul className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <li
            key={chip}
            className="rounded-full border border-line bg-surface/60 px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-stone"
          >
            {chip}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Capabilities() {
  return (
    <Section
      id="systems"
      seam
      rhythm="tight"
      backdrop={
        <AmbientBackground
          image="/media/still-blueprint.png"
          opacity={0.24}
          overlayClassName="bg-gradient-to-b from-canvas/82 via-canvas/86 to-canvas/92"
        />
      }
    >
      <SectionHeading
        index="04"
        eyebrow="Systems · Capabilities"
        title="What I can actually do."
        intro="A working map, not a skills cloud: the methods I rely on, the tools behind them, and what they are meant to produce."
        variant="right"
      />

      {/* Monospace schema header (decorative, honest label, aria-hidden). */}
      <div
        aria-hidden="true"
        className="mt-10 flex items-center justify-between border-b border-line pb-3 font-mono text-[0.7rem] uppercase tracking-wider text-muted"
      >
        <span>area · methods · tools · outputs</span>
        <span className="hidden sm:inline">capabilities.schema</span>
      </div>

      <Reveal
        stagger
        role="list"
        ariaLabel="Capabilities matrix"
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-fr"
      >
        {capabilities.map((c, i) => {
          const Icon = ICONS[i] ?? Microscope;
          const isHero = i === 0;
          return (
            <RevealItem
              key={c.area}
              role="listitem"
              className={cn(
                "relative flex flex-col gap-4 overflow-hidden rounded-lg border border-line bg-surface/70 p-5 shadow-[inset_0_1px_0_0_rgba(230,237,243,0.05),0_16px_36px_-18px_rgba(0,0,0,0.7)] sm:p-6",
                SPANS[i] ?? "",
                isHero && "bg-elevated/70",
              )}
            >
              {/* Hero cell carries the site's single amber accent (a corner glow). */}
              {isHero ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[radial-gradient(circle,rgba(244,183,64,0.12),transparent_70%)]"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.08),transparent_70%)]"
                />
              )}

              {isHero ? <ScanLine /> : null}

              <div className="relative flex items-center justify-between">
                <span className="font-mono text-[0.7rem] uppercase tracking-wider text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-5 text-aqua"
                />
              </div>

              <h3
                className={cn(
                  "relative font-serif font-medium text-ink",
                  isHero ? "text-2xl" : "text-xl",
                )}
              >
                {c.area}
              </h3>

              <p className="relative text-sm leading-relaxed text-stone">
                {c.methods}
              </p>

              <div className="relative mt-auto flex flex-col gap-4">
                <Chips label="Tools" value={c.tools} />
                <Chips label="Outputs" value={c.outputs} />
              </div>
            </RevealItem>
          );
        })}
      </Reveal>
    </Section>
  );
}
