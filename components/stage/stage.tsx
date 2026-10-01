"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useScroll } from "motion/react";
import { emit } from "@/lib/events";
import { film, type ActSpec } from "@/lib/film";
import { useDesktopFine, useDocumentVisible, useReducedMotion } from "@/lib/flags";
import { loopFor } from "@/lib/loops";
import { resolveMedia, type MediaAsset, type MediaId } from "@/lib/media";
import { pageItems } from "@/lib/sections";
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
  type StageShot,
} from "@/lib/stage";
import { useVariant } from "@/lib/use-variant";
import { StageVideo } from "./stage-video";

/* ============================================================================
   THE PERSISTENT STAGE (spec §3.2, P3-2) — OWNER: B1-STAGE (W1), W2-PLATES (W2).
   Loaded by <StageGate/> (next/dynamic, ssr: false) at ladder step 3 on
   DESKTOP_FINE with motion on: phones, reduced motion and a paused view
   never fetch this chunk.

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
   without Lenis). Anchors and extents are measured once and on
   ResizeObserver(document.body) / resize, never per frame. Per frame:
   stageAt(scrollY + innerHeight, shots, { fade: 40vh }) picks the shot in
   force (`a`), the next (`b`) and the crossfade `mix` (b's opacity); each
   mounted layer gets its camera pose (stage.camera: DEFAULT the cue's own
   drift / push / pan, ALT a push toward the focal point), a split window's
   arrival (B19: the plate slides in over 40vh) and its rack focus (the
   384 px rung's opacity). Transform / opacity only; values are written
   only when they change.

   LIVENESS. The first decoded plate sets html[data-stage="live"] (+ the
   `stage:live` event). A section turns transparent only when the stage
   marks it `[data-stage-on]` (its layer mounted, decoded and near), and
   only inside the boot gate while not paused (app/p3/stage.css): there is
   never a blank transparent section.

   ONE DECODER. <StageVideo/> plays the loop of the settled shot (`mix` ≤
   .02 or ≥ .98: posters during every crossfade), when one is registered to
   its plate (loopFor, DP-5; `plates.loops` ALT → its alt or none), the
   shot is on screen and no `own` section is within one viewport.

   MOTION OFF (Pause / OS reduced motion mid-session): the CSS hides every
   layer at once and drops the transparency; here the video stops, the
   `data-stage-on` marks go and per-frame work halts. 0 layout shift.
   ========================================================================== */

type Plate = {
  id: MediaId;
  src: string;
  focal: readonly [number, number];
  /** The rack-focus copy: the 384 px rung of the same plate. */
  soft: string;
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
};

type LayerEls = {
  layer: HTMLDivElement | null;
  cam: HTMLDivElement | null;
  soft: HTMLImageElement | null;
  video: HTMLDivElement | null;
  /** last written values (skip unchanged writes) */
  o: number;
  t: string;
  c: string;
  s: number;
};

type VideoState = { k: number; host: HTMLElement | null; play: boolean };
const NO_VIDEO: VideoState = { k: -1, host: null, play: false };

const FADE_VH = 0.4;
const MOUNT_MARGIN_VH = 0.5;
const OWN_CLEAR_VH = 1;

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
  return { id: a.id, src: a.src, focal: a.focal ?? [0.5, 0.5], soft: first || props.src };
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

/* — the shots (static: the manifest never changes on the client) ———————— */
const acts = film.acts as readonly ActSpec[];
const SHOTS: readonly StageShot[] = stageShots(stageCues(pageItems, (id) => acts.find((a) => a.id === id)?.stage));
/** Items that own their plates and decoder (`own`): the video keeps clear. */
const OWN_ITEMS: readonly string[] = stageCues(pageItems).filter((c) => c.mode === "own").map((c) => c.item);
const PLATES: readonly (Plate | null)[] = SHOTS.map((s) => plateOf(s.cue.media));
/** Whether shot k is the first shot shown in its split window. */
const FIRST_IN_WINDOW: readonly boolean[] = SHOTS.map(
  (s, k) => s.mode === "split" && SHOTS.findIndex((o) => o.mode === "split" && o.item === s.item) === k,
);

