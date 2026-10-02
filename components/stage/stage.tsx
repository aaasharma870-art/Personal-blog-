"use client";

import Image, { getImageProps } from "next/image";
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useScroll, type MotionValue } from "motion/react";
import { emit } from "@/lib/events";
import { film, type ActSpec } from "@/lib/film";
import { useDesktopFine, useDocumentVisible, useReducedMotion } from "@/lib/flags";
import { loopFor } from "@/lib/loops";
import { markOf, resolveMedia, type MediaAsset, type MediaId } from "@/lib/media";
import { requestScrollRefresh } from "@/lib/smooth-scroll";
import { pageItems } from "@/lib/sections";
import { SKY, skyOf, type SkyKey } from "@/lib/sky";
import { spotlight } from "@/lib/spotlight";
import {
  STAGE_IMAGE,
  poseTransform,
  rackSoft,
  shotArrival,
  shotLocal,
  stageAt,
  stageCamera,
  stageCues,
  stageShots,
  type CameraPose,
  type StageShot,
} from "@/lib/stage";
import { useScrollScene } from "@/lib/use-scroll-scene";
import { useVariant } from "@/lib/use-variant";
import { cn } from "@/lib/utils";
import type { Variant } from "@/lib/variants";
import type { CameraSpec } from "@/components/primitives/camera";
import type { DepthSpec } from "@/components/primitives/depth-plate";
import type { LivePlateProps } from "@/components/primitives/live-plate";
import { MediaFrame } from "@/components/primitives/media-frame";
import type { WeatherKind, WeatherLayerProps } from "./weather-layer";
import { StageVideo } from "./stage-video";

/* ============================================================================
   THE PERSISTENT STAGE (spec §3.2, P3-2) — OWNER: B1-STAGE (W1), W2-PLATES (W2).
   Loaded by <StageGate/> (next/dynamic, ssr: false) at ladder step 3 on
   DESKTOP_FINE with motion on: phones, reduced motion and a paused view
   never fetch this chunk.

   THIS CHUNK IS ALSO THE DESKTOP PLATES ENGINE (W2-PLATES, spec §6, §7.7;
   plan §6.3, DP-13): the lazy halves of the first-load facades live here,
   so on a desktop view they cost nothing the stage does not already load,
   and phones never fetch them:
     LiveImpl     <LivePlate>'s paths: the loop over the plate, or the code
                  camera + depth (components/primitives/live-plate.tsx)
     CameraDrive  <CameraGroup>'s driver (components/primitives/camera.tsx)
     DepthNear    <DepthPlate>'s near band + driver (depth-plate.tsx)
     WeatherImpl  <WeatherLayer>'s sprites (weather-layer.tsx)
     seqWindow    useFrameSequence's window mode (spec §6.2; ±N decoded
                  ImageBitmaps, ≤ 1 sequence resident, ≤ 128 MB decoded)
   See "THE PLATES ENGINE" below.

   WHAT IT SHOWS. The manifest's StageSpecs (lib/page.ts, film.acts[].stage)
   flattened into SHOTS (lib/stage.ts stageShots):
   - backdrop shots draw in the stage root: `fixed inset-0` at --z-stage
     (0), under <main> (1), so they show only through a backdrop section
     made transparent (its static StageScrim in front);
   - split shots draw INSIDE their section's <StageWindow> (portalled into
     `[data-stage-window-host]`): the window is sticky and the section stays
     opaque, so the plate fills exactly the window, never a hole.
   A shot's layer is mounted only while its extent is within half a
   viewport of the screen (≤ 3 at once). `own` / `opaque` / card stretches
   leave nothing mounted: the root is `visibility:hidden` (discrete).

   THE DRIVER. One page-scroll value (motion's useScroll; it works with or
   without Lenis). Anchors, extents and window boxes are measured once and
   on ResizeObserver(document.body) / resize, never per frame. Per frame:
   stageAt(scrollY + innerHeight, shots, { fade: 40vh }) picks the shot in
   force (`a`), the next (`b`) and the crossfade `mix` (b's opacity); each
   mounted layer gets its camera pose, a split window's arrival (B19: the
   plate slides in over 40vh) and its rack focus (the soft rung's opacity).
   Transform / opacity only; values are written only when they change.

   THE CAMERA (W2-PLATES, spec §6.1 per-cue ranges; `stage.camera`).
   DEFAULT: each plate's own move (MOVES below: the act-1 exit frame drifts
   out from the opening push's end scale about the stern, the harbour
   drift, the corridor pan, the ICE push, the corridor-alt settle, the sun
   push, the candle push), about a registered mark mapped through the cover
   crop; plates without an entry keep lib/stage.ts `stageCamera`. ALT: the
   same start, then a 6% push toward the focal point. Plus a pointer shift
   (≤ 6 px, eased, only inside the pose's overscan: never an edge). DEPTH:
   a loop-less shot whose plate has a registered line (lib/media.ts marks)
   splits into a far and a near band (two copies of one decoded image, a
   static masked near copy); the far band follows .4× of the camera's
   change from the shot's first pose (clamped to ±1.5%). GRADE: a cue's
   `grade` key is where its light starts; a static multiply layer of the
   ratio to the next section's sky (lib/sky.ts) fades in with the shot's
   progress (opacity only: beyond, golden → dusk). WEATHER: the cue's
   sprites, in the split window, or in a backdrop's outer gutters only
   (never behind the text column); run only while the layer shows.

   LIVENESS. The first decoded plate sets html[data-stage="live"] (+ the
   `stage:live` event). A section turns transparent only when the stage
   marks it `[data-stage-on]` (its layer mounted, decoded and near), and
   only inside the boot gate while not paused (app/p3/stage.css): there is
   never a blank transparent section. Every change of the marks dispatches
   `stage:cover` on window: inline MediaFrames inside a marked backdrop stop
   asking for the decoder (the stage owns it there).

   ONE DECODER. <StageVideo/> plays the loop of the settled shot (`mix` ≤
   .02 or ≥ .98: posters during every crossfade), when one is registered to
   its plate (loopFor, DP-5; `plates.loops` ALT → its alt or none), the
   shot is on screen and no `own` section is within one viewport.

   MOTION OFF (Pause / OS reduced motion mid-session): the CSS hides every
   layer at once and drops the transparency; here the video stops, the
   `data-stage-on` marks go, the weather pauses and per-frame work halts.
   0 layout shift.
   ========================================================================== */

/* ═══════════════════════════════════════════════════════════════════════════
   THE PLATES ENGINE (W2-PLATES)
   ═══════════════════════════════════════════════════════════════════════ */

type Pt = readonly [number, number];

const EASE_IN_MS = 500;

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

function c01(x: number): number {
  return clamp(x, 0, 1);
}

/** A plate point (0–1 of the plate) in box fractions, for a plate drawn
 *  `object-fit: cover` with `object-position: focal` in a box of aspect
 *  `boxA` (the focal point maps onto itself). */
function boxPoint(p: Pt, boxA: number, plateA: number, focal: Pt): [number, number] {
  if (boxA >= plateA) {
    const k = boxA / plateA;
    return [p[0], p[1] * k - (k - 1) * focal[1]];
  }
  const k = plateA / boxA;
  return [p[0] * k - (k - 1) * focal[0], p[1]];
}

