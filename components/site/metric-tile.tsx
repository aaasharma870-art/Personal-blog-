import type { Metric } from "@/lib/content";
import { RanchoCircle } from "@/components/site/idiots-chalk";
import { beatAttrs } from "@/lib/beats";

/**
 * MetricTile — one figure as a plain facts row (DESIGN v3: no cards, no glow,
 * no count-up — every figure is STATIC text, ratios above all, so the
 * numbers read soberly). The Meta label, the value in `heading` with tabular
 * figures, the note in `small`. `circleNote` puts Rancho's chalk circle
 * around the note when the note IS the caveat (SPEC TA-07: "anything > 2.0
 * is a red flag") — never around the value.
 * `data-research` (PHASE3-SPEC §5.5): a data island — the world type roles
 * reset inside it, so the tile stays Geist / Geist Mono in every world.
 */
export function MetricTile({ m, circleNote = false }: { m: Metric; circleNote?: boolean }) {
  return (
    <div className="border-t border-rule pt-tier-pair" data-research="">
      <dt className="type-meta text-fg-muted">{m.label}</dt>
      <dd className="mt-1">
        <span className="tnum block type-heading text-fg">{m.value}</span>
        {m.note ? (
          circleNote ? (
            <RanchoCircle className="mt-2" {...beatAttrs("B24", { weight: 1 })}>
              <span className="type-small text-fg-muted">{m.note}</span>
            </RanchoCircle>
          ) : (
            <span className="mt-1 block type-small text-fg-muted">{m.note}</span>
          )
        ) : null}
      </dd>
    </div>
  );
}
