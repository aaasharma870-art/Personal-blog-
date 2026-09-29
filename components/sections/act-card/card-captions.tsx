"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "motion/react";
import { remap } from "@/components/primitives/loaders/line";
import { useCard } from "@/components/sections/act-card/card-context";

/**
 * The act card's MOMENT captions (RECOGNIZABILITY §4.2–§4.3, rule (b)):
 * "THE LECTURE HALL AT ICE • 3 IDIOTS" in the world's fan face, set under
 * the frame's bottom-right corner (the lower bar's right column ≥ 640, in
 * flow under the frame below 640). Never over the frame, so never over
 * moving media (ignite G13, noise-order-seam N1) and always on the card's
 * own deep ground (AA by the plane's CALC, no scrim needed).
 *
 * A card may carry an OUTGOING caption (the world it leaves: "THE KRAKEN'S
 * STORM • PIRATES OF THE CARIBBEAN") and the SETTLED one (the world it
 * arrives in); both sit in one grid cell and crossfade on the card's own
 * driver p (opacity only; they reverse exactly by position):
 *   in   [a, b]  fades in as p crosses a → b
 *   out  [c, d]  fades out as p crosses c → d
 * The static card (SSR, no JS, reduced motion, Pause, < 640, a long card
 * off desktop-fine, in view at hydration) renders ONLY the settled caption,
 * fully visible. While live, the outgoing caption is aria-hidden (it names
 * a passing picture; the settled one is the card's caption).
 *
 * The caption nodes are server-rendered <SceneCaption>s (film data never
 * enters this client chunk); `world` wraps each in its own world plane so
 * the museum-label rule and the film span take that world's emphasis ink.
 */
export type CaptionCue = {
  key: string;
  node: ReactNode;
  /** The caption's world plane (its emphasis ink). */
  world: string;
  in?: readonly [number, number];
  out?: readonly [number, number];
  /** The caption the settled / static card shows. */
  settled: boolean;
};

export function CardCaptions({ cues }: { cues: readonly CaptionCue[] }) {
  if (!cues.length) return null;
  return (
    <div className="grid justify-items-start [&>*]:[grid-area:1/1]">
      {cues.map((c) => (
        <Cue key={c.key} cue={c} />
      ))}
    </div>
  );
}

function Cue({ cue }: { cue: CaptionCue }) {
  const { p, live } = useCard();
  const opacity = useTransform(p, (v) => {
    let o = 1;
    if (cue.in) o = Math.min(o, remap(v, cue.in[0], cue.in[1]));
    if (cue.out) o = Math.min(o, 1 - remap(v, cue.out[0], cue.out[1]));
    return o;
  });
  if (!live) {
    return cue.settled ? (
      <div data-world={cue.world} data-tone="deep" data-card-caption={cue.key}>
        {cue.node}
      </div>
    ) : null;
  }
  return (
    <motion.div
      data-world={cue.world}
      data-tone="deep"
      data-card-caption={cue.key}
      aria-hidden={cue.settled ? undefined : true}
      style={{ opacity }}
    >
      {cue.node}
    </motion.div>
  );
}
