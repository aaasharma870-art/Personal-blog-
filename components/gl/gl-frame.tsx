"use client";

import type { MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { film } from "@/lib/film";
import { addHost } from "@/lib/gl/gl-lock";
import type { GlTier } from "@/lib/gl/support";
import type { GlCardSpec } from "@/lib/gl/types";
import { useVariant } from "@/lib/use-variant";

/* ============================================================================
   GL FRAME (spec §3.3) — OWNER: W2-GL. The lazy half of GlGate: one host
   box per card frame; the runtime (lib/gl/gl-lock.ts) re-parents the page's
   one canvas into the host that owns it, fades the box in at a p end and
   flips `data-gl` on the frame. aria-hidden, no pointer events.
   ========================================================================== */

type Props = {
  spec: GlCardSpec;
  p: MotionValue<number>;
  onTier: (t: GlTier) => void;
};

export default function GlFrame({ spec, p, onTier }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const host = useRef<ReturnType<typeof addHost> | null>(null);
  const tier = useRef(onTier);
  // the card's manifest choice (the one CARDS resolves its css side with):
  // spec.choice, else the act of this world in the film manifest
  const choice = spec.choice ?? film.acts.find((a) => a.world === spec.b.world)?.variant ?? null;
  const title = useVariant(choice, "title.mask") === "default";
  const roll = useVariant(choice, "match.shape") === "alt";
  const latest = useRef({ spec, title, roll });

  useEffect(() => {
    tier.current = onTier;
    latest.current = { spec, title, roll };
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = addHost({ el, p, ...latest.current, onTier: (t) => tier.current(t) });
    host.current = h;
    return () => {
      host.current = null;
      h.remove();
    };
  }, [p]);

  useEffect(() => {
    host.current?.update({ spec, title, roll });
  }, [spec, title, roll]);

  return (
    <div
      ref={ref}
      data-gl-host=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden opacity-0"
    />
  );
}
