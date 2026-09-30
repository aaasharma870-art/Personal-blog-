/* ============================================================================
   SKY — the day-to-night arc as pure keyframes (PHASE3-SPEC §7.5). PURE: no
   imports, so Node and the validator can import it.

   Moonlit night (hero, Act I) → a pre-dawn squall (journey end) → dawn breaks
   in the seam → day (Act II) → the cinema, lights down (films) → golden hour
   → dusk (Act III) → candlelit night (Act IV, contact, credits).

   Where it lives: the GL IN half ramps its grade between two keys (the only
   animated grade); stage slots take a STATIC grade under an opaque card.
   There is no page-wide animated tint.
   `k` = white balance in kelvin; `ev` = exposure offset; `gain` = the RGB
   multiplier that moves D65 (6500 K) white to `k` (`kelvinGain`).
   ========================================================================== */

export type SkyKey = "moonlit" | "squall" | "dawn" | "day" | "cinema" | "golden" | "dusk" | "candle";

export type SkyGrade = { k: number; ev: number; gain: readonly [number, number, number] };

/** Approximate sRGB of a black body at `k` kelvin, 0–1 per channel
 *  (Tanner Helland's fit; good to ±1% over 1000–40000 K). */
function kelvinRgb(k: number): [number, number, number] {
  const t = k / 100;
  const clamp = (x: number) => Math.min(255, Math.max(0, x)) / 255;
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [clamp(r), clamp(g), clamp(b)];
}

const D65 = kelvinRgb(6500);

/** RGB gain that re-lights D65 white at `k` kelvin, normalised so the
 *  largest channel is 1 (a grade never brightens; `ev` does that). */
export function kelvinGain(k: number): readonly [number, number, number] {
  const c = kelvinRgb(k);
  const g = [c[0] / D65[0], c[1] / D65[1], c[2] / D65[2]];
  const max = Math.max(...g);
  const round = (x: number) => Math.round((x / max) * 1000) / 1000;
  return [round(g[0]), round(g[1]), round(g[2])] as const;
}

const grade = (k: number, ev: number): SkyGrade => ({ k, ev, gain: kelvinGain(k) });

/** The keys (spec §7.5). `dawn` is the ramp's start (4200 K, −1.0; the seam
 *  ramps it to `day`). `cinema` ("house deep"), `dusk` and `candle` have no
 *  EV in the spec: the values below are W1.0 placeholders (B1-STAGE / W2-GL
 *  tune them on the plates). */
export const SKY: Readonly<Record<SkyKey, SkyGrade>> = {
  moonlit: grade(9500, -1.3),
  squall: grade(8000, -1.6),
  dawn: grade(4200, -1.0),
  day: grade(5500, 0),
  cinema: grade(6500, -0.5),
  golden: grade(3200, -0.2),
  dusk: grade(2800, -0.6),
  candle: grade(2400, -0.8),
};

/** Section id or act-card id → its sky (spec §7.5). Unknown ids → "day". */
const SKY_OF: Readonly<Record<string, SkyKey>> = {
  top: "moonlit",
  "act-1": "moonlit",
  about: "moonlit",
  journey: "moonlit",
  "act-2": "dawn",
  work: "day",
  "trading-algos": "day",
  "optuna-screener": "day",
  experiment: "day",
  systems: "day",
  "kill-list": "day",
  films: "cinema",
  "act-3": "golden",
  beyond: "golden",
  writing: "dusk",
  voices: "dusk",
  "act-4": "candle",
  principles: "candle",
  contact: "candle",
  credits: "candle",
};

export function skyOf(sectionOrAct: string): SkyKey {
  return SKY_OF[sectionOrAct] ?? "day";
}
