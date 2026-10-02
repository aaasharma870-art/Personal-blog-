"use client";

import { useEffect } from "react";
import { emit, on } from "@/lib/events";
import type { Variant } from "@/lib/variants";
import { LUMOS_SPRITE } from "@/components/primitives/loaders/sprites-hp";
import { CANDLE_FLAME_AT } from "@/components/worlds/hp/sprites";
import "@/assets/p3/hp/hp-toys.css";

/* ============================================================================
   CANDLE TOY — Act IV's toy: light the Great Hall's candles with the wand
   (PHASE3-SPEC §9.2 #4, P3-8 #6; plan §7.5). OWNER: W3-HP. LAZY (DP-13):
   loaded by components/worlds/hp/hp-desktop.tsx only on DESKTOP_FINE with
   motion on, after ladder step 2; unmounted at once by Pause or reduced
   motion, which puts every candle back to lit with no transition.

   The host is the contact's hall ceiling (contact-scene.tsx HallField, ≥ lg):
   a CandleField with `toy` (hall-ceiling.tsx), every candle LIT by default
   (server, hydration, phones, touch, reduced motion, no JS: today's picture).

   - ARM: on the first mouse move inside #contact, and only if #contact was
     fully offscreen before (the Lens rule; never while the reader is already
     looking at it), the candles go dark in a 600 ms sweep away from the wand
     (ALT: down from the ceiling). When #contact leaves the viewport fully,
     they are lit again (offscreen: no animation).
   - LIGHT: a candle within 56 px of the wand tip (the pointer: the cursor's
     hotspot is the tip) lights: a 300 ms crossfade to the lit sprite and a
     Lumos spark at its wick (ALT: a slower 600 ms catch, no spark). Never by
     itself: only the visitor's own wand lights a candle (idle moments are
     deferred, IDEAS O.3; toys never auto-run).
   - ALL LIT: `toy` { candles, done } → the engine's hall swell, the plate's
     copy-flare on the MV-08 flame (contact-scene.tsx) and "The hall is lit."
     (contact-finale.tsx, a polite live region).
   - KEYBOARD: the contact column's "Lumos" button emits `toy` { candles,
     lumos }: every dark candle lights in one 1.6 s sweep out from the flame.
   - SOUND (lib/audio, voiced from `toy` events): a soft "fwip" per candle
     (pitch-varied, ≤ 10/s), the hall's swell at a third, two thirds (lower)
     and all (`lit` n −4 / −2, then `done`). Muted unless the visitor turned
     sound on; Pause silences the master.
   Only candles on screen count (a spot shown from a wider breakpoint up is
   left out below it). Work happens in a rAF scheduled by a pointer move:
   nothing runs while the wand is still.
   ========================================================================== */

/** The wand lights a candle whose flame is within this distance (CSS px). */
const RADIUS = 56;
/** The arming snuff: the sweep's spread and each candle's fade (ms). */
const SNUFF_SWEEP = 600;
const SNUFF_FADE = 200;
/** A candle catching: DEFAULT crossfade + spark; ALT a slower catch (ms). */
const LIGHT_FADE = { default: 300, alt: 600 } as const;
/** The "Lumos" button's sweep (ms). */
const LUMOS_SWEEP = 1600;
/** ≤ 10 fwips a second. */
const FWIP_GAP = 100;
/** The Lumos spark (the cool wand-tip light at the wick). */
const SPARK = 30;

type Pt = { x: number; y: number };

