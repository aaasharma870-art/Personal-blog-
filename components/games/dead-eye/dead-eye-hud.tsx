"use client";

import { useEffect, useRef, useState } from "react";
import { emit } from "@/lib/events";
import type { Variant } from "@/lib/variants";
import { StageLayerPortal } from "@/components/stage/stage-layers";
import { EyeRing } from "@/components/games/dead-eye/eye-ring";
import { startRound, type Round, type RoundView } from "@/components/games/dead-eye/run";
import { DEAD_EYE_CALL, fill, secs, type DeadEyeAction, type DeadEyeCopy } from "@/components/games/shared";
// the games' CSS rides this lazy chunk, never the first load (W2 rule 34)
import "@/components/games/games.css";

/* ============================================================================
   DEAD EYE · the HUD (lazy; PHASE3-SPEC §9.2 #3) — OWNER: W3-GAMES.
   Mounted for one round by the desktop enhancer's games binder (components/
   enhance/binders/games.ts: its own small React root per round; the DEAD
   EYE pill is server markup, components/games/dead-eye/dead-eye-call.tsx).
   It starts the round (run.ts) and shows it, fixed in the game-hud stage layer
   (StageLayerPortal: under the header and the fast lane, P3-2 #12):
   - the CORE: a white ring that drains over the 5.0 s of Dead Eye (IC-RD-09;
     two half-discs turned by transform under the inner core, no paint per
     frame), our eye-ring glyph inside it; full and still when untimed;
   - the score line ("2/5 marked · 3.1 s of Dead Eye left"; the clock at
     ≤ 10 Hz, aria-hidden), the best once lib/film.ts has its line, and the
     "Survived: not a target" note when a wrong row is clicked;
   - "Fire" (during the paint) and "Release" (always); when the round
     leaves the paint with focus on Fire (Enter on it, the core running
     out), focus moves to Release before Fire unmounts (never to <body>);
   - one polite live region: the notes and the final score.
   Esc anywhere releases (run.ts). Unmounting (the pill again, leaving
   DESKTOP_FINE) restores the ledger at once.
   ========================================================================== */

export default function DeadEyeHud({
  copy,
  variant,
  onEnd,
}: {
  copy: DeadEyeCopy;
  variant: Variant;
  /** The round is over and the ledger restored (`reason`: "esc", "release",
   *  "offscreen", "fastlane", "none"; never called for an unmount). */
  onEnd: (reason: string) => void;
}) {
  const [view, setView] = useState<RoundView | null>(null);
  const [note, setNote] = useState("");
  const [said, setSaid] = useState("");
  const right = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const fireBtn = useRef<HTMLButtonElement>(null);
  const releaseBtn = useRef<HTMLButtonElement>(null);
  const round = useRef<Round | null>(null);
  const endRef = useRef(onEnd);
  useEffect(() => {
    endRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    let noteTimer = 0;
    const r = startRound({
      variant,
      survivor: copy.survivor,
      hooks: {
        view: (v) => {
          // Fire unmounts when the paint ends: its focus goes to Release
          // first (synchronously, before React removes it)
          if (v.phase !== "paint" && fireBtn.current && document.activeElement === fireBtn.current) releaseBtn.current?.focus({ preventScroll: true });
          setView(v);
        },
        core: (share) => {
          // the ring drains clockwise from 12 o'clock: the right half first
          const used = 1 - Math.min(1, Math.max(0, share));
          const a = Math.min(used, 0.5) * 360;
          const b = Math.max(used - 0.5, 0) * 360;
          if (right.current) right.current.style.transform = `rotate(${a.toFixed(1)}deg)`;
          if (left.current) left.current.style.transform = `rotate(${b.toFixed(1)}deg)`;
        },
        note: (text) => {
          setNote(text);
          setSaid(text);
          window.clearTimeout(noteTimer);
          noteTimer = window.setTimeout(() => setNote(""), 1600);
        },
        ended: (reason) => endRef.current(reason),
      },
    });
    if (!r) {
      // nothing to play (no ledger rows): tell the callers it is over
      emit("game:stop", { game: "deadeye", reason: "none" });
      endRef.current("none");
      return;
    }
    round.current = r;
    const onCall = (e: Event) => {
      const a = (e as CustomEvent<{ action?: DeadEyeAction }>).detail?.action;
      if (a === "fire") r.fire();
    };
    window.addEventListener(DEAD_EYE_CALL, onCall);
    return () => {
      window.clearTimeout(noteTimer);
      window.removeEventListener(DEAD_EYE_CALL, onCall);
      r.release("unmount");
      round.current = null;
    };
  }, [variant, copy.survivor]);

  const result = view?.result ?? null;
  // the live region: the notes during the paint, then the final score once
  const live = result ? scoreLine(copy.score, result.n, result.left) : said;
  const phase = view?.phase ?? "aim";
  const line = view ? scoreLine(copy.score, view.marked, view.left) : "";
  const best = result?.best && copy.best ? fill(copy.best, { n: result.best.n, s: secs(result.best.left) }) : null;

  return (
    <StageLayerPortal layer="game-hud">
      <div className="de-hud" data-phase={phase} data-house-type="">
        <div className="de-core" aria-hidden="true">
          <div className="de-track" />
          <div className="de-half de-half-r">
            <div ref={right} className="de-fill" />
          </div>
          <div className="de-half de-half-l">
            <div ref={left} className="de-fill" />
          </div>
          <div className="de-inner">
            <EyeRing className="de-eye" />
          </div>
        </div>
        <div className="de-read">
          <p className="tnum type-meta text-fg" aria-hidden="true">
            {line}
          </p>
          {note ? (
            <p className="type-small text-fg-muted" aria-hidden="true">
              {note}
            </p>
          ) : best ? (
            <p className="tnum type-meta text-fg-muted">{best}</p>
          ) : null}
        </div>
        {phase === "paint" ? (
          <button ref={fireBtn} type="button" className="de-btn type-meta" onClick={() => round.current?.fire()}>
            {copy.fire}
          </button>
        ) : null}
        <button ref={releaseBtn} type="button" className="de-btn type-meta" onClick={() => round.current?.release("release")}>
          {copy.release}
        </button>
        <p className="sr-only" role="status" aria-live="polite">
          {live}
        </p>
      </div>
    </StageLayerPortal>
  );
}

/** "n/5 marked · s s of Dead Eye left"; untimed (reduced motion): the line
 *  up to its separator ("n/5 marked"), never an invented string. */
function scoreLine(template: string, n: number, left: number | null): string {
  if (left !== null) return fill(template, { n, s: secs(left) });
  const head = template.split(" · ")[0] ?? template;
  return fill(head, { n });
}
