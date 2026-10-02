"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import type { Variant } from "@/lib/variants";
import { StageLayerPortal } from "@/components/stage/stage-layers";
import { GATE_COUNT, gateSpan, gateX } from "@/components/games/drone/course";
import { flightController, type FlightController, type Phase, type Result } from "@/components/games/drone/flight";
import { fill, secs, type DroneCopy } from "@/components/games/shared";
// the games' CSS rides this lazy chunk, never the first load (W2 rule 34)
import "@/components/games/games.css";

/* ============================================================================
   FLY THE HOMEMADE DRONE (PHASE3-SPEC §9.2 #2; P3-8 #4) — OWNER: W3-GAMES.
   The lazy game, mounted inside the systems band's picture box by
   <DroneBand/> on the first press of "▲ Take off" (DESKTOP_FINE only; the
   pill is server markup shown by the full media query). It never starts by
   itself: every flight is a press (`run` counts them).

   THE FLIGHT
   - Take-off: the plate dims to the slate "board" state (an opacity layer
     over the plate: the plate itself is never repainted) and the chalk
     ChalkQuadcopter, a PRE-RASTERIZED PNG sprite (assets/p3/games/), rises
     from the photographed drone's mark [.60, .47]. Focus moves into the play
     field; `html[data-game="drone"]` is set (the typed-egg listener stands
     down, B9; no CSS keys on it, rule 33) and `game:start` holds the band's
     camera still (drone-desk.tsx).
   - Seven chalk gates (course.ts, static SVG): 01…07, the next one the
     viewport's one aqua mark. Passing gate n speaks its VERBATIM gauntlet
     title in a polite live region ("Gate 2 of 7 · A blind holdout, spent
     once"; the strings are filled on the server) and emits `game:gate`
     (the chalk tick). Gate 7 records the time (best in aryan:games:v1),
     emits `game:finish` (the finish chord), lands, and the band shows the
     score and a real link "Next: the kill-list ↓".
   - Physics (physics.ts): thrust, max speed, drag, tilt, hover bob; the
     band's edge stops it dead (restitution 0). No crash, fall, fail state
     or time limit. dt ≤ 1/30 s; rAF only while flying, in view and the tab
     visible; < 2 ms of JS per frame (one transform on one promoted sprite).
   - Controls: arrows / WASD ONLY while the play field has focus
     (preventDefault only there; no page-wide keys, WCAG 2.1.4); pointer
     press-and-drag on the field (a spring toward the pointer); Esc lands
     (600 ms glide back to the mark); the band below 50 % visible lands it.
     Wheel and scroll are never captured.
   - Sound (lib/audio): the rotor hum loop at a rate that follows the speed;
     the gate tick and finish chord come from the events.
   - The HUD ("3/7 gates · 9.2 s" and how to fly) is fixed, through
     StageLayerPortal("game-hud") (under the header and the fast lane).

   MOTION OFF (reduced motion or Pause): take-off is disabled; the pill shows
   the static labelled course with "Motion is off: here is the flight plan"
   and the gate titles (a press again or Esc closes it). Pause mid-flight
   lands at once; nothing keeps moving.

   VARIANTS (`systems.drone`, the key is handed to lib/variants.ts):
     default "chalk-sprite"  the slate board, chalk gates, the chalk sprite;
     alt     "blueprint"     the blueprint panel, dashed drafting gates in
                             the blueprint line, the drone as a clean
                             blueprint drawing (drone-blueprint.png).
   IC-3I-08: no window, no camera feed, no song, no crash, no comic sound,
   and nothing links it to Aryan's own drone work. Never "Rancho's drone"
   in any string.
   ========================================================================== */

/** The course's drawing box: the band is exactly 21:9 at ≥ 640 px. */
const VB_W = 2100;
const VB_H = 900;
/** The posts above / below each opening (viewBox units). */
const POST = 70;
const BAR = 26;

const pad = (n: number) => String(n).padStart(2, "0");

