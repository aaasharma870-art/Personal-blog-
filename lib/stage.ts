/* ============================================================================
   STAGE — the persistent desktop stage as data (PHASE3-SPEC §3.2). PURE:
   type-only imports, so Node and the validator import it.

   Manifest entries (lib/page.ts) and the act-1 program block (lib/film.ts
   `acts[].stage`) carry a StageSpec. `stageCues()` flattens the page into
   the ordered cue list; `stageShots()` merges it into the SHOTS the stage
   actually shows (consecutive same-plate backdrop cues are one continuous
   shot: the opening card's exit frame → about cue 1). The stage measures
   each shot's anchor and item once (and on resize) and writes `y` / `end`;
   per frame it only does arithmetic on those numbers (no layout reads):
     stageAt(line, shots, { fade })  → which shot is in force, the next one
                                        and the crossfade `mix`
     shotLocal / stageCamera         → the camera pose (transform only)
     shotArrival / rackSoft          → a split window's arrival and its
                                        rack focus (opacity only)
   Loops are never named here: the stage asks `loopFor(cue.media)`
   (lib/loops.ts, DP-5).

   THE READING LINE. A shot is "in force" once its anchor has entered the
   viewport (line = scrollY + innerHeight), so a backdrop section shows its
   plate from its first visible pixel, and a crossfade (`fade`, ≥ 40vh)
   runs while the next anchor is still below the fold.
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
 *  drives the camera). Indices are -1 when there are no cues. Works on any
 *  list of StageCueAt (cues or shots). */
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
  const span = cues[b].y - cues[a].y;
  const local = span > 0 ? clamp01((y - cues[a].y) / span) : 1;
  const fade = Math.max(0, o.fade ?? 0);
  const mix = fade > 0 ? clamp01((y - (cues[b].y - fade)) / fade) : 0;
  return { a, b, mix, local };
}

/* — Shots ———————————————————————————————————————————————————————————— */

/** What the stage shows: one or more consecutive cues of the same plate in
 *  the same place. `y` = the first cue's anchor top, `end` = the last
 *  item's bottom (page px, measured by the stage; 0 until then). */
export type StageShot = StageCueAt & {
  cue: StageCue;
  mode: "backdrop" | "split";
  /** First and last index into the stageCues() list. */
  from: number;
  to: number;
  /** The items the shot spans, in page order. */
  items: readonly string[];
  end: number;
};

/** Merge the media cues into shots: a backdrop cue that directly follows a
 *  backdrop cue of the same plate continues that shot (no crossfade, one
 *  camera). Markers (`own`, `opaque`, cards) are not shots. */
export function stageShots(cues: readonly StageCueAt[]): StageShot[] {
  const out: StageShot[] = [];
  cues.forEach((c, i) => {
    if (!c.cue || (c.mode !== "backdrop" && c.mode !== "split")) return;
    const last = out[out.length - 1];
    if (
      last &&
      last.to === i - 1 &&
      last.mode === "backdrop" &&
      c.mode === "backdrop" &&
      last.cue.media === c.cue.media
    ) {
      last.to = i;
      if (!last.items.includes(c.item)) last.items = [...last.items, c.item];
      return;
    }
    out.push({ ...c, cue: c.cue, mode: c.mode, from: i, to: i, items: [c.item], end: 0 });
  });
  return out;
}

/** The shots that need a mounted layer at this scroll position: their
 *  measured extent [y, end] meets the viewport grown by `margin` × vh. */
export function shotsNear(
  scrollY: number,
  vh: number,
  shots: readonly StageShot[],
  margin = 0.5,
): number[] {
  const lo = scrollY - margin * vh;
  const hi = scrollY + vh + margin * vh;
  const out: number[] = [];
  shots.forEach((s, k) => {
    if (s.end > s.y && s.y < hi && s.end > lo) out.push(k);
  });
  return out;
}

/** Progress of `shot` from its anchor entering the viewport (0) to its end
 *  leaving the top (1). Drives the camera. */
export function shotLocal(scrollY: number, vh: number, shot: Pick<StageShot, "y" | "end">): number {
  const span = shot.end - shot.y + vh;
  return span > 0 ? clamp01((scrollY + vh - shot.y) / span) : 0;
}

/* — Camera (transform only; `stage.camera` DEFAULT "drift" = each cue's
     own move, ALT "push" = a push toward the focal point for every cue) — */

/** A camera pose: `s` scale about the plate's focal point, `x` / `y`
 *  translation as fractions of the box (CSS `translate(x%, y%) scale(s)`
 *  with `transform-origin` at the focal point). */
export type CameraPose = { s: number; x: number; y: number };

const CAMERA_MOVES: Readonly<Record<StageCamera, { s: number; x: number; y: number }>> = {
  hold: { s: 0, x: 0, y: 0 },
  drift: { s: 0.05, x: -0.02, y: -0.008 },
  push: { s: 0.06, x: 0, y: 0 },
  "pan-l": { s: 0.06, x: 0.025, y: 0 },
  "pan-r": { s: 0.06, x: -0.025, y: 0 },
};

/** The camera pose at progress `l` (0–1). Every move starts at identity
 *  (the SSR poster's framing, so a hand-off never jumps) and never shows an
 *  edge: the translation is clamped inside the scale's overscan around
 *  `focal`. ALT (`variant === "alt"`) pushes toward the focal point. */
export function stageCamera(
  kind: StageCamera | undefined,
  l: number,
  focal: readonly [number, number] = [0.5, 0.5],
  variant: "default" | "alt" = "default",
): CameraPose {
  const k = kind ?? "drift";
  const move = CAMERA_MOVES[variant === "alt" && k !== "hold" ? "push" : k];
  const t = clamp01(l);
  const s = 1 + move.s * t;
  const over = s - 1;
  const [fx, fy] = focal;
  const x = clamp(move.x * t, -(1 - fx) * over, fx * over);
  const y = clamp(move.y * t, -(1 - fy) * over, fy * over);
  return { s, x, y };
}

