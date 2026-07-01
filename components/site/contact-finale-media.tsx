"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { springWeighted } from "@/lib/motion";

/** Fine-pointer probe via useSyncExternalStore (SSR snapshot = false), so we
 *  read the real capability on the client WITHOUT a setState-in-effect (the
 *  project bans that; matches ambient-background's useMediaQuery pattern). */
function useFinePointer(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(pointer:fine)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(pointer:fine)").matches,
    () => false,
  );
}

/**
 * ContactFinaleMedia — the closing frame (signature moment 4, spec §4).
 * The v-finale vol-surface video Ken-Burns SETTLES on a scroll-linked scale
 * (1.08 -> 1.0) eased through springWeighted, coming to rest as the section
 * centers. Scale stays >= 1 so canvas edges are never exposed. Scroll-linking
 * is gated behind reduced-motion + fine-pointer; everyone else gets the static
 * background. transform-only (compositor scale).
 */
export function ContactFinaleMedia() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const scale = useSpring(raw, springWeighted);

  const media = (
    <AmbientBackground
      image="/media/hero-still.png"
      video="/media/v-finale.mp4"
      opacity={0.6}
      overlayClassName="bg-gradient-to-b from-canvas/70 via-canvas/62 to-canvas/85"
    />
  );

  if (reduce || !fine) {
    return <div className="absolute inset-0">{media}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ scale }}
      className="absolute inset-0 will-change-transform"
    >
      {media}
    </motion.div>
  );
}
