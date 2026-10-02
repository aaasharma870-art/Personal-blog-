/* ============================================================================
   DEAD EYE · the bridge (RETIRED egg; PHASE3-SPEC §9.1 "dead-eye becomes a
   toy", §9.2 #3) — OWNER: W3-GAMES.
   The one-shot egg that lived here (time slowed, the ledger's ground
   transitioned, the marks locked by themselves) is retired into the game:
   components/games/dead-eye/{run.ts, dead-eye-hud.tsx, dead-eye-call.tsx}.
   What stays is the contract its callers use:
   - `killedRows(section)`: the ledger's DOM contract (data-verdict="killed",
     data-reason, data-name), now read by the game's run.ts;
   - `runDeadEye({ reduced, onFired, onEnd })` for the egg runtime (the typed
     word "deadeye" and the palette, components/eggs/egg-runtime.tsx): it
     CALLS the game (the DEAD_EYE_CALL window event, answered by the
     kill-list's <DeadEyeCall/>, DESKTOP_FINE) and returns { fire, abort }.
     `onEnd` runs when the round is released (`game:stop`). The round shows
     its own score in its HUD, so `onFired` is no longer called (the toast
     would repeat it) and `reduced` is the round's own business (run.ts
     reads motion live).
   Lazy: the egg runtime imports this file on the first "deadeye".
   ========================================================================== */

import { on } from "@/lib/events";
import { DESKTOP_FINE } from "@/lib/flags";
import { DEAD_EYE_CALL, type DeadEyeAction } from "@/components/games/shared";

export { killedRows } from "@/components/games/dead-eye/run";

export type DeadEyeRun = {
  /** Fire now (if the round is painting). */
  fire(): void;
  /** Esc: release the round; the ledger is restored at once. */
  abort(): void;
};

const call = (action: DeadEyeAction) => window.dispatchEvent(new CustomEvent(DEAD_EYE_CALL, { detail: { action } }));

export function runDeadEye(o: {
  reduced: boolean;
  /** Kept for the caller's contract; the round's HUD shows the score. */
  onFired: (n: number) => void;
  /** The round is over and the ledger restored. */
  onEnd: () => void;
}): DeadEyeRun | null {
  // the call lives in the kill-list header on DESKTOP_FINE; without it (a
  // phone, another page) there is no round to start
  if (!document.getElementById("kill-list") || !document.getElementById("deadeye-call") || !window.matchMedia(DESKTOP_FINE).matches) return null;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    off();
    o.onEnd();
  };
  const off = on("game:stop", (d) => {
    if (d.game === "deadeye") finish();
  });
  call("start");
  return {
    fire: () => call("fire"),
    // a stop always ends the round (or there was none): the caller is told
    // at once, so it never waits on a round that did not start
    abort: () => {
      call("stop");
      finish();
    },
  };
}
