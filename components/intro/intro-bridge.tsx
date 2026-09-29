"use client";

import { useEffect } from "react";
import { acquireDecoder, releaseDecoder } from "@/lib/decoder-lock";

type IntroWindow = Window & {
  __introHydrated?: boolean;
  __introCtl?: { onHydrated?: () => void };
};

/**
 * IntroBridge — the React side of the vanilla prologue controller
 * (public/intro/intro.js). Renders nothing.
 *
 * 1. Hydration signal. The controller may only set `inert` on the page
 *    behind the overlay AFTER React has hydrated it (an attribute added
 *    before hydration is a dev hydration diff). Until then Tab is trapped by
 *    the controller's key handler and the dialog is aria-modal.
 * 2. One decoder (SPEC §5.7). While `html.intro-armed` is present it holds
 *    the page-wide DecoderLock at priority 10 ("intro flight"), so the hero
 *    loop (MV-03 via MediaFrame, `wait: true`) stays queued and legacy
 *    ambient loops are refused until the overlay is gone (bar I22: MV-03
 *    fires no `playing` before S4). It releases the moment the class goes
 *    (landing, Skip, Esc, scroll, failsafe), which grants the queued loop.
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
      const armed = root.classList.contains("intro-armed");
      if (armed && !held) {
        acquireDecoder(id, { priority: 10, label: "intro flight" });
        held = true;
      } else if (!armed && held) {
        releaseDecoder(id);
        held = false;
      }
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mo.disconnect();
      if (held) releaseDecoder(id);
    };
  }, []);
  return null;
}
