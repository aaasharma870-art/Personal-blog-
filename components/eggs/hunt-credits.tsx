"use client";

import dynamic from "next/dynamic";
import { HUNT_TOTAL, useHuntState } from "@/components/eggs/hunt-store";

/* ============================================================================
   HUNT CREDITS (PHASE3-SPEC §9.4) — OWNER: W2-HUNT.
   Pre-mounted in the credits roll (components/site/footer.tsx) right after
   <SeekerRow/>, inside its <dl>. At 12/12 it adds THE HUNT block: twelve
   rows, each role in its world's face, about the visitor ("Solemn swearer —
   you"), never a fact about Aryan. Absent at rest, on the server and below
   12 (E1); the rows are a lazy chunk (components/eggs/hunt-credits-rows.tsx).
   ========================================================================== */

const Rows = dynamic(() => import("@/components/eggs/hunt-credits-rows"), { ssr: false });

export function HuntCredits() {
  const { count } = useHuntState();
  return count === HUNT_TOTAL ? <Rows /> : null;
}
