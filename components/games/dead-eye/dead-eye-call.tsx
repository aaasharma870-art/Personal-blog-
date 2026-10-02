"use client";

import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { beatAttrs } from "@/lib/beats";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { EyeRing } from "@/components/games/dead-eye/eye-ring";
import { DEAD_EYE_CALL, type DeadEyeAction, type DeadEyeCopy } from "@/components/games/shared";

/* the round + its HUD: a lazy chunk, DESKTOP_FINE only, on demand (DP-13) */
const DeadEyeHud = lazy(() => import("@/components/games/dead-eye/dead-eye-hud"));

/* ============================================================================
   DEAD EYE · the call (PHASE3-SPEC §9.2 #3 "Entry", B28) — OWNER: W3-GAMES.
   The Meta pill "DEAD EYE" (lettered in Rye by the server, with our
   eye-ring glyph, never a reticle) in the kill-list header's Meta row. It is
   server markup shown only on DESKTOP_FINE after JS by the full media query
   (app/p3/games.css), so phones, touch tablets and no-JS views keep today's
   header. A press starts a round (the lazy HUD + components/games/dead-eye/
   run.ts); a press during a round releases it. The typed word "deadeye"
   and the palette reach it through components/eggs/dead-eye.ts (the
   DEAD_EYE_CALL window event). It never runs by itself.
   B28, the invite: on scroll-idle, once, the pill pulses through the
   spotlight (components/games/invite.ts, lazy, motion on).
   ========================================================================== */

export function DeadEyeCall({ copy, choice, children }: { copy: DeadEyeCopy; choice: VariantChoice; children: ReactNode }) {
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  const variant = useVariant(choice, "kill-list.deadeye");
  /** The round being played (0 = none); a new number = a fresh round. */
  const [round, setRound] = useState(0);
  const last = useRef(0);
  const pill = useRef<HTMLButtonElement>(null);

  const start = useCallback(() => setRound((r) => (r > 0 ? r : ++last.current)), []);
  /** The round is over: focus comes home to the pill if it was in the game. */
  const ended = useCallback(() => {
    const a = document.activeElement;
    const inGame = !a || a === document.body || Boolean(a.closest("#kill-list, [data-stage-layers]"));
    setRound(0);
    if (inGame) pill.current?.focus({ preventScroll: true });
  }, []);

  // the typed word and the palette (components/eggs/dead-eye.ts)
  useEffect(() => {
    if (!fine) return;
    const onCall = (e: Event) => {
      const a = (e as CustomEvent<{ action?: DeadEyeAction }>).detail?.action;
      if (a === "start") start();
      else if (a === "stop") setRound(0);
    };
    window.addEventListener(DEAD_EYE_CALL, onCall);
    return () => window.removeEventListener(DEAD_EYE_CALL, onCall);
  }, [fine, start]);

  // B28: the invite (motion on), and the round's chunk warmed when near
  useEffect(() => {
    const el = pill.current;
    if (!fine || !el) return;
    let gone = false;
    let off: (() => void) | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        void import("@/components/games/dead-eye/dead-eye-hud").catch(() => {});
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    if (!reduced) {
      void import("@/components/games/invite").then(({ armInvite }) => {
        if (gone) return;
        off = armInvite(el, "B28", () =>
          el.animate(
            [
              { transform: "scale(1)" },
              { transform: "scale(1.06)", offset: 0.35 },
              { transform: "scale(1)" },
            ],
            { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          ),
        );
      });
    }
    return () => {
      gone = true;
      io.disconnect();
      off?.();
    };
  }, [fine, reduced]);

  return (
    <>
      <button
        ref={pill}
        id="deadeye-call"
        type="button"
        className="game-pill type-meta"
        aria-pressed={round > 0}
        onClick={() => (round > 0 ? setRound(0) : start())}
        {...beatAttrs("B28", { weight: 1 })}
      >
        <EyeRing className="size-5" />
        {children}
      </button>
      {fine && round > 0 ? (
        <Suspense fallback={null}>
          <DeadEyeHud key={round} copy={copy} variant={variant} onEnd={ended} />
        </Suspense>
      ) : null}
    </>
  );
}
