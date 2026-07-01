"use client";

import { useRef, useSyncExternalStore } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { RevealItem } from "@/components/ui/reveal";
import { DecryptText } from "@/components/ui/decrypt-text";
import { ease, springSoft } from "@/lib/motion";
import type { Principle } from "@/lib/content";

/** True only on a real fine pointer. Uses useSyncExternalStore (NOT
 *  setState-in-effect, per the project's react-hooks/set-state-in-effect
 *  guardrail): `false` on the server + first client render (SSR match), then
 *  upgrades to the live value and stays in sync if the pointer type changes. */
function useFinePointer(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(pointer: fine)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(pointer: fine)").matches,
    () => false,
  );
}

export function PrincipleRow({ principle }: { principle: Principle }) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const enable = reduce === false && fine;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6, once: true });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yRaw = useTransform(scrollYProgress, [0, 1], enable ? [24, -24] : [0, 0]);
  const igniteRaw = useTransform(
    scrollYProgress,
    [0.3, 0.5, 0.7],
    enable ? [0, 1, 0] : [0, 0, 0],
  );
  const y = useSpring(yRaw, springSoft);
  const ignite = useSpring(igniteRaw, springSoft);

  return (
    <RevealItem
      role="listitem"
      className="row-rail group relative -mx-3 grid grid-cols-1 gap-3 rounded-r-md border-b border-line px-3 py-8 transition-colors duration-200 hover:bg-elevated/20 sm:grid-cols-12 sm:gap-8"
    >
      <div ref={ref} className="relative sm:col-span-2">
        <motion.div style={{ y }} className="relative inline-block leading-none">
          <span className="block font-serif text-7xl font-medium text-aqua/25 transition-colors duration-300 group-hover:text-aqua/60 sm:text-8xl">
            {principle.n}
          </span>
          <motion.span
            aria-hidden="true"
            style={{ opacity: ignite }}
            className="absolute inset-0 block font-serif text-7xl font-medium text-aqua/70 sm:text-8xl"
          >
            {principle.n}
          </motion.span>
        </motion.div>
      </div>

      <div className="sm:col-span-7">
        <h3 className="font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          {principle.title}
        </h3>
        <motion.span
          aria-hidden="true"
          className="mt-3 block h-px w-10 origin-left bg-aqua/40"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          animate={inView || reduce ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.34, ease }}
        />
        <p className="mt-3 max-w-xl text-base leading-relaxed text-stone">
          {principle.body}
        </p>
      </div>

      <div className="sm:col-span-3 sm:text-right">
        {principle.thinker ? (
          <span className="inline-flex rounded-full border border-line px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-muted transition-colors duration-200 group-hover:border-aqua/40 group-hover:text-aqua">
            {inView && !reduce ? (
              <DecryptText text={principle.thinker} duration={700} />
            ) : (
              principle.thinker
            )}
          </span>
        ) : null}
      </div>
    </RevealItem>
  );
}
