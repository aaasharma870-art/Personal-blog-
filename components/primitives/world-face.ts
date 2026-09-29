import type { CaptionWorld } from "@/lib/film";

/** The CSS class that sets `world`'s fan face (app/globals.css "world
 *  faces"). Apply it ONLY to registered lettering strings (lib/sections.ts
 *  letteredIn / quoteLetteringWorld): the subsets hold only their glyphs.
 *  One of the few files validator #10 lets name a display face. */
export function worldFaceClass(world: CaptionWorld): string {
  return `world-face-${world}`;
}
