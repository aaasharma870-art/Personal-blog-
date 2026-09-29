"use client";

import dynamic from "next/dynamic";

/**
 * The ALT choreographies of the four authored act cards (lib/variants.ts,
 * registry pieces `card-<kind>.choreo`). Each is its own lazy chunk: the
 * server hands CardShell an `altFrame` element built from these wrappers,
 * but a chunk is fetched only when its frame actually renders — the page
 * that plays the defaults never downloads an alternate.
 *   opening  "chart-unfold"     a folded chart opens; a dotted trail climbs
 *                                to an X on Act I            (frames/opening-map)
 *   seam     "duster-erase"     a chalk duster wipes the storm off the board
 *                                stroke by stroke             (frames/seam-chalk)
 *   tintype  "dead-eye"         the plate takes the Dead Eye grade, marks lock
 *                                onto the four act points, then resolve at
 *                                once                         (frames/tintype-deadeye)
 *   ignite   "lumos-sweep"      one wand-tip light sweeps the hall and lights
 *                                the candles in its wake      (frames/ignite-lumos)
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
