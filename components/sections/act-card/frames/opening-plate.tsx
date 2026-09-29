"use client";

import { motion, useTransform } from "motion/react";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { remap } from "@/components/primitives/loaders/line";
import { useCard } from "@/components/sections/act-card/card-context";
import {
  FRAME_ASPECT,
  PlateBox,
  anchor,
  coverBox,
  inBox,
  plateOf,
  plateViewBox,
  type Plate,
  type Pos,
} from "@/components/sections/act-card/plate";

/**
 * Opening card, the FRAME (SM-3 + RECOGNIZABILITY S03/S04, T2): the Black
 * Pearl close — iconic-pearl (DEFAULT) or iconic-pearl-alt (ALT) — with
 * full, tattered black sails, in the 2.39:1 letterbox. Blind, a stranger
 * reads "the Black Pearl" in under 3 s; the film title above the frame and
 * the caption under it name it anyway.
 *
 *   T2  the hero's sea has already sunk into the deep (CardShell featherUp,
 *       the hero's last 18vh); the Pearl then opens by APERTURE from its own
 *       horizon line — a slit at the horizon widening to the full frame,
 *       sides inset(8%) → 0 — "from the horizon to the ship", on the
 *       card's passage p .15 → .5 (direct, reverses by position), while
 *       the plate settles from 1.04 → 1.
 *   The Jolly Roger — our own drawing (ICONS H2: a plain skull and
 *       CROSSBONES on a tattered black flag, never the film's skull-and-
 *       swords emblem; the plates carry no flag) — flies from the ensign
 *       staff at the Pearl's stern, registered to the plate's `ensign`
 *       anchor (lib/media.ts marks; measured values below until the
 *       integrator moves them into the plate rows). It flutters at ~0.3 Hz
 *       (SVG transform only) while the card is live; static under reduced
 *       motion, Pause, no JS and below 640.
 *   The frame is aria-hidden (the card's h2 and caption carry it).
 *
 * WHY the stern, not the masthead: the plates' masts run off their top edge
 * (mastTop y ≈ .05), and at the focal crop the 2.39 frame shows plate rows
 * .115–.86 — the masthead is outside it. Moving the crop up to show it
 * loses the horizon, the hull and the moon path. The ensign staff flies
 * the flag where it is seen, against the open night sky astern.
 */

/** The Jolly Roger's staff on each plate (0–1 of the plate): `top` = the
 *  staff head (the flag's hoist hangs from it), `base` = the taffrail.
 *  Measured by the cards builder on the 2560 px files (2026-09-29, 64 px
 *  grids). The plate's own `ensign` / `ensignBase` marks win when present. */
const ENSIGN: Partial<Record<MediaId, { top: Pos; base: Pos }>> = {
  "iconic-pearl": { top: [0.908, 0.3], base: [0.908, 0.456] },
  "iconic-pearl-alt": { top: [0.93, 0.215], base: [0.93, 0.37] },
};

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const OPEN = { from: 0.15, to: 0.5 };

export function OpeningPlateFrame({ plate: id, alt = false }: { plate: MediaId | null; alt?: boolean }) {
  const { p, live } = useCard();
  const plate = plateOf(id);

  // the aperture opens from the plate's horizon, as seen in the 2.39 frame
  const horizon = plate ? (anchor(plate, "horizon")?.[1] ?? 0.8) : 0.8;
  const hy = plate ? inBox(coverBox(FRAME_ASPECT.sm, plate.ratio, plate.pos), [0, horizon])[1] : 0.9;
  const clip = useTransform(p, (v) => {
    const e = easeOut(remap(v, OPEN.from, OPEN.to));
    const t = (hy * (1 - e) * 100).toFixed(3);
    const b = ((1 - hy) * (1 - e) * 100).toFixed(3);
    const s = (8 * (1 - e)).toFixed(3);
    return `inset(${t}% ${s}% ${b}% ${s}%)`;
  });
  const scale = useTransform(p, (v) => 1.04 - 0.04 * easeOut(remap(v, OPEN.from, 0.7)));

  if (!plate) return <div aria-hidden="true" className="absolute inset-0 bg-bg" />;

  return (
    <motion.div
      aria-hidden="true"
      data-frame="pearl"
      data-variant-plate={alt ? "alt" : "default"}
      className="absolute inset-0 overflow-hidden"
      style={live ? { clipPath: clip } : undefined}
    >
      <motion.div className="absolute inset-0" style={live ? { scale } : undefined}>
        <PlateBox plate={plate}>
          <MediaFrame media={plate.asset.id} layout="fill" playOn="never" sizes="100vw" />
          <JollyRoger plate={plate} flutter={live} />
        </PlateBox>
      </motion.div>
    </motion.div>
  );
}