export default function CandleToy({ variant }: { variant: Variant }) {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('[data-world-section="contact"]');
    const candles = section ? Array.from(section.querySelectorAll<SVGSVGElement>("svg[data-candle]")) : [];
    const field = candles[0]?.parentElement;
    if (!section || !field) return;
    const alt = variant === "alt";
    const fade = LIGHT_FADE[alt ? "alt" : "default"];

    /** #contact has been fully offscreen since the toy last armed. */
    let wasOff = false;
    let armed = false;
    let ready = false;
    let done = false;
    /** Flame points relative to the field box; null = not on screen. */
    let pts: (Pt | null)[] = [];
    let lit: boolean[] = candles.map(() => true);
    let px = 0;
    let py = 0;
    let raf = 0;
    let lastFwip = -Infinity;
    const timers = new Set<number>();
    const sparks = new Set<Animation>();

    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
    };
    const setTiming = (el: SVGSVGElement, fadeMs: number, delayMs: number) => {
      el.style.setProperty("--candle-fade", `${Math.round(fadeMs)}ms`);
      el.style.setProperty("--candle-delay", `${Math.round(delayMs)}ms`);
    };
    const measure = () => {
      const fr = field.getBoundingClientRect();
      pts = candles.map((c) => {
        const r = c.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return null;
        return { x: r.left - fr.left + r.width * CANDLE_FLAME_AT.x, y: r.top - fr.top + r.height * CANDLE_FLAME_AT.y };
      });
    };
    const shown = () => pts.reduce((n, p) => n + (p ? 1 : 0), 0);
    const litShown = () => pts.reduce((n, p, i) => n + (p && lit[i] ? 1 : 0), 0);

    const fwip = (i: number) => {
      const now = performance.now();
      if (now - lastFwip < FWIP_GAP) return;
      lastFwip = now;
      emit("toy", { toy: "candles", action: "light", n: (i * 3) % 5 });
    };
    const spark = (p: Pt) => {
      const img = document.createElement("img");
      img.src = LUMOS_SPRITE;
      img.alt = "";
      img.width = SPARK;
      img.height = SPARK;
      img.setAttribute("aria-hidden", "true");
      img.style.cssText = `position:absolute;left:${(p.x - SPARK / 2).toFixed(1)}px;top:${(p.y - SPARK / 2).toFixed(1)}px;pointer-events:none;opacity:0`;
      field.appendChild(img);
      const a = img.animate(
        [
          { opacity: 0, transform: "scale(0.4)" },
          { opacity: 1, transform: "scale(1.15)", offset: 0.35 },
          { opacity: 0, transform: "scale(0.9)" },
        ],
        { duration: 620, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
      sparks.add(a);
      const end = () => {
        sparks.delete(a);
        img.remove();
      };
      a.onfinish = end;
      a.oncancel = end;
    };

    const finish = () => {
      if (done) return;
      done = true;
      emit("toy", { toy: "candles", action: "done" });
    };
    /** The swell steps with the count: a third, two thirds, then all. */
    const counted = () => {
      const total = shown();
      const n = litShown();
      if (total === 0) return;
      if (n >= total) finish();
      else if (n === Math.floor((total * 2) / 3)) emit("toy", { toy: "candles", action: "lit", n: -2 });
      else if (n === Math.floor(total / 3)) emit("toy", { toy: "candles", action: "lit", n: -4 });
    };

    const light = (i: number) => {
      const c = candles[i];
      const p = pts[i];
      if (!c || !p || lit[i]) return;
      lit[i] = true;
      setTiming(c, fade, 0);
      c.setAttribute("data-lit", "");
      if (!alt) spark(p);
      fwip(i);
      counted();
    };

    /** Every candle lit at once, no transition (offscreen, or the toy ends). */
    const relightAll = () => {
      for (const t of timers) window.clearTimeout(t);
      timers.clear();
      for (const a of [...sparks]) a.cancel();
      candles.forEach((c) => {
        setTiming(c, 0, 0);
        c.setAttribute("data-lit", "");
      });
      lit = candles.map(() => true);
      armed = false;
      ready = false;
      done = false;
    };

    const arm = (x: number, y: number) => {
      measure();
      const fr = field.getBoundingClientRect();
      const ox = x - fr.left;
      const oy = y - fr.top;
      const far = Math.max(
        1,
        ...pts.map((p) => (p ? (alt ? p.y : Math.hypot(p.x - ox, p.y - oy)) : 0)),
      );
      candles.forEach((c, i) => {
        const p = pts[i];
        if (!p) return;
        const d = alt ? p.y : Math.hypot(p.x - ox, p.y - oy);
        setTiming(c, SNUFF_FADE, (Math.max(0, d) / far) * SNUFF_SWEEP);
        c.removeAttribute("data-lit");
        lit[i] = false;
      });
      armed = true;
      ready = false;
      done = false;
      wasOff = false;
      emit("toy", { toy: "candles", action: "arm" });
      // the wand lights nothing until the dark has finished falling
      later(() => {
        ready = true;
      }, SNUFF_SWEEP + SNUFF_FADE);
    };

    const tick = () => {
      raf = 0;
      if (!armed) {
        if (wasOff) arm(px, py);
        return;
      }
      if (!ready || done) return;
      const fr = field.getBoundingClientRect();
      const x = px - fr.left;
      const y = py - fr.top;
      pts.forEach((p, i) => {
        if (p && !lit[i] && (p.x - x) ** 2 + (p.y - y) ** 2 <= RADIUS * RADIUS) light(i);
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /** "Lumos" (keyboard): every dark candle catches, out from the flame. */
    const lumos = () => {
      if (!armed || done) {
        finish();
        return;
      }
      ready = true;
      const mono = section.querySelector('[data-motif="bracket-monogram"]');
      const fr = field.getBoundingClientRect();
      const mr = mono?.getBoundingClientRect();
      const fx = mr ? mr.left + mr.width / 2 - fr.left : fr.width;
      const fy = mr ? mr.top + mr.height / 2 - fr.top : fr.height / 2;
      const dark = pts.flatMap((p, i) => (p && !lit[i] ? [{ i, d: Math.hypot(p.x - fx, p.y - fy) }] : []));
      const far = Math.max(1, ...dark.map((k) => k.d));
      const span = LUMOS_SWEEP - fade;
      let lastAt = -Infinity;
      dark
        .sort((a, b) => a.d - b.d)
        .forEach(({ i, d }) => {
          const c = candles[i]!;
          const at = (d / far) * span;
          lit[i] = true;
          setTiming(c, fade, at);
          c.setAttribute("data-lit", "");
          // the fwips follow the wave, ≤ 10 a second
          if (at - lastAt >= FWIP_GAP) {
            lastAt = at;
            later(() => emit("toy", { toy: "candles", action: "light", n: (i * 3) % 5 }), at);
          }
        });
      later(finish, LUMOS_SWEEP);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (!entry || entry.isIntersecting) return;
      // fully offscreen: the hall is lit again, and the toy may arm next time
      wasOff = true;
      if (armed || done) relightAll();
    });
    io.observe(section);
    const ro = new ResizeObserver(() => {
      if (armed) measure();
    });
    ro.observe(field);
    section.addEventListener("pointermove", onMove, { passive: true });
    const offToy = on("toy", (d) => {
      if (d.toy === "candles" && d.action === "lumos") lumos();
    });
    field.setAttribute("data-candle-toy", "");

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      section.removeEventListener("pointermove", onMove);
      offToy();
      relightAll();
      candles.forEach((c) => {
        c.style.removeProperty("--candle-fade");
        c.style.removeProperty("--candle-delay");
      });
      field.removeAttribute("data-candle-toy");
    };
  }, [variant]);
  return null;
}
