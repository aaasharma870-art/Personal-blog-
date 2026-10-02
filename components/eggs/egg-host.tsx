"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { on } from "@/lib/events";
import { film } from "@/lib/film";
import { DESKTOP_FINE, setMotionPaused } from "@/lib/flags";
import { quotes } from "@/lib/quotes";
import { copyText, copyVisible } from "@/lib/sections";
import { quoteAttribution } from "@/components/site/film-quote";
import { EGG_EVENT, eggEnabled, eggsSessionOff, triggerEgg, type EggId } from "@/components/eggs/egg-bus";
import type { EggMsg } from "@/components/eggs/egg-runtime";

/* ============================================================================
   EGG HOST (SPEC v2 §10.3; eggs.BAR; PHASE3-SPEC §9) — the one always-mounted
   egg runtime, rendered by the command palette (so it lives wherever the
   site chrome does, and never on /lab). At rest it renders NOTHING (E1) and
   costs two listeners. Everything an egg does — the effects, the hunt count,
   the toasts, the Map, Dead Eye — lives in the lazy egg runtime
   (components/eggs/egg-runtime.tsx), fetched on the first trigger (E2);
   triggers that arrive while it loads are queued and replayed in order.

   Triggers (E3):
   - the palette, the hotspots binder, the hosts (kraken, quadcopter) and
     the typed words all dispatch EGG_EVENT through `triggerEgg()`, the one
     path the sound engine voices (lib/audio/cues.ts EGG_CUES);
   - typed words, only while focus is NOT in an input, textarea, select or
     contenteditable, letters only, the buffer reset after 1.5 s of quiet;
     NO single-key shortcut anywhere (WCAG 2.1.4); ignored while a game owns
     the keys (`html[data-game]`, B9) and while the eggs are off:
       "i solemnly swear" → the Marauder's Map    "parley" → parley
       "lumos" / "nox"    → the light spells       "aal izz well" → aal
       "deadeye"          → Dead Eye, when #kill-list is ≥ 50 % in view on a
                            DESKTOP_FINE with the DEAD EYE pill present
                            (#deadeye-call; a toy, not a hunt egg)
   - `hunt:found` from anywhere (the Snitch's catch) wakes the runtime too,
     so every find gets its "Egg n of 12" toast.
   The Pause control is never a trigger (components/primitives/
   motion-toggle.tsx): it pauses instantly and silently.
   Lumos resumes motion HERE, synchronously, so the sound engine (which
   voices the spell one task later) finds the context running.
   Also the console line, once per page view.
   ========================================================================== */

const EggRuntime = dynamic(() => import("@/components/eggs/egg-runtime"), { ssr: false });

const BUFFER_MS = 1500;
const WORDS: readonly (readonly [string, EggId])[] = [
  ["solemnlyswear", "marauders-map"],
  ["lumos", "lumos"],
  ["deadeye", "dead-eye"],
  ["nox", "nox"],
  ["parley", "parley"],
  ["aalizzwell", "aal-izz-well"],
];

let consoleLineShown = false;

/* — the queue between this always-loaded half and the lazy runtime ——— */
const inbox: EggMsg[] = [];
let sink: ((m: EggMsg) => void) | null = null;

function attach(fn: (m: EggMsg) => void): () => void {
  sink = fn;
  for (const m of inbox.splice(0)) fn(m);
  return () => {
    if (sink === fn) sink = null;
  };
}

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

/** `go` scrolls to a room (the palette's jump: lib/smooth-scroll.ts
 *  scrollToTarget) and resolves on arrival. */
export function EggHost({ go }: { go: (id: string) => Promise<void> }) {
  const [live, setLive] = useState(false);

  const post = useCallback((m: EggMsg) => {
    if (sink) sink(m);
    else {
      inbox.push(m);
      setLive(true);
    }
  }, []);

  // EGG_EVENT (every trigger) and hunt:found (finds counted elsewhere)
  useEffect(() => {
    const onEgg = (e: Event) => {
      const id = (e as CustomEvent<{ id: EggId }>).detail?.id;
      // the Snitch's appearance only voices its flutter; its catch counts
      if (!id || id === "snitch" || !eggEnabled(id)) return;
      if (id === "lumos") setMotionPaused(false);
      post({ kind: "egg", id });
    };
    window.addEventListener(EGG_EVENT, onEgg);
    const offFound = on("hunt:found", (d) => post({ kind: "found", id: d.id, count: d.count }));
    return () => {
      window.removeEventListener(EGG_EVENT, onEgg);
      offFound();
    };
  }, [post]);

  // typed words (never a single key; never while typing into a field)
  useEffect(() => {
    if (!film.enabled || !film.eggs.enabled || !film.eggs.typed) return;
    let buf = "";
    let last = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      // B9: a game owns the keys (the drone, Dead Eye)
      if (document.documentElement.hasAttribute("data-game")) {
        buf = "";
        return;
      }
      if (typingTarget(e.target) || typingTarget(document.activeElement)) return;
      if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
      if (eggsSessionOff()) return;
      const now = performance.now();
      if (now - last > BUFFER_MS) buf = "";
      last = now;
      buf = (buf + e.key.toLowerCase()).slice(-24);
      for (const [word, id] of WORDS) {
        if (!buf.endsWith(word)) continue;
        if (id === "dead-eye" && (!killListInView() || !document.getElementById("deadeye-call") || !window.matchMedia(DESKTOP_FINE).matches)) continue;
        buf = "";
        triggerEgg(id);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // the console line (Q-PC-3, attribution in the same string) and the hunt's
  // count line, once per page view
  useEffect(() => {
    if (consoleLineShown || !film.enabled || !film.eggs.enabled) return;
    const egg = film.eggs.list.find((e) => e.id === "console-line");
    if (!egg?.enabled) return;
    const q = quotes["Q-PC-3"];
    const lines: string[] = [];
    if (copyVisible({ text: q.text, status: q.status })) {
      lines.push(`“${q.text}” — ${quoteAttribution("Q-PC-3")}`, "Not in this repo: `npm run check`.");
    }
    const hunt = copyText("egg.console");
    if (copyVisible(hunt)) lines.push(hunt.text);
    if (!lines.length) return;
    consoleLineShown = true;
    console.info(lines.join("\n"));
  }, []);

  return live ? <EggRuntime go={go} attach={attach} /> : null;
}
