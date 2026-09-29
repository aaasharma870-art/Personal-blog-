/**
 * The Black Pearl in silhouette (IC-PC-01; RECOGNIZABILITY S20): a
 * three-masted square-rigger under BLACK, TATTERED sails — the loaders'
 * pirates ship (LD-PC's progress head and the bottled ship of its ALT).
 * Our own drawing from square-rigger conventions: no film still, no flag
 * device (the pennant is plain), no lettering. Pure SVG, server-safe.
 *
 * Local frame: facing +x, the waterline centre at the origin, masts up
 * (−y); ~36 × 26 user units. Colours are tokens only (loaders L17): the
 * sails and hull are the pirates deep (black) outlined in moonlight, the
 * spars brass. Stroke widths are passed in user units (`sw`).
 */

/** A deterministic 0–1 hash (integer maths: identical on server and client). */
function h01(i: number, salt: number): number {
  let h = Math.imul(i + 31 + salt * 97, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca77);
  return (((h ^ (h >>> 13)) >>> 0) % 1000) / 1000;
}

/** A square sail between yards ya (top) and yb (foot), `w` wide, its foot
 *  torn into rags and its leech rent (the Pearl's tattered canvas). `seed`
 *  varies the tears so no two sails match. */
export function tatteredSail(w: number, ya: number, yb: number, seed = 0): string {
  const h = w / 2;
  const d = yb - ya;
  const my = (ya + yb) / 2;
  const n = 4;
  const foot: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const x0 = -h + (w * i) / n;
    const x1 = -h + (w * (i + 1)) / n;
    const t = 0.16 + 0.44 * h01(i, seed);
    foot.push(`L${(x1 - (x1 - x0) * 0.35).toFixed(2)} ${(yb - d * t).toFixed(2)}`);
    foot.push(`L${(x0 + (x1 - x0) * 0.12).toFixed(2)} ${(yb + (i % 2 ? 0.25 : -0.15)).toFixed(2)}`);
  }
  const ny = ya + d * (0.3 + 0.12 * (seed % 3));
  return (
    `M${-h} ${ya}H${h}` +
    `L${(h + 0.4).toFixed(2)} ${ny.toFixed(2)}L${(h - w * 0.22).toFixed(2)} ${(ny + d * 0.09).toFixed(2)}L${(h + 0.5).toFixed(2)} ${(ny + d * 0.2).toFixed(2)}` +
    `Q${(h + d * 0.16).toFixed(2)} ${(my + d * 0.2).toFixed(2)} ${h} ${yb}` +
    foot.join("") +
    `L${-h} ${yb}Q${(-h + d * 0.16).toFixed(2)} ${my.toFixed(2)} ${-h} ${ya}Z`
  );
}

type Mast = { x: number; h: number; w: number };
/** fore · main · mizzen (the mainmast tallest), from the deck at y = −3.6. */
const MASTS: readonly Mast[] = [
  { x: 7.5, h: 16, w: 9.5 },
  { x: 0, h: 20, w: 11 },
  { x: -7.5, h: 15, w: 8.5 },
];
const DECK = -3.6;
const HULL = "M-15 -7.4L-10.5 -7.4L-10.5 -3.6L10 -3.6L15.5 -6.8L13.4 -0.6C9.2 2.9 -8.4 3.1 -13 0.6Z";
const RAIL = "M-10.5 -3.6H10";
const BOWSPRIT = "M14.6 -6.3L22 -10.2";
/** The jib: a torn triangle from the foremast head to the bowsprit. */
const JIB = "M8.6 -17.4L20.6 -9.6L16.4 -8.9L17.2 -7.4L12.2 -7.2L9.2 -6.2Z";

export function BlackPearl({
  sw,
  transform,
  className,
  sails = 1,
}: {
  /** px → user units (stroke widths are given in px). */
  sw: (px: number) => number;
  transform?: string;
  className?: string;
  /** 0–1: how much canvas is set (1 = every sail drawn). */
  sails?: number;
}) {
  return (
    <g transform={transform} className={className} data-ship="black-pearl" strokeLinejoin="round" strokeLinecap="round">
      {/* masts and yards (brass spars) */}
      {MASTS.map((m, i) => {
        const top = DECK - m.h;
        const ya = top + 2.2;
        const yc = DECK - m.h * 0.52;
        return (
          <g key={i} transform={`translate(${m.x} 0)`}>
            <path
              d={`M0 ${DECK}V${top}M${-m.w / 2 - 1} ${ya}H${m.w / 2 + 1}M${-m.w / 2 - 1.6} ${yc}H${m.w / 2 + 1.6}`}
              fill="none"
              stroke="var(--w-brass)"
              strokeWidth={sw(1)}
            />
            {sails > 0 ? (
              <path
                d={`${tatteredSail(m.w, ya + 0.3, yc - 0.8, i)}${tatteredSail(m.w + 2.4, yc + 0.3, DECK - 1.8, i + 3)}`}
                fill="var(--pir-deep)"
                fillOpacity={0.94}
                stroke="var(--w-moon)"
                strokeWidth={sw(0.9)}
                opacity={sails}
              />
            ) : null}
            {/* a plain black pennant at the truck (no device) */}
            <path d={`M0 ${top}L${i === 1 ? 5.5 : 4} ${top + 1.2}L0 ${top + 2.4}Z`} fill="var(--pir-deep)" stroke="var(--w-moon)" strokeWidth={sw(0.6)} />
          </g>
        );
      })}
      {sails > 0 ? (
        <path d={JIB} fill="var(--pir-deep)" fillOpacity={0.94} stroke="var(--w-moon)" strokeWidth={sw(0.8)} opacity={sails} />
      ) : null}
      <path d={BOWSPRIT} fill="none" stroke="var(--w-brass)" strokeWidth={sw(1)} />
      {/* the black hull, its rail and stern castle in moonlight */}
      <path d={HULL} fill="var(--pir-deep)" stroke="var(--w-moon)" strokeWidth={sw(1)} />
      <path d={RAIL} fill="none" stroke="var(--w-brass)" strokeWidth={sw(0.6)} opacity={0.7} />
      {/* the stern lantern (a tiny brass square; the light itself is media) */}
      <path d="M-14.2 -9.2h1.6v1.6h-1.6z" fill="none" stroke="var(--w-brass)" strokeWidth={sw(0.6)} />
    </g>
  );
}
