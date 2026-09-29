"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { LINE, LINE_D, LINE_VIEWBOX, remap, smooth01 } from "@/components/primitives/loaders/line";
import { CANDLE_SPRITE, LUMOS_SPRITE } from "@/components/primitives/loaders/sprites-hp";
import { EMBER_SPRITE, FIRE0_SPRITE, FIRE1_SPRITE, FIRE2_SPRITE } from "@/components/primitives/loaders/sprites-rd";
import { useCard } from "@/components/sections/act-card/card-context";
import {
  FRAME_ASPECT,
  PlateBox,
  anchor,
  coverBox,
  inBox,
  plateOf,
  type Plate,
  type Pos,
} from "@/components/sections/act-card/plate";

/**
 * Card III→IV "Embers → the Line ignites" (SM-10, kind `ignite`, D-5 long
 * #2; ignite.BAR). One pinned driver p (≤ 60vh, desktop fine pointer):
 *   0–.6    THE CAMP holds (T10, M2 ART-DIRECTOR #6): the previous
 *           section's own plate (Voices: iconic-camp) fills the frame and
 *           sinks into the hp deep over .3–.6, its fire glowing (a code
 *           fire sprite over the photograph's fire) until ≈ .45; the ground
 *           crossfades rd deep → hp deep over 0–.2 (CardShell `fromGround`);
 *           the Line lies in graphite at 30 %.
 *   .2–.7   ignition: N ember sprites rise FROM THE CAMP'S FIRE (the
 *           plate's `fire` anchor, registered in the 2.39 frame); ember i
 *           arrives at its point on the Line when p ≥ .2 + .5·i/N and
 *           becomes a floating candle (IC-HP-03). A cool light leads the
 *           kindling front; the graphite is re-inked behind it and fades as
 *           the points light — pencil becomes ink becomes light.
 *   .35–.55 THE GREAT HALL comes up to a third behind the candles, so the
 *           MIDDLE (p .5) shows both worlds — the camp going, the hall
 *           arriving, the candles between them;
 *   .78–.9  the hall (iconic-hall: the long tables, the high table, the
 *           tall window, the enchanted starry ceiling, hundreds of floating
 *           candles) takes the frame (RECOGNIZABILITY S17) as the canvas
 *           fades out (.8–.9); the canvas unmounts at p = 1 (and remounts
 *           below on the way back). Every layer is an opacity scrub of p.
 * Everything is a pure function of p (G2, G3: reversible, pixel-identical
 * on return; the ember glow now overlaps the first candles — G12's "one
 * warm family at a time" yields to ART-DIRECTOR #6); frames are drawn
 * only when p changes (0 rAF at rest, offscreen or on a hidden tab).
 * Luminous points are pre-rendered sprites drawn with
 * drawImage (Law 1; 0 gradients per frame); DPR ≤ 2; ≤ 36 embers + 1 light
 * + 3 fire frames. The canvas lives only while the card is within one
 * viewport and the device has ≥ 4 cores. Static card (RM, Pause, < 1024 /
 * coarse, no JS, SSR): the Great Hall still. aria-hidden art.
 *
 * MV-07 missing (`hall` null; ignite.BAR "the code-rendered final frame"):
 * the live canvas stays on its own final frame at p = 1 (every candle lit
 * along the Line) instead of handing over to the hall, and the static card
 * is that same final frame rendered once as SVG from the same sprites
 * (<StaticIgnition>: 0 canvas, 0 travel).
 */

const N = 36;
const RISE = 0.12;
const arrival = (i: number) => 0.2 + (0.5 * i) / N;

type Sprites = {
  ember: HTMLImageElement;
  candle: HTMLImageElement;
  light: HTMLImageElement;
  fire: HTMLImageElement[];
};

function loadSprites(): Sprites {
  const img = (src: string) => {
    const i = new Image();
    i.src = src;
    return i;
  };
  return {
    ember: img(EMBER_SPRITE),
    candle: img(CANDLE_SPRITE),
    light: img(LUMOS_SPRITE),
    fire: [img(FIRE0_SPRITE), img(FIRE1_SPRITE), img(FIRE2_SPRITE)],
  };
}

