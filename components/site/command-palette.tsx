"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { sectionById } from "@/lib/sections";
import { EggHost } from "@/components/eggs/egg-host";

/* ============================================================================
   COMMAND PALETTE (SPEC v2 §9.5, DESIGN v3 §9 chrome) — the always-loaded
   shell. ⌘K / Ctrl+K toggles it; the Menu's Search dispatches
   OPEN_PALETTE_EVENT. The dialog itself — the commands derived from the
   manifest, the eggs, the Play group, the list UI — is a lazy chunk
   (components/eggs/palette-dialog.tsx), warmed on the first intent (a
   pointer or focus in the header, ⌘ / Ctrl held) and mounted on the first
   open, then kept mounted (so it can animate out) and re-keyed per open (so
   every open is fresh). PHASE 3 (W2-HUNT): this split moved ≈ 4 KB gz out of
   the first load, which pays for the hunt chip and its store.
   The EggHost (typed words, toasts, lazy egg chunks) mounts here, so it lives
   wherever the chrome does. Jumps are route-aware: off the home page (the
   404) a room is /#id.
   ========================================================================== */

/** Event other components (the header menu) dispatch to open the palette. */
export const OPEN_PALETTE_EVENT = "open-command-palette";

const loadDialog = () => import("@/components/eggs/palette-dialog");
const PaletteDialog = lazy(loadDialog);

export function CommandPalette() {
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname === null;
  const [open, setOpen] = useState(false);
  /** 0 = never opened (no chunk); each open mounts a fresh dialog. */
  const [nonce, setNonce] = useState(0);

  // every palette / egg jump: lib/smooth-scroll.ts (instant under reduced
  // motion AND Pause — the old matchMedia check missed Pause; Lenis-aware;
  // a far room is a cut, not a glide). Resolves on arrival, focus moved.
  const go = useCallback(
    async (id: string): Promise<void> => {
      const el = document.getElementById(id);
      if (el) await scrollToTarget(el, { focus: true, history: "replace" });
      // off the home page (the 404): the room lives on the home page
      else if (!onHome && sectionById(id)) window.location.assign(`/#${id}`);
    },
    [onHome],
  );

  // open/close: ⌘K / Ctrl+K toggles; the custom event opens (fresh).
  useEffect(() => {
    const openFresh = () => {
      setNonce((n) => n + 1);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openFresh();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, openFresh);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, openFresh);
    };
  }, [open]);

  // warm the dialog chunk on the first intent (never at rest: E1)
  useEffect(() => {
    if (nonce) return;
    const warm = (e: Event) => {
      const t = e.target;
      const intent =
        e.type === "keydown"
          ? (e as KeyboardEvent).metaKey || (e as KeyboardEvent).ctrlKey
          : t instanceof Element && Boolean(t.closest("header"));
      if (!intent) return;
      off();
      void loadDialog();
    };
    const kinds = ["pointerover", "focusin", "keydown"] as const;
    const off = () => kinds.forEach((k) => window.removeEventListener(k, warm, true));
    kinds.forEach((k) => window.addEventListener(k, warm, { capture: true, passive: true }));
    return off;
  }, [nonce]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <EggHost go={go} />
      {nonce ? (
        <Suspense fallback={null}>
          <PaletteDialog key={nonce} open={open} onClose={close} go={go} />
        </Suspense>
      ) : null}
    </>
  );
}
