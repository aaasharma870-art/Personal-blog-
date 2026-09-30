/* ============================================================================
   STAGE — the persistent desktop stage as data (PHASE3-SPEC §3.2). PURE:
   type-only imports, so Node and the validator import it.

   Manifest entries (lib/page.ts) and the act-1 program block (lib/film.ts
   `acts[].stage`) carry a StageSpec. `stageCues()` flattens the page into
   the ordered cue list the stage walks; the stage measures each cue's
   anchor (once, and on resize) and writes `y`; `stageAt(y, cues)` is the
   per-frame lookup (no layout reads). Loops are never named here: the stage
   asks `loopFor(cue.media)` (lib/loops.ts, DP-5).

   W1.0: types + small working implementations (B1-STAGE owns and refines
   them: crossfade lengths, the card hand-off, program-block anchors).
   ========================================================================== */

import type { MediaId } from "./media";
import type { SkyKey } from "./sky";
import type { PageItem } from "./derive";

export type WeatherKind = "spray" | "chalk" | "fireflies" | "motes";
export type StageCamera = "drift" | "push" | "pan-l" | "pan-r" | "hold";

/** One stage cue. `loop` is omitted in data (DP-5: `loopFor(media)`). */
export type StageCue = {
  /** Child anchor id the cue starts at; default: the item's top. */
  at?: string;
  media: MediaId;
  camera?: StageCamera;
  depth?: boolean;
  grade?: SkyKey;
  weather?: WeatherKind;
};

/** The static scrim of a `backdrop` section (text ≥ .86, image ≥ .45). */
export type Scrim = { text: number; image: number; imageZone: "right" | "left" | "gutters" };

export type StageMode = "backdrop" | "split" | "own" | "opaque";

export type StageSpec = {
  mode: StageMode;
  /** split only: the window's side. */
  side?: "left" | "right";
  scrim?: Scrim;
  cues?: readonly StageCue[];
};

/** A cue placed on the page. `cue: null` = a marker where the stage hides
 *  (`own`, `opaque`, an act card, or an item without a StageSpec). */
export type StageCueAt = {
  /** The page item (section id, or act-card id "act-<n>"). */
  item: string;
  /** Element id the stage measures: `cue.at` ?? the item id. */
  anchor: string;
  mode: StageMode | "card";
  side?: "left" | "right";
  scrim?: Scrim;
  cue: StageCue | null;
  /** Page y of the anchor's top in px: 0 until the stage measures it. */
  y: number;
};

function push(out: StageCueAt[], item: string, spec: StageSpec | undefined): void {
  if (!spec || spec.mode === "own" || spec.mode === "opaque" || !spec.cues?.length) {
    out.push({ item, anchor: item, mode: spec?.mode ?? "opaque", cue: null, y: 0 });
    return;
  }
  for (const cue of spec.cues) {
    out.push({ item, anchor: cue.at ?? item, mode: spec.mode, side: spec.side, scrim: spec.scrim, cue, y: 0 });
  }
}

/** The page's cues in order. An act card is a "card" marker (the stage
 *  swaps its slots under the opaque card), followed by its act's program
 *  block cues when `actStage` returns a StageSpec for that act. */
export function stageCues(
  items: readonly PageItem[],
  actStage?: (actId: string) => StageSpec | undefined,
): StageCueAt[] {
  const out: StageCueAt[] = [];
  for (const it of items) {
    if (it.kind === "act") {
      out.push({ item: it.id, anchor: it.id, mode: "card", cue: null, y: 0 });
      const spec = actStage?.(it.act);
      if (spec) push(out, it.id, spec);
    } else {
      push(out, it.entry.id, it.entry.stage);
    }
  }
  return out;
}

/** The two slots at page y (`cues` sorted by measured `y`): `a` = the cue
 *  in force, `b` = the next one, `mix` = b's opacity over the last `fade` px
 *  before b starts (0 = a hard switch), `local` = progress through a (0–1,
 *  drives the camera). Indices are -1 when there are no cues. */
export function stageAt(
  y: number,
  cues: readonly StageCueAt[],
  o: { fade?: number } = {},
): { a: number; b: number; mix: number; local: number } {
  const n = cues.length;
  if (!n) return { a: -1, b: -1, mix: 0, local: 0 };
  let a = 0;
  while (a + 1 < n && cues[a + 1].y <= y) a++;
  const b = Math.min(a + 1, n - 1);
  // before the first cue, or on the last one (no end to measure against)
  if (b === a || y < cues[0].y) return { a, b, mix: 0, local: 0 };
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const span = cues[b].y - cues[a].y;
  const local = span > 0 ? clamp((y - cues[a].y) / span) : 1;
  const fade = Math.max(0, o.fade ?? 0);
  const mix = fade > 0 ? clamp((y - (cues[b].y - fade)) / fade) : 0;
  return { a, b, mix, local };
}
