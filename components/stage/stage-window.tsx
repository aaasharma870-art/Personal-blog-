import type { StageCue } from "@/lib/stage";

/* ============================================================================
   STAGE WINDOW (spec §3.2, split mode) — OWNER: B1-STAGE.
   Server markup: the sticky SSR poster of a split section's stage window,
   transparent once the stage is live (`stage-live:` variant).
   W1.0 stub: renders nothing.
   ========================================================================== */

export type StageWindowProps = {
  section: string;
  cue: StageCue;
  side: "left" | "right";
};

export function StageWindow(props: StageWindowProps): null {
  void props;
  return null;
}
