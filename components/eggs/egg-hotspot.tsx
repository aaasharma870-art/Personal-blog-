import type { ReactNode } from "react";
import type { CopyKey } from "@/lib/film";
import type { HuntId } from "@/lib/hunt";

/* ============================================================================
   EGG HOTSPOT (spec §9.1, plan §3.7) — OWNER: W2-HUNT.
   Server markup: a <button data-egg-hotspot> around its children, shown on
   DESKTOP_FINE by media query, keyboard-reachable, bound by the hotspots
   binder (components/enhance/binders/hotspots.ts).
   W1.0 stub: renders its children as they are (no button yet).
   ========================================================================== */

export type EggHotspotProps = {
  hunt: HuntId;
  label: CopyKey;
  className?: string;
  children?: ReactNode;
};

export function EggHotspot({ children }: EggHotspotProps) {
  return <>{children}</>;
}
