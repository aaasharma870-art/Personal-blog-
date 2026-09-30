"use client";

import type { ReactNode } from "react";
import { CutOverlay } from "@/components/director/cut-overlay";

/* ============================================================================
   STAGE LAYERS (spec §3.2) — OWNER: B1-STAGE.
   <StageLayers/> is mounted by app/page.tsx before <main>: the one fixed
   container for everything that must sit above the page (the z tokens in
   app/globals.css: --z-bars, --z-game-hud, --z-stop, --z-toast, --z-cut).
   <StageLayerPortal layer> portals its children into that container at the
   layer's z token. The director's-cut overlay (<CutOverlay/>, B1-SCROLL)
   renders in the "cut" layer.
   W1.0 stub: no container; the portal renders its children in place (every
   child is itself a stub that renders nothing, so the page is unchanged).
   ========================================================================== */

export type StageLayer = "cut" | "stop" | "game-hud" | "toast";

export function StageLayerPortal({ layer, children }: { layer: StageLayer; children?: ReactNode }) {
  void layer;
  return <>{children}</>;
}

export function StageLayers() {
  return (
    <StageLayerPortal layer="cut">
      <CutOverlay />
    </StageLayerPortal>
  );
}
