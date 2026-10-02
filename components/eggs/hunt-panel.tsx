"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import type { RefObject } from "react";
import { Check } from "lucide-react";
import { resetHunt } from "@/lib/hunt";
import { copyText, copyVisible, creditOf } from "@/lib/sections";
import type { CopyKey } from "@/lib/film";
import { triggerEgg } from "@/components/eggs/egg-bus";
import { HUNT_ROWS, HUNT_WORLDS } from "@/components/eggs/hunt-rows";
import { HUNT_IDS, HUNT_TOTAL, useHuntState } from "@/components/eggs/hunt-store";
// its CSS (game-lazy.css) loads with this lazy chunk, not the page (W2 assembly)
import "@/app/p3/game-lazy.css";

/* ============================================================================
   HUNT PANEL (lazy; PHASE3-SPEC §9.3) — OWNER: W2-HUNT.
   The chip's popover: NON-MODAL (no focus trap, no scroll lock). It takes
   focus when it opens; Esc closes it and returns focus to the chip; a press
   outside it, or focus leaving it, closes it. 4 worlds × 3 slots in page
   order: a found egg shows its name and ✓; an unfound one its themed hint in
   the world's face. Then "Reset the egg hunt" (a second, explicit confirm
   step) and "Turn off easter eggs" (the chip and the hints hide; the count
   is kept). All copy is `egg.hunt.*` (proposed, unsigned).
   ========================================================================== */

const text = (k: CopyKey, extra?: Record<string, string | number>): string | null => {
  const c = copyText(k, extra);
  return copyVisible(c) ? c.text : null;
};

export default function HuntPanel({
  id,
  chip,
  onClose,
}: {
  id: string;
  chip: RefObject<HTMLButtonElement | null>;
  /** Close; `refocus` returns focus to the chip (Esc). */
  onClose: (refocus: boolean) => void;
}) {
  const { count, found } = useHuntState();
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const close = useEffectEvent((refocus: boolean) => onClose(refocus));

  // focus in (once); Esc, a press outside, focus leaving → close
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    panel.focus({ preventScroll: true });
    const inside = (t: EventTarget | null) => t instanceof Node && (panel.contains(t) || Boolean(chip.current?.contains(t)));
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      close(true);
    };
    const onDown = (e: PointerEvent) => {
      if (!inside(e.target)) close(false);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (e.relatedTarget && !inside(e.relatedTarget)) close(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    panel.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
      panel.removeEventListener("focusout", onFocusOut);
    };
  }, [chip]);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
  }, [confirming]);

  const title = text("egg.hunt.panel.title");
  const foundWord = text("egg.hunt.found");
  const unfoundWord = text("egg.hunt.unfound");
  const reset = text("egg.hunt.reset");
  const confirmQ = text("egg.hunt.reset.confirm");
  const cancel = text("egg.hunt.reset.cancel");
  const off = text("egg.hunt.off");
  const n = count ?? 0;

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="hunt-panel surface-1 rounded-frame text-fg"
      data-hunt-panel=""
      data-lenis-prevent=""
    >
      <p id={titleId} className="flex items-baseline justify-between gap-4 type-meta text-fg-muted">
        <span>{title}</span>
        <span className="text-fg">
          {n}/{HUNT_TOTAL}
        </span>
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {HUNT_WORLDS.map((world) => {
          const ids = HUNT_IDS.filter((h) => HUNT_ROWS[h].world === world);
          const credit = creditOf(world);
          return (
            <section key={world} data-world={world} aria-label={credit ?? world} className="flex flex-col gap-1">
              {credit ? (
                <p aria-hidden="true" className="type-meta text-fg-ghost">
                  {credit}
                </p>
              ) : null}
              <ul className="flex flex-col gap-1">
                {ids.map((h) => {
                  const row = HUNT_ROWS[h];
                  const has = found.has(h);
                  const label = has ? text(row.name) : text(row.hint);
                  if (!label) return null;
                  return (
                    <li key={h} className="flex min-h-7 items-center justify-between gap-3" data-hunt-slot={h} data-found={has ? "" : undefined}>
                      <span className={has ? "font-world-head text-[1.0625rem] leading-tight text-fg" : "font-world-body type-small text-fg-muted"}>
                        {label}
                        {has ? null : unfoundWord ? <span className="sr-only">, {unfoundWord}</span> : null}
                      </span>
                      {has ? (
                        <span className="inline-flex shrink-0 items-center text-(--w-ink-contour)">
                          <Check className="size-4" strokeWidth={1.75} aria-hidden="true" />
                          {foundWord ? <span className="sr-only">{foundWord}</span> : null}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-rule pt-3">
        {confirming ? (
          <div role="group" aria-label={reset ?? undefined} className="flex flex-col gap-2">
            {confirmQ ? <p className="type-small text-fg">{confirmQ}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="hunt-panel-action"
                data-danger=""
                onClick={() => {
                  resetHunt();
                  setConfirming(false);
                  ref.current?.focus({ preventScroll: true });
                }}
              >
                {reset}
              </button>
              <button
                ref={cancelRef}
                type="button"
                className="hunt-panel-action"
                onClick={() => {
                  setConfirming(false);
                  ref.current?.focus({ preventScroll: true });
                }}
              >
                {cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {reset && n > 0 ? (
              <button type="button" className="hunt-panel-action" onClick={() => setConfirming(true)}>
                {reset}
              </button>
            ) : null}
            {off ? (
              <button
                type="button"
                className="hunt-panel-action"
                onClick={() => {
                  onClose(false);
                  triggerEgg("eggs-off");
                }}
              >
                {off}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
