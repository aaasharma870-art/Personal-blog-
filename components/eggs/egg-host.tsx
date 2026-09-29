"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { film } from "@/lib/film";
import { setMotionPaused, useOsReducedMotion, useReducedMotion } from "@/lib/flags";
import { quotes } from "@/lib/quotes";
import { copyText, copyVisible } from "@/lib/sections";
import { useVariant } from "@/lib/use-variant";
import type { WorldId } from "@/lib/worlds";
import { FilmQuote, quoteAttribution } from "@/components/site/film-quote";
import { Lettered } from "@/components/primitives/scene-caption";
import { eggCopy, type EggCopyKey } from "@/components/eggs/egg-copy";
import {
  EGG_EVENT,
  eggEnabled,
  eggsSessionOff,
  obliviate,
  setEggsSessionOff,
  type EggId,
} from "@/components/eggs/egg-bus";
import { EggToast, type EggToastData } from "@/components/eggs/egg-toast";
import type { DeadEyeRun } from "@/components/eggs/dead-eye";

/* ============================================================================
   EGG HOST (SPEC v2 §10.3; eggs.BAR) — the one always-mounted egg runtime,
   rendered by the command palette (so it lives wherever the site chrome
   does, and never on /lab). At rest it renders NOTHING (E1) and costs a
   keydown listener; every egg's body is a lazy chunk fetched on trigger (E2).

   Triggers (E3):
   - the palette (and anything else) dispatches EGG_EVENT (egg-bus.ts);
   - typed words, only while focus is NOT in an input, textarea, select or
     contenteditable, letters only, the buffer reset after 1.5 s of quiet;
     NO single-key shortcut anywhere (WCAG 2.1.4):
       "i solemnly swear"  → the Marauder's Map
       "lumos" / "nox"     → resume / pause motion (literal names elsewhere)
       "deadeye"           → Dead Eye, when #kill-list is ≥ 50 % in view on a
                             fine pointer
   "Turn off easter eggs" (session) stops typed triggers and auto-eggs.
   Also the console line (Q-PC-3, attribution in the same string, with its
   true rider), once per page view.
   ========================================================================== */

const MapDialog = dynamic(() => import("@/components/eggs/marauders-map-dialog"), { ssr: false });

const BUFFER_MS = 1500;
const WORDS: readonly (readonly [string, EggId])[] = [
  ["solemnlyswear", "marauders-map"],
  ["lumos", "lumos"],
  ["deadeye", "dead-eye"],
  ["nox", "nox"],
];

let consoleLineShown = false;

function typingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  return /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
}

/** ≥ 50 % of #kill-list is in view (or it fills ≥ 50 % of the viewport). */
function killListInView(): boolean {
  const el = document.getElementById("kill-list");
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const shown = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
  return shown >= Math.min(r.height, vh) * 0.5;
}

function deadEyeAvailable(): boolean {
  return window.matchMedia("(pointer: fine) and (min-width: 64rem)").matches;
}

const c = (k: EggCopyKey): string | null => (copyVisible(eggCopy[k]) ? eggCopy[k].text : null);

