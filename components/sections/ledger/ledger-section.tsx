import { Ledger } from "@/components/site/ledger-reckoning";
import { WorldSection } from "@/components/site/world-kit";
import type { SectionProps } from "@/components/sections/types";

/* ============================================================================
   LEDGER — the kill-list as its own section (SPEC v2 §3 row 8, SM-8 "The
   reckoning"; signature; Act II · idiots canvas). M2 integrator STUB: the M1
   austere ledger (components/site/ledger-reckoning.tsx) inside the section
   that owns #kill-list (the Dead Eye egg's host, SM-17).
   The act2-idiots builder fills SM-8 + RECOGNIZABILITY S11 / O-5:
     - the HEADER cue only: Virus's astronaut pen (SVG, 96 px, aria-hidden)
       by the "N SURVIVED" Meta + <SceneCaption k="cap.kill-list"
       place="head"> right of the h2 (pass both through Ledger `headExtra`
       or restructure). Rows stay D-6 austere: no icons, no chalk at rest.
     - T5: the idiots grid thins to 0 by the last row and the ground
       crossfades --idi-canvas → --color-deep over the last 30vh.
     - variants: "kill-list.reckoning" (lib/variants.ts) needs its ALT.
   ========================================================================== */
export function LedgerSection({ entry, number }: SectionProps<"ledger">) {
  const titleId = `${entry.id}-title`;
  return (
    <WorldSection entry={entry} labelledBy={titleId} className="scroll-mt-24">
      <Ledger titleId={titleId} number={number} />
    </WorldSection>
  );
}
