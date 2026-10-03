import type { ReactNode } from "react";
import { beatAttrs } from "@/lib/beats";
import { film } from "@/lib/film";
import { effectiveVariant, type VariantChoice } from "@/lib/variants";
import type { DeadEyeCopy } from "@/components/games/shared";

/* ============================================================================
   DEAD EYE · the call (PHASE3-SPEC §9.2 #3 "Entry", B28) — OWNER: W3-GAMES.
   The Meta pill "DEAD EYE" (lettered in Rye by the server, with our
   eye-ring glyph, never a reticle) in the kill-list header's Meta row.

   SERVER MARKUP (0 bytes of first-load JS, the DirectorsCutButton pattern):
   a real <button>, shown only on DESKTOP_FINE after JS by the full media
   query (app/p3/games.css), so phones, touch tablets and no-JS views keep
   today's header. The desktop enhancer's games binder (components/enhance/
   binders/games.ts, lazy, DESKTOP_FINE, home page) wires it:
   - a press starts a round (the lazy HUD + components/games/dead-eye/
     run.ts, in their own small React root); a press during a round
     releases it; `aria-pressed` follows the round;
   - a press before the binder ran is recorded by the boot script
     (`data-enhance-queue`) and replayed;
   - the typed word "deadeye" and the palette reach it through
     components/eggs/dead-eye.ts (the DEAD_EYE_CALL window event);
   - B28, the invite: on scroll-idle, once, the pill pulses through the
     spotlight (components/games/invite.ts, motion on); the round's chunk
     is warmed when the pill comes near.
   It never runs by itself. The round's strings ride `data-copy` (resolved
   on the server, components/games/copy.ts) and the manifest's
   `kill-list.deadeye` variant `data-variant` (the binder applies a
   ?variant= override on top, like useVariant).
   Server-only: never import this file from a client component.
   ========================================================================== */

/** `children`: the pill's face, server markup (the eye-ring glyph and the
 *  lettered "DEAD EYE"). */
export function DeadEyeCall({ copy, choice, children }: { copy: DeadEyeCopy; choice: VariantChoice; children: ReactNode }) {
  return (
    <button
      id="deadeye-call"
      type="button"
      className="game-pill type-meta"
      aria-pressed="false"
      data-enhance-queue=""
      data-variant={effectiveVariant(choice, "kill-list.deadeye", "", film.defaultVariant)}
      data-copy={JSON.stringify(copy)}
      {...beatAttrs("B28", { weight: 1 })}
    >
      {children}
    </button>
  );
}
