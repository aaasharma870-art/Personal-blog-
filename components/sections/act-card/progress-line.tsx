"use client";

import { motion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { worlds, type WorldId } from "@/lib/worlds";
import { LUMOS_SPRITE } from "@/components/primitives/loaders/sprites-hp";
import { useCard } from "@/components/sections/act-card/card-context";

/**
 * The lower bar's progress element (act-cards.BAR §3): the incoming world's
 * OWN progress mark, ≤ 40 % of the bar, driven directly by the card's p —
 * the brass course (LD-PC), the blueprint rack line (LD-3I), the graphite
 * trail (LD-RD), the ink line with its light (LD-HP), or a hairline (plain).
 * aria-hidden; never a percentage, never "loading", never role=status.
 * The static card shows it complete.
 */
const MATERIAL: Record<string, string> = {
  course:
    "h-[1.5px] bg-[repeating-linear-gradient(to_right,var(--w-brass)_0_6px,transparent_6px_12px)]",
  gauge:
    "h-px bg-(--w-bp-line)",
  "plate-trail": "h-[1.4px] rounded-full bg-(--w-pencil)",
  "ink-light": "h-[1.2px] rounded-full bg-(--w-ink-contour)",
  plain: "h-px bg-fg-muted",
};

export function ProgressLine({ world }: { world: WorldId }) {
  const { p: own, live, pin } = useCard();
  // pin mode: the whole card's damped p (the frames' p is star (a) alone)
  const p = pin?.t ?? own;
  const kind = worlds[world].loader;
  // the drawn part is a window sliding in from the left over a counter-moved
  // line (transforms only, composited: no clip-path re-draw per frame); the
  // dashes stay put, exactly as the old clip showed them
  const hide = useTransform(p, (v) => `${(-(1 - Math.min(1, Math.max(0, v))) * 100).toFixed(2)}%`);
  const back = useTransform(p, (v) => `${((1 - Math.min(1, Math.max(0, v))) * 100).toFixed(2)}%`);
  const x = useTransform(p, (v) => `${(Math.min(1, Math.max(0, v)) * 100).toFixed(2)}%`);

  return (
    // below 640 the card is a static stack: the frame's motif carries it
    <div aria-hidden="true" className="relative mt-1 hidden h-3 w-[min(40%,18rem)] min-w-40 sm:block">
      {/* the whole track, quiet */}
      <span className={cn("absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-25", MATERIAL[kind] ?? MATERIAL.plain)} />
      {/* the drawn part = p */}
      <motion.span
        className={cn("absolute -inset-y-1 inset-x-0 overflow-hidden", live && "will-change-transform")}
        style={live ? { x: hide } : undefined}
      >
        <motion.span
          className={cn("absolute inset-0 flex items-center", live && "will-change-transform")}
          style={live ? { x: back } : undefined}
        >
          <span className={cn("block w-full", MATERIAL[kind] ?? MATERIAL.plain)} />
        </motion.span>
      </motion.span>
      {kind === "gauge" ? (
        // the rack's end ticks (0 / end) — the dimension line's grammar
        <>
          <span className="absolute inset-y-0.5 left-0 w-px bg-(--w-bp-line)" />
          <span className="absolute inset-y-0.5 right-0 w-px bg-(--w-bp-line)" />
        </>
      ) : null}
      {kind === "ink-light" ? (
        // the light leads the ink (a pre-rendered sprite: world media)
        <motion.span className="absolute inset-0" style={{ x: live ? x : "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a 400-byte inline sprite, not content */}
          <img
            src={LUMOS_SPRITE}
            alt=""
            width={24}
            height={24}
            className="absolute top-1/2 left-0 size-6 max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </motion.span>
      ) : null}
    </div>
  );
}
