/* ============================================================================
   HYDRATED — "React has hydrated every section" (Oct 18, fix3a; HYDRATION-418).
   <PageHydrated/> (components/site/page-hydrated.tsx) is the LAST Suspense
   child of the home page, so its effect runs after every section boundary
   before it: it sets `window.__pageHydrated` and emits "page:hydrated".
   Anything that reaches into the server markup of a boundary from OUTSIDE
   it (the stage's portals into the split windows, the enhancer's binders)
   must wait for it. Before, they ran at ladder steps 2 / 3, which do not
   wait for hydration: on a slow CPU a visitor who pressed "Skip to the
   research" at ~1 s made the stage mount a layer inside the Work chapters'
   windows before their boundary had hydrated, and React threw #418
   ("Hydration failed … the tree is regenerated on the client").
   Client only; on the server nothing is hydrated.
   ========================================================================== */

import { on } from "./events";

/** True once every section boundary has hydrated. */
export function pageHydrated(): boolean {
  return typeof window !== "undefined" && Boolean(window.__pageHydrated);
}

/** Subscribe to the hydration sentinel (for useSyncExternalStore). */
export function subscribePageHydrated(onChange: () => void): () => void {
  return on("page:hydrated", onChange);
}

/** Resolves once the page has hydrated, or after `capMs` (a page that never
 *  hydrates is not worth waiting for forever; default 30 s). */
export function whenPageHydrated(capMs = 30_000): Promise<void> {
  if (pageHydrated()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    let off = () => {};
    const done = () => {
      off();
      window.clearTimeout(t);
      resolve();
    };
    const t = window.setTimeout(done, capMs);
    off = on("page:hydrated", done);
  });
}
