"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Play } from "lucide-react";
import { film } from "@/lib/film";
import { emit } from "@/lib/events";
import { DESKTOP_FINE } from "@/lib/flags";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { copyText, copyVisible } from "@/lib/sections";
import type { CopyKey } from "@/lib/film";
import { startDirectorsCut, type Tour } from "@/components/director/api";
import { eggEnabled, eggsSessionOff } from "@/components/eggs/egg-bus";
import { HUNT_PANEL_EVENT, HUNT_TOTAL, useHuntState } from "@/components/eggs/hunt-store";
import { DEAD_EYE_CALL } from "@/components/games/shared";
import { OPEN_PALETTE_EVENT } from "@/components/site/command-palette";
// its CSS loads with this lazy chunk, not the page
import "@/app/p3/dock-lazy.css";

/* ============================================================================
   DOCK POPOVERS (lazy): the Director's cut chooser and the Games menu that
   open under the header's control dock (components/site/control-dock.tsx,
   which owns open / close, Esc, the outside press and the focus return).
   NON-MODAL: no focus trap, no scroll lock. The first button takes focus
   when a popover opens. Everything here is a real <button>.
   - Chooser: two big buttons, "Quick tour" and "Full tour"; a press starts
     that tour (components/director/api.ts: the click is the sound consent).
   - Games: one row per thing to try, each "bold verb, one plain line, Play".
     Fly the drone / Dead Eye jump there through the film cut and START
     (the palette only focuses the pill); the hunt row opens the hint panel;
     the search row opens the palette. The drone and Dead Eye rows exist
     only when their pill is on the page; Dead Eye and the hunt are hidden
     when the easter eggs are off, like the palette.
   All copy is `dock.*` in lib/film.ts (proposed, unsigned).
   ========================================================================== */

const text = (k: CopyKey): string | null => {
  const c = copyText(k);
  return copyVisible(c) ? c.text : null;
};

export type PopoverKind = "cut" | "games";

export default function DockPopover({ kind, onDone }: { kind: PopoverKind; onDone: (refocus: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  }, []);
  return kind === "cut" ? <CutChooser box={ref} onDone={onDone} /> : <GamesMenu box={ref} onDone={onDone} />;
}

type BoxProps = { box: React.RefObject<HTMLDivElement | null>; onDone: (refocus: boolean) => void };

function CutChooser({ box, onDone }: BoxProps) {
  const titleId = useId();
  const heading = text("dock.cut.heading");
  const blurb = text("dock.cut.blurb");
  const note = text("dock.cut.sound");
  const tours: { tour: Tour; title: string | null; sees: string | null }[] = [
    { tour: "quick", title: text("dock.cut.quick"), sees: text("dock.cut.quick.sees") },
    { tour: "full", title: text("dock.cut.full"), sees: text("dock.cut.full.sees") },
  ];
  const start = (tour: Tour) => {
    // inside the click: the click is the sound consent (api.ts borrows it)
    startDirectorsCut(tour);
    onDone(true);
  };
  return (
    <div ref={box} className="dock-pop" role="dialog" aria-labelledby={titleId} tabIndex={-1} data-dock-pop="cut" data-lenis-prevent="">
      <p id={titleId} className="dock-pop-h">
        {heading}
      </p>
      {blurb ? <p className="dock-pop-p">{blurb}</p> : null}
      <div className="dock-tours">
        {tours.map((t) =>
          t.title ? (
            <button key={t.tour} type="button" className="dock-tour" data-tour={t.tour} onClick={() => start(t.tour)}>
              <span className="dock-tour-t">
                <Play aria-hidden="true" strokeWidth={2} />
                {t.title}
              </span>
              {t.sees ? <span className="dock-tour-s">{t.sees}</span> : null}
            </button>
          ) : null,
        )}
      </div>
      {note ? <p className="dock-pop-note">{note}</p> : null}
    </div>
  );
}

