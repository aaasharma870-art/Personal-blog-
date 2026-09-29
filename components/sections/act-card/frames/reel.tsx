"use client";

import { useState } from "react";
import { motion, useMotionValueEvent } from "motion/react";
import { dur, ease } from "@/lib/motion";
import type { MediaId } from "@/lib/media";
import type { WorldId } from "@/lib/worlds";
import { Loader } from "@/components/primitives/loader";
import { MediaFrame } from "@/components/primitives/media-frame";
import { useCard } from "@/components/sections/act-card/card-context";

/**
 * The generic loading reel (kind `reel`: a world pair with no authored
 * transition) and the same-world `title` card (act-cards.BAR §3):
 *   reel   the incoming world's `cardStill` crossfades in at p = .5 on
 *          dur.preview (a declared reuse), under the incoming loader motif
 *          (card size) driven directly by the card's passage p. With no
 *          still, the motif alone renders on the world's deep (C22).
 *   title  no still; the motif rests static-complete.
 * Static card: the still (reel) and the motif `complete`. aria-hidden art.
 */
export function ReelFrame({
  world,
  still,
  kind,
}: {
  world: WorldId;
  still: MediaId | null;
  kind: "reel" | "title";
}) {
  const { p, live } = useCard();
  const [half, setHalf] = useState(() => p.get() >= 0.5);
  useMotionValueEvent(p, "change", (v) => {
    const on = v >= 0.5;
    if (on !== half) setHalf(on);
  });
  const moving = live && kind === "reel";

  return (
    <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
      {kind === "reel" && still ? (
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: !live || half ? 1 : 0 }}
          transition={live ? { duration: dur.preview, ease } : { duration: 0 }}
        >
          <MediaFrame media={still} layout="fill" playOn="never" sizes="100vw" />
        </motion.div>
      ) : null}
      <span className="relative">
        <Loader
          key={moving ? "passage" : "static"}
          world={world}
          size="card"
          progress={moving ? p : 1}
          mode={moving ? "determinate" : "complete"}
        />
      </span>
    </div>
  );
}
