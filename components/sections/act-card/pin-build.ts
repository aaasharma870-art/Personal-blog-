import { film, type ActSpec } from "@/lib/film";
import { coverOf } from "@/lib/gl/cover";
import type { GlFlavour } from "@/lib/gl/types";
import { markOf, rectOf, sequenceFrames, type MediaId } from "@/lib/media";
import type { ActCardItem } from "@/lib/sections";
import type { SkyKey } from "@/lib/sky";
import type { Variant } from "@/lib/variants";
import {
  FRAME_ASPECT,
  MATCH_ROW,
  coverBox,
  inBox,
  plateOf,
  registerLine,
  type Box,
  type Plate,
  type Pos,
} from "@/components/sections/act-card/plate";
import { PLATE_ASPECT, plateBoxInFrame, plateRow } from "@/components/sections/act-card/frames/tintype-geo";
import type { CardPinSpec, GlCardData, ImpactSpec, PinBeat, PinWeather, PushSpec } from "@/components/sections/act-card/pin-spec";

/* ============================================================================
   PIN BUILD — the server builds each pinned card's Phase-3 data from the
   manifest (PHASE3-SPEC §6.2, §7.1–§7.6, §8.1; pin-spec.ts has the types).
   Pure: plates, marks and the act's beats in, plain data out (no React).
     • the REGISTERED crops (§7.2): the carried line of both halves on
       MATCH_ROW — MV-04 horizon .423 (crop y .286), iconic-ice ledge .3775
       (.109), iconic-ice-alt .425 (.294), MV-10 horizon on the frame's
       MATCH_ROW inside the tintype's inset plate (zoom ≈ 1.014), iconic-camp
       lake .378 (.111), iconic-hall table .638 (crop y 1, ZOOM 1.089 at the
       join) — computed from the marks, so a re-measured mark flows through;
     • the GL specs for both choreographies (W2-GL's GlCardSpec data);
     • the push-ins per choreography × push variant;
     • the impact, the meet, the title mask, the carried shape, the iris,
       weather and the star markers (from film.acts[].beats).
   ========================================================================== */

const A = FRAME_ASPECT.sm;
const VARIANTS: readonly Variant[] = ["default", "alt"];
type ByVariant<T> = Record<Variant, T>;

export type PinPlates = {
  /** The outgoing plate per choreography (null: none). */
  from: ByVariant<MediaId | null>;
  /** The settled (incoming) plate per choreography. */
  to: ByVariant<MediaId | null>;
};

export type PinRegs = ByVariant<{ from: Box | null; to: Box | null }>;

/** A plate's line (a mark's y, or the mean y of two marks). */
function lineOf(p: Plate, names: readonly string[]): number | null {
  const ys = names.map((n) => markOf(p.asset.id, n)?.[1]).filter((y): y is number => typeof y === "number");
  return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : null;
}

function reg(p: Plate | null, names: readonly string[], maxZoom = 1, aspect = A, row = MATCH_ROW): Box | null {
  if (!p) return null;
  const y = lineOf(p, names);
  return y === null ? null : (registerLine(p, y, row, maxZoom, aspect)?.box ?? null);
}

/** The plain crop (the plate's focal), as a box. */
const plainBox = (p: Plate, aspect = A): Box => coverBox(aspect, p.ratio, p.pos);

const frac = (b: Box, pt: Pos): Pos => inBox(b, pt);

/** p range of a beat (vh at p × travel). */
const toP = (vh: number, travel: number) => (travel > 0 ? vh / travel : 0);

const IMPACT: Record<CardPinSpec["kind"], ImpactSpec> = {
  opening: { at: 0.45, shake: 3, flash: 0.16, bloomEv: 0 },
  seam: { at: 0.45, shake: 2, flash: 0, bloomEv: 0, puff: true },
  tintype: { at: 0.03, shake: 2, flash: 0.18, bloomEv: 0 },
  ignite: { at: 0.45, shake: 0, flash: 0, bloomEv: 0.35 },
};

/** The meet (transition:meet): the opening's disc on the hero's horizon at
 *  the hook, the seam / ignite OUT → IN halves at .22, the tintype's flash. */
const MEET: Record<CardPinSpec["kind"], number> = { opening: 0.02, seam: 0.22, tintype: 0.03, ignite: 0.22 };

const FLAVOUR: Record<CardPinSpec["kind"], ByVariant<GlFlavour>> = {
  opening: { default: "iris", alt: "iris" },
  seam: { default: "chalk", alt: "duster" },
  tintype: { default: "develop", alt: "deadeye" },
  ignite: { default: "ink", alt: "lumos" },
};

