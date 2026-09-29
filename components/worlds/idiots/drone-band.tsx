"use client";

import type { ReactNode } from "react";
import { resolveVariant, type MediaId } from "@/lib/media";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { MediaFrame } from "@/components/primitives/media-frame";
import { SettleFrame } from "@/components/worlds/idiots/chalk";

/**
 * DroneBand — the systems section's head band (RECOGNIZABILITY S10): Rancho's
 * homemade quadcopter hovering in the college courtyard (iconic-drone; the
 * ALT plate is iconic-drone-alt), 21:9 ≥ 640, 4:3 below, the focal point on
 * the drone. The scene caption (THE HOMEMADE DRONE • 3 IDIOTS) sits on its
 * calm lower left. Sensitivity (IC-3I-08): the caption names no character,
 * the plate has no window or feed, and nothing links it to Aryan's own
 * drone work. The band settles in (non-interactive, aalIzzWell) under the
 * default; the ALT wipes it on. Decorative plate (alt="" in the manifest):
 * the caption carries the meaning.
 */
export function DroneBand({
  media,
  choice,
  caption,
  className,
}: {
  media: MediaId;
  choice: VariantChoice;
  caption?: ReactNode;
  className?: string;
}) {
  const variant = useVariant(choice, "systems.band");
  const plate = resolveVariant(media, variant)?.id ?? media;
  return (
    <div className={cn("scene-caption-host", className)} data-band={plate}>
      <SettleFrame entrance={variant === "alt" ? "wipe" : "settle"} className="relative sm:overflow-hidden sm:rounded-frame">
        <div className="relative aspect-[4/3] overflow-hidden rounded-frame sm:aspect-[21/9] sm:rounded-none">
          <MediaFrame media={plate} layout="fill" sizes="(min-width: 90rem) 1312px, 100vw" />
        </div>
        {caption}
      </SettleFrame>
    </div>
  );
}
