"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useReducedMotion } from "@/lib/flags";
import { easeClip } from "@/lib/motion";
import { copyVisible } from "@/lib/sections";
import { lockScroll, unlockScroll } from "@/lib/smooth-scroll";
import { sound } from "@/lib/audio";
import { planeAttrs } from "@/lib/worlds";
import { FilmQuote, quoteAttribution } from "@/components/site/film-quote";
import { FilmTitle, Lettered } from "@/components/primitives/scene-caption";
import { eggCopy } from "@/components/eggs/egg-copy";
import { readTrail } from "@/components/eggs/egg-bus";
import { MapPlan, mapRooms } from "@/components/eggs/marauders-map";

/* ============================================================================
   The Marauder's Map EGG (IC-HP-05/06; eggs.BAR E6) — a dialog (role=dialog,
   aria-modal, labelled; Esc and a close button; focus trapped inside and
   returned on close). Opened by the palette or by typing "I solemnly
   swear…" (EggHost); closed by "Mischief managed" (Q-HP-2 through
   FilmQuote). A lazy chunk (≤ 10 KB gz): loaded only when opened (E2).

   The unfold (DEFAULT, ≤ 1 s, transform only): the parchment's two outer
   panels are folded over the middle and swing open on their creases.
   ALT (?variant=egg-map.unfold:alt): the sheet opens from the centre crease
   (scaleX). Reduced motion / Pause: it opens flat (E10).
   Sound (PHASE3-SPEC §10.3): the closing line's button plays its TTS
   ("tts-mischief"; no page event carries it). Silent while muted.
   ========================================================================== */

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MaraudersMapDialog({
  onClose,
  onNavigate,
  variant = "default",
}: {
  onClose: () => void;
  /** Scroll to a room (the host knows the route: #id or /#id). */
  onNavigate: (id: string) => void;
  variant?: "default" | "alt";
}) {
  const reduced = useReducedMotion();
  const [trail] = useState(readTrail);
  const rooms = mapRooms();
  const sheet = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  const close = useCallback(() => {
    onClose();
    const el = opener.current;
    if (el instanceof HTMLElement) window.setTimeout(() => el.focus(), 0);
  }, [onClose]);

  // focus in (the first room), scroll lock (body + Lenis), Esc
  useEffect(() => {
    opener.current = document.activeElement;
    lockScroll("map");
    const t = window.setTimeout(() => sheet.current?.querySelector<HTMLElement>("[data-room]")?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      unlockScroll("map");
    };
  }, [close]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const els = Array.from(sheet.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const first = els[0];
    const last = els[els.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const sub = eggCopy["map.sub"];
  const you = eggCopy["map.you"];
  const empty = eggCopy["map.empty"];
  const closeLabel = eggCopy["map.close"];
  const flat = reduced;
  const unfold = { duration: 0.8, ease: easeClip };

  return (
    <div
      {...planeAttrs("deep", "hp")}
      className="fixed inset-0 z-(--z-menu) overflow-y-auto bg-bg/90 text-fg"
      data-egg="marauders-map"
      data-lenis-prevent=""
    >
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="marauders-map-title"
        onKeyDown={onKeyDown}
        className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-tier-group px-gutter py-tier-block"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="marauders-map-title" className="text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] leading-[1.05] tracking-[0.04em] text-fg">
              <Lettered world="hp" text="THE MARAUDER’S MAP" />
              <span aria-hidden="true" className="mx-3 align-[0.2em] font-mono text-[0.6em] text-fg-ghost">
                •
              </span>
              <span className="sr-only">, </span>
              <FilmTitle world="hp" as="span" className="text-(--world-emphasis)" />
            </h2>
            {copyVisible(sub) ? <p className="max-w-lead type-small text-fg-muted">{sub.text}</p> : null}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close the map"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg"
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <motion.div
          className="relative [perspective:1600px]"
          initial={flat || variant !== "alt" ? false : { scaleX: 0.04, opacity: 0.6 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={flat ? { duration: 0 } : unfold}
        >
          <MapPlan
            rooms={rooms}
            trail={trail}
            youLabel={copyVisible(you) ? you.text : null}
            headingId="marauders-map-title"
            onRoom={(id, e) => {
              e.preventDefault();
              onClose();
              window.setTimeout(() => onNavigate(id), 0);
            }}
          />
          {/* DEFAULT unfold: the outer panels swing open on their creases */}
          {flat || variant === "alt" ? null : (
            <>
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 origin-right rounded-l-frame border-r border-(--paper-edge-deep) bg-(--paper-s1) [backface-visibility:hidden]"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 178 }}
                transition={unfold}
              />
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 w-1/3 origin-left rounded-r-frame border-l border-(--paper-edge-deep) bg-(--paper-s1) [backface-visibility:hidden]"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -178 }}
                transition={{ ...unfold, delay: 0.08 }}
              />
            </>
          )}
        </motion.div>

        {!trail.length && copyVisible(empty) ? <p className="type-small text-fg-muted">{empty.text}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              sound.cue("tts-mischief");
              close();
            }}
            className="inline-flex min-h-11 items-center gap-3 rounded-control text-left text-[clamp(1.25rem,1rem+0.8vw,1.75rem)] text-fg transition-colors hover:text-(--world-emphasis)"
            data-map-close=""
          >
            <FilmQuote id="Q-HP-2" rendition="lettered" attribution="credits" />
            {copyVisible(closeLabel) ? <span className="sr-only">, {closeLabel.text}</span> : null}
          </button>
          {/* the line's attribution, beside the button (wraps on a phone) */}
          <p className="type-meta text-fg-muted">{quoteAttribution("Q-HP-2")}</p>
        </div>
      </div>
    </div>
  );
}
