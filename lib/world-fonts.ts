/* ============================================================================
   WORLD FONTS — lazy per-world display/type faces (PHASE3-SPEC §5.5). A
   world is "ready" when `html[data-fonts~="<world>"]` holds its token; CSS
   maps the token to the world's `--font-world-<w>-live` faces (≥ 64rem only;
   B1-TYPE writes those rules). <WorldFonts/> (components/providers/
   world-fonts.tsx) adds tokens as worlds approach; the chapter select, the
   fast lane and anchor jumps call `markWorldFontsReady()` before the cut.

   W1.0: adds the token and waits for `document.fonts.ready` (capped at
   `timeoutMs`). No CSS keys on the token yet, so nothing changes on screen.
   B1-TYPE replaces the wait with `document.fonts.load()` of that world's
   faces. Client only; resolves at once on the server.
   ========================================================================== */

import type { WorldId } from "./worlds";

export function markWorldFontsReady(world: WorldId, timeoutMs = 300): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const root = document.documentElement;
  const tokens = new Set((root.dataset.fonts ?? "").split(/\s+/).filter(Boolean));
  if (!tokens.has(world)) {
    tokens.add(world);
    root.dataset.fonts = [...tokens].join(" ");
  }
  const ready = document.fonts?.ready ?? Promise.resolve();
  return new Promise<void>((resolve) => {
    const t = window.setTimeout(resolve, timeoutMs);
    ready.then(
      () => {
        window.clearTimeout(t);
        resolve();
      },
      () => resolve(),
    );
  });
}
