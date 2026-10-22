import type { ReactNode } from "react";
import { beatAttrs } from "@/lib/beats";
import { film } from "@/lib/film";
import { copyText, copyVisible } from "@/lib/sections";
import { effectiveVariant, type VariantChoice } from "@/lib/variants";
import type { DeadEyeCopy, GameKeyCopy } from "@/components/games/shared";

/* ============================================================================
   DEAD EYE · the call (PHASE3-SPEC §9.2 #3 "Entry", B28) — OWNER: W3-GAMES.
   The game's ARCADE KEY (app/p3/arcade.css, Oct 22 fix: "the games aren't
   properly visible or clear while scrolling"): "Play DEAD EYE" (the eye-ring
   glyph, "Play" and the name lettered in Rye by the server, never a reticle)
   with a state window (a lamp and Ready / Live), and beside it a small
   "Mini-game" tag over one plain line about what you do. The key and its line
   are one plate (`.game-row`) in the kill-list header under the intro, shown
   at rest, not only when a pulse plays.

   SERVER MARKUP (0 bytes of first-load JS, the DirectorsCutButton pattern):
   a real <button>, its plate shown only on DESKTOP_FINE after JS by the full
   media query (app/p3/games.css), so phones, touch tablets and no-JS views
   keep today's header. The desktop enhancer's games binder (components/
   enhance/binders/games.ts, lazy, DESKTOP_FINE, home page) wires it:
   - a press starts a round (the lazy HUD + components/games/dead-eye/
     run.ts, in their own small React root); a press during a round
     releases it; `aria-pressed` follows the round (the key's lamp and its
     Ready / Live word follow it in CSS);
   - a press before the binder ran is recorded by the boot script
     (`data-enhance-queue`) and replayed;
   - the typed word "deadeye" and the palette reach it through
     components/eggs/dead-eye.ts (the DEAD_EYE_CALL window event);
   - B28, the invite: on scroll-idle, once, the key pulses through the
     spotlight (components/games/invite.ts, motion on); the round's chunk
     is warmed when the key comes near.
   It never runs by itself. The round's strings ride `data-copy` (resolved
   on the server, components/games/copy.ts) and the manifest's
   `kill-list.deadeye` variant `data-variant` (the binder applies a
   ?variant= override on top, like useVariant). The line beside the key is the
   key's description (`aria-describedby`).
   Server-only: never import this file from a client component.
   ========================================================================== */

/** The key's face is server markup: `icon` (the eye-ring glyph, class
 *  `arcade-key-ico`) and `children` (the lettered "DEAD EYE" in an
 *  `arcade-key-name` span), with the verb between them. `keys` is the
 *  "Mini-game" tag, the plain line and the Ready / Live words (null: the key
 *  alone, no line). */
export function DeadEyeCall({
  copy,
  choice,
  keys,
  icon,
  children,
}: {
  copy: DeadEyeCopy;
  choice: VariantChoice;
  keys: GameKeyCopy | null;
  icon: ReactNode;
  children: ReactNode;
}) {
  const play = copyText("dock.games.play");
  return (
    <div className="game-row arcade-plaque arcade-plaque--panel" data-arcade-skin="rdr2">
      <button
        id="deadeye-call"
        type="button"
        className="arcade-key arcade-key--big"
        aria-pressed="false"
        aria-describedby={keys ? "deadeye-what" : undefined}
        data-enhance-queue=""
        data-variant={effectiveVariant(choice, "kill-list.deadeye", "", film.defaultVariant)}
        data-copy={JSON.stringify(copy)}
        {...beatAttrs("B28", { weight: 1 })}
      >
        <span className="arcade-key-face">
          {icon}
          {/* a verb first, so the key reads as a thing to press ("Play DEAD EYE") */}
          {copyVisible(play) ? <span className="arcade-key-verb game-pill-verb">{play.text}</span> : null}
          {children}
          {keys ? (
            <span className="arcade-key-win" aria-hidden="true">
              <i className="arcade-lamp" />
              <span className="arcade-key-word">
                <span className="ak-off">{keys.ready}</span>
                <span className="ak-on">{keys.live}</span>
              </span>
            </span>
          ) : null}
        </span>
      </button>
      {keys ? (
        <p id="deadeye-what" className="arcade-what">
          <span className="arcade-what-tag">{keys.tag}</span>
          {keys.what}
        </p>
      ) : null}
    </div>
  );
}