const GRADE: Partial<Record<CardPinSpec["kind"], { from: SkyKey; to: SkyKey }>> = {
  seam: { from: "squall", to: "day" },
  tintype: { from: "cinema", to: "golden" },
  ignite: { from: "dusk", to: "candle" },
};

const isPinKind = (k: string): k is CardPinSpec["kind"] => k === "opening" || k === "seam" || k === "tintype" || k === "ignite";

/**
 * The pin spec of one card, plus the registered crops its frames draw (per
 * choreography). null for a card that does not pin (reel / title / no
 * travel). `title` = the act title as rendered (copy-gated).
 */
export function buildPin(item: ActCardItem, plates: PinPlates, title: string): { spec: CardPinSpec; regs: PinRegs } | null {
  const kind = item.transition;
  if (!isPinKind(kind) || !(item.travel > 0)) return null;
  const act = (film.acts as readonly ActSpec[]).find((a) => a.id === item.act);
  const travel = item.travel;
  const a: readonly [number, number] = kind === "tintype" ? [0.03, 0.45] : [0, 0.45];

  const regs = {} as PinRegs;
  const gl = {} as ByVariant<GlCardData | null>;
  const push = {} as ByVariant<ByVariant<PushSpec>>;
  let iris: CardPinSpec["iris"] = null;
  let shape: CardPinSpec["shape"] = null;

  for (const v of VARIANTS) {
    const fromP = plateOf(plates.from[v]);
    const toP_ = plateOf(plates.to[v]);
    let rFrom: Box | null = null;
    let rTo: Box | null = null;
    // GL covers (frame fractions) of what the DOM draws in pin mode
    let cFrom: Box | null = null;
    let cTo: Box | null = null;
    let center: Pos | undefined;
    const pv = {} as ByVariant<PushSpec>;

    if (kind === "opening" && toP_) {
      cTo = plainBox(toP_);
      const stern = (markOf(toP_.asset.id, "stern") as Pos | null) ?? [0.87, 0.6];
      center = frac(cTo, stern);
      // the hero plate (outgoing) with its horizon on the disc's row
      const hero = plateOf(plates.from[v]);
      cFrom = hero ? (reg(hero, ["horizon"], 1.2, A, center[1]) ?? plainBox(hero)) : null;
      if (v === "default") {
        const diag = Math.hypot(A, 1);
        const far = Math.max(
          ...[0, 1].flatMap((x) => [0, 1].map((y) => Math.hypot((center![0] - x) * A, center![1] - y))),
        );
        iris = { center, r0: 0.12 * diag, r1: far };
      }
      pv.default = { origin: center, scale: [1, 1.3], loop: true };
      pv.alt = { origin: center, scale: [1, 1.15], rack: true, loop: true };
    } else if (kind === "seam") {
      rFrom = reg(fromP, ["horizon"]);
      rTo = reg(toP_, ["ledgeL", "ledgeR"]);
      cFrom = rFrom ?? (fromP ? plainBox(fromP) : null);
      cTo = rTo ?? (toP_ ? plainBox(toP_) : null);
      const r = toP_ ? rectOf(toP_.asset.id, "boardRect") : null;
      const focus: Pos = r && cTo ? frac(cTo, [(r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2]) : [0.62, MATCH_ROW - 0.2];
      pv.default = { origin: focus, scale: [1, 1.35], loop: true };
      pv.alt = { origin: focus, scale: [1, 1.2], rack: true, loop: true };
      if (v === "default") shape = { id: "gear12", at: [0.5, MATCH_ROW], size: 0.2, range: [0.22, 0.45] };
    } else if (kind === "tintype" && toP_) {
      // the inset plate: MATCH_ROW of the frame as a row of the plate box
      rTo = reg(toP_, ["horizon"], 1.1, PLATE_ASPECT.sm, plateRow(MATCH_ROW));
      rFrom = rTo;
      const inPlate = rTo ?? plainBox(toP_, PLATE_ASPECT.sm);
      cTo = plateBoxInFrame(inPlate);
      cFrom = cTo;
      const sun = (markOf(toP_.asset.id, "sun") as Pos | null) ?? [0.8125, 0.2185];
      const focus = frac(cTo, sun);
      pv.default = { origin: focus, scale: [1, 1.04] };
      pv.alt = pv.default;
    } else if (kind === "ignite") {
      rFrom = reg(fromP, ["lake"]);
      rTo = reg(toP_, ["tableL", "tableR"], 1.1);
      cFrom = rFrom ?? (fromP ? plainBox(fromP) : null);
      cTo = rTo ?? (toP_ ? plainBox(toP_) : null);
      const zoom = toP_ && cTo ? cTo.w / plainBox(toP_).w : 1;
      const table = toP_ ? ((markOf(toP_.asset.id, "highTable") as Pos | null) ?? [0.5, 0.63]) : [0.5, 0.63];
      const focus: Pos = cTo ? frac(cTo, table as Pos) : [0.5, 0.45];
      const frames = sequenceFrames("SEQ-HALL");
      pv.default = {
        origin: focus,
        scale: [1, 1.06],
        seq: frames.length && cTo && plates.to[v] === "iconic-hall" ? { id: "SEQ-HALL", frames, plate: "iconic-hall", box: cTo } : null,
      };
      // the crane on L02: zoom 1.089 at the join → 1.25, focal .45
      pv.alt = { origin: [0.5, 0.45], scale: [1, 1.25 / Math.max(1, zoom)], loop: true };
      if (v === "default" && fromP && cFrom) {
        const wheel = markOf(fromP.asset.id, "wheel") as Pos | null;
        const wheelR = markOf(fromP.asset.id, "wheelR") as Pos | null;
        if (wheel) {
          // wheelR: the wheel's radius as plate fractions (x of the width,
          // y of the height); the snitch lands where the wheel was
          const size = wheelR ? 2 * Math.max(wheelR[0] * cFrom.w * A, wheelR[1] * cFrom.h) : 0.18;
          shape = { id: "snitch", at: frac(cFrom, wheel), size: Math.min(0.3, Math.max(0.1, size)), range: [0.22, 0.45] };
        }
      }
    }

    regs[v] = { from: rFrom, to: rTo };
    push[v] = {
      default: pv.default ?? { origin: [0.5, 0.5], scale: [1, 1] },
      alt: pv.alt ?? pv.default ?? { origin: [0.5, 0.5], scale: [1, 1] },
    };
    const from = plates.from[v] ?? plates.to[v];
    const to = plates.to[v];
    gl[v] =
      from && to && cFrom && cTo
        ? {
            card: kind,
            variant: v,
            a: { flavour: FLAVOUR[kind][v], from, to, range: a },
            b: { flavour: "title", text: title, world: item.to, maskOrigin: act?.maskOrigin ?? [0.5, 0.5], range: [0.5, 1] },
            row: MATCH_ROW,
            cover: { from: coverOf(cFrom), to: coverOf(cTo) },
            ...(center ? { center } : {}),
            ...(kind === "seam" || kind === "ignite"
              ? { shapes: kind === "seam" ? { from: "ring32", to: "gear12", at: 0.22 } : { from: "wheel12", to: "snitch", at: 0.22 } }
              : {}),
            ...(GRADE[kind] ? { grade: GRADE[kind] } : {}),
            ...(IMPACT[kind].flash || IMPACT[kind].bloomEv
              ? { flash: { at: IMPACT[kind].at, amount: IMPACT[kind].flash || IMPACT[kind].bloomEv } }
              : {}),
          }
        : null;
  }

  // the act's beats (lib/film.ts, vh at p × travel) → the pin's markers
  const beats: PinBeat[] = [];
  const weather: PinWeather[] = [];
  const WEATHER: Record<string, PinWeather["kind"]> = { spray: "spray", chalk: "chalk", fireflies: "fireflies", motes: "motes" };
  for (const bt of act?.beats ?? []) {
    const from = toP(bt.at, travel);
    const to = toP(bt.at + bt.span, travel);
    if (bt.kind === "transition" || bt.kind === "push-title" || bt.kind === "impact") {
      beats.push({ id: bt.id, from, to, ...(bt.star ? { weight: bt.weight ?? 1 } : {}) });
    } else if (bt.kind === "stage-cue") {
      const k = WEATHER[bt.id.split("-").pop() ?? ""];
      if (k) weather.push({ kind: k, beat: bt.id, range: [from, to] });
    }
  }

  return {
    regs,
    spec: {
      kind,
      world: item.to,
      a,
      meet: MEET[kind],
      impact: IMPACT[kind],
      gl,
      toPlate: { default: plates.to.default, alt: plates.to.alt },
      push,
      title: { text: title, origin: act?.maskOrigin ?? [0.5, 0.5] },
      shape,
      weather,
      beats,
      iris,
      kraken: kind === "seam" ? { at: [0.62, MATCH_ROW + 0.16] } : null,
    },
  };
}