/** A camera move's pose at t (0–1) about origin `o` (box fractions):
 *  scale and translation interpolated, the scale never below 1 and the
 *  translation clamped inside its overscan, so no edge ever shows. */
export function specPose(
  m: { kind?: CameraSpec["kind"]; scale: Pt; x?: Pt; y?: Pt },
  t: number,
  o: Pt,
): CameraPose {
  const u = m.kind === "hold" ? 0 : c01(t);
  const at = (r?: Pt) => (r ? r[0] + (r[1] - r[0]) * u : 0);
  const s = Math.max(1, at(m.scale));
  const over = s - 1;
  return {
    s,
    x: clamp(at(m.x), -(1 - o[0]) * over, o[0] * over),
    y: clamp(at(m.y), -(1 - o[1]) * over, o[1] * over),
  };
}

function inViewNow(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

type Writer = { start(t: number): void; set(t: number): void; stop(): void };

/** Writes one element's pose (transform only, unchanged values skipped).
 *  `start` eases in from identity over EASE_IN_MS when the element is on
 *  screen (the engine arrived mid-view: no pop), else applies at once. */
function poseWriter(el: HTMLElement, pose: (t: number) => CameraPose, origin?: Pt): Writer {
  let t = 0;
  let t0 = 0;
  let raf = 0;
  let last = "";
  if (origin) el.style.transformOrigin = `${origin[0] * 100}% ${origin[1] * 100}%`;
  const put = () => {
    raf = 0;
    const q = pose(t);
    const k = t0 ? c01((performance.now() - t0) / EASE_IN_MS) : 1;
    const e = 1 - (1 - k) ** 3;
    const css = poseTransform(k < 1 ? { s: 1 + (q.s - 1) * e, x: q.x * e, y: q.y * e } : q);
    if (css !== last) {
      last = css;
      el.style.transform = css;
    }
    if (k < 1) raf = requestAnimationFrame(put);
    else t0 = 0;
  };
  return {
    start(v) {
      t = c01(v);
      if (inViewNow(el)) t0 = performance.now();
      put();
    },
    set(v) {
      t = c01(v);
      if (!raf) put();
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      el.style.transform = "";
      el.style.transformOrigin = "";
      el.style.willChange = "";
    },
  };
}

/** Feeds a Writer 0–1 from the host's MotionValue (`progress`), else from
 *  ScrollTrigger (lib/use-scroll-scene: ladder step 2, gsap.context,
 *  reverted on motion off): `flow` = the trigger's passage through the
 *  viewport (`settle`: until it is centred), `sticky` = its track's stuck
 *  span. `will-change: transform` only while in range / in view. */
function useDrive(
  scope: RefObject<HTMLElement | null>,
  o: {
    driver: CameraSpec["driver"];
    progress?: MotionValue<number>;
    settle?: boolean;
    /** The element whose box drives a flow / sticky driver. */
    trigger: () => Element | null;
    /** The element that moves, and its writer. */
    make: () => [HTMLElement, Writer] | null;
    key: string;
  },
): void {
  // the progress effect reads the latest `make` through an effect event;
  // the ScrollTrigger build is itself one (useScrollScene), so it reads `o`
  const make = useEffectEvent(() => o.make());
  const { driver, progress, settle, key } = o;

  useEffect(() => {
    if (driver !== "progress" || !progress) return;
    const m = make();
    if (!m) return;
    const [el, w] = m;
    w.start(progress.get());
    const off = progress.on("change", (v) => w.set(v));
    const io = new IntersectionObserver(([e]) => {
      el.style.willChange = e?.isIntersecting ? "transform" : "";
    });
    io.observe(el);
    return () => {
      off();
      io.disconnect();
      w.stop();
    };
  }, [driver, progress, key]);

  useScrollScene(
    scope,
    ({ ScrollTrigger }) => {
      if (driver === "progress") return;
      const m = o.make();
      const at = o.trigger();
      if (!m || !at) return;
      const [el, w] = m;
      const sticky = driver === "sticky";
      const st = ScrollTrigger.create({
        trigger: at,
        start: sticky ? "top top" : "top bottom",
        end: sticky ? "bottom bottom" : settle ? "center center" : "bottom top",
        onUpdate: (s) => w.set(s.progress),
        onRefresh: (s) => w.set(s.progress),
        onToggle: (s) => {
          el.style.willChange = s.isActive ? "transform" : "";
        },
      });
      el.style.willChange = st.isActive ? "transform" : "";
      w.start(st.progress);
      return () => w.stop();
    },
    [driver, settle, key],
  );
}

/** <CameraGroup>'s driver (components/primitives/camera.tsx): moves
 *  `target` by `spec` (see that file). Renders nothing. */
export function CameraDrive({
  target,
  spec,
  progress,
}: {
  target: RefObject<HTMLDivElement | null>;
  spec: CameraSpec;
  progress?: MotionValue<number>;
}): null {
  const o: Pt = spec.focal ?? [0.5, 0.5];
  useDrive(target, {
    driver: spec.driver,
    progress,
    settle: spec.kind === "settle",
    key: JSON.stringify(spec),
    // the group's parent: the group itself is scaled (its rect is not the plate's)
    trigger: () => target.current?.parentElement ?? target.current,
    make: () => {
      const el = target.current;
      return el ? [el, poseWriter(el, (t) => specPose(spec, t, o), o)] : null;
    },
  });
  return null;
}

/** <DepthPlate>'s near band and driver (components/primitives/depth-plate.tsx):
 *  the near copy (same next/image props as the far MediaFrame → the same
 *  URL, one decode), masked at the line mapped through the cover crop
 *  (resize only); the far band lags by (far − near) × max × (1 − 2t) of the
 *  box width and scales just enough to cover (identity at t = .5). */
export function DepthNear({
  root,
  far,
  media,
  spec,
  progress,
  sizes,
}: {
  root: RefObject<HTMLDivElement | null>;
  far: RefObject<HTMLDivElement | null>;
  media: MediaId;
  spec: DepthSpec;
  progress?: MotionValue<number>;
  sizes: string;
}) {
  const near = useRef<HTMLDivElement>(null);
  const a = resolveMedia(media);
  const still = a?.kind === "image" ? a : null;
  const fx = still?.focal?.[0] ?? 0.5;
  const fy = still?.focal?.[1] ?? 0.5;
  const plateA = still ? still.width / still.height : 16 / 9;
  const line = spec.line;
  const feather = spec.feather ?? 0.06;

  useEffect(() => {
    const box = root.current;
    const n = near.current;
    if (!box || !n) return;
    const fit = () => {
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      if (!w || !h) return;
      const row = boxPoint([0, line], w / h, plateA, [fx, fy])[1];
      n.style.setProperty("--depth-line", `${(row * 100).toFixed(2)}%`);
      n.style.setProperty("--depth-feather", `${(feather * 100).toFixed(2)}%`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [root, line, feather, plateA, fx, fy]);

  const k = (spec.far ?? 0.4) - (spec.near ?? 1);
  const max = Math.min(0.015, spec.max ?? 0.01);
  useDrive(root, {
    driver: progress ? "progress" : "flow",
    progress,
    key: `${media}|${k}|${max}`,
    trigger: () => root.current?.closest("[data-live-plate]") ?? root.current,
    make: () => {
      const el = far.current;
      if (!el) return null;
      return [
        el,
        poseWriter(el, (t) => {
          const off = k * max * (1 - 2 * t);
          return { s: 1 + 2 * Math.abs(off), x: off, y: 0 };
        }),
      ];
    },
  });

  if (!still) return null;
  return (
    <div ref={near} className="plate-depth-near" aria-hidden="true">
      <Image
        src={still.src}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: `${(fx * 100).toFixed(2)}% ${(fy * 100).toFixed(2)}%` }}
      />
    </div>
  );
}

/* — LivePlate's paths (components/primitives/live-plate.tsx) ————————— */

/** The registered line of a plate (spec §6.1 "horizon, ledge, lake"): the
 *  `horizon` or `lake` row, else the mean of the `ledgeL` / `ledgeR` rows,
 *  else null (no depth: a band split elsewhere would shear the picture). */
export function lineOf(asset: Pick<MediaAsset, "id"> | null | undefined): number | null {
  if (!asset) return null;
  const h = markOf(asset.id, "horizon") ?? markOf(asset.id, "lake");
  if (h) return h[1];
  const l = markOf(asset.id, "ledgeL");
  const r = markOf(asset.id, "ledgeR");
  return l && r ? (l[1] + r[1]) / 2 : null;
}

/** The still a plate shows (a video's poster). */
function stillOf(id: MediaId): MediaAsset | null {
  const a = resolveMedia(id);
  if (!a || a.kind === "image") return a;
  return a.poster ? resolveMedia(a.poster) : null;
}

/** The CODE path's camera when the host gives none: a slow drift. */
const CODE_DRIFT: CameraSpec = { kind: "drift", scale: [1, 1.03], x: [0, -0.008], driver: "flow" };

/** <LivePlate>'s engine half: rendered between the facade's still and its
 *  overlays, inside the camera wrapper `cam`. LOOP → a MediaFrame of the
 *  loop over the plate (its poster = the plate: the same pixels); CODE → the
 *  near band of the plate's depth (the facade's still is the far band) and
 *  the camera (the host's, else CODE_DRIFT). Marks the box `data-plate`. */
export function LiveImpl({
  media,
  camera,
  depth,
  loop = "auto",
  priority = 0,
  playOn = "desktop",
  progress,
  sizes = "100vw",
  cam,
  far,
}: Omit<LivePlateProps, "children"> & {
  cam: RefObject<HTMLDivElement | null>;
  far: RefObject<HTMLDivElement | null>;
}) {
  const variant = useVariant(null, "plates.loops");
  const live = loop === "auto" && playOn !== "never" ? loopFor(media, variant) : null;
  const still = stillOf(media);
  // the CODE path moves on its own only where the plate is seen (not under the stage)
  const auto = !live && playOn !== "never";
  const line =
    depth === false || live ? null : typeof depth === "object" ? depth.line : depth || auto ? lineOf(still) : null;
  const dspec: DepthSpec | null = line === null ? null : typeof depth === "object" ? depth : { line };
  const spec = camera ?? (auto ? CODE_DRIFT : null);
  const focal: Pt = spec?.focal ?? still?.focal ?? [0.5, 0.5];
  const mode = live ? "loop" : dspec ? "depth" : "still";

  useEffect(() => {
    const root = cam.current?.parentElement;
    if (!root) return;
    root.setAttribute("data-plate", mode);
    return () => root.removeAttribute("data-plate");
  }, [cam, mode]);

  return (
    <>
      {spec ? <CameraDrive target={cam} spec={{ ...spec, focal }} progress={progress} /> : null}
      {live ? (
        <MediaFrame media={live} poster={media} layout="fill" playOn={playOn} decoderPriority={priority} sizes={sizes} loader={false} />
      ) : dspec && still ? (
        <DepthNear root={cam} far={far} media={still.id} spec={dspec} progress={progress} sizes={sizes} />
      ) : null}
    </>
  );
}

/* — Weather (spec §7.7) —————————————————————————————————————————————— */

type WeatherDef = {
  n: number;
  size: Pt;
  ms: Pt;
  /** the rows sprites start in (0–1 of the zone) */
  top: Pt;
  easing: string;
  frames: (r: () => number, w: number, h: number) => Keyframe[];
};

const T0 = "translate3d(0,0,0)";
const tr = (x: number, y: number) => `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;

const WEATHER: Readonly<Record<WeatherKind, WeatherDef>> = {
  // Pirates: spray flecks drift and fall
  spray: {
    n: 14,
    size: [2, 4],
    ms: [2400, 4200],
    top: [0, 0.7],
    easing: "cubic-bezier(.45,0,.85,.65)",
    frames: (r, w, h) => [
      { transform: T0, opacity: 0 },
      { opacity: 0.85, offset: 0.2 },
      { transform: tr(-(0.03 + r() * 0.05) * w, (0.16 + r() * 0.12) * h), opacity: 0 },
    ],
  },
  // 3 Idiots: chalk dust rising slowly in the beam
  chalk: {
    n: 12,
    size: [2, 5],
    ms: [9000, 14000],
    top: [0.3, 1],
    easing: "linear",
    frames: (r, w, h) => [
      { transform: T0, opacity: 0 },
      { opacity: 0.55, offset: 0.3 },
      { opacity: 0.35, offset: 0.7 },
      { transform: tr((r() - 0.5) * 0.04 * w, -(0.18 + r() * 0.12) * h), opacity: 0 },
    ],
  },
  // RDR2: fireflies wander and blink (two blinks per ≥ 3.2 s cycle: ≤ 1 Hz)
  fireflies: {
    n: 9,
    size: [4, 7],
    ms: [3200, 5200],
    top: [0.35, 0.95],
    easing: "ease-in-out",
    frames: (r) => {
      const a = 6 + r() * 8;
      const b = 4 + r() * 8;
      return [
        { transform: T0, opacity: 0 },
        { transform: tr(a, -b), opacity: 0.9, offset: 0.25 },
        { transform: tr(-a * 0.5, -b * 1.6), opacity: 0.12, offset: 0.5 },
        { transform: tr(a * 0.7, -b * 2.2), opacity: 0.8, offset: 0.75 },
        { transform: T0, opacity: 0 },
      ];
    },
  },
  // HP: candle motes rise
  motes: {
    n: 12,
    size: [3, 6],
    ms: [7000, 11000],
    top: [0.4, 1],
    easing: "cubic-bezier(.25,.6,.45,1)",
    frames: (r, w, h) => [
      { transform: T0, opacity: 0 },
      { opacity: 0.75, offset: 0.25 },
      { transform: tr((r() - 0.5) * 0.03 * w, -(0.22 + r() * 0.14) * h), opacity: 0 },
    ],
  },
};

/** Seeded PRNG (mulberry32): the same field on every visit. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The weather sprites (≤ 16), filling the positioned parent. Each sprite is
 *  a static dot (plates.css) with ONE infinite WAAPI keyframe; they pause
 *  while `run` is false, the box is offscreen or the tab is hidden, and are
 *  cancelled on unmount (reduced motion / Pause unmount the facade). The
 *  zone's size is read once at mount (travel distances in px). */
export function WeatherImpl({
  kind,
  zone = "frame",
  count,
  run = true,
  seed = 0,
  className,
}: WeatherLayerProps & { run?: boolean; seed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const anims = useRef<Animation[]>([]);
  const [seen, setSeen] = useState(true);
  const docOn = useDocumentVisible();
  const go = run && seen && docOn;
  const goRef = useRef(go);

  useEffect(() => {
    const box = ref.current;
    if (!box || typeof box.animate !== "function") return;
    const d = WEATHER[kind];
    const n = clamp(Math.round(count ?? d.n), 0, 16);
    const w = box.offsetWidth || 800;
    const h = box.offsetHeight || 600;
    const r = rng(kind.length * 7919 + n * 131 + seed);
    const list: Animation[] = [];
    for (let i = 0; i < n; i++) {
      const dot = document.createElement("i");
      const size = d.size[0] + r() * (d.size[1] - d.size[0]);
      const top = d.top[0] + r() * (d.top[1] - d.top[0]);
      dot.style.cssText = `left:${(r() * 100).toFixed(2)}%;top:${(top * 100).toFixed(2)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px`;
      box.appendChild(dot);
      const ms = d.ms[0] + r() * (d.ms[1] - d.ms[0]);
      const a = dot.animate(d.frames(r, w, h), { duration: ms, delay: -r() * ms, iterations: Infinity, easing: d.easing });
      if (!goRef.current) a.pause();
      list.push(a);
    }
    anims.current = list;
    return () => {
      for (const a of list) a.cancel();
      anims.current = [];
      box.replaceChildren();
    };
  }, [kind, count, seed]);

  useEffect(() => {
    goRef.current = go;
    for (const a of anims.current) {
      if (go) a.play();
      else a.pause();
    }
  }, [go]);

  useEffect(() => {
    const box = ref.current;
    if (!box || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setSeen(Boolean(e?.isIntersecting)));
    io.observe(box);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} className={cn("plate-weather", className)} data-weather={kind} data-zone={zone} aria-hidden="true" />;
}

/* — Sequence window (spec §6.2; use-frame-sequence.ts `{ window }`) ———— */

/** `tick` counts the asked frame's arrivals (a host redraws on it: a frame
 *  drawn from a neighbour is replaced once the exact one decodes). */
export type SeqState = { fetched: number; failed: number; ready: boolean; tick: number };
export type SeqHandle = { frameAt(i: number): ImageBitmap | null; drop(): void };

type SeqBlobs = { blobs: (Blob | null)[]; done: number; failed: number; subs: Set<() => void> };

/** Compressed frames per sequence, kept for the page's life (≈ 1.3–3.7 MB). */
const SEQ = new Map<string, SeqBlobs>();
const SEQ_MAX_BYTES = 128 * 1024 * 1024;
const SEQ_FRAME_GUESS = 1280 * 720 * 4;
let seqResident: { evict(): void } | null = null;
let seqBytes = 0;
let seqPeak = 0;

function seqDebug(key: string | null, frames: number): void {
  (window as Window & { __seqMem?: unknown }).__seqMem = { resident: key, frames, bytes: seqBytes, peak: seqPeak };
}

function seqBlobs(key: string, urls: readonly string[]): SeqBlobs {
  const had = SEQ.get(key);
  if (had) return had;
  const s: SeqBlobs = { blobs: new Array<Blob | null>(urls.length).fill(null), done: 0, failed: 0, subs: new Set() };
  SEQ.set(key, s);
  let next = 0;
  let inflight = 0;
  const pump = () => {
    while (inflight < 6 && next < urls.length) {
      const i = next++;
      inflight++;
      fetch(urls[i])
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then(
          (b) => {
            s.blobs[i] = b;
          },
          () => {
            s.failed++;
          },
        )
        .finally(() => {
          inflight--;
          s.done++;
          s.subs.forEach((f) => f());
          pump();
        });
    }
  };
  pump();
  return s;
}

/** A decoded window of ±`radius` frames around the host's index (`index()`,
 *  else the last frame asked for), decoded ahead in the scroll direction by
 *  createImageBitmap (off the main thread), `close()`d outside the window.
 *  ≤ 1 sequence resident page-wide (a sequence that decodes evicts the
 *  other's bitmaps; blobs stay) and ≤ 128 MB decoded. `ready` = every blob
 *  fetched and the first window decoded. Diagnostics: window.__seqMem. */
export function seqWindow(
  urls: readonly string[],
  radius: number,
  index: () => number,
  report: (s: SeqState) => void,
): SeqHandle {
  const key = `${urls[0]}#${urls.length}`;
  const n = urls.length;
  const store = seqBlobs(key, urls);
  const bm = new Map<number, ImageBitmap>();
  const pending = new Set<number>();
  let c = -1;
  let dir = 1;
  let asked = -1;
  let ready = false;
  let dead = false;
  let queued = false;
  let tick = 0;
  const bytesOf = (b: ImageBitmap) => b.width * b.height * 4;
  const free = (i: number) => {
    const b = bm.get(i);
    if (!b) return;
    seqBytes -= bytesOf(b);
    b.close();
    bm.delete(i);
  };
  const self = {
    evict: () => {
      for (const i of [...bm.keys()]) free(i);
      if (seqResident === self) seqResident = null;
      seqDebug(null, 0);
    },
  };
  const state = (): SeqState => ({ fetched: store.done - store.failed, failed: store.failed, ready, tick });
  const schedule = () => {
    if (queued || dead) return;
    queued = true;
    queueMicrotask(pump);
  };
  function pump() {
    queued = false;
    if (dead || !n) return;
    const want = index();
    const at = clamp(Math.round(want >= 0 ? want : asked >= 0 ? asked : 0), 0, n - 1);
    if (at !== c) {
      if (c >= 0) dir = at > c ? 1 : -1;
      c = at;
    }
    for (const i of [...bm.keys()]) if (Math.abs(i - c) > radius) free(i);
    if (seqResident !== self) {
      seqResident?.evict();
      seqResident = self;
    }
    const order = [c];
    for (let k = 1; k <= radius; k++) order.push(c + k * dir);
    for (let k = 1; k <= radius; k++) order.push(c - k * dir);
    let complete = true;
    for (const i of order) {
      if (i < 0 || i >= n || bm.has(i)) continue;
      complete = false;
      const blob = store.blobs[i];
      if (pending.has(i) || !blob || pending.size >= 2 || seqBytes + SEQ_FRAME_GUESS > SEQ_MAX_BYTES) continue;
      pending.add(i);
      createImageBitmap(blob).then(
        (b) => {
          pending.delete(i);
          if (dead || seqResident !== self || Math.abs(i - c) > radius) b.close();
          else {
            bm.set(i, b);
            seqBytes += bytesOf(b);
            seqPeak = Math.max(seqPeak, seqBytes);
            // the frame the host asked for: redraw it over the neighbour
            if (i === asked) {
              tick++;
              report(state());
            }
          }
          schedule();
        },
        () => {
          pending.delete(i);
          schedule();
        },
      );
    }
    if (complete && !ready && store.done === n && store.failed === 0) {
      ready = true;
      report(state());
    }
    seqDebug(key, bm.size);
  }
  const onFetch = () => {
    report(state());
    schedule();
  };
  store.subs.add(onFetch);
  report(state());
  schedule();
  return {
    frameAt(i) {
      if (i !== asked) {
        asked = i;
        schedule();
      }
      const b = bm.get(i);
      if (b) return b;
      // nearest decoded neighbour (a fast scrub never draws a hole)
      for (let k = 1; k <= radius; k++) {
        const x = bm.get(i - k * dir) ?? bm.get(i + k * dir);
        if (x) return x;
      }
      return null;
    },
    drop() {
      dead = true;
      store.subs.delete(onFetch);
      self.evict();
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE STAGE
   ═══════════════════════════════════════════════════════════════════════ */

type Plate = {
  id: MediaId;
  src: string;
  focal: Pt;
  aspect: number;
  /** The rack-focus copy: the soft rung of the same plate. */
  soft: string;
  /** The registered line (plate row) for depth, or null. */
  line: number | null;
};

type Geom = {
  /** Page y where the shot's layer is worth mounting / is visible. */
  top: number;
  bottom: number;
  /** split only: the split grid's top (the window's arrival). */
  splitTop: number;
  /** split only: the text blocks' edges (rack focus). */
  edges: number[];
  /** split only: the window and its portal host. */
  windowEl: HTMLElement | null;
  host: HTMLElement | null;
  /** The layer's box (px): the viewport, or the window. */
  bw: number;
  bh: number;
};

type LayerEls = {
  layer: HTMLDivElement | null;
  cam: HTMLDivElement | null;
  soft: HTMLImageElement | null;
  video: HTMLDivElement | null;
  far: HTMLDivElement | null;
  near: HTMLDivElement | null;
  grade: HTMLDivElement | null;
  /** last written values (skip unchanged writes) */
  o: number;
  t: string;
  c: string;
  s: number;
  f: string;
  g: number;
  org: string;
  row: string;
};

type VideoState = { k: number; host: HTMLElement | null; play: boolean };
const NO_VIDEO: VideoState = { k: -1, host: null, play: false };

const FADE_VH = 0.4;
const MOUNT_MARGIN_VH = 0.5;
const OWN_CLEAR_VH = 1;
/** Pointer shift (spec §6.1: ≤ 6 px, the hero and the stage only). */
const POINTER_PX = 6;
/** Depth on the stage: the far band follows this share of the camera's
 *  change (spec §6.1 far .4 × / near 1 ×), clamped to ±1.5%. */
const DEPTH_FAR = 0.4;
const DEPTH_MAX = 0.015;

function plateOf(media: MediaId): Plate | null {
  let a: MediaAsset | null = resolveMedia(media);
  if (a && a.kind !== "image") a = a.poster ? resolveMedia(a.poster) : null;
  if (!a || a.kind !== "image") return null;
  const h = Math.max(1, Math.round((STAGE_IMAGE.softWidth * a.height) / a.width));
  const { props } = getImageProps({
    src: a.src,
    alt: "",
    width: STAGE_IMAGE.softWidth,
    height: h,
    quality: STAGE_IMAGE.softQuality,
  });
  const first = props.srcSet?.split(", ")[0]?.split(" ")[0];
  return {
    id: a.id,
    src: a.src,
    focal: a.focal ?? [0.5, 0.5],
    aspect: a.width / a.height,
    soft: first || props.src,
    line: lineOf(a),
  };
}

/** The element whose box is the item: a section's (inside its
 *  display:contents SectionFrame), or the act card's. */
function itemBox(item: string): HTMLElement | null {
  const frame = document.querySelector<HTMLElement>(`[data-section="${CSS.escape(item)}"]`);
  const inner = frame?.firstElementChild;
  if (inner instanceof HTMLElement) return inner;
  return document.getElementById(item);
}

/** The element a shot marks `[data-stage-on]` for a backdrop item. */
function itemMark(item: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-section="${CSS.escape(item)}"]`) ?? document.getElementById(item);
}

/* — the per-plate camera (spec §6.1; `stage.camera` DEFAULT) ——————————————
   scale / x / y as specPose takes them; `at` = the registered mark the
   camera scales about (mapped through the cover crop), default the focal. */
type Move = { scale: Pt; x?: Pt; y?: Pt; at?: string };

const MOVES: Readonly<Partial<Record<MediaId, Move>>> = {
  // act-1 program + about cue 1: the opening card's exit frame (push-in #1's
  // end scale about the stern, card-opening.push), drifting out 4% and 1%
  // right (spec §6.1 "1.04 → 1.0, x +1%" on the exit still). The opening's
  // ALT push ends at 1.15 (moveOf).
  "iconic-pearl": { scale: [1.3, 1.25], x: [0, 0.01], at: "stern" },
  // about cue 2: a slow drift toward the harbour lights
  "MV-05a": { scale: [1, 1.03], x: [0, -0.008] },
  // trading-algos window: pan-l, x +2% → −2% (1.05 holds the overscan)
  "iconic-corridor": { scale: [1.05, 1.05], x: [0.02, -0.02] },
  // optuna cue 1: push 1 → 1.05
  "iconic-ice": { scale: [1, 1.05] },
  // optuna cue 2: drift 1.03 → 1
  "iconic-corridor-alt": { scale: [1.03, 1], x: [0.005, -0.005] },
  // beyond window: push toward the sun
  "MV-10": { scale: [1, 1.06], at: "sun" },
  // credits: push 1 → 1.06 toward the last candle
  "MV-08": { scale: [1, 1.06], at: "flame" },
};

/** card-opening.push ALT ("code-rack-l01") ends at 1.15 about the stern. */
const OPENING_ALT_END = 1.15;

function moveOf(media: MediaId, camera: Variant, opening: Variant): Move | null {
  let m = MOVES[media] ?? null;
  if (m && media === "iconic-pearl" && opening === "alt") {
    m = { ...m, scale: [OPENING_ALT_END, OPENING_ALT_END / 1.04] };
  }
  // stage.camera ALT: the same first frame, then a 6% push toward the origin
  if (m && camera === "alt") m = { scale: [m.scale[0], m.scale[0] * 1.06], at: m.at };
  return m;
}

/* — the shots (static: the manifest never changes on the client) ———————— */
const acts = film.acts as readonly ActSpec[];
const CUES = stageCues(pageItems, (id) => acts.find((a) => a.id === id)?.stage);
const SHOTS: readonly StageShot[] = stageShots(CUES);
/** Items that own their plates and decoder (`own`): the video keeps clear. */
const OWN_ITEMS: readonly string[] = CUES.filter((c) => c.mode === "own").map((c) => c.item);
const PLATES: readonly (Plate | null)[] = SHOTS.map((s) => plateOf(s.cue.media));
/** Whether shot k is the first shot shown in its split window. */
const FIRST_IN_WINDOW: readonly boolean[] = SHOTS.map(
  (s, k) => s.mode === "split" && SHOTS.findIndex((o) => o.mode === "split" && o.item === s.item) === k,
);
const ITEM_IDS: readonly string[] = pageItems.map((it) => (it.kind === "act" ? it.id : it.entry.id));

/** The static grade of a cue that names one (spec §7.5): a multiply colour
 *  from the cue's sky to the sky of the item after the shot (never
 *  brightens), or null when they match. */
function gradeOf(s: StageShot): string | null {
  const from = s.cue.grade;
  if (!from) return null;
  const after = ITEM_IDS[ITEM_IDS.indexOf(s.items[s.items.length - 1]) + 1];
  const to: SkyKey = after ? skyOf(after) : from;
  if (to === from) return null;
  const a = SKY[from];
  const b = SKY[to];
  const ev = Math.pow(2, Math.min(0, b.ev - a.ev));
  const ch = [0, 1, 2].map((i) => b.gain[i] / a.gain[i]);
  const top = Math.max(...ch);
  return `rgb(${ch.map((v) => Math.round((v / top) * ev * 255)).join(" ")})`;
}
const GRADES: readonly (string | null)[] = SHOTS.map(gradeOf);

export function Stage() {
  const reduced = useReducedMotion();
  const fine = useDesktopFine();
  const visibleDoc = useDocumentVisible();
  const cameraVariant = useVariant(null, "stage.camera");
  const loopVariant = useVariant(null, "plates.loops");
  const openingVariant = useVariant(acts[0]?.variant ?? null, "card-opening.push");
  const on = fine && !reduced;

  const { scrollY } = useScroll();
  const rootRef = useRef<HTMLDivElement>(null);
  const geom = useRef<(Geom | null)[]>(SHOTS.map(() => null));
  const ownExtents = useRef<[number, number][]>([]);
  const els = useRef<Map<number, LayerEls>>(new Map());
  const ready = useRef<Set<number>>(new Set());
  const marked = useRef(new Set<HTMLElement>());
  const vhRef = useRef(900);
  const live = useRef(false);
  const rootShown = useRef<boolean | null>(null);
  const settings = useRef({ on, cameraVariant, openingVariant, visibleDoc });
  /** the pointer shift: target and eased current (px, ±POINTER_PX) */
  const ptr = useRef({ tx: 0, ty: 0, x: 0, y: 0 });

  const [mounted, setMounted] = useState<readonly number[]>([]);
  const [hosts, setHosts] = useState<ReadonlyMap<number, HTMLElement>>(new Map());
  const [video, setVideo] = useState<VideoState>(NO_VIDEO);
  const [weatherOn, setWeatherOn] = useState("");
  const videoRef = useRef<VideoState>(NO_VIDEO);

  const loops = useMemo(
    () => PLATES.map((p) => (p ? loopFor(p.id, loopVariant) : null)),
    [loopVariant],
  );
  /** depth: a loop-less shot whose plate has a registered line */
  const depths = useMemo(() => PLATES.map((p, k) => Boolean(p && p.line !== null && !loops[k])), [loops]);
  const loopsRef = useRef(loops);
  const depthsRef = useRef(depths);

  // the per-frame step, built once; it reads everything through refs
  const step = useRef<() => void>(() => {});
  const measure = useRef<() => void>(() => {});

  useEffect(() => {
    settings.current = { on, cameraVariant, openingVariant, visibleDoc };
    loopsRef.current = loops;
    depthsRef.current = depths;
  });

  // the stage mounted: ScrollTrigger re-measures once (debounced, lib/smooth-scroll)
  useEffect(() => {
    requestScrollRefresh();
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    const setRoot = (shown: boolean) => {
      if (!root || rootShown.current === shown) return;
      rootShown.current = shown;
      root.style.visibility = shown ? "visible" : "hidden";
    };

    const mark = (want: Set<HTMLElement>) => {
      let changed = false;
      for (const el of marked.current) {
        if (!want.has(el)) {
          el.removeAttribute("data-stage-on");
          changed = true;
        }
      }
      for (const el of want) {
        if (!marked.current.has(el)) {
          el.setAttribute("data-stage-on", "");
          changed = true;
        }
      }
      marked.current = want;
      // inline MediaFrames under a marked backdrop re-read their cover
      if (changed) window.dispatchEvent(new Event("stage:cover"));
    };

    const write = (e: LayerEls, o: number, t: string, c: string, s: number) => {
      if (e.layer && Math.abs(o - e.o) > 0.001) {
        e.o = o;
        e.layer.style.opacity = o.toFixed(3);
      }
      if (e.layer && t !== e.t) {
        e.t = t;
        e.layer.style.transform = t;
      }
      if (e.cam && c !== e.c) {
        e.c = c;
        e.cam.style.transform = c;
      }
      if (e.soft && Math.abs(s - e.s) > 0.001) {
        e.s = s;
        e.soft.style.opacity = s.toFixed(3);
      }
    };

    /** The camera of shot k at progress l in its box: the pose, its origin
     *  (box fractions) and the far band's transform (depth). */
    const camera = (k: number, l: number, m: Geom): { pose: CameraPose; origin: Pt; far: string } => {
      const s = SHOTS[k];
      const plate = PLATES[k];
      const { cameraVariant: cv, openingVariant: ov } = settings.current;
      const focal: Pt = plate?.focal ?? [0.5, 0.5];
      const boxA = m.bw / Math.max(1, m.bh);
      const move = plate ? moveOf(plate.id, cv, ov) : null;
      const pin = move?.at && plate ? markOf(plate.id, move.at) : null;
      const origin: Pt = pin && plate ? boxPoint(pin, boxA, plate.aspect, focal) : focal;
      const pose = move ? specPose(move, l, origin) : stageCamera(s.cue.camera, l, focal, cv);
      let far = "none";
      if (depthsRef.current[k]) {
        // the far band follows DEPTH_FAR of the camera's change since the
        // shot's first pose (identity there), relative to the near band
        const p0 = move ? specPose(move, 0, origin) : stageCamera(s.cue.camera, 0, focal, cv);
        const rel = clamp((p0.s + DEPTH_FAR * (pose.s - p0.s)) / pose.s, 1 - DEPTH_MAX, 1 + DEPTH_MAX);
        const off = clamp(-(1 - DEPTH_FAR) * (pose.x - p0.x), -DEPTH_MAX, DEPTH_MAX);
        far = poseTransform({ s: rel, x: off, y: 0 });
      }
      // the pointer: only inside the pose's remaining overscan (never an edge)
      const over = pose.s - 1;
      const { x: px, y: py } = ptr.current;
      const dx = clamp(px / Math.max(1, m.bw), -(pose.x + (1 - origin[0]) * over), origin[0] * over - pose.x);
      const dy = clamp(py / Math.max(1, m.bh), -(pose.y + (1 - origin[1]) * over), origin[1] * over - pose.y);
      return { pose: { s: pose.s, x: pose.x + dx, y: pose.y + dy }, origin, far };
    };

    let lastMounted = "";
    let lastWeather = "";

    step.current = () => {
      const { on: motionOn, visibleDoc: docOn } = settings.current;
      if (!motionOn) {
        mark(new Set());
        if (lastWeather !== "") {
          lastWeather = "";
          setWeatherOn("");
        }
        if (videoRef.current.play) {
          videoRef.current = { ...videoRef.current, play: false };
          setVideo(videoRef.current);
        }
        return;
      }
      const vh = vhRef.current;
      const sy = window.scrollY;
      const g = geom.current;

      // the measured shots, in page order (stageAt needs `y`)
      const list: StageShot[] = [];
      const index: number[] = [];
      SHOTS.forEach((s, k) => {
        const m = g[k];
        if (!m) return;
        list.push(s);
        index.push(k);
      });
      const { a, b, mix } = stageAt(sy + vh, list, { fade: FADE_VH * vh });
      const ka = a >= 0 ? index[a] : -1;
      const kb = b >= 0 ? index[b] : -1;

      // mount what is near (discrete)
      const lo = sy - MOUNT_MARGIN_VH * vh;
      const hi = sy + vh + MOUNT_MARGIN_VH * vh;
      const near: number[] = [];
      index.forEach((k) => {
        const m = g[k];
        if (m && m.top < hi && m.bottom > lo) near.push(k);
      });
      const key = near.join(",");
      if (key !== lastMounted) {
        lastMounted = key;
        setMounted(near);
      }

      // per layer: opacity, arrival, camera (+ depth, pointer), rack focus, grade
      let rootWanted = false;
      const want = new Set<HTMLElement>();
      const opacityOf = new Map<number, number>();
      const weather: number[] = [];
      for (const k of near) {
        const s = SHOTS[k];
        const m = g[k];
        const e = els.current.get(k);
        if (!m) continue;
        const onScreen = m.top < sy + vh && m.bottom > sy;
        let o = k <= ka ? 1 : FIRST_IN_WINDOW[k] ? 1 : k === kb ? mix : 0;
        let t = "none";
        let soft = 0;
        if (s.mode === "split") {
          if (FIRST_IN_WINDOW[k]) {
            const arr = shotArrival(sy, vh, m.splitTop);
            o *= arr;
            const dir = s.side === "left" ? -1 : 1;
            t = arr >= 1 ? "none" : `translate3d(${((1 - arr) * 10 * dir).toFixed(3)}%, 0, 0)`;
            soft = arr >= 1 ? rackSoft(sy, vh, m.edges) : 0;
          } else {
            soft = rackSoft(sy, vh, m.edges);
          }
          if (ready.current.has(k) && m.windowEl && FIRST_IN_WINDOW[k]) want.add(m.windowEl);
        } else if (onScreen && o > 0) {
          rootWanted = true;
        }
        if (s.mode === "backdrop" && ready.current.has(k) && m.top < hi && m.bottom > lo) {
          for (const item of s.items) {
            const el = itemMark(item);
            if (el) want.add(el);
          }
        }
        const l = shotLocal(sy, vh, { y: s.y, end: s.end });
        const cam = camera(k, l, m);
        opacityOf.set(k, o);
        if (s.cue.weather && onScreen && o > 0.02 && docOn) weather.push(k);
        if (!e) continue;
        write(e, o, t, poseTransform(cam.pose), soft);
        const org = `${(cam.origin[0] * 100).toFixed(2)}% ${(cam.origin[1] * 100).toFixed(2)}%`;
        if (e.cam && org !== e.org) {
          e.org = org;
          e.cam.style.transformOrigin = org;
          if (e.far) e.far.style.transformOrigin = org;
        }
        if (e.far && cam.far !== e.f) {
          e.f = cam.far;
          e.far.style.transform = cam.far;
        }
        const plate = PLATES[k];
        if (e.near && plate && plate.line !== null) {
          const row = `${(boxPoint([0, plate.line], m.bw / Math.max(1, m.bh), plate.aspect, plate.focal)[1] * 100).toFixed(2)}%`;
          if (row !== e.row) {
            e.row = row;
            e.near.style.setProperty("--depth-line", row);
          }
        }
        if (e.grade && Math.abs(l - e.g) > 0.002) {
          e.g = l;
          e.grade.style.opacity = l.toFixed(3);
        }
      }
      setRoot(rootWanted);
      mark(want);
      const wkey = weather.join(",");
      if (wkey !== lastWeather) {
        lastWeather = wkey;
        setWeatherOn(wkey);
      }

      // the one video: the settled shot, on screen, clear of own sections
      const kv = mix <= 0.02 ? ka : mix >= 0.98 ? kb : -1;
      let play = false;
      let host: HTMLElement | null = null;
      if (kv >= 0 && near.includes(kv) && ready.current.has(kv) && loopsRef.current[kv] && docOn) {
        const m = g[kv];
        const onScreen = m !== null && m.top < sy + vh && m.bottom > sy;
        const clear = !ownExtents.current.some(([t0, t1]) => t0 < sy + vh + OWN_CLEAR_VH * vh && t1 > sy - OWN_CLEAR_VH * vh);
        host = els.current.get(kv)?.video ?? null;
        // posters during every fade, a split window's arrival included,
        // anywhere on the stage: the loop plays only while its own layer is
        // fully in and no other layer is mid-fade (one decoder; P3-2 #5)
        const fading = [...opacityOf.values()].some((x) => x > 0.02 && x < 0.98);
        play = onScreen && clear && host !== null && !fading && (opacityOf.get(kv) ?? 0) >= 0.98;
      }
      const v = videoRef.current;
      if (v.k !== kv || v.host !== host || v.play !== play) {
        videoRef.current = { k: kv, host, play };
        setVideo(videoRef.current);
      }
    };

    measure.current = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      vhRef.current = vh;
      const sy = window.scrollY;
      const nextHosts = new Map<number, HTMLElement>();
      SHOTS.forEach((s, k) => {
        // the shot starts at its first cue whose anchor exists (a cue naming
        // an id the page does not render yet is skipped, never guessed)
        let anchor: HTMLElement | null = null;
        for (let i = s.from; i <= s.to && !anchor; i++) {
          const c = CUES[i];
          anchor = c.cue?.at ? document.getElementById(c.cue.at) : itemBox(c.item);
        }
        if (!anchor) {
          geom.current[k] = null;
          return;
        }
        const y = anchor.getBoundingClientRect().top + sy;
        let end = y;
        for (const item of s.items) {
          const box = itemBox(item);
          if (box) end = Math.max(end, box.getBoundingClientRect().bottom + sy);
        }
        let top = y;
        let bottom = end;
        let splitTop = y;
        let bw = vw;
        let bh = vh;
        const edges: number[] = [];
        let windowEl: HTMLElement | null = null;
        let host: HTMLElement | null = null;
        if (s.mode === "split") {
          windowEl = document.querySelector<HTMLElement>(`[data-stage-window="${CSS.escape(s.item)}"]`);
          const split = windowEl?.closest<HTMLElement>("[data-stage-split]") ?? null;
          host = windowEl?.querySelector<HTMLElement>("[data-stage-window-host]") ?? null;
          // the window is display:none outside the boot gate: nothing to show
          if (!windowEl || !split || !host || windowEl.getClientRects().length === 0) {
            geom.current[k] = null;
            return;
          }
          const r = split.getBoundingClientRect();
          splitTop = r.top + sy;
          top = splitTop;
          bottom = r.bottom + sy;
          bw = windowEl.offsetWidth || vw;
          bh = windowEl.offsetHeight || vh;
          // the text blocks (rack focus): marked ones, else the column's children
          let blocks = split.querySelectorAll<HTMLElement>("[data-stage-block]");
          if (!blocks.length) blocks = split.querySelectorAll<HTMLElement>(".stage-split-text > *");
          blocks.forEach((blk, i, all) => {
            const br = blk.getBoundingClientRect();
            edges.push(br.top + sy);
            if (i === all.length - 1) edges.push(br.bottom + sy);
          });
          edges.sort((p, q) => p - q);
          nextHosts.set(k, host);
        }
        s.y = y;
        s.end = end;
        geom.current[k] = { top, bottom, splitTop, edges, windowEl, host, bw, bh };
      });
      ownExtents.current = OWN_ITEMS.flatMap((item) => {
        const box = itemBox(item);
        if (!box) return [];
        const r = box.getBoundingClientRect();
        return [[r.top + sy, r.bottom + sy] as [number, number]];
      });
      setHosts((prev) => {
        if (prev.size === nextHosts.size && [...nextHosts].every(([k, h]) => prev.get(k) === h)) return prev;
        return nextHosts;
      });
      step.current();
    };

    // measure once now and on any size change (batched into one frame)
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        measure.current();
      });
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    window.addEventListener("resize", schedule);
    const offScroll = scrollY.on("change", () => step.current());

    // the pointer shift: eased toward the pointer (≤ POINTER_PX), a rAF only
    // while it settles; mouse only, never while motion is off
    let praf = 0;
    const settle = () => {
      praf = 0;
      const p = ptr.current;
      p.x += (p.tx - p.x) * 0.08;
      p.y += (p.ty - p.y) * 0.08;
      const done = Math.abs(p.tx - p.x) < 0.05 && Math.abs(p.ty - p.y) < 0.05;
      if (done) {
        p.x = p.tx;
        p.y = p.ty;
      }
      step.current();
      if (!done) praf = requestAnimationFrame(settle);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !settings.current.on) return;
      const p = ptr.current;
      p.tx = ((e.clientX / window.innerWidth) * 2 - 1) * POINTER_PX;
      p.ty = ((e.clientY / window.innerHeight) * 2 - 1) * POINTER_PX;
      if (!praf) praf = requestAnimationFrame(settle);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // the window arrival is a scroll star (B19): the spotlight owns its span
    const stars: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>("[data-stage-window][data-beat-star]").forEach((el) => {
      const id = el.dataset.beat;
      const w = Number(el.dataset.beatWeight ?? 1);
      if (id) stars.push(spotlight.registerScrollStar(id, el, w === 3 ? 3 : w === 2 ? 2 : 1));
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (praf) cancelAnimationFrame(praf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onPointer);
      offScroll();
      stars.forEach((off) => off());
      mark(new Set());
    };
  }, [scrollY]);

  // motion / desktop / tab / variant changes: re-run the step (motion off
  // also drops the pointer shift, so a resume starts from the pose)
  useEffect(() => {
    if (!on) Object.assign(ptr.current, { tx: 0, ty: 0, x: 0, y: 0 });
    step.current();
  }, [on, cameraVariant, openingVariant, visibleDoc, loops, depths]);

  // after every mount change: forget unmounted layers' readiness (a
  // remounted <img> fires `load` again) and write the new layers' values
  useEffect(() => {
    for (const k of ready.current) if (!mounted.includes(k)) ready.current.delete(k);
    for (const e of els.current.values()) {
      e.o = -1;
      e.t = "";
      e.c = "";
      e.s = -1;
      e.f = "";
      e.g = -1;
      e.org = "";
      e.row = "";
    }
    step.current();
  }, [mounted, hosts, depths]);

  // leaving: drop liveness
  useEffect(
    () => () => {
      if (live.current) {
        live.current = false;
        document.documentElement.removeAttribute("data-stage");
        emit("stage:live", { on: false });
      }
    },
    [],
  );

  const onReady = (k: number, img: HTMLImageElement) => {
    const done = () => {
      ready.current.add(k);
      if (!live.current) {
        live.current = true;
        document.documentElement.setAttribute("data-stage", "live");
        emit("stage:live", { on: true });
      }
      step.current();
    };
    if (typeof img.decode === "function") img.decode().then(done, done);
    else done();
  };

  type Part = "layer" | "cam" | "soft" | "video" | "far" | "near" | "grade";
  const bind = (k: number, part: Part) => (el: HTMLElement | null) => {
    let e = els.current.get(k);
    if (!e) {
      e = {
        layer: null, cam: null, soft: null, video: null, far: null, near: null, grade: null,
        o: -1, t: "", c: "", s: -1, f: "", g: -1, org: "", row: "",
      };
      els.current.set(k, e);
    }
    if (part === "soft") e.soft = el as HTMLImageElement | null;
    else e[part] = el as HTMLDivElement | null;
    if (!e.layer && !e.cam && !e.soft && !e.video && !e.far && !e.near && !e.grade) els.current.delete(k);
  };

  const weatherRun = new Set(weatherOn ? weatherOn.split(",").map(Number) : []);

  const layer = (k: number) => {
    const s = SHOTS[k];
    const plate = PLATES[k];
    if (!plate) return null;
    const split = s.mode === "split";
    const [fx, fy] = plate.focal;
    const position = `${fx * 100}% ${fy * 100}%`;
    const depth = depths[k];
    const grade = GRADES[k];
    const weather = s.cue.weather;
    // the far and near copies share these props: the same URL, one decode
    const img = {
      src: plate.src,
      alt: "",
      fill: true,
      loading: "eager",
      sizes: split ? STAGE_IMAGE.windowSizes : STAGE_IMAGE.backdropSizes,
      quality: split ? STAGE_IMAGE.quality : STAGE_IMAGE.backdropQuality,
      style: { objectFit: "cover", objectPosition: position },
    } as const;
    return (
      <div key={k} ref={bind(k, "layer")} className="stage-layer" data-stage-layer={k} data-mode={s.mode} style={{ opacity: 0 }}>
        <div ref={bind(k, "cam")} className="stage-cam" style={{ transformOrigin: position }} data-depth={depth ? "" : undefined}>
          {depth ? (
            <>
              <div ref={bind(k, "far")} className="plate-far">
                <Image {...img} alt="" onLoad={(e) => onReady(k, e.currentTarget)} />
              </div>
              <div ref={bind(k, "near")} className="plate-depth-near">
                <Image {...img} alt="" />
              </div>
            </>
          ) : (
            <Image {...img} alt="" onLoad={(e) => onReady(k, e.currentTarget)} />
          )}
          <div ref={bind(k, "video")} className="stage-video-host" />
          {split ? (
            // the rack-focus copy: the soft rung stretched (never `filter`)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={bind(k, "soft")}
              src={plate.soft}
              alt=""
              decoding="async"
              className="stage-soft"
              style={{ objectPosition: position }}
            />
          ) : null}
        </div>
        {grade ? <div ref={bind(k, "grade")} className="plate-grade" style={{ backgroundColor: grade }} /> : null}
        {weather && on ? (
          split ? (
            <WeatherImpl kind={weather} zone="window" run={weatherRun.has(k)} seed={k} />
          ) : (
            // a backdrop: the outer gutters only (never behind the text column)
            <>
              <div className="plate-gutter" data-side="left">
                <WeatherImpl kind={weather} zone="image" count={6} run={weatherRun.has(k)} seed={k * 2} />
              </div>
              <div className="plate-gutter" data-side="right">
                <WeatherImpl kind={weather} zone="image" count={6} run={weatherRun.has(k)} seed={k * 2 + 1} />
              </div>
            </>
          )
        ) : null}
      </div>
    );
  };

  const vk = video.k;
  const vLoop = vk >= 0 ? loops[vk] : null;
  const vFocal = vk >= 0 ? PLATES[vk]?.focal : undefined;

  return (
    <>
      <div ref={rootRef} className="stage-root" data-stage-root="" aria-hidden="true" style={{ visibility: "hidden" }}>
        {mounted.filter((k) => SHOTS[k].mode === "backdrop").map(layer)}
      </div>
      {mounted
        .filter((k) => SHOTS[k].mode === "split")
        .map((k) => {
          const host = hosts.get(k);
          return host ? createPortal(layer(k), host, `stage-${k}`) : null;
        })}
      <StageVideo host={video.host} loop={vLoop} focal={vFocal} play={video.play && on} />
    </>
  );
}

export default Stage;
