"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { emit } from "@/lib/events";
import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { spotlight } from "@/lib/spotlight";
import { useVariant } from "@/lib/use-variant";
import { BROOM_SVG } from "@/components/intro/broom";
import { HUNT_TOTAL, foundIds } from "@/components/eggs/hunt-store";
// its CSS (game-lazy.css) loads with this lazy chunk, not the page (W2 assembly)
import "@/app/p3/game-lazy.css";

/* ============================================================================
   POST-CREDITS SCENE (lazy; PHASE3-SPEC §9.4, B58) — OWNER: W2-HUNT.
   Mounted by components/site/post-credits.tsx inside the 60vh tail once it
   has been ≥ 50 % in view for 1 s (once per session). A time star: it asks
   the spotlight (weight 3) and plays on "play"; on "skip", with motion off
   (Pause / reduced motion) or when motion goes off mid-scene (≤ 100 ms) it
   shows its STILL end state. Transform / opacity only, inside the tail
   (overflow clipped: never over text, no horizontal scroll). aria-hidden.

   DEFAULT "riderless-broom" (≤ 3.6 s): the intro's riderless broom
   (components/intro/broom.ts, the bookend match cut) drifts in along the
   bottom from the right, pauses under "↑ Back to the opening", tips up and
   exits up-left. Still: it rests there.
   ALT "ink-footprints": ink footprints walk in from the left and stop under
   the link. Still: the whole trail.
   12/12 EXTENDED CUT (both): first the four instruments play one beat each
   — the compass needle swings to point up, the chalk quadcopter lifts, the
   Dead Eye core fills gold, one candle lights (our own drawings: no
   reticle, no figure) — then the broom (or the footprints).
   Sound: `post-credits` { extended } (the engine's whoosh + chime).
   ========================================================================== */

/** The intro broom, re-keyed so its gradients and class never collide with
 *  the intro's copy (which may still be in the document). */
const BROOM = BROOM_SVG.replace(/ib-/g, "pcb-").replace('class="intro-broom"', 'class="pc-broom-art"');

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
const EASE_EXIT = "cubic-bezier(0.55, 0, 0.75, 0.25)";
/** The instruments' beats (extended cut): start of each, ms. */
const BEAT_MS = 400;
const INSTRUMENTS_MS = 4 * BEAT_MS + 250;
const PRINTS = 8;

type Mode = "wait" | "play" | "still";

