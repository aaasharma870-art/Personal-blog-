"use client";

import { useEffect, useRef } from "react";
import { onMotionOffChange, motionOffNow } from "@/lib/flags";
import { AztecMedallion } from "@/components/worlds/pirates/aztec-medallion";
import { COURSE, MEDALLION_AT, NOW_INDEX, STRIP, WAYPOINTS, pct } from "@/components/worlds/pirates/voyage-chart";

/* ============================================================================
   COIN MOON — the `pc-coin` egg's effect (PHASE3-SPEC §9.1 #5, "The cursed
   coin"; ICONS IC-PC-04). Lazy: journey-chart.tsx mounts it when the coin's
   hotspot fires `aztec-coin` (the egg runtime counts it and the sound
   engine rings coin-ting + hollow wind; nothing here).

   A moon-silver copy of the chart's BRASS layer (the course, the waypoint
   dots, the X, the medallion as its moonlit skull; never text) is shown
   through a soft band of moonlight that sweeps left → right across the
   strip in 1.2 s: under the band the gold reads as its skeleton, and it is
   gold again behind it. It adds no event to the voyage.
   The band is a MASK RIDING A TRANSFORM (plan §0.1 #7): the band box moves
   by translateX with a static gradient mask, and the art inside it
   counter-moves by the same amount, so it stays registered to the chart.
   Compositor-only; it leaves nothing behind (unmounts itself).

   `hold` (reduced motion / Pause at the press): an instant swap to the
   moonlit art, held until the next press (the host toggles it off) or Esc.
   Pause mid-sweep: stops at once and is gone.
   ========================================================================== */

const MS = 1200;
/** The band's width as a fraction of the strip. */
const BAND = 0.34;
const [XX, XY] = WAYPOINTS[NOW_INDEX] ?? [0, 0];

function MoonArt({ medallionClassName }: { medallionClassName: string }) {
  return (
    <div className="absolute inset-0">
      <svg viewBox={`0 0 ${STRIP.w} ${STRIP.h}`} aria-hidden="true" focusable="false" className="absolute inset-0 size-full overflow-visible" fill="none">
        <path d={COURSE} className="stroke-(--w-moon)" strokeWidth={1.75} strokeDasharray="7 6" vectorEffect="non-scaling-stroke" />
        {WAYPOINTS.map(([x, y], i) =>
          i === NOW_INDEX ? null : <circle key={i} cx={x} cy={y} r={4.5} className="fill-(--w-moon)" />,
        )}
        <path
          d={`M${XX - 10} ${XY - 10} L${XX + 10} ${XY + 10} M${XX + 10} ${XY - 10} L${XX - 10} ${XY + 10}`}
          className="stroke-(--w-moon)"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute" style={{ ...pct(MEDALLION_AT), transform: "translate(-50%, -50%)" }}>
        <AztecMedallion cursed className={medallionClassName} />
      </div>
    </div>
  );
}

export default function CoinMoon({
  hold,
  medallionClassName,
  onDone,
}: {
  hold: boolean;
  medallionClassName: string;
  onDone: () => void;
}) {
  const band = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  // the sweep (motion on)
  useEffect(() => {
    if (hold) return;
    const b = band.current;
    const a = art.current;
    if (!b || !a || motionOffNow()) {
      done.current();
      return;
    }
    const timing: KeyframeAnimationOptions = { duration: MS, easing: "cubic-bezier(.45,0,.55,1)", fill: "both" };
    // the band travels from just off the left edge to just off the right
    // (in band widths); the art counter-moves (in strip widths)
    const end = 1 / BAND;
    const anims = [
      b.animate([{ transform: "translateX(-100%)" }, { transform: `translateX(${(end * 100).toFixed(2)}%)` }], timing),
      a.animate([{ transform: `translateX(${(BAND * 100).toFixed(2)}%)` }, { transform: "translateX(-100%)" }], timing),
    ];
    let over = false;
    const finish = () => {
      if (over) return;
      over = true;
      anims.forEach((x) => x.cancel());
      done.current();
    };
    void anims[0]?.finished.then(finish, () => {});
    const off = onMotionOffChange(() => {
      if (motionOffNow()) finish();
    });
    return () => {
      off();
      anims.forEach((x) => x.cancel());
    };
  }, [hold]);

  // held (reduced motion): Esc puts the gold back
  useEffect(() => {
    if (!hold) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") done.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hold]);

  if (hold) {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" data-coin-moon="hold">
        <MoonArt medallionClassName={medallionClassName} />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" data-coin-moon="sweep">
      <div
        ref={band}
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{
          width: `${BAND * 100}%`,
          transform: "translateX(-100%)",
          willChange: "transform",
          maskImage: "linear-gradient(90deg, transparent, #000 38%, #000 62%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 38%, #000 62%, transparent)",
        }}
      >
        <div
          ref={art}
          className="absolute inset-y-0 left-0"
          style={{ width: `${(100 / BAND).toFixed(3)}%`, transform: `translateX(${(BAND * 100).toFixed(2)}%)`, willChange: "transform" }}
        >
          <MoonArt medallionClassName={medallionClassName} />
        </div>
      </div>
    </div>
  );
}
