import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import type { LoaderKind } from "@/lib/worlds";

/**
 * The four world loader renderers (SPEC v2 §8), registered into the Loader
 * shell's `loaderRenderers` (components/primitives/loader.tsx):
 *   course      LD-PC  Jack's compass (pirates)
 *   gauge       LD-3I  the honest gauge (idiots)
 *   plate-trail LD-RD  plate & trail (rdr2)
 *   ink-light   LD-HP  light finds the ink (hp)
 * Each is its own chunk (SPEC §14 "code-split per world"; loaders L16), still
 * server-rendered — a card's static SSR motif is in the HTML, and hydration
 * keeps it while the chunk arrives (next/dynamic = lazy + Suspense).
 */
export const worldLoaderRenderers: Partial<Record<LoaderKind, ComponentType<LoaderRendererProps>>> = {
  course: dynamic(() => import("@/components/primitives/loaders/course-loader")),
  gauge: dynamic(() => import("@/components/primitives/loaders/gauge")),
  "plate-trail": dynamic(() => import("@/components/primitives/loaders/plate-trail")),
  "ink-light": dynamic(() => import("@/components/primitives/loaders/ink-light")),
};

/**
 * Their ALTERNATES (lib/variants.ts `loader-<kind>.motion`, AUTOPILOT
 * "two versions of every animation"): a meaningfully different mechanism
 * for the same verb, under the same shell contract (modes, show delay, 5 s
 * idle stop, static under reduced motion / Pause, sprites-only light, no
 * text). Each is its own chunk, fetched only when an alt is chosen.
 *   course      "bottle"      a ship in a bottle: the rigging line is pulled
 *                             out through the neck (= progress) and the masts
 *                             rise; the cork seats at completion
 *   gauge       "derivation"  a chalk derivation writes itself stroke by
 *                             stroke (= progress); the answer is boxed
 *   plate-trail "journal"     a journal page: a pencil sketches the frontier
 *                             stroke by stroke (= progress); one red underline
 *   ink-light   "footprints"  Marauder's-Map footprints walk the Line
 *                             (= progress) and stop together at its end
 */
export const worldLoaderAltRenderers: Partial<Record<LoaderKind, ComponentType<LoaderRendererProps>>> = {
  course: dynamic(() => import("@/components/primitives/loaders/course-bottle")),
  gauge: dynamic(() => import("@/components/primitives/loaders/gauge-chalk")),
  "plate-trail": dynamic(() => import("@/components/primitives/loaders/plate-journal")),
  "ink-light": dynamic(() => import("@/components/primitives/loaders/ink-footprints")),
};
