"use client";

import Image from "next/image";
import { useMotionValue } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { GlGate } from "@/components/gl/gl-gate";
import { MotionToggle } from "@/components/primitives/motion-toggle";
import { emit } from "@/lib/events";
import { film } from "@/lib/film";
import { coverFor } from "@/lib/gl/cover";
import { useGlTier, type GlTier } from "@/lib/gl/support";
import type { GlCardSpec, GlFlavour, GlShape } from "@/lib/gl/types";
import { getMedia, type MediaId } from "@/lib/media";
import type { SkyKey } from "@/lib/sky";
import type { Variant } from "@/lib/variants";
import { planeAttrs, type WorldId } from "@/lib/worlds";

/* The lab's cards: the spec §7.1 pairs on the registered plates (the CARDS
   builder owns the real specs; these only exercise every flavour). */
type Cfg = {
  id: string;
  label: string;
  card: GlCardSpec["card"];
  variant: Variant;
  flavour: GlFlavour;
  from: MediaId;
  to: MediaId;
  posFrom: readonly [number, number];
  posTo: readonly [number, number];
  zoomTo?: number;
  act: number;
  range?: readonly [number, number];
  shapes?: { from: GlShape; to: GlShape; at: number };
  grade?: { from: SkyKey; to: SkyKey };
  flash?: number;
};

const CFGS: readonly Cfg[] = [
  { id: "opening", label: "Opening · iris", card: "opening", variant: "default", flavour: "iris", from: "MV-01", to: "iconic-pearl", posFrom: [0.7, 0.5], posTo: [0.66, 0.45], act: 0, flash: 0.16 },
  { id: "opening-alt", label: "Opening · iris (alt plates)", card: "opening", variant: "alt", flavour: "iris", from: "MV-01-alt", to: "iconic-pearl-alt", posFrom: [0.7, 0.5], posTo: [0.63, 0.45], act: 0, flash: 0.16 },
  { id: "seam", label: "Seam · wave → chalk", card: "seam", variant: "default", flavour: "chalk", from: "MV-04", to: "iconic-ice", posFrom: [0.7, 0.286], posTo: [0.62, 0.109], act: 1, shapes: { from: "ring32", to: "gear12", at: 0.22 }, grade: { from: "squall", to: "day" } },
  { id: "seam-alt", label: "Seam · wave → duster (ALT)", card: "seam", variant: "alt", flavour: "duster", from: "MV-04-alt", to: "iconic-ice-alt", posFrom: [0.7, 0.29], posTo: [0.65, 0.294], act: 1, shapes: { from: "ring32", to: "gear12", at: 0.22 }, grade: { from: "squall", to: "day" } },
  { id: "tintype", label: "Tintype · develop", card: "tintype", variant: "default", flavour: "develop", from: "MV-06", to: "MV-10", posFrom: [0.5, 0.5], posTo: [0.78, 0], zoomTo: 1.02, act: 2, range: [0.03, 0.45], grade: { from: "cinema", to: "golden" }, flash: 0.18 },
  { id: "tintype-alt", label: "Tintype · Dead Eye (ALT)", card: "tintype", variant: "alt", flavour: "deadeye", from: "MV-06", to: "iconic-deadeye", posFrom: [0.5, 0.5], posTo: [0.5, 0.5], act: 2, range: [0.03, 0.45], flash: 0.18 },
  { id: "ignite", label: "Ignite · burn → ink", card: "ignite", variant: "default", flavour: "ink", from: "iconic-camp", to: "iconic-hall", posFrom: [0.55, 0.111], posTo: [0.5, 1], zoomTo: 1.089, act: 3, shapes: { from: "wheel12", to: "snitch", at: 0.22 }, grade: { from: "dusk", to: "candle" }, flash: 0.35 },
  { id: "ignite-alt", label: "Ignite · burn → Lumos (ALT)", card: "ignite", variant: "alt", flavour: "lumos", from: "iconic-camp-alt", to: "iconic-hall-alt", posFrom: [0.6, 0.111], posTo: [0.48, 1], zoomTo: 1.089, act: 3, shapes: { from: "wheel12", to: "snitch", at: 0.22 }, grade: { from: "dusk", to: "candle" }, flash: 0.35 },
];

const FRAME = 2.39;
const MARKS = [0, 0.05, 0.22, 0.45, 0.5, 0.68, 0.85, 1] as const;

type GlDebug = { contexts: number; draws: number; owner: string | null; engaged: string[]; bytes: number; lose(): void; restore(): void; log: { t: number; ev: string; card?: string; p?: number }[] };
const dbg = (): GlDebug | undefined => (window as Window & { __gl?: GlDebug }).__gl;

