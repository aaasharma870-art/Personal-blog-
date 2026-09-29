import { principles } from "@/lib/content";
import { slot } from "@/lib/sections";
import { Meta, SectionHead, WorldSection } from "@/components/site/world-kit";
import { Rise } from "@/components/site/world-motion";
import { PatronusRibbons } from "@/components/site/hp-ink";
import type { SectionProps } from "@/components/sections/types";

/**
 * Principles — five numbered rows (SPEC v2 §3 row 13; Act IV "The Light",
 * hp canvas: candle-night ground). Ideas condensing out of the dark: on
 * entry, silver-blue ribbons converge ONCE into the underline of each title
 * (HP-07, the hp `ribbon` emphasis slot — in another world the rows render
 * plain). Numbers and "after …" attributions are Meta, roman; body verbatim
 * content.ts. Retired: ghost numerals, the parallax/ignite numeral, the
 * decrypting thinker chips, the aqua hover rail (SPEC §11.3).
 */
export function Principles({ entry, number }: SectionProps<"principles">) {
  const titleId = `${entry.id}-title`;
  const ribbons = slot(entry, "emphasis") === "ribbon";
  return (
    <WorldSection entry={entry} labelledBy={titleId}>
      <SectionHead
        id={titleId}
        number={number}
        label={entry.nav?.label ?? "Principles"}
        title="A small philosophy of work."
        intro="Five ideas I actually use when I build. The names are sources, not decoration."
      />

      <ol aria-label="Operating principles" className="mt-tier-block border-t border-rule">
        {principles.map((p, i) => (
          <Rise
            as="li"
            key={p.n}
            delay={Math.min(i, 3) * 0.05}
            className="grid grid-cols-1 gap-tier-pair border-b border-rule py-tier-block sm:grid-cols-12 sm:gap-x-6"
          >
            <Meta className="sm:col-span-2" fields={[p.n]} />
            <div className="sm:col-span-7">
              <h3 className="type-title text-fg">{p.title}</h3>
              {ribbons ? <PatronusRibbons className="mt-tier-pair" /> : null}
              <p className="mt-tier-group max-w-body type-body text-fg-muted">{p.body}</p>
            </div>
            {p.thinker ? (
              <Meta className="sm:col-span-3 sm:text-right" fields={[p.thinker]} />
            ) : null}
          </Rise>
        ))}
      </ol>
    </WorldSection>
  );
}
