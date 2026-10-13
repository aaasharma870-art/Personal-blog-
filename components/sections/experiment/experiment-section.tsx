import { BacktestDemo } from "@/components/visuals/backtest-demo";
import { Meta, WorldSection } from "@/components/site/world-kit";
import { CurveDraw } from "@/components/sections/experiment/curve-draw";
import { variantChoiceOf } from "@/lib/sections";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   EXPERIMENT — the quiet stretch of Act II (SPEC v2 §3 row 6; manifest tone
   `raised`). M2 integrator STUB: the M1 block moved here from the retired
   `work` monolith. BacktestDemo on the raised plane with its
   SYNTHETIC • ILLUSTRATIVE label adjacent.
   H4 (RECOGNIZABILITY §3 "never overridden"): NO film styling here — no
   caption, no chalk, no icons, no fan face. It is synthetic research UI and
   must never read as evidence or as a film scene.
   P3-4 (PHASE3-SPEC §5.1): the whole section is research data — one
   `data-research` island (display: contents, so no box changes), so no world
   type role reaches it: at ≥ 64rem every line, the h2 included, is Geist /
   Geist Mono inside Act II's 3 Idiots plane (app/p3/type.css); below 64rem
   it renders as before.
   PHASE 3 (W3-IDIOTS; PHASE3-SPEC §2.2 row 9, §2.3 B25):
   - the empty head is tightened under the boot gate (`boot:` only, so
     phones, touch, reduced motion and a paused boot keep today's stack):
     the intro sits beside the h2, bottom-aligned, instead of under it, so
     the head's empty right half carries it and the demo comes up a
     paragraph sooner;
   - the synthetic curve draws once on entry (CurveDraw: the B25 time star,
     desktop only, lazy), its "Synthetic • illustrative" label visible from
     frame 1. No film, no chalk, no world face (H4).
   ========================================================================== */
export function ExperimentSection({ entry, number }: SectionProps<"experiment">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection entry={entry} labelledBy={titleId} className="scroll-mt-24">
      <div className="contents" data-research="">
        <div className="boot:grid boot:grid-cols-12 boot:items-end boot:gap-x-6">
          <div className="boot:col-span-7">
            <Meta fields={[number, "Experiment"]} />
            <h2 id={titleId} className="mt-tier-pair max-w-title type-title text-fg motion-off:transition-none">
              See the thesis, not just read it.
            </h2>
          </div>
          <p className="mt-tier-group max-w-body type-body text-fg-muted boot:col-span-5 boot:mt-0">
            A working front-end concept — clearly labelled as illustrative / simulated, never real performance or a live
            feed. It shows the interface; real exported data plugs in later.
          </p>
        </div>
        <CurveDraw choice={variantChoiceOf(entry)} className="mt-tier-block max-w-[56rem]">
          <BacktestDemo />
        </CurveDraw>
      </div>
    </WorldSection>
  );
}
