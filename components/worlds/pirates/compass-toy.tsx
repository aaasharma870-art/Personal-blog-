"use client";

import { useEffect, useRef } from "react";
import { beatAttrs } from "@/lib/beats";
import { spotlight } from "@/lib/spotlight";
import type { CompassApi } from "@/components/worlds/pirates/jack-compass";
import { useCompassSpin } from "@/components/worlds/pirates/use-compass-spin";

/* ============================================================================
   COMPASS TOY — "Spin Jack's compass" (PHASE3-SPEC §9.2 #1; Act I's toy).
   The lazy half of the About compass (about-pillars.tsx mounts it on
   DESKTOP_FINE only, after the compass handed over its handle): a real
   <button> laid exactly over the compass drawing, which stays aria-hidden.
   The behaviour is use-compass-spin.ts (spin / drag / ← → / reduced
   motion / sound).

   A spin settles on the next pillar in reading order, or on the pillar
   focused by keyboard since the last spin (spec §9.2 #1: about-pillars.tsx
   marks its list `data-pillars`; the focus is read here, in the lazy half).

   THE INVITE (B08-invite, a `needsIdle` time star; spec §2.3 B08): once the
   button is half in view it asks the spotlight; the row's scroll star (the
   scrubbed sentence of pillar 02) owns the spotlight while it crosses the
   middle 60 %, so the invite plays only after the sentence has left it and
   the reader is idle (< 300 px/s for 600 ms): ONE needle twitch, once per
   page view. Dropped if the compass leaves the viewport first, skipped if
   the visitor already used the toy. The button carries the beat's data-beat
   (the spotlight's host check, the beats probe).
   ========================================================================== */

export type CompassToyProps = {
  api: CompassApi;
  /** toy.compass.label: "Spin Jack's compass". */
  label: string;
  bearings: readonly number[];
  point: number;
  alt: boolean;
  setPoint(i: number): void;
  setBusy(busy: boolean): void;
};

const INVITE = "B08-invite";

export default function CompassToy({ api, label, bearings, point, alt, setPoint, setBusy }: CompassToyProps) {
  const ref = useRef<HTMLButtonElement>(null);
  /** The pillar focused by keyboard since the last spin (its goal). */
  const focused = useRef<number | null>(null);
  const spin = useCompassSpin(api, { bearings, point, alt, setPoint, setBusy, focused });
  const spinRef = useRef(spin);
  useEffect(() => {
    spinRef.current = spin;
  });

  // keyboard focus on a pillar (about-pillars.tsx `ol[data-pillars]`) since
  // the last spin: the next spin settles on it (spec §9.2 #1)
  useEffect(() => {
    const list = document.querySelector<HTMLOListElement>("ol[data-pillars]");
    if (!list) return;
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target;
      if (!(t instanceof Element) || !t.matches(":focus-visible")) return;
      // the pillar: the list's own child holding the focus
      let li: Element | null = t;
      while (li && li.parentElement !== list) li = li.parentElement;
      const i = li ? Array.prototype.indexOf.call(list.children, li) : -1;
      if (i >= 0) focused.current = i;
    };
    list.addEventListener("focusin", onFocusIn);
    return () => list.removeEventListener("focusin", onFocusIn);
  }, []);

  // the B08 invite: half in view → the spotlight (needsIdle) → one twitch
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let asked = false;
    let live = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (asked || !e?.isIntersecting || e.intersectionRatio < 0.5) return;
        asked = true;
        io.disconnect();
        if (spinRef.current.used()) return;
        void spotlight.request(INVITE, { weight: 1, needsIdle: true, durationMs: 600 }).then((a) => {
          if (live && a === "play") spinRef.current.twitch();
        });
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => {
      live = false;
      io.disconnect();
      if (asked) spotlight.release(INVITE);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      {...beatAttrs(INVITE, { weight: 1 })}
      data-toy="compass"
      className="pointer-events-auto absolute inset-0 rounded-control"
      style={{ cursor: "grab", touchAction: "none" }}
      onClick={spin.onClick}
      onKeyDown={spin.onKeyDown}
      onPointerDown={spin.onPointerDown}
      onPointerMove={spin.onPointerMove}
      onPointerUp={spin.onPointerUp}
      onPointerCancel={spin.onPointerCancel}
    />
  );
}
