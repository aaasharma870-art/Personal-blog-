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
import { cameraOwnsScroll } from "./smooth-scroll";
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

/** The block under the reading line (a bit above the middle of the
 *  viewport) whose top edge a face swap would move only by the content ABOVE
 *  it. Null at the top of the page (nothing above to change), under a fixed
 *  or sticky box (a pinned stage does not follow the document), or when
 *  nothing but the page itself is there. */
function readingAnchor(): HTMLElement | null {
  if (window.scrollY < 8) return null;
  const hit = document.elementFromPoint(window.innerWidth / 2, Math.min(window.innerHeight * 0.4, 360));
  let e: Element | null = hit;
  let block: HTMLElement | null = null;
  for (; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
    const cs = window.getComputedStyle(e);
    if (cs.position === "fixed" || cs.position === "sticky") return null;
    if (!block && e instanceof HTMLElement && !cs.display.startsWith("inline") && cs.display !== "contents") block = e;
  }
  return block;
}

/** Add `world`'s token and keep the reader where they were. The browser's own
 *  scroll anchoring is off on desktop (app/globals.css), so a face that swaps
 *  in above the viewport (Pirates: About −93 px @1440) used to move the page
 *  under a visitor who had already scrolled (Oct 18, fix3a). The anchor's top
 *  is read before and after the token; the difference is scrolled away,
 *  instantly. A glide or a wheel in flight (Lenis smooth) owns the position
 *  and is left alone, as is a camera move (the director's cut). Wide screens
 *  only; the token is the only thing that moves. */
function addTokenKeepingView(world: WorldId): void {
  let anchor: HTMLElement | null = null;
  let before = 0;
  try {
    anchor = readingAnchor();
    before = anchor ? anchor.getBoundingClientRect().top : 0;
  } catch {
    anchor = null;
  }
  if (!addToken(world) || !anchor) return;
  try {
    const dy = anchor.getBoundingClientRect().top - before;
    if (Math.abs(dy) < 1) return;
    const l = window.__lenis;
    if (cameraOwnsScroll() || (l && l.isScrolling === "smooth")) return;
    const y = Math.max(0, window.scrollY + dy);
    if (l) l.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: "instant" });
  } catch {
    /* the swap stands; only the correction is skipped */
  }
}

/** Load `world`'s faces, then mark them live (the token), and resolve —
 *  when they have loaded, or after `timeoutMs` (default 300 ms), whichever
 *  comes first. The token waits for the faces so the swap happens once,
 *  on loaded faces (never fallback → face while a slow file streams in:
 *  the W1 gate's scroll CLS was a caption swapping in view). Never
 *  rejects. On phones (below DESKTOP_WIDE) and for "house" it marks and
 *  resolves at once. */
export function markWorldFontsReady(world: WorldId, timeoutMs = 300): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const fonts = document.fonts;
  const wide = typeof window.matchMedia === "function" && window.matchMedia(DESKTOP_WIDE).matches;
  if (!wide || !fonts || typeof fonts.load !== "function" || FACES[world].length === 0) {
    addToken(world);
    return Promise.resolve();
  }
  // Read the family names BEFORE the token changes <html>: the token
  // invalidates the whole document's style, and a computed-style read
  // after it would force that restyle inside the caller (the fast lane's
  // click). The faces' vars come from next/font classes, not the token.
  const style = window.getComputedStyle(document.documentElement);
  const families = FACES[world].map(([v, weight]) => [style.getPropertyValue(v).trim(), weight] as const);
  const loads = families.map(([family, weight]) => {
    return family ? fonts.load(`${weight} 1em ${family}`).then(
      () => undefined,
      () => undefined,
    ) : Promise.resolve();
  });
  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      addTokenKeepingView(world);
      resolve();
    };
    const t = window.setTimeout(finish, Math.max(0, timeoutMs));
    void Promise.all(loads).then(() => {
      window.clearTimeout(t);
      finish();
    });
  });
}