export function GlLab() {
  const [id, setId] = useState(CFGS[2].id);
  const [pv, setPv] = useState(0);
  const [shown, setShown] = useState<GlTier | null>(null);
  const [stats, setStats] = useState("");
  const p = useMotionValue(0);
  const kraken = useMotionValue(0);
  const tier = useGlTier();
  const cfg = CFGS.find((c) => c.id === id) ?? CFGS[0];
  const act = film.acts[cfg.act];
  const world = act.world as WorldId;

  const spec = useMemo<GlCardSpec>(() => {
    const a = (m: MediaId) => {
      const x = getMedia(m);
      return x.width / x.height;
    };
    return {
      card: cfg.card,
      variant: cfg.variant,
      // the ALT configs preview the whole ALT card (title.mask ALT = no GL
      // title, match.shape ALT = the roll), as act.variant "alt" would
      choice: cfg.variant,
      a: { flavour: cfg.flavour, from: cfg.from, to: cfg.to, range: cfg.range ?? [0, 0.45] },
      b: { flavour: "title", text: act.title.text, world, maskOrigin: act.maskOrigin ?? [0.5, 0.5], range: [0.5, 1] },
      row: 0.47,
      cover: { from: coverFor(FRAME, a(cfg.from), cfg.posFrom), to: coverFor(FRAME, a(cfg.to), cfg.posTo, cfg.zoomTo ?? 1) },
      shapes: cfg.shapes,
      grade: cfg.grade,
      flash: cfg.flash ? { at: cfg.range?.[0] ?? 0.45, amount: cfg.flash } : undefined,
      kraken: cfg.card === "seam" ? kraken : undefined,
    };
  }, [cfg, act, world, kraken]);

  const setP = (v: number) => {
    setPv(v);
    p.set(v);
  };

  // the gl probe's handle (tools/capture/probes/gl.mjs): pick a card, set p
  useEffect(() => {
    const w = window as Window & { __glLab?: unknown };
    w.__glLab = {
      cards: CFGS.map((c) => c.id),
      card: (c: string) => {
        setId(c);
        setPv(0);
        p.set(0);
      },
      p: (v: number) => {
        setPv(v);
        p.set(v);
      },
      kraken: (v: number) => kraken.set(v),
    };
    return () => {
      delete w.__glLab;
    };
  }, [p, kraken]);
  const refresh = () => {
    const d = dbg();
    setStats(
      d
        ? `contexts ${d.contexts} · draws ${d.draws} · owner ${d.owner ?? "–"} · engaged ${d.engaged.join(",") || "–"} · ${(d.bytes / 2 ** 20).toFixed(1)} MB · last: ${d.log
            .slice(-4)
            .map((e) => `${e.ev}${e.p != null ? `@${e.p}` : ""}`)
            .join(" ")}`
        : "GL chunk not loaded (tier ≠ gl, or before ladder step 4)",
    );
  };

  return (
    <div className="flex flex-col gap-tier-group">
      {/* the CARDS rule (cards.css), here for the lab's stand-in layer */}
      <style>{`[data-gl="on"] [data-gl-replaced]{visibility:hidden}`}</style>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Card">
        {CFGS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={c.id === id}
            onClick={() => {
              setId(c.id);
              setP(0);
            }}
            className="type-meta rounded-sm border border-rule px-3 py-1.5 text-fg-muted aria-pressed:border-fg aria-pressed:text-fg"
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        data-act-card-frame=""
        {...planeAttrs("deep", world)}
        className="relative aspect-[2.39/1] w-full overflow-hidden bg-bg"
      >
        <Image
          src={getMedia(cfg.to).src}
          alt=""
          fill
          sizes="(min-width: 84rem) 80rem, 92vw"
          className="object-cover"
          data-gl-replaced=""
        />
        <GlGate key={cfg.id} spec={spec} p={p} live onTier={setShown} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="type-small flex items-center gap-3 text-fg-muted">
          <span className="w-16 tabular-nums">p {pv.toFixed(3)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={pv}
            onChange={(e) => setP(Number(e.target.value))}
            className="flex-1"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {MARKS.map((m) => (
            <button key={m} type="button" onClick={() => setP(m)} className="type-meta rounded-sm border border-rule px-2 py-1 text-fg-muted">
              p {m}
            </button>
          ))}
          {cfg.card === "seam" ? (
            <button type="button" onClick={() => kraken.set(kraken.get() > 0 ? 0 : 1)} className="type-meta rounded-sm border border-rule px-2 py-1 text-fg-muted">
              kraken
            </button>
          ) : null}
          <button type="button" onClick={() => emit("impact", { world })} className="type-meta rounded-sm border border-rule px-2 py-1 text-fg-muted">
            impact
          </button>
          <button type="button" onClick={() => dbg()?.lose()} className="type-meta rounded-sm border border-rule px-2 py-1 text-fg-muted">
            lose context
          </button>
          <button type="button" onClick={() => dbg()?.restore()} className="type-meta rounded-sm border border-rule px-2 py-1 text-fg-muted">
            restore
          </button>
          <button type="button" onClick={refresh} className="type-meta rounded-sm border border-rule px-2 py-1 text-fg-muted">
            stats
          </button>
          <MotionToggle showLabel />
        </div>
        <p className="type-small text-fg-muted" data-gl-lab-status="">
          page tier {tier ?? "–"} · this card shows {shown ?? "–"}
          {stats ? ` · ${stats}` : ""}
        </p>
      </div>
    </div>
  );
}
