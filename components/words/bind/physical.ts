/* ============================================================================
   WORDS ENGINE — physical words (PHASE3-SPEC §8.5; W2-WORDS). One-shot,
   600 ms, transform / opacity. Markup: components/words/physical-word.tsx.
     grain   DEFAULT a grain sprite over "noise" settles to 0 while its
                     letters jitter by ≤ 1 px (per-letter translate)
             ALT     the jitter only
     strike  DEFAULT an ember strike draws through "Killed" (scaleX 0 → 1 on
                     the 1.5 px `.w-strike` bar, a spark at its front) and
                     stays (the bar is static CSS on DESKTOP_FINE)
             ALT     a graphite strike (CSS colour + a slight tilt)
   ========================================================================== */

import type { Variant } from "@/lib/variants";
import { EASE_OUT, fxSpan, openFx, rng, setStyle, splitChars, variantOf, type Restore, type Run } from "./shared";
import { GRAIN, SPARK } from "./sprites";

export const PHYSICAL_MS = 600;
const STRIKE_DRAW = 450;
const STRIKE_EASE = "cubic-bezier(0.3, 0.7, 0.2, 1)";

const barOf = (el: HTMLElement): HTMLElement | null => el.querySelector<HTMLElement>(":scope > .w-strike");
const tilt = (v: Variant): string => (v === "alt" ? "rotate(-1.2deg) " : "");

/** Keeps the static strike's colour in step with a `?variant=` preview. */
export function syncPhysicalVariant(el: HTMLElement): void {
  const v = variantOf(el, "words.physical");
  if (el.dataset.wordsVariant !== v) el.dataset.wordsVariant = v;
}

/** The armed state: the strike not drawn yet (grain has none). */
export function armPhysical(el: HTMLElement): Restore | null {
  if (el.dataset.wordsKind !== "strike") return null;
  const bar = barOf(el);
  if (!bar) return null;
  return setStyle(bar, { transform: `${tilt(variantOf(el, "words.physical"))}scaleX(0)` });
}

function strike(el: HTMLElement, run: Run, v: Variant): number | null {
  const bar = barOf(el);
  if (!bar || getComputedStyle(bar).display === "none") return null;
  const base = tilt(v);
  run.animate(bar, [{ transform: `${base}scaleX(0)` }, { transform: `${base}scaleX(1)` }], { duration: STRIKE_DRAW, easing: STRIKE_EASE, fill: "both" });
  if (v !== "alt") {
    const fx = openFx(run, el.querySelector<HTMLElement>(":scope > [data-words-fx]"));
    if (fx) {
      const size = 7;
      const spark = fxSpan(fx, {
        left: `${bar.offsetLeft - size / 2}px`,
        top: `${bar.offsetTop + bar.offsetHeight / 2 - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: SPARK,
        willChange: "transform, opacity",
      });
      run.animate(spark, [{ transform: "translateX(0px)" }, { transform: `translateX(${bar.offsetWidth}px)` }], { duration: STRIKE_DRAW, easing: STRIKE_EASE, fill: "both" });
      run.animate(spark, [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: PHYSICAL_MS, fill: "both" });
    }
  }
  return PHYSICAL_MS;
}

function grain(el: HTMLElement, run: Run, v: Variant): number {
  const cs = getComputedStyle(el);
  run.style(el, { whiteSpace: "nowrap", position: cs.position === "static" ? "relative" : null });
  const split = splitChars(el, true);
  run.restore(split.restore);
  const seed = rng(1031);
  const j = () => `translate(${(seed() * 2 - 1).toFixed(2)}px, ${(seed() * 2 - 1).toFixed(2)}px)`;
  for (const c of split.chars) {
    run.animate(
      c,
      [
        { transform: j() },
        { transform: j(), offset: 0.16 },
        { transform: j(), offset: 0.32 },
        { transform: j(), offset: 0.5 },
        { transform: "translate(0px, 0px)", offset: 0.8 },
        { transform: "none" },
      ],
      { duration: PHYSICAL_MS, easing: "linear", fill: "both" },
    );
  }
  if (v !== "alt") {
    const fx = openFx(run, el.querySelector<HTMLElement>(":scope > [data-words-fx]"));
    if (fx) {
      const g = fxSpan(fx, {
        left: "-0.14em",
        right: "-0.14em",
        top: "-0.08em",
        bottom: "-0.08em",
        backgroundImage: GRAIN,
        backgroundSize: "40px 40px",
        willChange: "opacity",
      });
      run.animate(g, [{ opacity: 0.9 }, { opacity: 0 }], { duration: PHYSICAL_MS, easing: EASE_OUT, fill: "both" });
    }
  }
  return PHYSICAL_MS;
}

/** Plays the word's one-shot into `run` (ends itself). Returns its duration
 *  (ms), or null when there is nothing to play. */
export function playPhysical(el: HTMLElement, run: Run, variant?: Variant): number | null {
  const v = variant ?? variantOf(el, "words.physical");
  const kind = el.dataset.wordsKind;
  const ms = kind === "strike" ? strike(el, run, v) : kind === "grain" ? grain(el, run, v) : null;
  if (ms == null) {
    run.end();
    return null;
  }
  run.endWhenDone(ms + 800);
  return ms;
}
