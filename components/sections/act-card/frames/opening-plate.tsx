"use client";

import { motion, useTransform } from "motion/react";
import type { MediaId } from "@/lib/media";
import { MediaFrame } from "@/components/primitives/media-frame";
import { remap } from "@/components/primitives/loaders/line";
import { useCard } from "@/components/sections/act-card/card-context";
import { FRAME_ASPECT, PlateBox, anchor, coverBox, inBox, plateOf } from "@/components/sections/act-card/plate";

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
 *   No hard edge (M2 ART-DIRECTOR #7): the plate's TOP is feathered into
 *       the deep over min(14vh, 24%) (≥ 640; a static mask, so SSR, RM,
 *       Pause and no-JS frames have it too) — the masts rise out of the
 *       night instead of starting at a ruled line under the film title.
 *   No flag: the code Jolly Roger read as a flat sticker floating off the
 *       stern (and was clipped by the alt's crop); the plates carry the
 *       ship alone, which already passes blind at 0.8–0.9.
 *   The frame is aria-hidden (the card's h2 and caption carry it).
 */

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
      // the top feathers into the deep (≥ 640; static, every state)
      className="absolute inset-0 overflow-hidden sm:[mask-image:linear-gradient(to_bottom,transparent,#000_min(14vh,24%))]"
      style={live ? { clipPath: clip } : undefined}
    >
      <motion.div className="absolute inset-0" style={live ? { scale } : undefined}>
        <PlateBox plate={plate}>
          <MediaFrame media={plate.asset.id} layout="fill" playOn="never" sizes="100vw" />
        </PlateBox>
      </motion.div>
    </motion.div>
  );
}
