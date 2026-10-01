"use client";

import { useEffect } from "react";
import { acquireDecoder, releaseDecoder } from "@/lib/decoder-lock";
import { track } from "@/lib/analytics";
import { emit } from "@/lib/events";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { markWorldFontsReady } from "@/lib/world-fonts";

type IntroWindow = Window & {
  __introHydrated?: boolean;
  __introCtl?: { onHydrated?: () => void };
};

type EndDetail = { played?: boolean; reason?: string; href?: string };

/**
 * IntroBridge — the React side of the vanilla prologue controller
 * (public/intro/intro.js). Renders nothing.
 *
 * 1. Hydration signal. The controller may only set `inert` on the page
 *    behind the overlay AFTER React has hydrated it (an attribute added
 *    before hydration is a dev hydration diff). Until then Tab is trapped by
 *    the controller's key handler and the dialog is aria-modal.
 * 2. One decoder (SPEC §5.7; PHASE3-SPEC §3.7, §4.2). While the prologue
 *    plays a video (`html.intro-armed`: L05, then the flight) it holds the
 *    page-wide DecoderLock at priority 10 ("intro flight"), so the hero loop
 *    (MV-03 via MediaFrame, `wait: true`) stays queued and legacy ambient
 *    loops are refused. It releases at the HOLD (`html.intro-handoff`: the
 *    flight's last frame is on a static canvas and its video is gone), so
 *    the hero loop starts under the hold — or when the overlay goes
 *    (Skip, Esc, scroll, the failsafe).
 * 3. The intro fast lane (PHASE3-SPEC §11.3): the overlay's "Skip to the
 *    research" link dismisses the prologue; once it has ended (inert off)
 *    the controller reports `intro:end` with reason "fastlane" and this
 *    makes the jump — the Idiots fonts first, then
 *    `scrollToTarget(href, { immediate, cut, focus, history: "push" })`
 *    — and emits "fastlane" (the director's cut and games stop).
 *
 * Hydration-safe: effect-only, no render output.
 */
export function IntroBridge() {
  useEffect(() => {
    const w = window as IntroWindow;
    w.__introHydrated = true;
    w.__introCtl?.onHydrated?.();

    const root = document.documentElement;
    const id = Symbol("intro");
    let held = false;
    const sync = () => {
      const c = root.classList;
      const playing = c.contains("intro-armed") && !c.contains("intro-handoff");
      if (playing && !held) {
        acquireDecoder(id, { priority: 10, label: "intro flight" });
        held = true;
      } else if (!playing && held) {
        releaseDecoder(id);
        held = false;
      }
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    const onEnd = (e: Event) => {
      const d = (e as CustomEvent<EndDetail | undefined>).detail;
      if (d?.reason !== "fastlane" || !d.href) return;
      const href = d.href;
      void markWorldFontsReady("idiots").then(() => {
        emit("fastlane");
        track("fast_lane", { from: "intro" });
        return scrollToTarget(href, { immediate: true, cut: true, focus: true, history: "push" });
      });
    };
    window.addEventListener("intro:end", onEnd);
    return () => {
      mo.disconnect();
      window.removeEventListener("intro:end", onEnd);
      if (held) releaseDecoder(id);
    };
  }, []);
  return null;
}
