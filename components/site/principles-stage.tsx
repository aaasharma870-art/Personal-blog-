"use client";

import type { ReactNode } from "react";
import { captionKeyFor } from "@/lib/sections";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { SceneCaption } from "@/components/primitives/scene-caption";
import { PrinciplesMap } from "@/components/site/principles-map";
import { CeilingCandles, PrinciplesLumos } from "@/components/site/principles-lumos";

/**
 * PrinciplesStage — picks the Principles choreography (lib/variants.ts
 * piece `principles.map`): the server render and hydration use the
 * manifest's choice; a ?variant=… preview switches after mount. Both sides
 * render the same heading, list and text (choreography and caption change;
 * content and focus targets never do).
 *
 * The head: the server-rendered SectionHead at left, the scene caption
 * (RECOGNIZABILITY S18, `head`: right of the h2 on desktop, under it on
 * mobile) at right — "THE MARAUDER'S MAP • HARRY POTTER" / "LUMOS • …".
 */
export function PrinciplesStage({
  choice,
  ribbons,
  head,
}: {
  choice: VariantChoice;
  ribbons: boolean;
  head: ReactNode;
}) {
  const variant = useVariant(choice, "principles.map");
  const alt = variant === "alt";
  return (
    <div data-variant={variant} data-principles-stage="">
      {alt ? <CeilingCandles /> : null}
      <div className="flex flex-col gap-tier-group xl:flex-row xl:items-end xl:justify-between xl:gap-x-10">
        {head}
        {/* the caption's own CSS owns its margins: size and place it from here */}
        <div className="xl:w-[26rem] xl:shrink-0 xl:pb-2">
          <SceneCaption k={captionKeyFor("cap.principles", variant)} place="head" />
        </div>
      </div>
      {alt ? <PrinciplesLumos ribbons={ribbons} /> : <PrinciplesMap ribbons={ribbons} />}
    </div>
  );
}
