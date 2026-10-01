"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CutOverlay } from "@/components/director/cut-overlay";

/* ============================================================================
   STAGE LAYERS (spec §3.2) — OWNER: B1-STAGE.
   <StageLayers/> is mounted by app/page.tsx before <main>: the fixed
   containers for everything that must sit above the page and under the
   header (the z tokens in app/globals.css):
     game-hud --z-game-hud 25 · stop --z-stop 30 · toast --z-toast 32 ·
     cut --z-cut 35 (below the header's 40, so the fast lane never hides).
   Nothing fixed renders inside <main> (main is `relative z-[var(--z-main)]`,
   a stacking context at 1: a fixed layer inside it could never rise above
   the bars or the header). Layers that belong UNDER text (the wand bloom,
   the Dead Eye grade, weather in split windows) stay inside their section.

   Each container is its own fixed element in the root stacking context (a
   wrapper would trap their z-indexes), pointer-events none (children opt
   back in) and `display:none` while empty, so an unused layer costs
   nothing. The markup is identical on the server and every device.

   <StageLayerPortal layer> portals its children into that layer's container
   once it exists (after mount: nothing portals on the server, so SSR and
   hydration are unchanged). The director's-cut overlay (<CutOverlay/>,
   B1-SCROLL) renders in the "cut" layer.
   ========================================================================== */

export type StageLayer = "cut" | "stop" | "game-hud" | "toast";

const LAYERS: readonly { layer: StageLayer; z: string }[] = [
  { layer: "game-hud", z: "var(--z-game-hud)" },
  { layer: "stop", z: "var(--z-stop)" },
  { layer: "toast", z: "var(--z-toast)" },
  { layer: "cut", z: "var(--z-cut)" },
];

/* — the container registry (module-level; one <StageLayers/> per page) — */
const containers = new Map<StageLayer, HTMLElement>();
const listeners = new Set<() => void>();

function register(layer: StageLayer, el: HTMLElement | null): void {
  if (el) containers.set(layer, el);
  else containers.delete(layer);
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Portal `children` into the fixed container of `layer` (null until it
 *  exists, and on the server). */
export function StageLayerPortal({ layer, children }: { layer: StageLayer; children?: ReactNode }) {
  const target = useSyncExternalStore(
    subscribe,
    () => containers.get(layer) ?? null,
    () => null,
  );
  return target ? createPortal(children, target) : null;
}

/** The fixed layer containers + the director's-cut overlay in "cut". */
export function StageLayers() {
  return (
    <>
      {LAYERS.map(({ layer, z }) => (
        <div
          key={layer}
          ref={(el) => {
            register(layer, el);
            return () => register(layer, null);
          }}
          data-stage-layers={layer}
          className="pointer-events-none fixed inset-0 empty:hidden"
          style={{ zIndex: z }}
        />
      ))}
      <StageLayerPortal layer="cut">
        <CutOverlay />
      </StageLayerPortal>
    </>
  );
}
