import type { ReactNode } from "react";
import { film, type CopyKey } from "@/lib/film";
import type { HuntId } from "@/lib/hunt";
import { copyText, copyVisible } from "@/lib/sections";
import { cn } from "@/lib/utils";
import type { HUNT_ROWS } from "@/components/eggs/hunt-rows";

/* ============================================================================
   EGG HOTSPOT (PHASE3-SPEC §9, §9.1; PHASE3-PLAN §3.7) — OWNER: W2-HUNT.
   Server markup for an in-world find: a real <button data-egg-hotspot>,
   shown ONLY on DESKTOP_FINE by the full media query (app/p3/game.css;
   never `lg:`), so phones and touch tablets never get a button they cannot
   use. Keyboard: it is a button (Enter / Space activate it). The desktop
   enhancer's hotspots binder (components/enhance/binders/hotspots.ts) binds
   it; a click before the binder is recorded (`data-enhance-queue`) and
   replayed. Its activation dispatches `triggerEgg(<registry id>)`, the one
   path the egg runtime counts and the sound engine voices; the host draws
   the effect from the same EGG_EVENT and never waits for the spotlight.

   Wave-3 hosts place it:
   - with `children` it IS the glyph (the eye ring, the chalk heart);
   - without, it is a transparent ≥ 44 px hit area the host positions over
     its art with `className` (the medallion, the bone, the fire).
   Per egg (from its hunt id, no prop): 3i-aal is a press-and-HOLD (600 ms;
   Enter / Space count as the hold); rd-fire also fires on a 0.8 s hover.
   Renders nothing when the egg is off in the registry or its label may not
   render here (no orphan button).
   ========================================================================== */

export type EggHotspotProps = {
  hunt: HuntId;
  label: CopyKey;
  className?: string;
  children?: ReactNode;
};

type InWorld = "pc-coin" | "pc-kraken" | "3i-aal" | "3i-quad" | "3i-pen" | "rd-eagle" | "rd-bone" | "rd-fire";

/** The registry id each in-world hotspot fires (spec §9.1). Typed against
 *  components/eggs/hunt-rows.ts, so the two can never disagree, without
 *  shipping the registry rows to every host's chunk. */
const EGG_OF: { readonly [K in InWorld]: (typeof HUNT_ROWS)[K]["registryId"] } = {
  "pc-coin": "aztec-coin",
  "pc-kraken": "hidden-kraken",
  "3i-aal": "aal-izz-well",
  "3i-quad": "quadcopter-lift",
  "3i-pen": "worthy-pen",
  "rd-eagle": "eagle-eye",
  "rd-bone": "fossil-bone",
  "rd-fire": "campfire-flare",
};
const HOLD_MS: Partial<Record<HuntId, number>> = { "3i-aal": 600 };
const DWELL_MS: Partial<Record<HuntId, number>> = { "rd-fire": 800 };

/** On in the registry (data only: a server component may render the hotspot,
 *  so this never imports the client egg bus; these eggs' registry ids are
 *  their EggIds). */
const on = (egg: string): boolean => film.enabled && film.eggs.enabled && film.eggs.list.some((e) => e.id === egg && e.enabled);

export function EggHotspot({ hunt, label, className, children }: EggHotspotProps) {
  const egg = hunt in EGG_OF ? EGG_OF[hunt as InWorld] : undefined;
  const name = copyText(label);
  if (!egg || !on(egg) || !copyVisible(name)) return null;
  return (
    <button
      type="button"
      id={`egg-${hunt}`}
      aria-label={name.text}
      className={cn("egg-hotspot", className)}
      data-egg-hotspot={hunt}
      data-egg={egg}
      data-egg-hold={HOLD_MS[hunt]}
      data-egg-dwell={DWELL_MS[hunt]}
      // a click before the binder is replayed; a hold can't be (a replayed
      // short press is not the hold)
      data-enhance-queue={HOLD_MS[hunt] ? undefined : ""}
    >
      {children}
    </button>
  );
}
