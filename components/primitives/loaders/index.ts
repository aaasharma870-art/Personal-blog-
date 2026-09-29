import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { LoaderRendererProps } from "@/components/primitives/loader";
import type { LoaderKind } from "@/lib/worlds";

/**
 * The four world loader renderers (SPEC v2 §8; M2 RECOGNIZABILITY S20 — each
 * must read as its film blind, at card size), registered into the Loader
 * shell's `loaderRenderers` (components/primitives/loader.tsx):
 *   course      LD-PC  Jack's compass, lid open on its star chart, and the
 *                      Black Pearl sailing the course to the X (pirates)
 *   gauge       LD-3I  the honest gauge, drawn in chalk on a mini ICE
 *                      chalkboard (idiots)
 *   plate-trail LD-RD  Arthur's journal: a strapped leather journal, a pencil
 *                      sketching the frontier (rdr2). M2 SWAP: the journal
 *                      (the M1.5 ALT, the one RDR loader that passed blind)
 *                      is now the DEFAULT; the tintype plate (plate-trail.tsx)
 *                      is retired from the rotation — one line to restore.
 *   ink-light   LD-HP  the floating candles kindling one by one as the light
 *                      passes beneath them (hp)
 * Each is its own chunk (SPEC §14 "code-split per world"; loaders L16), still
 * server-rendered — a card's static SSR motif is in the HTML, and hydration
 * keeps it while the chunk arrives (next/dynamic = lazy + Suspense).
 */
export const worldLoaderRenderers: Partial<Record<LoaderKind, ComponentType<LoaderRendererProps>>> = {
  course: dynamic(() => import("@/components/primitives/loaders/course-loader")),
  gauge: dynamic(() => import("@/components/primitives/loaders/gauge")),
  "plate-trail": dynamic(() => import("@/components/primitives/loaders/plate-journal")),
  "ink-light": dynamic(() => import("@/components/primitives/loaders/ink-light")),
};

/**
 * Their ALTERNATES (lib/variants.ts `loader-<kind>.motion`, AUTOPILOT
 * "two versions of every animation"): a meaningfully different mechanism
 * for the same verb, under the same shell contract (modes, show delay, 5 s
 * idle stop, static under reduced motion / Pause, sprites-only light, no
 * text). Each is its own chunk, fetched only when an alt is chosen.
 *   course      "bottle"      the Black Pearl in a bottle (black, tattered
 *                             sails): the rigging line pulled out through the
 *                             neck (= progress) raises the masts; the cork
 *                             seats at completion
 *   gauge       "derivation"  a chalk derivation writes itself stroke by
 *                             stroke (= progress) on the same ICE board; the
 *                             answer is boxed
 *   plate-trail "dead-eye"    Dead Eye: the frontier goes red-sepia and an
 *                             ember X locks on the trail at each quarter of
 *                             the progress, then fires once (M2 NEW)
 *   ink-light   "map"         the Marauder's Map: a folded parchment of rooms
 *                             and corridors, footprints walking them
 *                             (= progress), stopping together at the end
 */
export const worldLoaderAltRenderers: Partial<Record<LoaderKind, ComponentType<LoaderRendererProps>>> = {
  course: dynamic(() => import("@/components/primitives/loaders/course-bottle")),
  gauge: dynamic(() => import("@/components/primitives/loaders/gauge-chalk")),
  "plate-trail": dynamic(() => import("@/components/primitives/loaders/plate-deadeye")),
  "ink-light": dynamic(() => import("@/components/primitives/loaders/ink-footprints")),
};