export default function PostCreditsScene() {
  const variant = useVariant(null, "post-credits.scene");
  // the cut is fixed when the scene starts (a find during it changes nothing)
  const [extended] = useState(() => foundIds().length >= HUNT_TOTAL);
  const [mode, setMode] = useState<Mode>("wait");
  const root = useRef<HTMLDivElement>(null);

  // ask the spotlight: play, or the still end state
  useEffect(() => {
    let live = true;
    void spotlight.request("B58", { weight: 3, durationMs: 1200 }).then((a) => {
      if (!live) return;
      setMode(a === "play" && !motionOffNow() ? "play" : "still");
    });
    return () => {
      live = false;
      spotlight.release("B58");
    };
  }, []);

  // the timeline (WAAPI, transform / opacity), set before the first paint so
  // no part flashes at its resting place; motion off → the still state
  useLayoutEffect(() => {
    const box = root.current;
    if (mode !== "play" || !box) return;
    emit("post-credits", { extended });
    const anims: Animation[] = [];
    const W = box.clientWidth;
    const H = box.clientHeight;
    const t0 = extended ? INSTRUMENTS_MS : 0;
    const at = (el: Element | null, frames: Keyframe[], o: KeyframeAnimationOptions) => {
      if (el) anims.push(el.animate(frames, { fill: "both", ...o }));
    };

    if (extended) {
      const q = (s: string) => box.querySelector(`[data-pc-part="${s}"]`);
      at(q("needle"), [{ transform: "rotate(52deg)" }, { transform: "rotate(-8deg)", offset: 0.7 }, { transform: "rotate(0deg)" }], {
        duration: 520,
        easing: EASE_OUT,
      });
      at(q("quad"), [{ transform: "translateY(0)" }, { transform: "translateY(-8px)" }], { duration: 480, delay: BEAT_MS, easing: EASE_OUT });
      at(q("core"), [{ opacity: 0, transform: "scale(0.4)" }, { opacity: 1, transform: "scale(1)" }], {
        duration: 420,
        delay: 2 * BEAT_MS,
        easing: EASE_OUT,
      });
      at(q("flame"), [{ opacity: 0, transform: "scale(0.5)" }, { opacity: 1, transform: "scale(1)" }], {
        duration: 420,
        delay: 3 * BEAT_MS,
        easing: EASE_OUT,
      });
      at(box.querySelector("[data-pc-instruments]"), [{ opacity: 1 }, { opacity: 0 }], {
        duration: 400,
        delay: t0 + (variant === "alt" ? 2400 : 2600),
        easing: "ease",
      });
    }

    if (variant === "alt") {
      box.querySelectorAll("[data-pc-print]").forEach((p, i) => {
        at(p, [{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: t0 + i * 240, easing: "ease-out" });
      });
    } else {
      const bw = Math.min(260, Math.max(180, W * 0.22));
      const y0 = H * 0.68;
      const xIn = W + 24;
      const xMid = (W - bw) / 2;
      const xOut = -bw - 48;
      const tr = (x: number, y: number, r: number) => `translate(${x}px, ${y}px) rotate(${r}deg)`;
      at(
        box.querySelector("[data-pc-broom]"),
        [
          { transform: tr(xIn, y0, 0), opacity: 0, easing: EASE_OUT },
          { transform: tr(xIn - 40, y0, 0), opacity: 1, offset: 0.06, easing: EASE_OUT },
          { transform: tr(xMid, y0 - 2, -1.5), offset: 0.39, easing: "ease-in-out" },
          { transform: tr(xMid, y0 - 6, 0), offset: 0.56, easing: EASE_IN_OUT },
          { transform: tr(xMid - 12, y0 - 14, -18), offset: 0.67, easing: EASE_EXIT },
          { transform: tr(xOut, H * 0.08, -22), opacity: 1, offset: 0.95 },
          { transform: tr(xOut, H * 0.08, -22), opacity: 0 },
        ],
        { duration: 3600, delay: t0 },
      );
    }

    const stop = onMotionOffChange(() => {
      if (!motionOffNow()) return;
      anims.forEach((a) => a.cancel());
      setMode("still");
    });
    return () => {
      stop();
      anims.forEach((a) => a.cancel());
    };
  }, [mode, extended, variant]);

  if (mode === "wait") return null;
  const still = mode === "still";

  return (
    <div ref={root} className="pc-scene" data-pc-scene={variant} data-still={still ? "" : undefined} data-extended={extended ? "" : undefined}>
      {extended ? <Instruments /> : null}
      {variant === "alt" ? (
        <div className="pc-prints">
          {Array.from({ length: PRINTS }, (_, i) => (
            <svg
              key={i}
              data-pc-print=""
              viewBox="0 0 12 20"
              width={12}
              height={20}
              className="pc-print"
              style={{ left: `${12 + (i / (PRINTS - 1)) * 38}%`, top: i % 2 ? "64%" : "60%" }}
              focusable="false"
            >
              <ellipse cx="6" cy="7" rx="4.2" ry="6" />
              <ellipse cx="6" cy="16.4" rx="3" ry="3.2" />
            </svg>
          ))}
        </div>
      ) : (
        <div className="pc-broom" data-pc-broom="" dangerouslySetInnerHTML={{ __html: BROOM }} />
      )}
    </div>
  );
}

/** The four instruments (our own drawings, 40 px each): end states are the
 *  static markup; the timeline plays from their start states. */
function Instruments() {
  return (
    <div className="pc-instruments" data-pc-instruments="">
      {/* Jack's compass: the needle settles pointing up */}
      <svg viewBox="0 0 40 40" width={40} height={40} focusable="false">
        <circle cx="20" cy="20" r="15" />
        <circle cx="20" cy="20" r="11.5" strokeOpacity=".45" />
        <path data-pc-part="needle" className="pc-pivot" d="M20 8.5 L22.6 20 L20 31.5 L17.4 20 Z" />
      </svg>
      {/* the chalk quadcopter: lifts 8 px */}
      <svg viewBox="0 0 40 40" width={40} height={40} focusable="false">
        <g data-pc-part="quad">
          <path d="M12 21 H28 M14 21 L10 16 M26 21 L30 16 M14 21 L10 26 M26 21 L30 26" />
          <path d="M5 16 H15 M25 16 H35 M5 26 H15 M25 26 H35" strokeOpacity=".7" />
          <rect x="16" y="18" width="8" height="6" rx="1.5" />
        </g>
      </svg>
      {/* the Dead Eye core: a ring that fills gold (no reticle) */}
      <svg viewBox="0 0 40 40" width={40} height={40} focusable="false">
        <circle cx="20" cy="20" r="12" />
        <circle data-pc-part="core" className="pc-pivot pc-gold" cx="20" cy="20" r="8.5" />
      </svg>
      {/* one candle lights */}
      <svg viewBox="0 0 40 40" width={40} height={40} focusable="false">
        <rect x="16.5" y="18" width="7" height="16" rx="1" />
        <path data-pc-part="flame" className="pc-pivot pc-gold" d="M20 6 C23.5 10.5 23.8 13.5 20 16.5 C16.2 13.5 16.5 10.5 20 6 Z" />
      </svg>
    </div>
  );
}
