import type { GlCardSpec } from "@/lib/gl/types";
import type { MediaId } from "@/lib/media";
import type { Variant } from "@/lib/variants";
import type { WorldId } from "@/lib/worlds";
import type { CarriedShapeId } from "@/components/stage/carried-shape";
import type { Box, Pos } from "@/components/sections/act-card/plate";

/* ============================================================================
   PIN SPEC — the data a pinned act card needs in Phase 3's pin mode
   (PHASE3-SPEC §6.2, §7.1–§7.6, §8.1, §8.4; PHASE3-PLAN §6.1 W2-CARDS).
   Types only: the SERVER (act-card-section.tsx) builds it from the manifest
   (plates, marks, registered crops, the act title, the beats) and hands it
   to CardShell as plain props; the lazy pin chunk (card-p3.tsx) plays it.
   Every point is in FRAME fractions of the 2.39:1 letterbox frame (0–1
   across, 0–1 down); every range is in the card's p (0 → 1 over its
   travel).
   ========================================================================== */

/** The GL spec's data part (the client adds `kraken` and `choice`). */
export type GlCardData = Omit<GlCardSpec, "kraken" | "choice">;

/** One push-in camera (star (b), p .50–1). */
export type PushSpec = {
  /** The camera's focus (frame fractions): the scale's origin. */
  origin: Pos;
  /** Content scale over star (b): [at p .50, at p 1]. */
  scale: readonly [number, number];
  /** Rack focus (the ALT pushes): the plate's soft rung crossfades to the
   *  sharp one over p .45–.62 (opacity between rungs, never a blur). */
  rack?: boolean;
  /** Play the plate's registered loop from p .50 (lib/loops.ts loopFor). */
  loop?: boolean;
  /** A frame sequence on the card's canvas (push-in #3 DEFAULT, SEQ-HALL):
   *  its frames, drawn in `box` (the plate's registered crop), only while
   *  the drawn plate is `plate` (frame 0 = that still). */
  seq?: { id: MediaId; frames: readonly string[]; plate: MediaId; box: Box } | null;
};

/** The impact (§7.6): once per world per view, on "new world revealed". */
export type ImpactSpec = {
  /** The p it lands on (the opening/seam/ignite .45; the tintype's flash .03). */
  at: number;
  shake: number;
  flash: number;
  bloomEv: number;
  /** The seam's chalk-dust puff (no flash). */
  puff?: boolean;
};

/** A beat the pin wrapper carries as a marker (stars on the pin spacer). */
export type PinBeat = {
  id: string;
  /** Range in the card's p. */
  from: number;
  to: number;
  weight?: 1 | 2 | 3;
};

/** A weather cue inside the card frame (§7.7; WeatherLayer, W2-PLATES). */
export type PinWeather = {
  kind: "spray" | "chalk" | "fireflies" | "motes";
  /** Its stage-cue beat id (data-beat on the layer). */
  beat: string;
  range: readonly [number, number];
};

export type CardPinSpec = {
  kind: "opening" | "seam" | "tintype" | "ignite";
  world: WorldId;
  /** Star (a)'s range (the frame's DOM choreography runs over it). */
  a: readonly [number, number];
  /** The two halves' meet (transition:meet: the sound cue). */
  meet: number;
  impact: ImpactSpec;
  /** GL specs for the two choreography variants (null: no GL for it). */
  gl: Readonly<Record<Variant, GlCardData | null>>;
  /** The plate each choreography settles on (the push's still). */
  toPlate: Readonly<Record<Variant, MediaId | null>>;
  /** The push-in, per choreography (its settled plate) and per
   *  `card-<kind>.push` variant: push[choreo][push]. */
  push: Readonly<Record<Variant, Readonly<Record<Variant, PushSpec>>>>;
  /** The act title as a mask (§8.1): the text, its world face, and the
   *  zoom origin in the title's ink box (film.acts[].maskOrigin). */
  title: { text: string; origin: readonly [number, number] };
  /** The css tier's static carried shape (the incoming half, §7.3). */
  shape: { id: CarriedShapeId; at: Pos; size: number; range: readonly [number, number] } | null;
  weather: readonly PinWeather[];
  beats: readonly PinBeat[];
  /** The iris (opening, css tier) per choreography (its plate's stern):
   *  the disc's centre and radii, in frame HEIGHTS (r0 = .12 × the frame
   *  diagonal; r1 = the farthest corner). */
  iris?: Readonly<Record<Variant, { center: Pos; r0: number; r1: number } | null>> | null;
  /** The kraken (seam, pc-kraken): where the tentacle breaks the foam. */
  kraken?: { at: Pos } | null;
};