export function IgniteFrame({
  hall,
  mid = null,
  fire = null,
  camp = null,
}: {
  /** The settled plate: the Great Hall (iconic-hall). */
  hall: MediaId | null;
  /** The lit Line (MV-07): the settled plate only when the hall is missing. */
  mid?: MediaId | null;
  /** The previous section's fire (0–1 of its plate, `fire` anchor), used
   *  as frame fractions when there is no `camp` plate (the lab). */
  fire?: readonly [number, number] | null;
  /** The previous section's plate (Voices: iconic-camp): the outgoing
   *  picture, held until p ≈ .5; the embers rise from ITS fire. */
  camp?: MediaId | null;
}) {
  const { p, live } = useCard();
  const hostRef = useRef<HTMLDivElement>(null);
  const campPlate = plateOf(camp);
  // the camp's fire in FRAME fractions (the plate as the 2.39 frame crops
  // it); memoised: the canvas re-initialises when its fire changes
  const fireAt = useMemo(() => {
    const c = plateOf(camp);
    return c ? (fireInFrame(c) ?? fire) : fire;
  }, [camp, fire]);

  // The static card: the hall (or the lit Line when the hall is missing).
  const [done, setDone] = useState(() => p.get() >= 0.999);
  useMotionValueEvent(p, "change", (v) => {
    const d = v >= 0.999;
    if (d !== done) setDone(d);
  });

  // Near = within one viewport of the card (the canvas's whole life).
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = hostRef.current;
    if (!live || !el || typeof IntersectionObserver === "undefined") return;
    if ((navigator.hardwareConcurrency ?? 8) < 4) return; // static fallback
    const io = new IntersectionObserver(([e]) => setNear(Boolean(e?.isIntersecting)), {
      rootMargin: "100% 0px 100% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  const plated = Boolean(hall || mid);
  // with no plate to hand over to, the canvas keeps its final frame
  const canvasOpacity = useTransform(p, (v) => (plated ? 1 - remap(v, 0.8, 0.9) : 1));
  const showCanvas = live && near && (!done || !plated);
  const hallOpacity = useTransform(p, hallAt);
  // MV-07 stands in for the hall only when the hall is missing
  const midOpacity = useTransform(p, (v) => remap(v, 0.7, 0.85));

  return (
    <div ref={hostRef} aria-hidden="true" data-frame="ignite" className="absolute inset-0">
      {live && campPlate ? <CampLayer plate={campPlate} p={p} /> : null}
      {mid && !hall ? (
        <motion.div className="absolute inset-0" style={live ? { opacity: midOpacity } : undefined}>
          <MediaFrame media={mid} layout="fill" playOn="never" sizes="100vw" />
        </motion.div>
      ) : null}
      {hall ? (
        <motion.div className="absolute inset-0" style={live ? { opacity: hallOpacity } : undefined}>
          <MediaFrame media={hall} layout="fill" playOn="never" sizes="100vw" />
        </motion.div>
      ) : null}
      {!plated && (!live || !near) ? <StaticIgnition /> : null}
      {showCanvas ? (
        <motion.div className="absolute inset-0" style={{ opacity: canvasOpacity }}>
          <IgniteCanvas p={p} fire={fireAt} />
        </motion.div>
      ) : null}
    </div>
  );
}

/** The camp sinks into the hp deep over this window of p (still ~.4 at the
 *  middle: both worlds, the hall leading). */
const CAMP_OUT = { from: 0.3, to: 0.62 };

/** THE CAMP (the previous section's plate) sinking into the hp deep over
 *  CAMP_OUT; live only. Shared with the ALT (frames/ignite-lumos.tsx). */
export function CampLayer({ plate, p }: { plate: Plate; p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => 1 - remap(v, CAMP_OUT.from, CAMP_OUT.to));
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ opacity }}>
      <PlateBox plate={plate}>
        <MediaFrame media={plate.asset.id} layout="fill" playOn="never" sizes="100vw" />
      </PlateBox>
    </motion.div>
  );
}

