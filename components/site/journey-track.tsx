"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { springSoft } from "@/lib/motion";
import { journey } from "@/lib/content";
import { cn } from "@/lib/utils";

const KILLED_MARKERS = new Set(["Early work", "The break"]);

/** Clamp an index into [0, n-1]. Pure — unit-checked in Step 4. */
export function clampIndex(idx: number, n: number): number {
  if (n <= 0) return 0;
  return Math.max(0, Math.min(n - 1, idx));
}

export function JourneyTrack() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const n = journey.length;
  const [active, setActive] = useState(0);
  const [distance, setDistance] = useState(0);

  // Progress across the tall spacer while the stage is pinned.
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  // Measure how far the track must translate so its right edge (incl. padding)
  // meets the stage's right edge. Robust to panel width + viewport resize.
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const stage = scrollRef.current;
      if (!track || !stage) return;
      const overflow = track.scrollWidth - stage.clientWidth;
      setDistance(overflow > 0 ? overflow : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    if (scrollRef.current) ro.observe(scrollRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(xRaw, springSoft);
  const beamRaw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const beamScaleX = useSpring(beamRaw, springSoft);

  // Which panel is centered → its label ignites.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(clampIndex(Math.round(p * (n - 1)), n));
  });

  return (
    <div ref={scrollRef} className="relative mt-14 h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* chapter filmstrip */}
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max gap-6 px-[8vw] will-change-transform"
        >
          {journey.map((s, idx) => {
            const killed = KILLED_MARKERS.has(s.marker);
            const isActive = idx === active;
            return (
              <article
                key={s.marker}
                className={cn(
                  "relative flex aspect-[16/10] w-[78vw] shrink-0 flex-col justify-end overflow-hidden rounded-2xl border bg-surface/50 p-8 sm:w-[62vw] lg:w-[46vw]",
                  isActive ? "border-line-strong" : "border-line",
                )}
              >
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 46vw, (min-width: 640px) 62vw, 78vw"
                  quality={45}
                  className="object-cover opacity-40"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/70 to-canvas/10"
                />
                <div className="relative">
                  <p
                    className={cn(
                      "font-mono text-[0.7rem] uppercase tracking-[0.18em] transition-colors duration-300",
                      isActive
                        ? killed
                          ? "text-ember"
                          : "text-aqua-bright"
                        : "text-muted",
                    )}
                  >
                    {s.marker} · {idx + 1} / {n}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-medium text-ink sm:text-3xl">
                    {s.title}
                  </h3>
                  <p className="measure mt-3 text-base leading-relaxed text-stone">
                    {s.body}
                  </p>
                </div>
              </article>
            );
          })}
        </motion.div>

        {/* horizontal progress beam (scaleX, origin-left, over a static rail) */}
        <div className="relative mx-[8vw] mt-10">
          <div aria-hidden="true" className="h-px w-full bg-line" />
          <motion.div
            aria-hidden="true"
            style={{ scaleX: beamScaleX }}
            className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-transparent via-aqua to-aqua-bright"
          />
        </div>
      </div>
    </div>
  );
}
