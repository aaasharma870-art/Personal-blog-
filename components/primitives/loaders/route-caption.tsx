"use client";

import type { CaptionWorld } from "@/lib/film";
import { captionKeyFor, loaderVariantOf } from "@/lib/sections";
import { useVariant } from "@/lib/use-variant";
import { worlds } from "@/lib/worlds";
import { SceneCaption } from "@/components/primitives/scene-caption";

/**
 * The route card's MOMENT • FILM caption (RECOGNIZABILITY S20 / §6:
 * "JACK'S COMPASS • PIRATES OF THE CARIBBEAN" …), under the loader art.
 * A client leaf so it names the variant the Loader ACTUALLY draws: the same
 * choice (the world's loaderVariant) and piece key the Loader shell reads,
 * including a ?variant=… preview after hydration (server and hydration
 * render the manifest's variant, like the Loader). HTML text, never inside
 * the loader SVG (L7); it is not the status (the status stays Meta, L14).
 */
export function RouteCaption({ world }: { world: CaptionWorld }) {
  const kind = worlds[world].loader;
  const variant = useVariant(loaderVariantOf(world), `loader-${kind}.motion`);
  // the host column centres it (a flex item, shrink-to-fit) under the art;
  // its text and the museum-label rule stay left-aligned inside that box
  return <SceneCaption k={captionKeyFor(`cap.loader.${world}`, variant)} place="under" />;
}
