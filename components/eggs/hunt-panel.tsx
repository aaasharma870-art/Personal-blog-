"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import type { RefObject } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { penProgress, resetHunt, worthyOfPen } from "@/lib/hunt";
import { film, type CopyKey } from "@/lib/film";
import { headerLabel, copyText, copyVisible, creditOf, labelFor, sectionById } from "@/lib/sections";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { triggerEgg } from "@/components/eggs/egg-bus";
import { HUNT_ROWS, HUNT_WORLDS } from "@/components/eggs/hunt-rows";
import { HUNT_IDS, HUNT_TOTAL, useHuntState, type HuntId } from "@/components/eggs/hunt-store";
// its CSS (game-lazy.css, eggs-lazy.css) loads with this lazy chunk, not the page (W2 assembly)
import "@/app/p3/game-lazy.css";
import "@/app/p3/eggs-lazy.css";

/* ============================================================================
   HUNT PANEL (lazy; PHASE3-SPEC §9.3) — OWNER: W2-HUNT.
   The chip's popover: NON-MODAL (no focus trap, no scroll lock). It takes
   focus when it opens; Esc closes it and returns focus to the chip; a press
   outside it, or focus leaving it, closes it. 4 worlds × 3 slots in page
   order: a found egg shows its name and ✓; an unfound one its themed hint in
   the world's face. Then "Reset the egg hunt" (a second, explicit confirm
   step) and "Turn off easter eggs" (the chip and the hints hide; the count
   is kept). All copy is `egg.hunt.*` (proposed, unsigned).
   Oct 22 (fix/eggs): the panel TEACHES the hunt. A plain "how this works"
   line on top; each unfound egg shows its riddle, WHERE it lives (the act and
   section, read from the page's own manifest) and HOW to collect it (one
   sentence from components/eggs/hunt-rows.ts `how`), then a key: "Take me
   there" for an egg placed on the page (scrolls it into view through the
   site's scroll helper, then calls its marker for ~2 s: no pulse under
   reduced motion / Pause, it just arrives) or "Show the word" for a spell
   (opt-in: spoilers are never on by default).
   ========================================================================== */

const text = (k: CopyKey, extra?: Record<string, string | number>): string | null => {
  const c = copyText(k, extra);
  return copyVisible(c) ? c.text : null;
};

/** The palette key as the visitor's keyboard names it. */
const paletteKey = (): string => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘ K" : "Ctrl K");

/** WHERE: "ACT II · Optuna" / "ACT II · The Workshop" (an act card) /
 *  "Anywhere on the page" / "CREDITS", read from the page's own sections
 *  (headerLabel names the film too: "ACT II · 3 IDIOTS"; only the act is kept). */
function whereOf(host: string): string | null {
  if (host === "global") return text("egg.hunt.where.global");
  const act = headerLabel(host).split("·")[0]?.trim() ?? "";
  const section = sectionById(host) ? labelFor(host) : (film.acts.find((a) => a.id === host)?.title.text ?? "");
  const parts = [act, section].filter(Boolean);
  return parts.length === 2 && parts[0]!.toLowerCase() === parts[1]!.toLowerCase() ? parts[0]! : parts.join(" · ") || null;
}

/** "Take me there": the egg's own element (its marker), else its host
 *  section. The pen first needs the ledger read: it takes you to the ledger. */
