/* ============================================================================
   WORDS ENGINE — fly-throughs (PHASE3-SPEC §3.8, §2.5; W2-WORDS). Markup:
   components/words/fly-through.tsx (a clipped, aria-hidden zone layer with
   a hidden sprite). The sprite is shown for one flight along the host's
   path (a Catmull-Rom curve through `points`, constant speed), then hidden
   again. The wrapper moves by transform; frames step by opacity.
     DEFAULT glide-gallop   the gull (3 wing frames, two short flap bursts in
                            a glide) / the graphite horse (the gallop frames
                            at 14 fps)
     ALT     shadow-pass    only a flattened dark shadow of the sprite crosses
   ========================================================================== */

import type { Variant } from "@/lib/variants";
import { variantOf, type Run } from "./shared";

const HORSE_FPS = 14;
const GULL_FLAP_MS = 70;
/** Flap bursts as fractions of the flight (the rest is a glide). */
const GULL_FLAPS: readonly (readonly [number, number])[] = [
  [0.06, 0.2],
  [0.56, 0.66],
];

type Pt = readonly [number, number];

function catmull(p: readonly Pt[], per: number): Pt[] {
  if (p.length < 3) {
    const out: Pt[] = [];
    for (let k = 0; k <= per; k++) {
      const t = k / per;
      out.push([p[0][0] + (p[1][0] - p[0][0]) * t, p[0][1] + (p[1][1] - p[0][1]) * t]);
    }
    return out;
  }
  const out: Pt[] = [];
  for (let s = 0; s < p.length - 1; s++) {
    const p0 = p[Math.max(0, s - 1)];
    const p1 = p[s];
    const p2 = p[s + 1];
    const p3 = p[Math.min(p.length - 1, s + 2)];
    for (let k = s === 0 ? 0 : 1; k <= per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return out;
}

/** Discrete opacity keyframes: `on` over the given [from, to) windows. */
function stepFrames(windows: readonly (readonly [number, number])[]): Keyframe[] {
  const kf: Keyframe[] = [];
  let last = 0;
  const startOn = windows.some(([a]) => a <= 0);
  kf.push({ offset: 0, opacity: startOn ? 1 : 0 });
  last = startOn ? 1 : 0;
  for (const [a, b] of windows) {
    if (a > 0) {
      kf.push({ offset: a, opacity: last }, { offset: a, opacity: 1 });
      last = 1;
    }
    if (b < 1) {
      kf.push({ offset: b, opacity: 1 }, { offset: b, opacity: 0 });
      last = 0;
    }
  }
  kf.push({ offset: 1, opacity: last });
  return kf;
}

/** The gull's frame per moment: [frame, from, to) in flight fractions. */
function gullSchedule(ms: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  let t = 0;
  const step = GULL_FLAP_MS / ms;
  for (const [a, b] of GULL_FLAPS) {
    if (a > t) out.push([0, t, a]);
    let x = a;
    let k = 0;
    while (x < b) {
      const frame = [1, 0, 2, 0][k % 4];
      const y = Math.min(b, x + step);
      out.push([frame, x, y]);
      x = y;
      k++;
    }
    t = b;
  }
  if (t < 1) out.push([0, t, 1]);
  return out;
}

/** Flies the sprite once into `run` (ends itself). Returns its duration
 *  (ms), or null when the zone cannot fly (no size, no path, no sprite). */
export function playFly(el: HTMLElement, run: Run, variant?: Variant): number | null {
  const svg = el.querySelector<SVGSVGElement>(":scope > svg[data-words-sprite]");
  const ms = Number(el.dataset.wordsMs) || 0;
  let pts: Pt[] = [];
  try {
    pts = (JSON.parse(el.dataset.wordsPath ?? "[]") as Pt[]).filter((p) => Array.isArray(p) && p.length === 2);
  } catch {
    pts = [];
  }
  const W = el.clientWidth;
  const H = el.clientHeight;
  if (!svg || pts.length < 2 || ms <= 0 || W < 8 || H < 8) {
    run.end();
    return null;
  }
  const horse = el.dataset.wordsKind === "horse";
  const v = variant ?? variantOf(el, "words.flythrough");
  const vb = svg.viewBox.baseVal;
  const aspect = vb && vb.width > 0 && vb.height > 0 ? vb.width / vb.height : 2.5;
  const w = horse ? Math.min(64, Math.max(40, H * 0.1)) * aspect : Math.min(48, Math.max(26, W * 0.05));
  const h = w / aspect;
  const anchorY = horse ? h : h / 2;
  const path = catmull(
    pts.map(([x, y]) => [x * W, y * H] as const),
    12,
  );
  const flip = horse && path[path.length - 1][0] < path[0][0] ? " scaleX(-1)" : "";
  const shadow = v === "alt";
  const tail = shadow ? (horse ? " translateY(2px) skewX(-35deg) scaleY(0.3)" : ` translateY(${(0.12 * H).toFixed(1)}px) skewX(-28deg) scaleY(0.38)`) : "";

  // constant speed: offsets by distance along the curve
  const dist = [0];
  for (let k = 1; k < path.length; k++) dist.push(dist[k - 1] + Math.hypot(path[k][0] - path[k - 1][0], path[k][1] - path[k - 1][1]));
  const total = dist[dist.length - 1] || 1;

  svg.removeAttribute("hidden");
  run.restore(() => svg.setAttribute("hidden", ""));
  run.style(svg, {
    position: "absolute",
    left: "0px",
    top: "0px",
    width: `${w.toFixed(1)}px`,
    height: `${h.toFixed(1)}px`,
    overflow: "visible",
    color: shadow ? "#000" : horse ? "var(--world-line)" : "var(--world-deep)",
    transformOrigin: horse ? "50% 100%" : "50% 50%",
    willChange: "transform, opacity",
  });
  run.animate(
    svg,
    path.map((p, k) => ({
      offset: dist[k] / total,
      transform: `translate(${(p[0] - w / 2).toFixed(1)}px, ${(p[1] - anchorY).toFixed(1)}px)${flip}${tail}`,
    })),
    { duration: ms, easing: "linear", fill: "both" },
  );
  const peak = shadow ? 0.22 : horse ? 0.9 : 0.78;
  run.animate(svg, [{ opacity: 0 }, { opacity: peak, offset: 0.08 }, { opacity: peak, offset: 0.92 }, { opacity: 0 }], { duration: ms, fill: "both" });

  const frames = Array.from(svg.querySelectorAll<SVGPathElement>(":scope > path[data-f]"));
  if (horse && frames.length > 1) {
    const cycle = (frames.length / HORSE_FPS) * 1000;
    const iterations = Math.max(1, Math.ceil(ms / cycle));
    frames.forEach((f, i) =>
      run.animate(f, stepFrames([[i / frames.length, (i + 1) / frames.length]]), { duration: cycle, iterations, easing: "linear" }),
    );
  } else if (!horse && frames.length >= 3) {
    const plan = gullSchedule(ms);
    frames.slice(0, 3).forEach((f, i) =>
      run.animate(f, stepFrames(plan.filter(([fr]) => fr === i).map(([, a, b]) => [a, b] as const)), { duration: ms, easing: "linear" }),
    );
  }
  run.endWhenDone(ms + 600);
  return ms;
}
