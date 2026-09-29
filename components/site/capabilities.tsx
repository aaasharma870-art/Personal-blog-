import { capabilities, featuredProjects } from "@/lib/content";
import { Schematic } from "@/components/site/idiots-chalk";
import { Meta, SectionHead, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { actCards, acts, enabledSections, worksInUse } from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";

/**
 * Systems — the capabilities matrix (Act II, idiots canvas; SPEC v2 §3 row 7,
 * SM-7 "same grammar"). A real matrix of rows (area · methods · tools ·
 * outputs; table rows are the one place rules are allowed) — the bento grid,
 * glow orbs, scan line and chip pills are retired. Beside it, FIG "How this
 * page is built": a TRUE schematic of the pipeline that renders this very
 * page, in the jugaad register; every count on it is computed from the live
 * manifest at build time. The graph grid thins here toward open air (3I-07).
 */
const COLS = [
  ["Methods", "methods"],
  ["Tools", "tools"],
  ["Outputs", "outputs"],
] as const;

export function Capabilities({ entry, number }: SectionProps<"matrix">) {
  const titleId = `${entry.id}-title`;
  const nodes = [
    { label: "lib/page.ts", note: `manifest • ${enabledSections.length} sections` },
    { label: "lib/film.ts", note: `${acts.length} acts • ${worksInUse.length} works` },
    { label: "lib/sections.ts", note: `derives ${actCards.length} act cards` },
    { label: "registry.ts", note: "type → component" },
    { label: "SectionFrame", note: "data-world × data-tone" },
  ];
  return (
    <WorldSection entry={entry} labelledBy={titleId} ground groundClassName="world-ground--fade">
      <SectionHead
        id={titleId}
        number={number}
        label={entry.nav?.label ?? "Systems"}
        title="What I can actually do."
        intro="A working map, not a skills cloud: the methods I rely on, the tools behind them, and what they are meant to produce."
      />

      <div className="mt-tier-block grid grid-cols-1 gap-tier-block lg:grid-cols-12 lg:gap-x-6">
        <div className="lg:col-span-8">
          {/* column heads (desktop); every cell also carries its own label */}
          <div
            aria-hidden="true"
            className="hidden border-b border-rule pb-tier-pair lg:grid lg:grid-cols-[9rem_1fr_1fr_1fr] lg:gap-6"
          >
            <span className="type-meta text-fg-muted">Area</span>
            {COLS.map(([label]) => (
              <span key={label} className="type-meta text-fg-muted">
                {label}
              </span>
            ))}
          </div>
          <ol aria-label="Capabilities matrix" className="border-t border-rule lg:border-t-0">
            {capabilities.map((c, i) => (
              <Rise
                as="li"
                key={c.area}
                delay={i * 0.04}
                className="grid grid-cols-1 gap-3 border-b border-rule py-tier-group lg:grid-cols-[9rem_1fr_1fr_1fr] lg:gap-6"
              >
                <h3 className="type-heading text-fg lg:text-[length:var(--text-lead)] lg:leading-[1.45]">{c.area}</h3>
                {COLS.map(([label, key]) => (
                  <dl key={key}>
                    <dt className="type-meta text-fg-muted lg:sr-only">{label}</dt>
                    <dd className="mt-1 type-small text-fg-muted lg:mt-0">{c[key]}</dd>
                  </dl>
                ))}
              </Rise>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-4">
          {/* FIG numbering continues the chapters' FIG. 1…n (M1: they render in `work`) */}
          <Schematic fig={`FIG. ${featuredProjects.length + 1} • How this page is built • ${nodes.length} stages`} nodes={nodes} />
          <Meta
            className="mt-tier-group"
            fields={["Native scroll", "CSS + SVG first", "no WebGL"]}
          />
        </div>
      </div>
    </WorldSection>
  );
}
