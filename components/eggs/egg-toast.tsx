"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { dur, ease } from "@/lib/motion";
import { planeAttrs, type WorldId } from "@/lib/worlds";

/* ============================================================================
   EGG TOAST (eggs.BAR E11): a transient line in the bottom-left corner — a
   polite role="status" announced once, auto-dismissed within 4 s, never
   focusable, never in front of the reading column's start (it sits in the
   corner, above the gutter), pointer-events off. Its plane is the egg's
   world (Dead Eye: rdr2; Lumos: hp; Aal izz well: idiots …).
   ========================================================================== */

export type EggToastData = { key: number; world: WorldId; body: ReactNode; ms?: number };

export function EggToast({ toast, onDone }: { toast: EggToastData | null; onDone: () => void }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDone, Math.min(toast.ms ?? 3600, 4000));
    return () => window.clearTimeout(t);
  }, [toast, onDone]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 z-(--z-menu) max-w-[min(26rem,calc(100vw-2rem))]">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.key}
            {...planeAttrs("raised", toast.world)}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : dur.base, ease }}
            className="rounded-frame bg-bg px-4 py-3 text-fg shadow-[inset_0_0_0_1px_var(--rule)]"
            data-egg-toast=""
          >
            {toast.body}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
