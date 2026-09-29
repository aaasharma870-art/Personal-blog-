import { pillars } from "@/lib/content";
import { RhumbRose } from "@/components/site/pirates-instruments";
import { Rise } from "@/components/site/world-motion";
import { Meta } from "@/components/site/world-kit";

/**
 * The four pillars as four BEARINGS on a rhumb rose (TA-06, SPEC v2 §3 row
 * 1). Desktop: a 2 × 2 chart whose centre cross holds the brass rose (drawn
 * once); each pillar sits in its quadrant under a Meta bearing. Below lg the
 * rose leads a plain list. Copy verbatim (content.ts `pillars`).
 */
const BEARINGS = ["NW", "NE", "SW", "SE"] as const;

export function AboutPillars() {
  return (
    <div className="relative">
      {/* the rose: in the centre cross on desktop, leading the list below */}
      <div className="mb-tier-group lg:pointer-events-none lg:absolute lg:left-1/2 lg:top-1/2 lg:mb-0 lg:-translate-x-1/2 lg:-translate-y-1/2">
        <RhumbRose size={132} className="size-24 lg:size-[8.25rem]" />
      </div>
      <ol
        aria-label="Four operating pillars"
        className="grid grid-cols-1 gap-y-tier-block sm:grid-cols-2 sm:gap-x-12 lg:gap-x-40 lg:gap-y-24"
      >
        {pillars.map((p, i) => (
          <Rise as="li" key={p.index} delay={i * 0.06} className="max-w-[34ch]">
            <Meta fields={[p.index, BEARINGS[i] ?? null]} />
            <h3 className="mt-tier-pair type-heading text-fg">{p.title}</h3>
            <p className="mt-tier-pair type-body text-fg-muted">{p.body}</p>
          </Rise>
        ))}
      </ol>
    </div>
  );
}
