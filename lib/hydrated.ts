/* ============================================================================
   HYDRATED — "React has hydrated this part of the page" (Oct 18, fix3a;
   HYDRATION-418; reworked Oct 20, fix5).
   <PageHydrated/> (components/site/page-hydrated.tsx) is the LAST Suspense
   child of the home page, so its effect runs after every section boundary
   before it: it sets `window.__pageHydrated` and emits "page:hydrated".
   Anything that reaches into the server markup of a boundary from OUTSIDE
   it (the stage's portals into the split windows, the games' drone host) must
   not touch a boundary that has not hydrated: React #418 ("Hydration failed
   … the tree is regenerated on the client") on a slow CPU.
   fix3a made the WHOLE stage and the WHOLE enhancer wait for `page:hydrated`.
   In `next dev` that sentinel comes 7-27 s after load, so the hero "Director's
   cut", the eggs and every animation answered ~10 s late (Oct 20: "we lost
   the good intro, animations are gone, I see no buttons"). fix5 keeps the
   guard only where it is cheap: the enhancer and the stage start at ladder
   steps 2 / 3 again, and only the ONE thing that mutates server markup (a
   portal into a window's host, a drone host in Systems) waits for ITS OWN
   boundary: `markHydrated(el)` is a ref callback of that element
   (components/stage/stage-window-host.tsx), which React runs in the commit
   that hydrates the boundary; `elHydrated(el)` reads it. Once the whole page
   has hydrated every element counts as hydrated.
   Client only; on the server nothing is hydrated.
   ========================================================================== */

import { on } from "./events";

/** True once every section boundary has hydrated. */
export function pageHydrated(): boolean {
  return typeof window !== "undefined" && Boolean(window.__pageHydrated);
}

/** Elements whose Suspense boundary has hydrated (set by their ref callback,
 *  which React runs in the commit that hydrates them). */
const hydratedEls = new WeakSet<Element>();

/** A ref callback: the element's boundary has hydrated (stable identity). */
export function markHydrated(el: Element | null): void {
  if (el) hydratedEls.add(el);
}

/** True when `el` can be safely changed from outside React: its own boundary
 *  hydrated (`markHydrated`), or the whole page has. */
export function elHydrated(el: Element | null): boolean {
  return Boolean(el) && (hydratedEls.has(el as Element) || pageHydrated());
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
