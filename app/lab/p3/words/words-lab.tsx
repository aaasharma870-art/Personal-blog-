"use client";

/* /lab/p3/words client shell (W2-WORDS). Workbench only — not product UI.
   The desktop enhancer never runs on /lab, so this binds the words binder
   itself (DESKTOP_FINE only, like the page) and offers replay buttons that
   play one primitive now (no spotlight, no once-per-view). */

import { useEffect, useState } from "react";
import { DESKTOP_FINE, useDesktopFine, useReducedMotion } from "@/lib/flags";
import type { Variant } from "@/lib/variants";
import { MotionToggle } from "@/components/primitives/motion-toggle";

type Binder = typeof import("@/components/enhance/binders/words");
let binder: Promise<Binder> | null = null;
const loadBinder = (): Promise<Binder> => (binder ??= import("@/components/enhance/binders/words"));

/** Binds the words binder to this page (DESKTOP_FINE) and shows its state. */
export function WordsLabBinder() {
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  const [bound, setBound] = useState(false);

  useEffect(() => {
    if (!fine || !window.matchMedia(DESKTOP_FINE).matches) return;
    let undo: (() => void) | null = null;
    let dead = false;
    void loadBinder().then((m) => {
      if (dead) return;
      undo = m.default(document);
      setBound(true);
    });
    return () => {
      dead = true;
      undo?.();
      setBound(false);
    };
  }, [fine]);

  const state = !fine
    ? "Not a desktop with a fine pointer: everything below is static, as on the page."
    : reduced
      ? "Motion is off (reduced motion or Pause): everything below is static, as on the page."
      : bound
        ? "Bound: offscreen pieces arm and play once through the spotlight; replay plays one now."
        : "Binding…";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <MotionToggle showLabel />
      <p className="type-small text-fg-muted" data-words-lab-state={bound ? "bound" : "static"}>
        {state}
      </p>
    </div>
  );
}

/** Plays the primitive matched by `target` (a CSS selector) now. */
export function ReplayButton({ target, variant, label = "Replay" }: { target: string; variant?: Variant; label?: string }) {
  const fine = useDesktopFine();
  const reduced = useReducedMotion();
  return (
    <button
      type="button"
      disabled={!fine || reduced}
      onClick={() => {
        const el = document.querySelector(target);
        if (el) void loadBinder().then((m) => m.playNow(el, variant));
      }}
      className="inline-flex min-h-11 items-center rounded-control border border-rule px-3 type-meta text-fg-muted transition-colors hover:text-fg disabled:opacity-50"
    >
      {label}
    </button>
  );
}
