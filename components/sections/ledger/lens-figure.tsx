/* ============================================================================
   LENS FIGURE — the Lens Index figure (lens-index.BAR v2 H30, SPEC SM-8):
   a CODE schematic of the row's parent program, a mono/colour pair. Every
   row's figure is a true route through a real system:
     flagship Trading_Algos-  the whole pipeline (pre-registration → LEAN
                              backtest → the gates → survivors | kill-list)
     flagship Optuna-Screener its pipeline (six stages, drawn as a loop)
     survivor                 the Trading_Algos- route ending in SURVIVORS
     killed idea              the Trading_Algos- route ending in KILL-LIST
   Mono (every stroke ghost) while the lens idles; colour (the blueprint
   panel, the row's route in full bp-line) on the active row. The route is
   never aqua, ember or amber: the lens group's one aqua mark is the
   bracket, the verdict word carries the hue (H8, H9). aria-hidden: the row's
   verdict word carries the meaning. Server-safe (no hooks); no text in SVG.
   ========================================================================== */

export type LensFigureKind = "ta" | "optuna";
export type LensRoute = "all" | "survivors" | "kill-list";

type Seg = { d: string; on: boolean };

function taSegments(route: LensRoute): { boxes: { x: number; y: number; w: number; h: number; on: boolean }[]; segs: Seg[] } {
  const chainOn = true;
  const upOn = route !== "kill-list";
  const downOn = route !== "survivors";
  return {
    boxes: [
      { x: 8, y: 48, w: 28, h: 24, on: chainOn },
      { x: 48, y: 48, w: 28, h: 24, on: chainOn },
      { x: 88, y: 48, w: 28, h: 24, on: chainOn },
      { x: 130, y: 14, w: 24, h: 22, on: upOn },
      { x: 130, y: 84, w: 24, h: 22, on: downOn },
    ],
    segs: [
      { d: "M36 60 L48 60 M76 60 L88 60 M116 60 L123 60", on: chainOn },
      { d: "M123 60 L123 25 L130 25", on: upOn },
      { d: "M123 60 L123 95 L130 95", on: downOn },
    ],
  };
}

function optunaSegments() {
  const r1 = 20;
  const r2 = 78;
  const xs = [8, 58, 108];
  return {
    boxes: [
      ...xs.map((x) => ({ x, y: r1, w: 40, h: 22, on: true })),
      ...[...xs].reverse().map((x) => ({ x, y: r2, w: 40, h: 22, on: true })),
    ],
    segs: [{ d: `M48 31 L58 31 M98 31 L108 31 M128 42 L128 78 M108 89 L98 89 M58 89 L48 89`, on: true }],
  };
}

function Drawing({ kind, route, colour }: { kind: LensFigureKind; route: LensRoute; colour: boolean }) {
  const { boxes, segs } = kind === "optuna" ? optunaSegments() : taSegments(route);
  const stroke = colour ? "stroke-(--w-bp-line)" : "stroke-fg-ghost";
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false" className="absolute inset-0 size-full">
      {colour ? <rect x="0" y="0" width="160" height="120" className="fill-(--bp-panel)" /> : null}
      {segs.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill="none"
          className={stroke}
          strokeOpacity={colour ? (s.on ? 1 : 0.35) : 0.7}
          strokeWidth={colour && s.on ? 1.8 : 1.2}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {boxes.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={2.5}
            fill="none"
            className={stroke}
            strokeOpacity={colour ? (b.on ? 1 : 0.35) : 0.7}
            strokeWidth={colour && b.on ? 1.6 : 1.1}
            vectorEffect="non-scaling-stroke"
          />
          {/* the jugaad bolts */}
          {colour && b.on
            ? [
                [b.x + 3, b.y + 3],
                [b.x + b.w - 3, b.y + 3],
                [b.x + 3, b.y + b.h - 3],
                [b.x + b.w - 3, b.y + b.h - 3],
              ].map(([cx, cy], k) => <circle key={k} cx={cx} cy={cy} r={0.9} className="fill-(--w-bp-line)" />)
            : null}
        </g>
      ))}
    </svg>
  );
}

/** Both layers stacked; `colour` crossfades them (dur.preview, CSS). */
export function LensFigure({ kind, route, colour }: { kind: LensFigureKind; route: LensRoute; colour: boolean }) {
  return (
    <div className="relative size-full" data-lens-figure={`${kind}:${route}`}>
      <div className={colour ? "absolute inset-0 opacity-0 transition-opacity duration-(--dur-preview)" : "absolute inset-0 opacity-100 transition-opacity duration-(--dur-preview)"}>
        <Drawing kind={kind} route={route} colour={false} />
      </div>
      <div className={colour ? "absolute inset-0 opacity-100 transition-opacity duration-(--dur-preview)" : "absolute inset-0 opacity-0 transition-opacity duration-(--dur-preview)"}>
        <Drawing kind={kind} route={route} colour />
      </div>
    </div>
  );
}