export function Stage() {
  const reduced = useReducedMotion();
  const fine = useDesktopFine();
  const visibleDoc = useDocumentVisible();
  const cameraVariant = useVariant(null, "stage.camera");
  const loopVariant = useVariant(null, "plates.loops");
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
  const settings = useRef({ on, cameraVariant, visibleDoc });

  const [mounted, setMounted] = useState<readonly number[]>([]);
  const [hosts, setHosts] = useState<ReadonlyMap<number, HTMLElement>>(new Map());
  const [video, setVideo] = useState<VideoState>(NO_VIDEO);
  const videoRef = useRef<VideoState>(NO_VIDEO);

  const loops = useMemo(
    () => PLATES.map((p) => (p ? loopFor(p.id, loopVariant) : null)),
    [loopVariant],
  );
  const loopsRef = useRef(loops);

  // the per-frame step, built once; it reads everything through refs
  const step = useRef<() => void>(() => {});
  const measure = useRef<() => void>(() => {});

  useEffect(() => {
    settings.current = { on, cameraVariant, visibleDoc };
    loopsRef.current = loops;
  });

  useEffect(() => {
    const root = rootRef.current;

    const setRoot = (shown: boolean) => {
      if (!root || rootShown.current === shown) return;
      rootShown.current = shown;
      root.style.visibility = shown ? "visible" : "hidden";
    };

    const mark = (want: Set<HTMLElement>) => {
      for (const el of marked.current) {
        if (!want.has(el)) el.removeAttribute("data-stage-on");
      }
      for (const el of want) {
        if (!marked.current.has(el)) el.setAttribute("data-stage-on", "");
      }
      marked.current = want;
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

    let lastMounted = "";

    step.current = () => {
      const { on: motionOn, cameraVariant: cv, visibleDoc: docOn } = settings.current;
      if (!motionOn) {
        mark(new Set());
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

      // per layer: opacity, arrival, camera, rack focus
      let rootWanted = false;
      const want = new Set<HTMLElement>();
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
        const plate = PLATES[k];
        const pose = stageCamera(s.cue.camera, shotLocal(sy, vh, { y: s.y, end: s.end }), plate?.focal, cv);
        if (e) write(e, o, t, poseTransform(pose), soft);
      }
      setRoot(rootWanted);
      mark(want);

      // the one video: the settled shot, on screen, clear of own sections
      const kv = mix <= 0.02 ? ka : mix >= 0.98 ? kb : -1;
      let play = false;
      let host: HTMLElement | null = null;
      if (kv >= 0 && near.includes(kv) && ready.current.has(kv) && loopsRef.current[kv] && docOn) {
        const m = g[kv];
        const onScreen = m !== null && m.top < sy + vh && m.bottom > sy;
        const clear = !ownExtents.current.some(([t0, t1]) => t0 < sy + vh + OWN_CLEAR_VH * vh && t1 > sy - OWN_CLEAR_VH * vh);
        host = els.current.get(kv)?.video ?? null;
        play = onScreen && clear && host !== null;
      }
      const v = videoRef.current;
      if (v.k !== kv || v.host !== host || v.play !== play) {
        videoRef.current = { k: kv, host, play };
        setVideo(videoRef.current);
      }
    };

    measure.current = () => {
      const vh = window.innerHeight;
      vhRef.current = vh;
      const sy = window.scrollY;
      const nextHosts = new Map<number, HTMLElement>();
      SHOTS.forEach((s, k) => {
        const anchor = document.getElementById(s.anchor) ?? itemBox(s.item);
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
          split.querySelectorAll<HTMLElement>("[data-stage-block]").forEach((blk, i, all) => {
            const br = blk.getBoundingClientRect();
            edges.push(br.top + sy);
            if (i === all.length - 1) edges.push(br.bottom + sy);
          });
          edges.sort((p, q) => p - q);
          nextHosts.set(k, host);
        }
        s.y = y;
        s.end = end;
        geom.current[k] = { top, bottom, splitTop, edges, windowEl, host };
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

    // the window arrival is a scroll star (B19): the spotlight owns its span
    const stars: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>("[data-stage-window][data-beat-star]").forEach((el) => {
      const id = el.dataset.beat;
      const w = Number(el.dataset.beatWeight ?? 1);
      if (id) stars.push(spotlight.registerScrollStar(id, el, w === 3 ? 3 : w === 2 ? 2 : 1));
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      offScroll();
      stars.forEach((off) => off());
      mark(new Set());
    };
  }, [scrollY]);

  // motion / desktop / tab / variant changes: re-run the step
  useEffect(() => {
    step.current();
  }, [on, cameraVariant, visibleDoc, loops]);

  // after every mount change: forget unmounted layers' readiness (a
  // remounted <img> fires `load` again) and write the new layers' values
  useEffect(() => {
    for (const k of ready.current) if (!mounted.includes(k)) ready.current.delete(k);
    for (const e of els.current.values()) {
      e.o = -1;
      e.t = "";
      e.c = "";
      e.s = -1;
    }
    step.current();
  }, [mounted, hosts]);

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

  const bind = (k: number, part: "layer" | "cam" | "soft" | "video") => (el: HTMLElement | null) => {
    let e = els.current.get(k);
    if (!e) {
      e = { layer: null, cam: null, soft: null, video: null, o: -1, t: "", c: "", s: -1 };
      els.current.set(k, e);
    }
    if (part === "layer") e.layer = el as HTMLDivElement | null;
    else if (part === "cam") e.cam = el as HTMLDivElement | null;
    else if (part === "soft") e.soft = el as HTMLImageElement | null;
    else e.video = el as HTMLDivElement | null;
    if (!e.layer && !e.cam && !e.soft && !e.video) els.current.delete(k);
  };

  const layer = (k: number) => {
    const s = SHOTS[k];
    const plate = PLATES[k];
    if (!plate) return null;
    const split = s.mode === "split";
    const [fx, fy] = plate.focal;
    const origin = `${fx * 100}% ${fy * 100}%`;
    const style = { opacity: 0 } as CSSProperties;
    return (
      <div key={k} ref={bind(k, "layer")} className="stage-layer" data-stage-layer={k} data-mode={s.mode} style={style}>
        <div ref={bind(k, "cam")} className="stage-cam" style={{ transformOrigin: origin }}>
          <Image
            src={plate.src}
            alt=""
            fill
            loading="eager"
            sizes={split ? STAGE_IMAGE.windowSizes : STAGE_IMAGE.backdropSizes}
            quality={split ? STAGE_IMAGE.quality : STAGE_IMAGE.backdropQuality}
            style={{ objectFit: "cover", objectPosition: origin }}
            onLoad={(e) => onReady(k, e.currentTarget)}
          />
          <div ref={bind(k, "video")} className="stage-video-host" />
          {split ? (
            // the rack-focus copy: the 384 px rung stretched (never `filter`)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={bind(k, "soft")}
              src={plate.soft}
              alt=""
              decoding="async"
              className="stage-soft"
              style={{ objectPosition: origin }}
            />
          ) : null}
        </div>
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