/** The camp's ember glow holds until ≈ .45 and is out by .5. */
export const EMBER_OUT = { from: 0.4, to: 0.5 };
/** The Great Hall: up to a third from p .35 (behind the candles, the camp
 *  still in the frame: both worlds at the middle), then the whole frame
 *  over .78–.9. Shared with the ALT (frames/ignite-lumos.tsx). */
export function hallAt(v: number): number {
  // M2 critic 3 / blind D10-act-4-mid (hp .45–.55): at the middle the hall
  // must LEAD (the caption rule: the mid frame's dominant world is the
  // incoming one) — .6 by p .5 over the fading camp, then the whole frame
  return 0.6 * remap(v, 0.3, 0.5) + 0.4 * remap(v, 0.72, 0.88);
}

/** Measured fires (0–1 of the plate) for plates without a `fire` mark
 *  (cards builder, 2026-09-29, on the 2560 px files); the plate's own mark
 *  wins. MV-11 is the Voices ALT's campfire. */
const PLATE_FIRE: Partial<Record<MediaId, Pos>> = { "MV-11": [0.76, 0.62], "MV-11-alt": [0.76, 0.62] };

/** A camp plate's fire in FRAME fractions of the 2.39:1 letterbox (the
 *  canvas and the sweep only run there: live is ≥ 1024), or null. */
export function fireInFrame(plate: Plate): readonly [number, number] | null {
  const f = anchor(plate, "fire", PLATE_FIRE[plate.asset.id] ?? null);
  return f ? inBox(coverBox(FRAME_ASPECT.sm, plate.ratio, plate.pos), f) : null;
}

/** The ignition's final frame (every point lit), drawn once in SVG from the
 *  canvas's own geometry and sprites: the static card while MV-07 is
 *  missing. Same fit as the canvas (the Line viewBox at 90 %, centred). */
const STATIC_PAD = { x: (LINE_VIEWBOX.w / 0.9 - LINE_VIEWBOX.w) / 2, y: (LINE_VIEWBOX.h / 0.9 - LINE_VIEWBOX.h) / 2 };
const STATIC_CANDLES = Array.from({ length: N }, (_, i) => {
  const q = LINE.at((i + 0.5) / N);
  const depth = 0.75 + 0.5 * (((i * 7) % 5) / 4);
  const w = (10 / 1.3) * depth;
  return { x: q.x - w / 2, y: q.y - w * 3 * 0.22, w, h: w * 3 };
});

