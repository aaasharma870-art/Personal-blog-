"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/flags";
import { dur, ease } from "@/lib/motion";
import { planeAttrs, type WorldId } from "@/lib/worlds";
import { StageLayerPortal } from "@/components/stage/stage-layers";

/* ============================================================================
   EGG TOAST (eggs.BAR E11; PHASE3-SPEC §3.2, §9.3) — a transient line in the
   bottom-left corner: a polite role="status" announced once, auto-dismissed
   within 4 s, never focusable, pointer-events off. Its plane is the egg's
   world (Dead Eye: rdr2; Lumos: hp; Aal izz well: idiots …).
   PHASE 3: it renders in <StageLayers/>'s fixed "toast" layer (--z-toast 32:
   above the stage, the bars and the game HUDs; below the director's-cut
   overlay and the header, so the fast lane is never covered; bottom-left,
   clear of the bottom-centre stop pill). Pages without the stage (the 404)
   get the same corner as a plain fixed box at the same z.
   ========================================================================== */

export type EggToastData = { key: number; world: WorldId; body: ReactNode; ms?: number };

const BOX = "pointer-events-none absolute bottom-4 left-4 max-w-[min(26rem,calc(100vw-2rem))]";

/* the stage's toast layer exists only on the home page (read once mounted;
   the runtime that renders toasts is client-only) */
const noSubscribe = () => () => {};
const hasToastLayer = () => Boolean(document.querySelector('[data-stage-layers="toast"]'));
const noToastLayer = () => null;

export function EggToast({ toast, onDone }: { toast: EggToastData | null; onDone: () => void }) {
  const reduce = useReducedMotion();
  const staged = useSyncExternalStore(noSubscribe, hasToastLayer, noToastLayer);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDone, Math.min(toast.ms ?? 3600, 4000));
    return () => window.clearTimeout(t);
  }, [toast, onDone]);

  if (staged === null) return null;
  const region = (
    <div role="status" aria-live="polite" className={BOX} data-egg-toasts="">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.key}
            {...planeAttrs("raised", toast.world)}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : dur.micro, ease } }}
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
  return staged ? (
    <StageLayerPortal layer="toast">{region}</StageLayerPortal>
  ) : (
    <div className="pointer-events-none fixed inset-0 z-(--z-toast)">{region}</div>
  );
}
