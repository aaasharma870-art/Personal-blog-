import { BacktestDemo } from "@/components/visuals/backtest-demo";
import { Meta, WorldSection } from "@/components/site/world-kit";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   EXPERIMENT — the quiet stretch of Act II (SPEC v2 §3 row 6; manifest tone
   `raised`). M2 integrator STUB: the M1 block moved here from the retired
   `work` monolith. BacktestDemo on the raised plane with its
   SYNTHETIC • ILLUSTRATIVE label adjacent.
   H4 (RECOGNIZABILITY §3 "never overridden"): NO film styling here — no
   caption, no chalk, no icons, no fan face. It is synthetic research UI and
   must never read as evidence or as a film scene.
   ========================================================================== */
export function ExperimentSection({ entry, number }: SectionProps<"experiment">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection entry={entry} labelledBy={titleId} className="scroll-mt-24">
      <Meta fields={[number, "Experiment"]} />
      <h2 id={titleId} className="mt-tier-pair max-w-title type-title text-fg">
        See the thesis, not just read it.
      </h2>
      <p className="mt-tier-group max-w-body type-body text-fg-muted">
        A working front-end concept — clearly labelled as illustrative / simulated, never real performance or a live
        feed. It shows the interface; real exported data plugs in later.
      </p>
      <div className="mt-tier-block max-w-[56rem]">
        <BacktestDemo />
      </div>
    </WorldSection>
  );
}
