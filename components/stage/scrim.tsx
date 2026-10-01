import type { CSSProperties } from "react";
import type { Scrim } from "@/lib/stage";

/* ============================================================================
   STAGE SCRIM (spec §3.2, backdrop mode) — OWNER: B1-STAGE.
   Server markup: the ONE static scrim layer of a `backdrop` section, built
   from its `Scrim` (text ≥ .86, image ≥ .45 of the section's own --bg):
     imageZone "right"   (text on the left)  bg .86 over 0–58 %, .45 from 72 %
     imageZone "left"    the mirror
     imageZone "gutters" .86 over the page container's content box, .45 in
                         the outer gutters outside it
   It renders on every device but is `display:none` unless the section is
   live (app/p3/stage.css: the boot gate + html[data-stage="live"], not
   paused, and the stage marked the section `[data-stage-on]`), so every
   section is opaque, exactly as today, whenever the stage is not showing it.
   Never animated (a static gradient, rasterised once). The host puts it
   first inside its `relative isolate` box; it sits under the world ground.
   ========================================================================== */

const pct = (x: number) => `${Math.round(x * 1000) / 10}%`;

export function StageScrim({ scrim, className }: { scrim: Scrim; className?: string }) {
  const style = {
    "--scrim-text": pct(scrim.text),
    "--scrim-image": pct(scrim.image),
  } as CSSProperties;
  return (
    <div
      aria-hidden="true"
      className={className ? `stage-scrim ${className}` : "stage-scrim"}
      data-zone={scrim.imageZone}
      style={style}
    />
  );
}
