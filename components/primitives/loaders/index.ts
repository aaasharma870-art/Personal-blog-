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
