"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { ease } from "@/lib/motion";
import { credibility } from "@/lib/content";

/** Wrap v into [min, max). Pure — unit-checked in Step 2. */
export function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  if (range <= 0) return min;
  return ((((v - min) % range) + range) % range) + min;
}

function Marker({
  label,
  pulse = false,
  pulseDelay = 0,
}: {
  label: string;
  pulse?: boolean;
  pulseDelay?: number;
}) {
  const reduce = useReducedMotion();
  const animate = pulse && !reduce;
  return (
    <span className="group flex shrink-0 cursor-default items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-stone transition-colors duration-200 hover:text-aqua-bright hover:[text-shadow:0_0_14px_rgba(45,212,191,0.6)]">
      {animate ? (
        <motion.span
          aria-hidden="true"
          className="h-1 w-1 rounded-full bg-aqua/60 transition-transform duration-200 group-hover:scale-150 group-hover:bg-aqua-bright"
          initial={{ opacity: 0.5, scale: 1 }}
          whileInView={{ opacity: [0.5, 1, 0.5], scale: [1, 1.9, 1] }}
          viewport={{ once: true, amount: 1 }}
          transition={{ duration: 0.7, ease, delay: pulseDelay }}
        />
      ) : (
        <span
          aria-hidden="true"
          className="h-1 w-1 rounded-full bg-aqua/60 transition-transform duration-200 group-hover:scale-150 group-hover:bg-aqua-bright"
        />
      )}
      {label}
    </span>
  );
}

/** Velocity-linked drift. Constant slow leftward base; scroll velocity speeds
 *  it up and can reverse direction. Transform-only, wrapped seamlessly. */
function VelocityStrip() {
  const baseVelocity = -0.6; // px/frame @ 60fps baseline drift (leftward)
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {
    clamp: false,
  });

  const groupRef = useRef<HTMLDivElement>(null);
  const [groupWidth, setGroupWidth] = useState(0);

  useEffect(() => {
    const measure = () => setGroupWidth(groupRef.current?.offsetWidth ?? 0);
    measure();
    const ro = new ResizeObserver(measure);
    if (groupRef.current) ro.observe(groupRef.current);
    return () => ro.disconnect();
  }, []);

  const x = useTransform(baseX, (v) =>
    groupWidth > 0 ? `${wrap(-groupWidth, 0, v)}px` : "0px",
  );

  const directionFactor = useRef(1);
  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 16.6667);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <section
      aria-label="Areas of focus"
      className="relative overflow-hidden border-t border-line bg-surface/30 py-6"
    >
      {/* static wrapper carries the edge mask so the fade stays fixed */}
      <div className="[-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div style={{ x }} className="flex w-max will-change-transform">
          {[0, 1, 2].map((g) => (
            <div
              key={g}
              ref={g === 0 ? groupRef : undefined}
              aria-hidden={g === 0 ? undefined : "true"}
              className="flex shrink-0 items-center gap-10 pr-10"
            >
              {credibility.map((c, idx) => (
                <Marker
                  key={`${g}-${c}`}
                  label={c}
                  pulse={g === 0}
                  pulseDelay={idx * 0.09}
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/** Credibility strip: velocity-linked drift (motion) or a static centered row
 *  (reduced-motion). Decision 2 / Build 16. */
export function CredibilityStrip() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <section
        aria-label="Areas of focus"
        className="border-t border-line bg-surface/30 py-6"
      >
        <ul className="container-edge flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {credibility.map((c) => (
            <li key={c}>
              <Marker label={c} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return <VelocityStrip />;
}