/** CSS transform for a pose (translate in % of the box, then scale). */
export function poseTransform(p: CameraPose): string {
  return `translate3d(${(p.x * 100).toFixed(3)}%, ${(p.y * 100).toFixed(3)}%, 0) scale(${p.s.toFixed(4)})`;
}

/* — Split windows ——————————————————————————————————————————————————— */

/** A split window's arrival (B19): 0 while the split's top is at the
 *  viewport bottom, 1 once it has risen `span` × vh (≥ 40vh). Eased out. */
export function shotArrival(scrollY: number, vh: number, splitTop: number, span = 0.4): number {
  const p = clamp01((scrollY + vh - splitTop) / (span * vh));
  return 1 - (1 - p) ** 3;
}

/** Rack focus (split windows only): the soft layer's opacity. Sharp (0)
 *  within 15vh of a text-block edge (30vh between blocks), soft (1) once
 *  the reading line is 25vh inside a block. `edges` = page ys of the block
 *  boundaries, sorted. Reading line = 40% down the viewport. */
export function rackSoft(scrollY: number, vh: number, edges: readonly number[]): number {
  if (!edges.length) return 0;
  const line = scrollY + 0.4 * vh;
  let d = Infinity;
  for (const e of edges) d = Math.min(d, Math.abs(line - e));
  return clamp01((d - 0.15 * vh) / (0.1 * vh));
}

/** next/image settings shared by a split window's SSR poster and the
 *  stage's layer of the same plate, so both request the same URL (the layer
 *  is a cache hit, "the same pixels"). The rack-focus soft copy is the
 *  384 px rung, stretched (a free, pre-rasterised blur; never `filter`). */
export const STAGE_IMAGE = {
  windowSizes: "42vw",
  backdropSizes: "100vw",
  quality: 75,
  backdropQuality: 55,
  softWidth: 384,
  softQuality: 55,
} as const;

/* — Validator rules (spec §3.2; scripts/checks/stage.mjs) —————————————— */

/** Research types: may be `split`, never `backdrop` (honesty, legibility). */
export const RESEARCH_TYPES: ReadonlySet<string> = new Set(["chapter", "ledger", "experiment", "matrix"]);
/** Tones that are never `backdrop` (paper inks are ≥ 5:1 only on opaque paper). */
export const OPAQUE_TONES: ReadonlySet<string> = new Set(["paper", "raised"]);
/** Scrim floors (spec §3.2 AA maths: muted #9db0bd needs ≥ .77 over white). */
export const SCRIM_MIN = { text: 0.86, image: 0.45 } as const;

/** Problems with one StageSpec (`type` / `tone` of its item; null for the
 *  act-1 program block). Pure: media resolution is the caller's. */
export function stageSpecIssues(
  spec: StageSpec,
  where: { type: string | null; tone: string | null },
): string[] {
  const out: string[] = [];
  const modes: readonly string[] = ["backdrop", "split", "own", "opaque"];
  if (!modes.includes(spec.mode)) return [`unknown mode "${spec.mode}"`];
  if (where.type && RESEARCH_TYPES.has(where.type) && spec.mode === "backdrop") {
    out.push(`research type "${where.type}" may be split, never backdrop`);
  }
  if (where.tone && OPAQUE_TONES.has(where.tone) && spec.mode === "backdrop") {
    out.push(`tone "${where.tone}" is never backdrop`);
  }
  if (where.type === "experiment" && spec.mode !== "opaque") out.push(`experiment is opaque (H4)`);
  const cues = spec.cues ?? [];
  if (spec.mode === "backdrop" || spec.mode === "split") {
    if (!cues.length) out.push(`${spec.mode} needs ≥ 1 cue`);
  } else if (cues.length) {
    out.push(`${spec.mode} carries cues (the stage hides there)`);
  }
  if (spec.mode === "backdrop") {
    const s = spec.scrim;
    if (!s) out.push(`backdrop needs a Scrim`);
    else {
      if (!(s.text >= SCRIM_MIN.text && s.text <= 1)) out.push(`scrim.text ${s.text} < ${SCRIM_MIN.text}`);
      if (!(s.image >= SCRIM_MIN.image && s.image <= 1)) out.push(`scrim.image ${s.image} < ${SCRIM_MIN.image}`);
      if (!["right", "left", "gutters"].includes(s.imageZone)) out.push(`scrim.imageZone "${s.imageZone}"`);
    }
  } else if (spec.scrim) {
    out.push(`only backdrop takes a Scrim`);
  }
  if (spec.side && spec.mode !== "split") out.push(`only split takes a side`);
  const cameras: readonly string[] = ["drift", "push", "pan-l", "pan-r", "hold"];
  const weathers: readonly string[] = ["spray", "chalk", "fireflies", "motes"];
  cues.forEach((c, i) => {
    if (c.camera && !cameras.includes(c.camera)) out.push(`cue ${i + 1}: unknown camera "${c.camera}"`);
    if (c.weather && !weathers.includes(c.weather)) out.push(`cue ${i + 1}: unknown weather "${c.weather}"`);
    if (c.at !== undefined && !/^[a-z0-9][a-z0-9-]*$/.test(c.at)) out.push(`cue ${i + 1}: anchor "${c.at}" is not an id`);
  });
  return out;
}

/* — helpers ———————————————————————————————————————————————————————— */

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

function clamp01(x: number): number {
  return clamp(x, 0, 1);
}