export default function DroneGame({
  run,
  box,
  pill,
  copy,
  variant,
  sprite,
}: {
  /** Presses of "▲ Take off" (each one takes off, lands, or opens the plan). */
  run: number;
  /** The band's picture box (the field covers it). */
  box: RefObject<HTMLDivElement | null>;
  /** The pill (focus returns to it on landing). */
  pill: RefObject<HTMLButtonElement | null>;
  copy: DroneCopy;
  /** `systems.drone`: "default" chalk-sprite, "alt" blueprint. */
  variant: Variant;
  /** The sprite for the variant (a static import's URL). */
  sprite: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [gates, setGates] = useState(0);
  const [clock, setClock] = useState(0);
  const [said, setSaid] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const field = useRef<HTMLDivElement>(null);
  const spriteEl = useRef<HTMLImageElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const planEl = useRef<HTMLDivElement>(null);
  const ctl = useRef<FlightController | null>(null);
  const helpId = useId();

  useEffect(() => {
    const c = flightController({ box, field, sprite: spriteEl, board, pill }, copy, {
      phase: setPhase,
      gates: setGates,
      clock: setClock,
      say: setSaid,
      result: setResult,
    });
    ctl.current = c;
    return () => {
      c.destroy();
      ctl.current = null;
    };
  }, [box, pill, copy]);

  // each press of the pill (the first one mounted this chunk); declared
  // after the controller's effect, so it runs after it on every mount
  useEffect(() => {
    ctl.current?.request(run);
  }, [run]);

  // focus follows the game: into the field on take-off, onto the plan
  useEffect(() => {
    if (phase === "flying") field.current?.focus({ preventScroll: true });
    else if (phase === "plan") planEl.current?.focus({ preventScroll: true });
  }, [phase]);

  const local = (e: PointerEvent<HTMLDivElement>) => {
    const b = box.current?.getBoundingClientRect();
    return b ? { x: e.clientX - b.left, y: e.clientY - b.top } : null;
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>, down: boolean) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (down && e.key === "Escape") {
      if (ctl.current?.esc()) e.preventDefault();
      return;
    }
    if (ctl.current?.key(e.key, down)) e.preventDefault();
    // Space would page the band away mid-flight: inside the field it does nothing
    else if (e.key === " ") e.preventDefault();
  };

  const flying = phase === "flying" || phase === "landing";
  const score = (n: number, ms: number) => fill(copy.score, { n, s: secs(ms) });

  return (
    <>
      <div className="drone-game" data-phase={phase} data-variant={variant}>
        {/* the board and its course stay mounted once the game is (the board
            is transparent at rest), so a landing fades them out together */}
        <div ref={board} className="drone-board" aria-hidden="true">
          <svg className="drone-course" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" focusable="false">
            {Array.from({ length: GATE_COUNT }, (_, i) => {
              const x = gateX(i) * VB_W;
              const [a, b] = gateSpan(i);
              const top = a * VB_H;
              const bot = b * VB_H;
              const state = phase === "plan" ? "todo" : i < gates ? "done" : i === gates ? "next" : "todo";
              return (
                <g key={i} data-state={state}>
                  <path
                    d={`M${x} ${top - POST} L${x} ${top} M${x - BAR} ${top} L${x + BAR} ${top} M${x} ${bot + POST} L${x} ${bot} M${x - BAR} ${bot} L${x + BAR} ${bot}`}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
          {Array.from({ length: GATE_COUNT }, (_, i) => (
            <span
              key={i}
              className="drone-label tnum"
              data-state={phase === "plan" ? "todo" : i < gates ? "done" : i === gates ? "next" : "todo"}
              style={{
                left: `${gateX(i) * 100}%`,
                top: `${((gateSpan(i)[0] * VB_H - POST) / VB_H) * 100}%`,
              }}
            >
              {pad(i + 1)}
            </span>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- a pre-rasterized sprite moved by transform every frame (spec §9.2 #2) */}
        <img
          ref={spriteEl}
          className="drone-sprite"
          src={sprite}
          width={192}
          height={134}
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
        />

        {flying ? (
          <div
            ref={field}
            className="drone-field"
            role="application"
            aria-label={copy.cmd}
            aria-describedby={helpId}
            tabIndex={0}
            onKeyDown={(e) => onKey(e, true)}
            onKeyUp={(e) => onKey(e, false)}
            onBlur={() => ctl.current?.blur()}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              e.currentTarget.focus({ preventScroll: true });
              const p = local(e);
              if (p) ctl.current?.point(p.x, p.y);
            }}
            onPointerMove={(e) => {
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
              const p = local(e);
              if (p) ctl.current?.point(p.x, p.y);
            }}
            onPointerUp={() => ctl.current?.release()}
            onPointerCancel={() => ctl.current?.release()}
            onLostPointerCapture={() => ctl.current?.release()}
          />
        ) : null}
        <p id={helpId} className="sr-only">
          {copy.help}
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {said}
        </p>

        {phase === "plan" ? (
          <div
            ref={planEl}
            className="drone-panel drone-plan"
            role="group"
            aria-label={copy.rm}
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape" && ctl.current?.esc()) e.preventDefault();
            }}
          >
            <p className="type-meta text-fg">{copy.rm}</p>
            <ol className="mt-2 type-small text-fg-muted">
              {copy.titles.map((title, i) => (
                <li key={i}>
                  <span className="tnum text-fg">{pad(i + 1)}</span> {title}
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {phase === "done" && result ? (
          <div className="drone-panel drone-result">
            <p className="tnum type-meta text-fg">{score(GATE_COUNT, result.ms)}</p>
            {copy.best ? <p className="tnum type-meta text-fg-muted">{fill(copy.best, { s: secs(result.best) })}</p> : null}
            <a href="#kill-list" className="drone-next type-meta">
              {copy.next}
            </a>
          </div>
        ) : null}
      </div>

      {flying ? (
        <StageLayerPortal layer="game-hud">
          <div className="drone-hud" aria-hidden="true" data-house-type="">
            <p className="tnum type-meta text-fg">{score(gates, clock)}</p>
            <p className="type-small text-fg-muted">{copy.help}</p>
          </div>
        </StageLayerPortal>
      ) : null}
    </>
  );
}
