"use client";

import type { ReactNode } from "react";
import { captionKeyFor } from "@/lib/sections";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import type { ScrubBody } from "@/components/worlds/hp/principle-body";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { PrinciplesMap } from "@/components/site/principles-map";
import { PrinciplesLumos } from "@/components/site/principles-lumos";

/**
 * PrinciplesStage — picks the Principles choreography (lib/variants.ts
 * piece `principles.map`): the server render and hydration use the
 * manifest's choice; a ?variant=… preview switches after mount. Both sides
 * render the same heading, list and text (choreography and caption change;
 * content and focus targets never do).
 *
 * The head row: the server-rendered SectionHead at left, the scene caption
 * (RECOGNIZABILITY S18, `head`: right of the h2 on desktop, under it on
 * mobile) at right — "THE MARAUDER'S MAP • HARRY POTTER" / "LUMOS — THE
 * ENCHANTED CEILING • …". The choreography hosts it: DEFAULT sets it ON
 * the Map (the whole section is one sheet of parchment); ALT hangs the
 * Great Hall's ceiling over it.
 */
export function PrinciplesStage({
  choice,
  ribbons,
  head,
  scrub,
  hint,
  features,
}: {
  choice: VariantChoice;
  ribbons: boolean;
  head: ReactNode;
  /** Room 05's body with the B55 scrubbed sentence (server-rendered). */
  scrub?: ScrubBody;
  /** The `hp-map` egg's hint per choreography (server-rendered). */
  hint?: { map: ReactNode; ceiling: ReactNode };
  /** The Map's room furniture (server-rendered; DEFAULT only). */
  features?: readonly ReactNode[];
}) {
  const variant = useVariant(choice, "principles.map");
  const alt = variant === "alt";
  const headRow = (
    <div className="flex flex-col gap-tier-group xl:flex-row xl:items-end xl:justify-between xl:gap-x-10">
      {head}
      {/* the caption's own CSS owns its margins: size and place it from here */}
      <div className="xl:w-[26rem] xl:shrink-0 xl:pb-2">
        <SceneCaption k={captionKeyFor("cap.principles", variant)} place="head" />
      </div>
    </div>
  );
  return (
    <div data-variant={variant} data-principles-stage="">
      {alt ? (
        <PrinciplesLumos ribbons={ribbons} head={headRow} scrub={scrub} hint={hint?.ceiling} />
      ) : (
        <PrinciplesMap ribbons={ribbons} head={headRow} scrub={scrub} hint={hint?.map} features={features} />
      )}
    </div>
  );
}
