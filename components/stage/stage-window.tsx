import Image from "next/image";
import type { ReactNode } from "react";
import { beatAttrs, type Beat } from "@/lib/beats";
import { resolveMedia, type MediaAsset } from "@/lib/media";
import type { SectionEntry } from "@/lib/page";
import { STAGE_IMAGE, type StageCue } from "@/lib/stage";

/* ============================================================================
   STAGE WINDOW + STAGE SPLIT (spec §3.2, split mode) — OWNER: B1-STAGE.
   Server markup only.

   <StageSplit entry> wraps a section's research body when its StageSpec is
   `split` (anything else: the children, unwrapped, byte-for-byte today's
   DOM). Under the BOOT GATE the wrapper is a CSS grid from first paint
   (7fr text · 5fr window, or 5fr · 7fr for a left window; app/p3/stage.css),
   so a late stage mount never shifts layout. Outside it (phones, tablets,
   reduced motion, a paused view, no JS) both wrappers are `display:
   contents` and the window `display:none`: today's layout exactly, and the
   window's lazy poster is never fetched.
   - The text column is the named container `split` (inline-size): research
     grids inside it carry `.split-stack` and stack below 40rem of column
     (≈ 523 px @1024 stacks, ≈ 740 px @1440 keeps two columns).
   - `[data-stage-wide]` blocks inside it (the chapter's ICE board) break out
     over the full grid on an opaque ground: a horizontal schematic never
     squeezes into the column.
   - `[data-stage-block]` marks the text blocks whose edges drive the rack
     focus.

   <StageWindow> is the window column: sticky under the header, 100svh tall,
   `self-start`, with an SSR next/image poster of cue 1 (lazy, the same focal
   fit and URL as the stage's layer). The live stage portals its layer into
   `[data-stage-window-host]` and marks the window `[data-stage-on]`; the
   poster then hides (CSS) and the window shows the stage's plate, camera
   and loop. A mid-session Pause or reduced motion hides the layer and the
   poster simply stays, so the column is never empty.
   Beats (PHASE3-PLAN §8; ids from the manifest entry): the window carries
   the section's STAR `stage-cue` beat (B19, the window arrival); its portal
   host carries the section's rack-focus beat (`stage-cue` "<id>-rack":
   B20-rack, B23-rack, B42-rack), which the window performs.
   ========================================================================== */

export type StageWindowProps = {
  section: string;
  cue: StageCue;
  side: "left" | "right";
  /** The section's star `stage-cue` beat (data-beat on the window). */
  beat?: Pick<Beat, "id" | "star" | "weight">;
  /** The section's rack-focus beat (data-beat on the portal host). */
  rack?: Pick<Beat, "id">;
};

type BeatLike = Pick<Beat, "id" | "star" | "weight">;
const attrsOf = (b: BeatLike | undefined) =>
  b ? beatAttrs(b.id, b.star ? { weight: b.weight ?? 1 } : undefined) : {};

/** The still a cue shows: its plate resolved, or a video's poster. */
function plateOf(cue: StageCue): MediaAsset | null {
  const a = resolveMedia(cue.media);
  if (!a) return null;
  if (a.kind === "image") return a;
  return a.poster ? resolveMedia(a.poster) : null;
}

export function StageWindow({ section, cue, side, beat, rack }: StageWindowProps) {
  const plate = plateOf(cue);
  const [fx, fy] = plate?.focal ?? [0.5, 0.5];
  return (
    <div data-stage-window={section} data-side={side} className="stage-window" aria-hidden="true" {...attrsOf(beat)}>
      {plate ? (
        <Image
          src={plate.src}
          alt=""
          fill
          sizes={STAGE_IMAGE.windowSizes}
          quality={STAGE_IMAGE.quality}
          className="stage-window-poster"
          style={{ objectFit: "cover", objectPosition: `${fx * 100}% ${fy * 100}%` }}
        />
      ) : null}
      <div data-stage-window-host="" className="stage-window-host" {...attrsOf(rack)} />
    </div>
  );
}

/** The split wrapper of a section body (see the header). */
export function StageSplit({ entry, children }: { entry: SectionEntry; children: ReactNode }) {
  const spec = entry.stage;
  const first = spec?.mode === "split" ? spec.cues?.[0] : undefined;
  if (!first) return <>{children}</>;
  const side = spec?.side ?? "right";
  const cueBeats = entry.beats?.filter((b) => b.kind === "stage-cue") ?? [];
  const beat = cueBeats.find((b) => b.star);
  const rack = cueBeats.find((b) => !b.star && b.id.endsWith("-rack"));
  return (
    <div data-stage-split={entry.id} data-side={side} className="stage-split">
      <div className="stage-split-text">{children}</div>
      <StageWindow section={entry.id} cue={first} side={side} beat={beat} rack={rack} />
    </div>
  );
}