/** Our own Jolly Roger on the plate's ensign staff (plate-pixel SVG). */
function JollyRoger({ plate, flutter }: { plate: Plate; flutter: boolean }) {
  const m = ENSIGN[plate.asset.id];
  const top = anchor(plate, "ensign", m?.top ?? null);
  const base = anchor(plate, "ensignBase", m?.base ?? null);
  if (!top) return null;
  const W = plate.asset.width;
  const H = plate.asset.height;
  const x = top[0] * W;
  const yt = top[1] * H;
  const yb = (base?.[1] ?? top[1] + 0.15) * H;
  const fly = 0.05 * W; // ≤ 5 % of the frame width (RECOGNIZABILITY S04)
  const hoist = 0.058 * H;
  // the cloth: a straight hoist, a tattered fly (two rents), a slight belly
  const cloth =
    `M0 0C${fly * 0.3} ${-hoist * 0.05} ${fly * 0.62} ${hoist * 0.06} ${fly} ${hoist * 0.02}` +
    `L${fly * 0.93} ${hoist * 0.22}L${fly * 1.01} ${hoist * 0.34}L${fly * 0.9} ${hoist * 0.5}` +
    `L${fly * 0.99} ${hoist * 0.63}L${fly * 0.91} ${hoist * 0.8}L${fly * 0.97} ${hoist * 0.99}` +
    `C${fly * 0.62} ${hoist * 1.05} ${fly * 0.3} ${hoist * 0.95} 0 ${hoist}Z`;
  const cx = fly * 0.48;
  const cy = hoist * 0.4;
  const r = hoist * 0.22;
  const bone = hoist * 0.07;
  const bx = hoist * 0.36;
  const bones = [
    [cx - bx, cy - hoist * 0.02, cx + bx, cy + hoist * 0.44],
    [cx + bx, cy - hoist * 0.02, cx - bx, cy + hoist * 0.44],
  ] as const;
  const ink = "#ebe7dc";
  return (
    <svg
      viewBox={plateViewBox(plate)}
      preserveAspectRatio="none"
      focusable="false"
      data-jolly-roger=""
      className="pointer-events-none absolute inset-0 size-full"
    >
      {/* the ensign staff: dark wood with a moonlit edge */}
      <path d={`M${x} ${yb}V${yt - hoist * 0.12}`} stroke="#0a0d10" strokeWidth={W * 0.0022} strokeLinecap="round" />
      <path
        d={`M${x + W * 0.0008} ${yb}V${yt - hoist * 0.12}`}
        stroke="var(--w-moon)"
        strokeOpacity={0.35}
        strokeWidth={W * 0.0006}
      />
      <circle cx={x} cy={yt - hoist * 0.14} r={W * 0.0016} fill="var(--w-brass)" />
      <g transform={`translate(${x} ${yt})`}>
        <g>
          {flutter ? (
            <animateTransform
              attributeName="transform"
              type="skewY"
              values="0;-3;0;2.2;0"
              keyTimes="0;0.3;0.5;0.8;1"
              dur="3.3s"
              repeatCount="indefinite"
            />
          ) : null}
          {/* the black cloth, its edge caught by the moon */}
          <path d={cloth} fill="#07090b" stroke="var(--w-moon)" strokeOpacity={0.45} strokeWidth={W * 0.0007} />
          {/* crossbones, behind and below the skull */}
          {bones.map(([x1, y1, x2, y2], k) => (
            <g key={k} stroke={ink} strokeLinecap="round">
              <path d={`M${x1} ${y1}L${x2} ${y2}`} strokeWidth={bone} />
              <circle cx={x1} cy={y1} r={bone * 0.55} fill={ink} stroke="none" />
              <circle cx={x1 + (k ? bone * 0.9 : -bone * 0.9) * 0.2} cy={y1 + bone * 0.75} r={bone * 0.5} fill={ink} stroke="none" />
              <circle cx={x2} cy={y2} r={bone * 0.55} fill={ink} stroke="none" />
              <circle cx={x2 + (k ? -bone * 0.9 : bone * 0.9) * 0.2} cy={y2 - bone * 0.75} r={bone * 0.5} fill={ink} stroke="none" />
            </g>
          ))}
          {/* the skull: cranium, jaw, two sockets, the nose */}
          <circle cx={cx} cy={cy} r={r} fill={ink} />
          <rect x={cx - r * 0.62} y={cy + r * 0.55} width={r * 1.24} height={r * 0.72} rx={r * 0.18} fill={ink} />
          <circle cx={cx - r * 0.4} cy={cy + r * 0.08} r={r * 0.27} fill="#07090b" />
          <circle cx={cx + r * 0.4} cy={cy + r * 0.08} r={r * 0.27} fill="#07090b" />
          <path
            d={`M${cx} ${cy + r * 0.38}l${-r * 0.13} ${r * 0.26}h${r * 0.26}Z`}
            fill="#07090b"
          />
          <path
            d={`M${cx - r * 0.3} ${cy + r * 0.95}V${cy + r * 1.22}M${cx} ${cy + r * 0.95}V${cy + r * 1.22}M${cx + r * 0.3} ${cy + r * 0.95}V${cy + r * 1.22}`}
            stroke="#07090b"
            strokeWidth={r * 0.08}
          />
        </g>
      </g>
    </svg>
  );
}