function StaticIgnition() {
  return (
    <svg
      viewBox={`${-STATIC_PAD.x} ${-STATIC_PAD.y} ${LINE_VIEWBOX.w + 2 * STATIC_PAD.x} ${LINE_VIEWBOX.h + 2 * STATIC_PAD.y}`}
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      className="absolute inset-0 size-full"
      fill="none"
    >
      <path
        d={LINE_D}
        stroke="var(--w-ink-contour)"
        strokeOpacity={0.3}
        strokeWidth={1.4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <g style={{ mixBlendMode: "plus-lighter" }} opacity={0.95}>
        {STATIC_CANDLES.map((c, i) => (
          <image key={i} href={CANDLE_SPRITE} x={c.x} y={c.y} width={c.w} height={c.h} preserveAspectRatio="none" />
        ))}
      </g>
    </svg>
  );
}

function IgniteCanvas({ p, fire: fireAt }: { p: MotionValue<number>; fire: readonly [number, number] | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<((v: number) => void) | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const sprites = loadSprites();
    const css = getComputedStyle(canvas);
    const pencil = css.getPropertyValue("--w-pencil").trim() || "gray";
    const ink = css.getPropertyValue("--w-ink-contour").trim() || "tan";
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let s = 1;
    let ox = 0;
    let oy = 0;
    const pts = Array.from({ length: N }, (_, i) => LINE.at((i + 0.5) / N));
    const poly = Array.from({ length: 161 }, (_, k) => LINE.at(k / 160));
    const at = (q: { x: number; y: number }) => ({ x: ox + q.x * s, y: oy + q.y * s });

    const fit = () => {
      W = Math.max(1, Math.round(canvas.clientWidth * dpr));
      H = Math.max(1, Math.round(canvas.clientHeight * dpr));
      canvas.width = W;
      canvas.height = H;
      s = Math.min(W / LINE_VIEWBOX.w, H / LINE_VIEWBOX.h) * 0.9;
      ox = (W - LINE_VIEWBOX.w * s) / 2;
      oy = (H - LINE_VIEWBOX.h * s) / 2;
    };

    const strokeTo = (f: number) => {
      const end = Math.round(Math.min(1, Math.max(0, f)) * 160);
      if (end < 1) return;
      ctx.beginPath();
      const a = at(poly[0]);
      ctx.moveTo(a.x, a.y);
      for (let k = 1; k <= end; k++) {
        const b = at(poly[k]);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();
    };

    const draw = (v: number) => {
      ctx.clearRect(0, 0, W, H);
      const lit = pts.reduce((n, _, i) => n + (v >= arrival(i) ? 1 : 0), 0);
      // sprite unit: ~1 CSS px per Line unit at 1440 wide (s carries the DPR)
      const unit = s / 1.3;

      // the Line: graphite fading as the points light, ink behind the front
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 1.4 * dpr;
      ctx.strokeStyle = pencil;
      ctx.globalAlpha = 0.3 * (1 - lit / N);
      strokeTo(1);
      ctx.strokeStyle = ink;
      ctx.globalAlpha = 1 - 0.7 * remap(v, 0.6, 0.85);
      strokeTo(lit / N);

      // warm points: additive sprites only
      ctx.globalCompositeOperation = "lighter";
      // the fire: where the camp's fire was (the Voices plate's anchor, in
      // frame fractions), else the Line's start
      const fire = fireAt ? { x: fireAt[0] * W, y: fireAt[1] * H } : at(LINE.at(0));
      // the camp's ember glow holds while its picture does (ART-DIRECTOR
      // #6: the outgoing world stays in the frame to the middle), out by .5
      const fireA = 1 - remap(v, EMBER_OUT.from, EMBER_OUT.to);
      if (fireA > 0) {
        const f = sprites.fire[Math.floor(v * 90) % 3];
        const fw = 22 * unit;
        ctx.globalAlpha = fireA;
        ctx.drawImage(f, fire.x - fw / 2, fire.y - fw * 1.3, fw, fw * 1.5);
      }
      for (let i = 0; i < N; i++) {
        const arr = arrival(i);
        const start = Math.max(0.12, arr - RISE);
        if (v < start) continue;
        const q = at(pts[i]);
        const depth = 0.75 + 0.5 * (((i * 7) % 5) / 4);
        if (v < arr) {
          const t = (v - start) / (arr - start);
          const e = smooth01(t);
          const x = fire.x + (q.x - fire.x) * e;
          const y = fire.y + (q.y - fire.y) * e - Math.sin(Math.PI * e) * 60 * s;
          const sz = 9 * unit * depth;
          ctx.globalAlpha = 0.9;
          ctx.drawImage(sprites.ember, x - sz / 2, y - sz / 2, sz, sz);
        } else {
          const cw = 10 * unit * depth;
          const ch = cw * 3;
          ctx.globalAlpha = 0.95;
          ctx.drawImage(sprites.candle, q.x - cw / 2, q.y - ch * 0.22, cw, ch);
        }
      }
      if (lit > 0 && lit < N) {
        const f = at(LINE.at(lit / N));
        const lw = 20 * unit;
        ctx.globalAlpha = 1;
        ctx.drawImage(sprites.light, f.x - lw / 2, f.y - lw / 2, lw, lw);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const schedule = (v: number) => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        draw(v);
      });
    };
    drawRef.current = (v) => schedule(v);

    fit();
    const ro = new ResizeObserver(() => {
      fit();
      schedule(p.get());
    });
    ro.observe(canvas);
    // sprites decode async: redraw once each has arrived
    const all = [sprites.ember, sprites.candle, sprites.light, ...sprites.fire];
    all.forEach((im) => im.addEventListener("load", () => schedule(p.get()), { once: true }));
    schedule(p.get());

    return () => {
      ro.disconnect();
      drawRef.current = null;
      if (frame.current) window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [p, fireAt]);

  useMotionValueEvent(p, "change", (v) => drawRef.current?.(v));

  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}
