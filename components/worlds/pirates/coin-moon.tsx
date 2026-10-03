import { motionOffNow, onMotionOffChange } from "@/lib/flags";
import { COURSE, NOW_INDEX, STRIP, WAYPOINTS } from "@/components/worlds/pirates/voyage-chart";

/* ============================================================================
   COIN MOON — the `pc-coin` egg's effect (PHASE3-SPEC §9.1 #5, "The cursed
   coin"; ICONS IC-PC-04). Lazy, and plain DOM (no React root: a lazy
   `react-dom/client` import splits the framework chunk, W3 budget): the
   hotspots binder (components/enhance/binders/hotspots.ts) calls it when the
   coin's hotspot fires `aztec-coin` (the egg runtime counts it and the sound
   engine rings coin-ting + hollow wind; nothing here).

   A moon-silver copy of the chart's BRASS layer (the course, the waypoint
   dots, the X, the medallion as its moonlit skull; never text) is shown
   through a soft band of moonlight that sweeps left → right across the
   strip in 1.2 s: under the band the gold reads as its skeleton, and it is
   gold again behind it. It adds no event to the voyage. The layer goes
   right after the chart's `[data-chart-medallion]` (over the medallion,
   under the compass and the labels) and is removed when it ends.
   The band is a MASK RIDING A TRANSFORM (plan §0.1 #7): the band box moves
   by translateX with a static gradient mask, and the art inside it
   counter-moves by the same amount, so it stays registered to the chart.
   Compositor-only; it leaves nothing behind.

   `hold` (reduced motion / Pause at the press): an instant swap to the
   moonlit art, held until the next press (the binder stops it) or Esc.
   Pause mid-sweep: stops at once and is gone.
   ========================================================================== */

const MS = 1200;
/** The band's width as a fraction of the strip. */
const BAND = 0.34;
const MASK = "linear-gradient(90deg, transparent, #000 38%, #000 62%, transparent)";
let uid = 0;

/** The moonlit art: the brass layer in moon silver, and a copy of the
 *  chart's own medallion with the moonlight fully across it (the skull). */
function moonArt(medal: Element): HTMLElement {
  const art = document.createElement("div");
  art.className = "absolute inset-0";
  const [x, y] = WAYPOINTS[NOW_INDEX] ?? [0, 0];
  const dots = WAYPOINTS.map(([cx, cy], i) => (i === NOW_INDEX ? "" : `<circle cx="${cx}" cy="${cy}" r="4.5" class="fill-(--w-moon)"/>`)).join("");
  art.innerHTML =
    `<svg viewBox="0 0 ${STRIP.w} ${STRIP.h}" aria-hidden="true" focusable="false" class="absolute inset-0 size-full overflow-visible" fill="none">` +
    `<path d="${COURSE}" class="stroke-(--w-moon)" stroke-width="1.75" stroke-dasharray="7 6" vector-effect="non-scaling-stroke"/>${dots}` +
    `<path d="M${x - 10} ${y - 10} L${x + 10} ${y + 10} M${x + 10} ${y - 10} L${x - 10} ${y + 10}" class="stroke-(--w-moon)" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>`;
  const coin = medal.cloneNode(true) as HTMLElement;
  coin.removeAttribute("data-chart-medallion");
  // the moonlight's clip fully across (AztecMedallion `cursed`), its own id
  const clip = coin.querySelector("clipPath");
  if (clip) {
    const id = `${clip.id}-moon${++uid}`;
    clip.id = id;
    clip.querySelector("rect")?.setAttribute("x", "-30");
    coin.querySelector("[clip-path]")?.setAttribute("clip-path", `url(#${id})`);
  }
  coin.querySelector("svg")?.setAttribute("data-cursed", "");
  coin.querySelector("line")?.remove(); // the leading-edge hairline
  art.append(coin);
  return art;
}

/** Shows the moon over the chart whose medallion box is `medal`; `onEnd`
 *  runs when it ends by itself (the sweep, Pause, Esc). Returns its stop. */
export default function coinMoon(medal: Element, hold: boolean, onEnd: () => void): () => void {
  if (!hold && motionOffNow()) {
    onEnd();
    return () => {};
  }
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.className = `pointer-events-none absolute inset-0${hold ? "" : " overflow-hidden"}`;
  layer.dataset.coinMoon = hold ? "hold" : "sweep";
  const art = moonArt(medal);
  const offs: (() => void)[] = [];
  const anims: Animation[] = [];
  let over = false;
  const stop = () => {
    if (over) return;
    over = true;
    offs.forEach((f) => f());
    anims.forEach((a) => a.cancel());
    layer.remove();
  };
  const end = () => {
    if (over) return;
    stop();
    onEnd();
  };

  if (hold) {
    layer.append(art);
    medal.after(layer);
    // held (reduced motion): Esc puts the gold back
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") end();
    };
    window.addEventListener("keydown", onKey);
    offs.push(() => window.removeEventListener("keydown", onKey));
    return stop;
  }

  // the band travels from just off the left edge to just off the right (in
  // band widths); the art counter-moves (in strip widths)
  const band = document.createElement("div");
  band.className = "absolute inset-y-0 left-0 overflow-hidden";
  band.style.cssText = `width:${BAND * 100}%;transform:translateX(-100%);will-change:transform;mask-image:${MASK};-webkit-mask-image:${MASK}`;
  const slide = document.createElement("div");
  slide.className = "absolute inset-y-0 left-0";
  slide.style.cssText = `width:${(100 / BAND).toFixed(3)}%;transform:translateX(${(BAND * 100).toFixed(2)}%);will-change:transform`;
  slide.append(art);
  band.append(slide);
  layer.append(band);
  medal.after(layer);
  const timing: KeyframeAnimationOptions = { duration: MS, easing: "cubic-bezier(.45,0,.55,1)", fill: "both" };
  anims.push(
    band.animate([{ transform: "translateX(-100%)" }, { transform: `translateX(${((1 / BAND) * 100).toFixed(2)}%)` }], timing),
    slide.animate([{ transform: `translateX(${(BAND * 100).toFixed(2)}%)` }, { transform: "translateX(-100%)" }], timing),
  );
  void anims[0]?.finished.then(end, () => {});
  offs.push(
    onMotionOffChange(() => {
      if (motionOffNow()) end();
    }),
  );
  return stop;
}
