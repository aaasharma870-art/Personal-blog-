"use client";

import { useState } from "react";
import { Gamepad2, Play, RotateCcw } from "lucide-react";
import { copyText, copyVisible } from "@/lib/sections";
import type { CopyKey } from "@/lib/film";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { replayIntro } from "@/components/site/dock-actions";

/* ============================================================================
   MENU CONTROLS: the three dock controls, inside the Menu sheet, for the
   widths where the header dock is not shown (below 64rem: a phone, a tablet,
   a laptop zoomed to 150 %). app/p3/dock.css hides this block under
   DESKTOP_FINE, where the dock is in the header.
   - Replay intro: works at every width (the intro plays on phones too).
   - Director's cut and Games need a window of 64 rem and a mouse (the player
     and the games are DESKTOP_FINE only): shown only for a fine pointer (a
     narrow laptop window), disabled, with the reason beside them.
   Copy is `dock.*` in lib/film.ts (proposed, unsigned).
   ========================================================================== */

const text = (k: CopyKey): string | null => {
  const c = copyText(k);
  return copyVisible(c) ? c.text : null;
};

export function MenuControls({ onPick }: { onPick: () => void }) {
  const { reduced, paused } = useMotionPreference();
  const [why, setWhy] = useState<string | null>(null);
  const replay = text("dock.replay");
  const cut = text("dock.cut");
  const games = text("dock.games");
  const needs = text("dock.menu.needs");
  const motionWhy = text(paused ? "dock.replay.paused" : "dock.replay.reduced");

  const onReplay = () => {
    if (reduced) {
      setWhy(motionWhy);
      return;
    }
    onPick();
    // after the menu released its scroll lock
    window.setTimeout(() => replayIntro(), 60);
  };

  if (!replay && !cut && !games) return null;
  return (
    <div className="menu-ctl" data-menu-ctl="">
      {replay ? (
        <div className="menu-ctl-row">
          <button type="button" className="dock-btn" aria-disabled={reduced || undefined} onClick={onReplay}>
            <RotateCcw aria-hidden="true" strokeWidth={2} />
            {replay}
          </button>
          {why ? (
            <p className="menu-ctl-why" role="status">
              {why}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="menu-ctl-narrow">
        {cut ? (
          <div className="menu-ctl-row">
            <button type="button" className="dock-btn" aria-disabled="true">
              <Play aria-hidden="true" strokeWidth={2} />
              {cut}
            </button>
            {needs ? <p className="menu-ctl-why">{needs}</p> : null}
          </div>
        ) : null}
        {games ? (
          <div className="menu-ctl-row">
            <button type="button" className="dock-btn" aria-disabled="true">
              <Gamepad2 aria-hidden="true" strokeWidth={2} />
              {games}
            </button>
            {needs ? <p className="menu-ctl-why">{needs}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