export function EggHost({ go }: { go: (id: string) => void }) {
  const reduced = useReducedMotion();
  const osReduced = useOsReducedMotion();
  const mapVariant = useVariant(null, "egg-map.unfold");
  const [region, setRegion] = useState(false);
  const [toast, setToast] = useState<EggToastData | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const deadEye = useRef<DeadEyeRun | null>(null);
  const seq = useRef(0);

  const say = useCallback((world: WorldId, body: ReactNode, ms?: number) => {
    // mount the live region first (never at rest: E1), then speak into it
    setRegion(true);
    window.setTimeout(() => setToast({ key: ++seq.current, world, body, ms }), 60);
  }, []);
  const sayCopy = useCallback(
    (world: WorldId, k: EggCopyKey) => {
      const text = c(k);
      if (text) say(world, <p className="type-small text-fg">{text}</p>);
    },
    [say],
  );
  const clearToast = useCallback(() => setToast(null), []);

  const startDeadEye = useCallback(() => {
    if (deadEye.current) {
      deadEye.current.abort();
      return;
    }
    import("@/components/eggs/dead-eye").then(({ runDeadEye }) => {
      const run = runDeadEye({
        reduced,
        onFired: (n) => {
          const status = copyText("deadeye.status", { n });
          say(
            "rdr2",
            <div className="flex flex-col gap-2">
              <p className="text-[1.5rem] leading-none tracking-[0.06em] text-fg">
                <Lettered world="rdr2" text="DEAD EYE" />
              </p>
              <FilmQuote id="Q-RD-2" rendition="caption" attribution="inline" className="text-fg" />
              {copyVisible(status) ? <p className="type-meta text-fg-muted">{status.text}</p> : null}
            </div>,
            4000,
          );
        },
        onEnd: () => {
          deadEye.current = null;
        },
      });
      if (!run) {
        sayCopy("rdr2", "toast.deadeye.none");
        return;
      }
      deadEye.current = run;
    });
  }, [reduced, say, sayCopy]);

  const run = useCallback(
    (id: EggId) => {
      if (!eggEnabled(id)) return;
      switch (id) {
        case "marauders-map":
          setMapOpen(true);
          return;
        case "lumos":
          // Lumos only undoes the visitor's OWN Pause; it never overrides the
          // OS reduced-motion setting (E5)
          setMotionPaused(false);
          sayCopy("hp", osReduced ? "toast.lumos.os" : "toast.lumos");
          return;
        case "nox":
          setMotionPaused(true);
          sayCopy("hp", "toast.nox");
          return;
        case "accio-obliviate":
          obliviate();
          sayCopy("hp", "toast.obliviate");
          return;
        case "parley":
          go("contact");
          return;
        case "aal-izz-well": {
          // the current section heading: one two-beat settle (motion on)
          const probe = document.elementFromPoint(window.innerWidth / 2, window.innerHeight * 0.45);
          const host = probe?.closest("section[id], footer[id]");
          const h = host?.querySelector<HTMLElement>("h2");
          if (h && !reduced) {
            h.animate(
              [
                { transform: "translateY(0)" },
                { transform: "translateY(-6px)", offset: 0.3 },
                { transform: "translateY(2px)", offset: 0.62 },
                { transform: "translateY(0)" },
              ],
              { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            );
          }
          say("idiots", <FilmQuote id="Q-3I-1" rendition="caption" attribution="inline" className="text-fg" />);
          return;
        }
        case "dead-eye":
          if (killListInView()) startDeadEye();
          else {
            // from the palette: bring the ledger into view, then call it
            go("kill-list");
            window.setTimeout(startDeadEye, reduced ? 50 : 900);
          }
          return;
        case "eggs-off":
          setEggsSessionOff(true);
          sayCopy("house", "toast.eggs.off");
          return;
        case "eggs-on":
          setEggsSessionOff(false);
          sayCopy("house", "toast.eggs.on");
          return;
        case "snitch":
          return;
      }
    },
    [go, osReduced, reduced, say, sayCopy, startDeadEye],
  );

  // palette / anything → EGG_EVENT
  useEffect(() => {
    const onEgg = (e: Event) => {
      const id = (e as CustomEvent<{ id: EggId }>).detail?.id;
      if (id) run(id);
    };
    window.addEventListener(EGG_EVENT, onEgg);
    return () => window.removeEventListener(EGG_EVENT, onEgg);
  }, [run]);

  // Dead Eye keys: Esc aborts, Enter fires (while it runs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = deadEye.current;
      if (!d) return;
      if (e.key === "Escape") {
        d.abort();
        deadEye.current = null;
      } else if (e.key === "Enter" && !typingTarget(e.target)) {
        d.fire();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // typed words (never a single key; never while typing into a field)
  useEffect(() => {
    if (!film.enabled || !film.eggs.enabled || !film.eggs.typed) return;
    let buf = "";
    let last = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (typingTarget(e.target) || typingTarget(document.activeElement)) return;
      if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
      if (eggsSessionOff()) return;
      const now = performance.now();
      if (now - last > BUFFER_MS) buf = "";
      last = now;
      buf = (buf + e.key.toLowerCase()).slice(-24);
      for (const [word, id] of WORDS) {
        if (!buf.endsWith(word)) continue;
        if (id === "dead-eye" && (!killListInView() || !deadEyeAvailable())) continue;
        buf = "";
        run(id);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  // the console line (Q-PC-3), once per page view, attribution in the string
  useEffect(() => {
    if (consoleLineShown || !film.enabled || !film.eggs.enabled) return;
    const egg = film.eggs.list.find((e) => e.id === "console-line");
    const q = quotes["Q-PC-3"];
    if (!egg?.enabled || !copyVisible({ text: q.text, status: q.status })) return;
    consoleLineShown = true;
    console.info(`“${q.text}” — ${quoteAttribution("Q-PC-3")}\nNot in this repo: \`npm run check\`.`);
  }, []);

  return (
    <>
      {region ? <EggToast toast={toast} onDone={clearToast} /> : null}
      {mapOpen ? (
        <MapDialog variant={mapVariant} onClose={() => setMapOpen(false)} onNavigate={go} />
      ) : null}
    </>
  );
}