/** The jump through the film cut (focus lands on the target's heading). */
function jump(id: string): Promise<void> {
  const el = document.getElementById(id);
  return el ? scrollToTarget(el, { cut: true, focus: true, history: "replace" }) : Promise.resolve();
}

/** Start a Dead Eye round: the DEAD_EYE_CALL event the games binder answers;
 *  before the binder ran, a click on the pill (the boot script queues it). */
function startDeadEye(): void {
  const detail: { action: "start"; handled?: boolean } = { action: "start" };
  window.dispatchEvent(new CustomEvent(DEAD_EYE_CALL, { detail }));
  if (detail.handled) return;
  if (window.__enhanceQ) document.getElementById("deadeye-call")?.click();
}

type Row = { id: string; verb: string; line: string; n?: string; kbd?: string; button: string; run: () => void };

function GamesMenu({ box, onDone }: BoxProps) {
  const titleId = useId();
  const { count, enabled: huntOn } = useHuntState();
  // what the page holds right now (the popover mounts fresh on every open)
  const [page] = useState(() => {
    const fine = window.matchMedia(DESKTOP_FINE).matches;
    const eggsOn = film.enabled && film.eggs.enabled && !eggsSessionOff();
    return {
      drone: fine && Boolean(document.getElementById("drone-takeoff")),
      deadEye: fine && eggsOn && eggEnabled("dead-eye") && Boolean(document.getElementById("kill-list")) && Boolean(document.getElementById("deadeye-call")),
      hunt: fine && eggsOn,
      mac: /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    };
  });
  const play = text("dock.games.play");
  const open = text("dock.games.open");
  const rows: Row[] = [];
  const add = (r: Omit<Row, "verb" | "line" | "button"> & { verb: string | null; line: string | null; button: string | null }) => {
    if (r.verb && r.line && r.button) rows.push({ ...r, verb: r.verb, line: r.line, button: r.button });
  };
  if (page.drone)
    add({
      id: "drone",
      verb: text("dock.games.drone"),
      line: text("dock.games.drone.sees"),
      button: play,
      run: () => {
        onDone(false);
        emit("fastlane");
        void jump("systems").then(() => document.getElementById("drone-takeoff")?.click());
      },
    });
  if (page.deadEye)
    add({
      id: "deadeye",
      verb: text("dock.games.deadeye"),
      line: text("dock.games.deadeye.sees"),
      button: play,
      run: () => {
        onDone(false);
        emit("fastlane");
        void jump("kill-list").then(startDeadEye);
      },
    });
  if (page.hunt && huntOn)
    add({
      id: "hunt",
      verb: text("dock.games.hunt"),
      line: text("dock.games.hunt.sees"),
      n: `${count ?? "–"}/${HUNT_TOTAL}`,
      button: open,
      run: () => {
        onDone(false);
        window.setTimeout(() => window.dispatchEvent(new Event(HUNT_PANEL_EVENT)), 0);
      },
    });
  add({
    id: "search",
    verb: text("dock.games.search"),
    line: text("dock.games.search.sees"),
    kbd: page.mac ? "⌘ K" : "Ctrl K",
    button: open,
    run: () => {
      onDone(false);
      window.setTimeout(() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT)), 0);
    },
  });

  return (
    <div ref={box} className="dock-pop" role="dialog" aria-labelledby={titleId} tabIndex={-1} data-dock-pop="games" data-lenis-prevent="">
      <p id={titleId} className="dock-pop-h">
        {text("dock.games")}
      </p>
      <div className="dock-rows">
        {rows.map((r) => (
          <div key={r.id} className="dock-row" data-game-row={r.id}>
            <div className="dock-row-t">
              <p className="dock-row-v">
                <span>{r.verb}</span>
                {r.n ? <span className="dock-row-n">{r.n}</span> : null}
                {r.kbd ? <kbd className="dock-row-kbd">{r.kbd}</kbd> : null}
              </p>
              <p className="dock-row-s">{r.line}</p>
            </div>
            <button type="button" className="dock-play" aria-label={`${r.button}: ${r.verb}`} onClick={r.run}>
              {r.button}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
