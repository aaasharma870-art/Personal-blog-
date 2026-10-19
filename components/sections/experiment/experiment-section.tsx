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
   - the empty head is tightened at >= 64rem (`dw:`; fix3c: it was the boot
     gate): the intro sits beside the h2, bottom-aligned, instead of under
     it, so the head's empty right half carries it and the demo comes up a
     paragraph sooner;
   - fix3c: at >= 64rem the demo's card spans the page column (it stopped at
     56rem and left 37 % of the row empty) and lays itself out in two
     columns (components/visuals/backtest-demo.tsx: title and plot left,
     toggle and explanation in a right rail). Same text, same data, no film
     styling (H4), nothing new animated;
   - the synthetic curve draws once on entry (CurveDraw: the B25 time star,
     desktop only, lazy), its "Synthetic • illustrative" label visible from
     frame 1. No film, no chalk, no world face (H4).
   ========================================================================== */
export function ExperimentSection({ entry, number }: SectionProps<"experiment">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection entry={entry} labelledBy={titleId} className="scroll-mt-24">
      <div className="contents" data-research="">
        <div className="dw:grid dw:grid-cols-12 dw:items-end dw:gap-x-6">
          <div className="dw:col-span-7">
            <Meta fields={[number, "Experiment"]} />
            <h2 id={titleId} className="mt-tier-pair max-w-title type-title text-fg">
              See the thesis, not just read it.
            </h2>
          </div>
          <p className="mt-tier-group max-w-body type-body text-fg-muted dw:col-span-5 dw:mt-0">
            A working front-end concept — clearly labelled as illustrative / simulated, never real performance or a live
            feed. It shows the interface; real exported data plugs in later.
          </p>
        </div>
        <CurveDraw choice={variantChoiceOf(entry)} className="mt-tier-block max-w-[56rem] dw:max-w-none">
          <BacktestDemo />
        </CurveDraw>
      </div>
    </WorldSection>
  );
}