function targetOf(h: HuntId): { el: Element; marker: boolean } | null {
  const row = HUNT_ROWS[h];
  if (h === "3i-pen" && !worthyOfPen()) {
    const ledger = document.getElementById("kill-list");
    return ledger ? { el: ledger, marker: false } : null;
  }
  const own = "target" in row ? document.querySelector(row.target) : null;
  if (own) return { el: own, marker: true };
  const host = document.getElementById(row.host);
  return host ? { el: host, marker: false } : null;
}

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
  /** Spells whose word the visitor asked to see. */
  const [shown, setShown] = useState<ReadonlySet<HuntId>>(new Set());
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
  const intro = text("egg.hunt.intro");
  const goWord = text("egg.hunt.goto");
  const showWord = text("egg.hunt.word.show");
  const hideWord = text("egg.hunt.word.hide");
  const n = count ?? 0;
  const key = paletteKey();

  const toggleWord = (h: HuntId) =>
    setShown((cur) => {
      const next = new Set(cur);
      if (!next.delete(h)) next.add(h);
      return next;
    });

  /** Close the panel (it would cover the page), arrive, then call the marker. */
  const goTo = (h: HuntId) => {
    const t = targetOf(h);
    if (!t) return;
    onClose(false);
    // a marker is brought to the middle of the screen; a card or a section lands at its top
    // focus lands on the egg (or the section's heading), so the keyboard and a screen reader arrive with the page
    void scrollToTarget(t.el, { block: t.marker && h !== "pc-kraken" ? "center" : "start", history: false, focus: true }).then(() => {
      if (t.marker) window.dispatchEvent(new CustomEvent("egg:call", { detail: { hunt: h } }));
    });
  };

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
      <div className="hunt-panel-head">
        <p id={titleId} className="flex items-baseline justify-between gap-4 type-meta text-fg-muted">
          <span>{title}</span>
          <span className="text-fg">
            {n}/{HUNT_TOTAL}
          </span>
        </p>
      </div>
      {intro ? <p className="egg-intro">{intro}</p> : null}

      <div className="mt-4 flex flex-col gap-3">
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
              <ul className="flex flex-col">
                {ids.map((h) => {
                  const row = HUNT_ROWS[h];
                  const has = found.has(h);
                  const label = has ? text(row.name) : text(row.hint);
                  if (!label) return null;
                  const how = text(row.how, { key });
                  const where = whereOf(row.host);
                  const word = "word" in row ? row.word : null;
                  const spell = !has && word !== null;
                  const placed = !has && "target" in row;
                  const pen = !has && h === "3i-pen" ? penProgress() : null;
                  const penLine = pen && pen.total > 0 && !pen.won ? text("egg.pen.progress", { n: pen.read, total: pen.total }) : null;
                  const open = shown.has(h);
                  const wordId = `${titleId}-${h}`;
                  return (
                    <li key={h} className="egg-row" data-hunt-slot={h} data-found={has ? "" : undefined}>
                      <div className="min-w-0">
                        <p className={cn("egg-row-title", has ? "font-world-head text-[1.0625rem] leading-tight text-fg" : "font-world-body type-small text-fg")}>
                          {label}
                          {has ? null : unfoundWord ? <span className="sr-only">, {unfoundWord}</span> : null}
                        </p>
                        {has ? null : how ? <p className="egg-row-how">{how}</p> : null}
                        {penLine ? <p className="egg-progress">{penLine}</p> : null}
                        {where ? <p className="egg-row-where type-meta">{where}</p> : null}
                        {spell && open && word ? (
                          <p className="egg-row-word" id={wordId}>
                            <kbd className="egg-word">{word}</kbd>
                          </p>
                        ) : null}
                      </div>
                      {has ? (
                        <span className="inline-flex shrink-0 items-center text-(--w-ink-contour)">
                          <Check className="size-4" strokeWidth={1.75} aria-hidden="true" />
                          {foundWord ? <span className="sr-only">{foundWord}</span> : null}
                        </span>
                      ) : (
                        <div className="egg-row-act">
                          {placed && goWord ? (
                            <button
                              type="button"
                              className="egg-key"
                              onClick={() => goTo(h)}
                              aria-label={where ? (text("egg.hunt.goto.label", { where }) ?? goWord) : goWord}
                            >
                              <span className="egg-key-face">
                                <span className="egg-key-lamp" aria-hidden="true" />
                                {goWord}
                              </span>
                            </button>
                          ) : null}
                          {spell && showWord && hideWord ? (
                            <button
                              type="button"
                              className="egg-key"
                              aria-expanded={open}
                              aria-controls={open ? wordId : undefined}
                              onClick={() => toggleWord(h)}
                            >
                              <span className="egg-key-face">
                                <span className="egg-key-lamp" aria-hidden="true" />
                                {open ? hideWord : showWord}
                              </span>
                            </button>
                          ) : null}
                        </div>
                      )}
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
