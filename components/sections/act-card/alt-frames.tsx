"use client";

import dynamic from "next/dynamic";

/**
 * The ALT choreographies of the four authored act cards (lib/variants.ts,
 * registry pieces `card-<kind>.choreo`). Each is its own lazy chunk: the
 * server hands CardShell an `altFrame` element built from these wrappers,
 * but a chunk is fetched only when its frame actually renders — the page
 * that plays the defaults never downloads an alternate.
 *   opening  "chart-unfold"     the Pearl ALT plate (iconic-pearl-alt);
 *                                below it a folded chart opens, a dotted
 *                                trail climbs to an X on Act I, and the
 *                                caption sits under the chart
 *                                (frames/opening-plate + opening-map)
 *   seam     "duster-erase"     a chalk duster sweeps the storm (MV-04-alt)
 *                                off the ICE board (iconic-ice-alt) in one
 *                                feathered diagonal pass, left → right; the
 *                                board is left WIPED CLEAN (frames/seam-chalk)
 *   tintype  "dead-eye"         the frozen frontier (iconic-deadeye) takes
 *                                the Dead Eye grade, ember X marks lock onto
 *                                the four act points and STAY (frames/tintype-deadeye)
 *   ignite   "lumos-sweep"      a wand-tip light is struck at the camp's
 *                                fire, sweeps the hall and lights the
 *                                candles in its wake, then the Great Hall
 *                                (iconic-hall-alt)            (frames/ignite-lumos)
 * The opening's Pearl frame (frames/opening-plate) is shared by both sides
 * (a static import: it is the card's first paint).
 * SSR renders them when the MANIFEST picks an alt (next/dynamic keeps SSR);
 * a ?variant=… preview mounts one after hydration.
 */
export const OpeningMapFrame = dynamic(() =>
  import("@/components/sections/act-card/frames/opening-map").then((m) => m.OpeningMapFrame),
);
export const SeamChalkFrame = dynamic(() =>
  import("@/components/sections/act-card/frames/seam-chalk").then((m) => m.SeamChalkFrame),
);
export const TintypeDeadEyeFrame = dynamic(() =>
  import("@/components/sections/act-card/frames/tintype-deadeye").then((m) => m.TintypeDeadEyeFrame),
);
export const IgniteLumosFrame = dynamic(() =>
  import("@/components/sections/act-card/frames/ignite-lumos").then((m) => m.IgniteLumosFrame),
);
