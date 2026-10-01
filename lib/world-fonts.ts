/* ============================================================================
   WORLD FONTS — lazy per-world type faces (PHASE3-SPEC §5.5; owner B1-TYPE).
   A world is "ready" when `html[data-fonts~="<world>"]` holds its token;
   app/globals.css ("world type", ≥ 64rem only) maps the token to the world's
   `--font-world-<world>-<role>-live` faces, so its head / body / lead text
   switches face and the browser fetches the files. <WorldFonts/>
   (components/providers/world-fonts.tsx) adds tokens as worlds approach,
   from warm-up ladder step 5; the chapter select, the fast lane and anchor
   jumps call `markWorldFontsReady()` and await it before the cut.

   Below 64rem (DESKTOP_WIDE false) the token is still added (the CSS keys
   on it only at ≥ 64rem, so it is inert) but nothing is fetched or awaited:
   phones keep today's fonts. Client only; resolves at once on the server.
   ========================================================================== */

import { DESKTOP_WIDE } from "./flags";
import type { WorldId } from "./worlds";

/** A world's faces as `[css var on <html>, weight]` (lib/fonts.ts, app/
 *  globals.css). The rdr2 hand (≤ 4 words a page) is left to load on use. */
const FACES: Readonly<Record<WorldId, readonly (readonly [string, number])[]>> = {
  house: [],
  pirates: [
    ["--font-name-pirates", 400],
    ["--font-world-pirates-body", 500],
  ],
  idiots: [
    ["--font-world-idiots-head", 700],
    ["--font-world-idiots-lead", 400],
  ],
  rdr2: [
    ["--font-world-rdr2-head", 400],
    ["--font-world-rdr2-body", 400],
  ],
  hp: [
    ["--font-world-hp-head", 400],
    ["--font-world-hp-body", 400],
  ],
};

/** The worlds whose token is on <html> (client; empty on the server). */
export function worldFontsMarked(): ReadonlySet<string> {
  if (typeof document === "undefined") return new Set();
  return new Set((document.documentElement.dataset.fonts ?? "").split(/\s+/).filter(Boolean));
}

/** Add `world`'s token; true when it was not there yet. */
function addToken(world: WorldId): boolean {
  const root = document.documentElement;
  const tokens = new Set((root.dataset.fonts ?? "").split(/\s+/).filter(Boolean));
  if (tokens.has(world)) return false;
  tokens.add(world);
  root.dataset.fonts = [...tokens].join(" ");
  return true;
}

/** Mark `world`'s faces live and resolve when they have loaded, or after
 *  `timeoutMs` (default 300 ms), whichever comes first. Never rejects. On
 *  phones (below DESKTOP_WIDE) and for "house" it resolves at once. */
export function markWorldFontsReady(world: WorldId, timeoutMs = 300): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  addToken(world);
  const fonts = document.fonts;
  const wide = typeof window.matchMedia === "function" && window.matchMedia(DESKTOP_WIDE).matches;
  if (!wide || !fonts || typeof fonts.load !== "function" || FACES[world].length === 0) return Promise.resolve();
  const style = window.getComputedStyle(document.documentElement);
  const loads = FACES[world].map(([v, weight]) => {
    const family = style.getPropertyValue(v).trim();
    return family ? fonts.load(`${weight} 1em ${family}`).then(
      () => undefined,
      () => undefined,
    ) : Promise.resolve();
  });
  return new Promise<void>((resolve) => {
    const t = window.setTimeout(resolve, Math.max(0, timeoutMs));
    void Promise.all(loads).then(() => {
      window.clearTimeout(t);
      resolve();
    });
  });
}
