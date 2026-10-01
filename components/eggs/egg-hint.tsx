"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { eggEnabled, eggsSessionOff, subscribeEggs, type EggId } from "@/components/eggs/egg-bus";

/* ============================================================================
   EGG HINT (PHASE3-SPEC §3.6, §9.1) — OWNER: W2-HUNT.
   Wraps a hunt egg's lettered hint marginal on its host ("I solemnly
   swear…" on the Map banner, "parley?" by the brass X): rendered at rest
   (server and hydration), hidden once the visitor turns the eggs off for
   the session (the count is kept), absent when the egg is off in the
   registry. The host keeps the marginal aria-hidden, as today.
   ========================================================================== */

export function EggHint({ egg, children }: { egg: EggId; children?: ReactNode }) {
  const off = useSyncExternalStore(subscribeEggs, eggsSessionOff, () => false);
  if (off || !eggEnabled(egg)) return null;
  return <>{children}</>;
}
