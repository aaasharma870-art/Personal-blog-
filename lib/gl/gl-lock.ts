/* ============================================================================
   GL LOCK — the contained WebGL layer's runtime (PHASE3-SPEC §3.3, §7.6,
   §12.1). Lazy (the GL chunk); framework-free. OWNER: W2-GL.

   ONE CONTEXT, ONE CANVAS, re-parented between the card hosts (the four
   frames are ≥ 1 viewport apart): the visible, live, ready host nearest the
   viewport centre owns it; a host mid-transition (0 < p < 1) on screen is
   never robbed. The context is the tier probe (support.ts): created once.

   TIMING: nothing before ladder step 4. Context creation, the noise, each
   program compile (+ KHR_parallel_shader_compile polling) and each SDF
   slice run as separate onIdle slices once a host is ≤ 2 viewports away;
   plates are fetched + decoded off-thread once ≤ 1 viewport away and each
   is uploaded in its own slice. No slice runs while a visible card's p is
   moving (180 ms quiet), under Pause / reduced motion, or on a hidden tab.
   A queued job nobody needs any more (its host left) is dropped and frees
   what it holds (a decoded plate's ImageBitmap).

   TIER SWITCH ONLY AT p ENDS: a ready owner engages at p ≤ 0 or p ≥ 1
   once p has been still for 180 ms — one draw, a .2 s fade-in, then
   `data-gl="on"` on the closest `[data-act-card-frame]` (CARDS hides
   `[data-gl-replaced]` under it). If p moves during the fade, the fade
   aborts (back to css) and engages again at the next end. A plate that
   fails to load keeps the card on css (retried on the next approach).
   Reduced motion / Pause / a lost context disengage at once (the card shows
   its static / css frame); anything else waits for the next end.

   DRAW ONLY ON p CHANGE: one coalesced rAF per change (p, the kraken), plus
   the 120 ms flash / 520 ms bloom impact pulse. 0 rAF at rest, offscreen or hidden.
   BUDGET: ≤ 3 plates and ≤ 25 MB of textures (LRU; an offscreen owner's
   plates give way to the card approaching), buffer ≤ 1922×804. With no
   host left (Pause, reduced motion, a resize, tier css) the plates, titles
   and SDF cache are freed; the one context stays.
   VIDEO: GL never decodes video. When it engages over the from plate's
   playing loop it takes ONE texImage2D frame (drawn for p ≤ 0 too, so the
   plate never pops when p leaves 0), pauses the loop (`gl:frame`, bubbling
   from the <video>) and hands it back on disengage (`gl:release`).
   Debug: `window.__gl` (lib/gl/gl-debug.ts, its own chunk: only under
   `?gl=force`, `?debug=gl` or on /lab/).
   ========================================================================== */

import type { MotionValue } from "motion/react";
import { on } from "../events";
import { motionOffNow, onMotionOffChange } from "../flags";
import { onIdle } from "../idle";
import { whenLadder } from "../ladder";
import { getMedia, isMediaId, markOf, registeredTo, type MediaId } from "../media";
import { worldFontsMarked } from "../world-fonts";
import type { GlPeek } from "./gl-debug";
import { TITLE_ZOOM, frameAt, programsOf, titleXf, uniformsFor, type Geo } from "./plan";
import type { SdfTitle, TitleFont } from "./sdf-title";
import { fragment } from "./shaders";
import { glForced, glTier, onGlTierChange, setContextTier } from "./support";
import { cssRgb, loadBitmap, markIds, noiseTexture, plateAsset, plateUrl, rungOf, solidTexture } from "./textures";
import { createTransitionGL, type TransitionGL } from "./transition-gl";
import type { GlCardSpec, GlFlavour } from "./types";

const BUDGET = 25 * 2 ** 20;
const MAX_PLATES = 3;
const MAX_BUFFER = 1922 * 804;
const FADE_MS = 200;
const QUIET_MS = 180;
const DEEP: [number, number, number] = [0.04, 0.05, 0.07];

export type GlHostOptions = {
  el: HTMLDivElement;
  spec: GlCardSpec;
  p: MotionValue<number>;
  /** title.mask DEFAULT (the SDF knockout); ALT = no GL title */
  title: boolean;
  /** match.shape ALT (roll) */
  roll: boolean;
  onTier: (t: "gl" | "css") => void;
};

type Host = GlHostOptions & {
  frame: HTMLElement | null;
  near2: boolean;
  near1: boolean;
  visible: boolean;
  dist: number;
  cssW: number;
  state: "idle" | "fading" | "engaged";
  fade: number;
  deep: [number, number, number];
  from: string | null;
  to: string | null;
  aspFrom: number;
  aspTo: number;
  /** the ids whose marks describe the drawn from / to plates */
  mk: [MediaId[], MediaId[]];
  /** the title texture drawn (kept until the wanted one is uploaded) */
  titleKey: string | null;
  /** the title texture the current spec + face asks for */
  titleWant: string | null;
  titling: boolean;
  vid: { tex: WebGLTexture | null; aspect: number; el: HTMLVideoElement } | null;
  offs: (() => void)[];
};

type Tex = { tex: WebGLTexture | null; bytes: number; used: number; kind: "plate" | "title" | "fixed"; meta?: SdfTitle };
/** `want` false → the job is dropped (`drop` frees what it holds). */
type Job = { key: string; run: () => boolean; want?: () => boolean; drop?: () => void };

const c01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const now = () => performance.now();

let canvas: HTMLCanvasElement | null = null;
let tgl: TransitionGL | null = null;
let sdf: typeof import("./sdf-title") | null = null;
let failed = false;
let lost = false;
let owner: Host | null = null;
let raf = 0;
let retry = 0;
let lastMove = -1e9;
let clock = 0;
let installed = false;
let debug = false;
let ro: ResizeObserver | null = null;
let io: [IntersectionObserver, IntersectionObserver, IntersectionObserver] | null = null;
let flash = { t0: 0, dur: 0, amt: 0, bloom: false, raf: 0 };

const hosts = new Set<Host>();
const byEl = new Map<Element, Host>();
const texs = new Map<string, Tex>();
const loading = new Set<string>();
/** plate keys whose fetch / decode failed (cleared on the next approach) */
const broken = new Set<string>();
const queue: Job[] = [];
const queued = new Set<string>();
let pumping = false;

/* — debug (window.__gl, lib/gl/gl-debug.ts) ——————————————————————————— */

const dbg: GlPeek["dbg"] = { contexts: 0, draws: 0, compiles: [], log: [] };
const log = (ev: string, h?: Host) => {
  if (!debug) return;
  dbg.log.push({ t: Math.round(now()), ev, card: h?.spec.card, p: h ? Math.round(h.p.get() * 1000) / 1000 : undefined });
  if (dbg.log.length > 200) dbg.log.shift();
};
const moving = () => now() - lastMove < QUIET_MS;
/** The PAGE scrolled within QUIET_MS (any scroll, not only a card's p):
 *  the engage (mount, size, first draw) waits for it (P3-11 r1, F6 / J8
 *  #1: it ran inside the first scroll's observer pass, 180–350 ms). */
let lastScroll = -1e9;
const scrolling = () => now() - lastScroll < QUIET_MS;
/** The visibility observer's work (arbitrate + reprep), coalesced into
 *  ONE idle slice instead of running inside the observer callback. */
let arbiter: (() => void) | null = null;
function arbitrateSoon(): void {
  if (arbiter) return;
  arbiter = onIdle(
    () => {
      arbiter = null;
      arbitrate();
      if (!holds(owner)) reprep();
    },
    { timeout: 600 },
  );
}

/** WEBGL_lose_context, taken at creation (getExtension is null once lost). */
let loseExt: WEBGL_lose_context | null = null;

/* — the job queue (one job per idle slice) ———————————————————————————— */

/** false = a job with this key is already queued (nothing added). */
function enqueue(job: Job): boolean {
  if (queued.has(job.key)) return false;
  queued.add(job.key);
  queue.push(job);
  void pump();
  return true;
}

/** Resolves when a slice may run: motion on, tier gl, visible tab, no p
 *  moving (or nothing left that wants the work). */
function quiet(): Promise<void> {
  return new Promise((res) => {
    const check = () => {
      if (!hosts.size || (!motionOffNow() && glTier() === "gl" && !document.hidden && !moving())) res();
      else window.setTimeout(check, 120);
    };
    check();
  });
}

async function pump(): Promise<void> {
  if (pumping) return;
  pumping = true;
  await whenLadder(4);
  while (queue.length) {
    await quiet();
    await new Promise<void>((r) => onIdle(r, { timeout: 600 }));
    const job = queue[0];
    if (!job) break;
    const wanted = hosts.size > 0 && !lost && !(failed && job.key !== "ctx") && (!job.want || job.want());
    let done = true;
    if (!wanted) job.drop?.();
    else if (motionOffNow() || moving()) done = false;
    else {
      try {
        done = job.run();
      } catch (e) {
        job.drop?.();
        if (process.env.NODE_ENV !== "production") console.warn("[gl]", job.key, e);
      }
    }
    if (done && queue[0] === job) {
      queue.shift();
      queued.delete(job.key);
      hosts.forEach(tryEngage);
      arbitrate();
    }
  }
  pumping = false;
}

/* — context ———————————————————————————————————————————————————————————— */

function ctxJob(): boolean {
  if (tgl || failed) return true;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.dataset.glCanvas = "";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
  }
  dbg.contexts++;
  const forced = glForced();
  const t = createTransitionGL(canvas, forced);
  if (!t || (t.maxTex < 4096 && !forced)) {
    t?.gl.getExtension("WEBGL_lose_context")?.loseContext();
    failed = true;
    log(t ? "context:small" : "context:none");
    setContextTier("css");
    return true;
  }
  tgl = t;
  loseExt = t.gl.getExtension("WEBGL_lose_context");
  log("context");
  setContextTier("gl");
  return true;
}

function onLost(e: Event): void {
  e.preventDefault();
  lost = true;
  log("lost");
  hosts.forEach((h) => disengage(h, true));
  queue.forEach((j) => j.drop?.());
  queue.length = 0;
  queued.clear();
  texs.clear();
  loading.clear();
}

function onRestored(): void {
  if (!tgl) return;
  lost = false;
  tgl.reset();
  log("restored");
  hosts.forEach(prep);
}

/* — preparation ————————————————————————————————————————————————————————— */

function compileJob(f: GlFlavour): Job {
  let started = false;
  return {
    key: `c:${f}`,
    run: () => {
      if (!tgl) return true;
      if (!started) {
        if (tgl.ready(f)) return true;
        tgl.compile(f, fragment(f));
        if (debug) dbg.compiles.push({ t: Math.round(now()), flavour: f, moving: moving() });
        started = true;
        return false;
      }
      const r = tgl.poll(f);
      if (r === false) log(`compile:failed:${f}`);
      return r !== null;
    },
  };
}

const keysOf = (h: Host | null | undefined) => (h ? [h.from, h.to, h.titleKey, h.titleWant] : []);
const mid = (h: Host) => {
  const v = h.p.get();
  return v > 0 && v < 1;
};
/** The first host that needs plate `key` / title `key`. */
const plateHost = (key: string) => [...hosts].find((h) => h.from === key || h.to === key);
const titleHost = (key: string) => [...hosts].find((h) => h.titleWant === key);

/** Whether the owner still needs its textures: mid-transition, or on
 *  screen before p 1 (at p ≥ 1 it draws nothing). */
const holds = (o: Host | null): o is Host => !!o && (mid(o) || (o.visible && o.p.get() < 1));

/** LRU admission: make room for `bytes` (+1 plate) within ≤ 3 plates and
 *  ≤ 25 MB, evicting the least recently drawn texture that neither `h`
 *  (the host asking) nor a holding owner needs: an offscreen (or p ≥ 1)
 *  owner's plates give way to the card approaching (two 2048-rung plates
 *  are ≈ 19 MB). false = no room (skip; reprep() asks again). */
function admit(bytes: number, plate: boolean, h: Host | undefined): boolean {
  const keep = new Set(keysOf(h));
  if (holds(owner)) keysOf(owner).forEach((k) => keep.add(k));
  for (;;) {
    let total = bytes;
    let plates = plate ? 1 : 0;
    let victim = "";
    let used = Infinity;
    for (const [k, t] of texs) {
      total += t.bytes;
      if (t.kind === "plate") plates++;
      if (t.kind !== "fixed" && !keep.has(k) && t.used < used) {
        used = t.used;
        victim = k;
      }
    }
    if (plates <= MAX_PLATES && total <= BUDGET) return true;
    if (!victim) return false;
    evict(victim);
  }
}

/** Drop one texture; a host drawing it falls back to css at once (only an
 *  owner that no longer holds: offscreen, or at p ≥ 1 drawing nothing) and
 *  re-engages through ready(). */
function evict(k: string): void {
  tgl?.drop(texs.get(k)?.tex);
  texs.delete(k);
  hosts.forEach((x) => {
    if (x.state !== "idle" && keysOf(x).includes(k)) disengage(x, true);
  });
}

/** No host left or the tier off: drop the plates and titles (≤ 25 MB of
 *  GPU memory) and the SDF cache. The context, the noise and the programs
 *  stay (the one-context rule; all cheap). */
function free(): void {
  texs.forEach((t, k) => {
    if (t.kind === "fixed") return;
    tgl?.drop(t.tex);
    texs.delete(k);
  });
  sdf?.clearSdf();
}

function keep(key: string, tex: WebGLTexture | null, bytes: number, kind: Tex["kind"], meta?: SdfTitle) {
  texs.set(key, { tex, bytes, used: ++clock, kind, meta });
}

function platePrep(h: Host, which: "from" | "to"): void {
  const key = h[which];
  if (!key || texs.has(key) || loading.has(key) || broken.has(key)) return;
  const want = () => !!plateHost(key);
  if (key.startsWith("solid:")) {
    enqueue({
      key: `u:${key}`,
      want,
      run: () => {
        if (tgl) keep(key, tgl.texture(solidTexture(h.deep)), 4, "fixed");
        return true;
      },
    });
    return;
  }
  loading.add(key);
  const done = (bmp: ImageBitmap) => {
    bmp.close();
    loading.delete(key);
  };
  loadBitmap(key, rungOf(key, 1920), which === "from" ? h.aspFrom : h.aspTo).then(
    (bmp) => {
      // the context was lost meanwhile, or nobody needs the plate now
      if (!loading.has(key) || !want()) return done(bmp);
      const job: Job = {
        key: `u:${key}`,
        want,
        drop: () => done(bmp),
        run: () => {
          const bytes = bmp.width * bmp.height * 4;
          if (tgl && !lost && admit(bytes, true, plateHost(key))) keep(key, tgl.texture(bmp), bytes, "plate");
          done(bmp);
          return true;
        },
      };
      if (!enqueue(job)) bmp.close();
    },
    () => {
      // the card stays on css (the DOM plate shows); the next approach retries
      loading.delete(key);
      broken.add(key);
      log("plate:failed", h);
    },
  );
}

async function fontOf(h: Host): Promise<TitleFont> {
  // never force a world's face in from here (P3-11 r1, F6: forcing it could
  // swap the face while that world is on screen); WorldFonts adds the token
  // while the world is off screen: wait for it (≤ 8 s, a 250 ms poll, no
  // work), else set the title in the face that is there
  const w = h.spec.b.world;
  for (let i = 0; i < 32 && !worldFontsMarked().has(w); i++) await new Promise((r) => window.setTimeout(r, 250));
  const cs = getComputedStyle(h.el);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  const family = v("--world-font-head") || v("--world-font-act") || cs.fontFamily;
  const weight = /^\d+$/.test(v("--world-head-weight")) ? v("--world-head-weight") : "400";
  try {
    await document.fonts.load(`${weight} 100px ${family}`, h.spec.b.text);
  } catch {
    /* the fallback face still makes a title */
  }
  return { family, weight };
}

/** The face, then the SDF (its own chunk: the title.mask ALT never loads
 *  it) in idle slices, then one upload. An engaged host keeps drawing the
 *  title it has until the new one is in. */
function titlePrep(h: Host): void {
  if (h.titling) return;
  h.titling = true;
  void Promise.all([fontOf(h), import("./sdf-title")]).then(
    ([font, m]) => {
      sdf = m;
      h.titling = false;
      if (!hosts.has(h) || !h.title) return;
      const s = h.spec.b;
      const key = m.sdfKey(s.text, font, s.maskOrigin);
      h.titleWant = key;
      if (texs.has(key)) {
        h.titleKey = key;
        return;
      }
      const want = () => !!titleHost(key);
      const upload = (r: SdfTitle) =>
        enqueue({
          key: `u:${key}`,
          want,
          run: () => {
            if (tgl && admit(r.w * r.h, false, titleHost(key))) {
              keep(key, tgl.texture({ w: r.w, h: r.h, data: r.data, r8: true }), r.w * r.h, "title", r);
              hosts.forEach((x) => {
                if (x.titleWant === key) x.titleKey = key;
              });
              schedule();
            }
            return true;
          },
        });
      const hit = m.cachedSdf(key);
      if (hit) {
        upload(hit);
        return;
      }
      const st = m.sdfTitle(s.text, font, s.maskOrigin, tgl?.maxTex ?? 4096);
      enqueue({
        key: `s:${key}`,
        want,
        run: () => {
          if (!st.step()) return false;
          const r = st.result();
          if (r) upload(r);
          return true;
        },
      });
    },
    () => {
      h.titling = false;
    },
  );
}

/** Queue everything `h` needs (idempotent; called on approach + updates). */
function prep(h: Host): void {
  if (!h.near2 || failed || lost) return;
  enqueue({ key: "ctx", run: ctxJob });
  enqueue({
    key: "noise",
    run: () => {
      if (tgl && !texs.has("noise")) keep("noise", tgl.texture(noiseTexture()), 65536, "fixed");
      return true;
    },
  });
  for (const f of programsOf(h.spec, h.title)) enqueue(compileJob(f));
  if (h.title && !(h.titleKey && h.titleKey === h.titleWant && texs.has(h.titleKey))) titlePrep(h);
  if (h.near1 && h.cssW > 0) {
    if (!h.from || !h.to) keys(h);
    platePrep(h, "from");
    platePrep(h, "to");
  }
}

/** The texture keys (the optimized URL of the right rung) of h's plates,
 *  and where their marks come from (the asset actually drawn). */
function keys(h: Host): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const one = (id: MediaId, scale: number): [string, number] => {
    const a = plateAsset(id);
    if (!a) return [`solid:${h.deep.join(",")}`, 16 / 9];
    return [plateUrl(a, h.cssW * dpr * Math.max(1, scale)), a.width / a.height];
  };
  [h.from, h.aspFrom] = one(h.spec.a.from, h.spec.cover.from.scale);
  [h.to, h.aspTo] = one(h.spec.a.to, h.spec.cover.to.scale);
  h.mk = [markIds(h.spec.a.from), markIds(h.spec.a.to)];
}

/** The owner let go of its textures (left the screen, or reached p 1):
 *  the cards approaching that admit() refused ask again. */
function reprep(): void {
  hosts.forEach((x) => {
    if (x !== owner && x.near1 && !ready(x)) prep(x);
  });
}

function ready(h: Host): boolean {
  if (!tgl || lost || failed || !texs.has("noise")) return false;
  for (const f of programsOf(h.spec, h.title)) if (!tgl.ready(f)) return false;
  if (!h.from || !h.to || !texs.has(h.from) || !texs.has(h.to)) return false;
  return !h.title || (!!h.titleKey && h.titleKey === h.titleWant && texs.has(h.titleKey));
}

/* — ownership, engagement ————————————————————————————————————————————— */

function size(h: Host): void {
  if (!tgl) return;
  const r = h.el.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let w = Math.max(1, r.width * dpr);
  let ht = Math.max(1, r.height * dpr);
  const k = Math.min(1, Math.sqrt(MAX_BUFFER / (w * ht)));
  w = Math.round(w * k);
  ht = Math.round(ht * k);
  tgl.size(w, ht);
}

/** The visible host nearest the viewport centre owns the canvas (it then
 *  engages once ready, at a p end). A visible owner mid-transition keeps it. */
function arbitrate(): void {
  let best: Host | null = null;
  for (const h of hosts) if (h.visible && (!best || h.dist < best.dist)) best = h;
  if (!best || best === owner) {
    if (owner) tryEngage(owner);
    return;
  }
  if (owner && owner.visible && mid(owner)) return; // never rob a running transition
  if (owner) disengage(owner, false);
  owner = best;
  prep(owner);
  tryEngage(owner);
}

/** Re-parent the one canvas into `h` (contexts survive DOM moves). */
function mount(h: Host): void {
  if (!canvas || canvas.parentElement === h.el) return;
  h.el.appendChild(canvas);
  size(h);
  ro?.disconnect();
  ro = new ResizeObserver(() => {
    if (!owner) return;
    size(owner);
    schedule();
  });
  ro.observe(h.el);
}

/** Retry the owner's engage once p has been still for QUIET_MS. */
function later(): void {
  if (retry) return;
  retry = window.setTimeout(() => {
    retry = 0;
    if (owner) tryEngage(owner);
  }, QUIET_MS);
}

function tryEngage(h: Host): void {
  if (h !== owner || h.state !== "idle" || mid(h) || !ready(h) || glTier() !== "gl" || motionOffNow()) return;
  // only at a still p end: the fade never meets a scrub
  if (moving() || scrolling()) return later();
  mount(h);
  grab(h);
  draw(h);
  h.state = "fading";
  h.el.style.transition = `opacity ${FADE_MS}ms linear`;
  h.el.style.opacity = "1";
  h.fade = window.setTimeout(() => settle(h), FADE_MS);
  log("engage", h);
}

function settle(h: Host): void {
  if (h.state !== "fading") return;
  clearTimeout(h.fade);
  h.state = "engaged";
  h.el.style.transition = "none";
  h.frame?.setAttribute("data-gl", "on");
  h.onTier("gl");
  log("settle", h);
}

function disengage(h: Host, now_: boolean, ev = now_ ? "disengage:now" : "disengage"): void {
  release(h);
  if (h.state === "idle") return;
  clearTimeout(h.fade);
  h.frame?.removeAttribute("data-gl");
  h.el.style.transition = "none";
  h.el.style.opacity = "0";
  h.state = "idle";
  h.onTier("css");
  log(ev, h);
}

/** The from plate's loop, playing in the frame as GL engages (a p end,
 *  before the first draw): ONE texImage2D frame, then the loop is paused
 *  and handed off (`gl:frame`; LivePlate releases its decoder). Matched by
 *  the `[data-media]` around the <video> (MediaFrame's): the plate itself
 *  or a loop registered to it. */
function grab(h: Host): void {
  if (!tgl || h.vid || !h.frame) return;
  const id = h.spec.a.from;
  for (const v of h.frame.querySelectorAll("video")) {
    const m = v.closest("[data-media]")?.getAttribute("data-media") ?? "";
    if (v.paused || v.readyState < 2 || !v.videoWidth) continue;
    if (m !== id && !(isMediaId(m) && registeredTo(getMedia(m), id))) continue;
    h.vid = { tex: tgl.texture(v), aspect: v.videoWidth / v.videoHeight, el: v };
    v.pause();
    v.dispatchEvent(new CustomEvent("gl:frame", { bubbles: true }));
    log("video-frame", h);
    return;
  }
}

/** Hand the loop GL paused back (LivePlate resumes it on `gl:release`). */
function release(h: Host): void {
  const v = h.vid;
  if (!v) return;
  h.vid = null;
  tgl?.drop(v.tex);
  v.el.dispatchEvent(new CustomEvent("gl:release", { bubbles: true }));
}

/* — drawing ———————————————————————————————————————————————————————————— */

function flashNow(): [number, number] {
  if (!flash.dur) return [0, 0];
  const k = (now() - flash.t0) / flash.dur;
  if (k < 0 || k >= 1) return [0, 0];
  // up fast, then an ease-out decay (P3-11 r1 J8 #5: the bloom's linear
  // 180 ms tail read as a one-frame drop back to dark)
  const v = flash.amt * (k < 0.2 ? k / 0.2 : (1 - (k - 0.2) / 0.8) ** 2);
  return flash.bloom ? [0, v] : [v, 0];
}

function draw(h: Host): void {
  if (!tgl || lost || owner !== h || !canvas) return;
  const p = c01(h.p.get());
  const d = frameAt(h.spec, p, h.title);
  dbg.draws++;
  if (d.kind === "clear") return tgl.clear();
  const res: [number, number] = [canvas.width, canvas.height];
  const t = (k: string | null) => {
    const e = k ? texs.get(k) : undefined;
    if (e) e.used = ++clock;
    return e;
  };
  const title = d.kind === "title" ? t(h.titleKey) : undefined;
  const geo: Geo = {
    res,
    fromAspect: h.vid?.aspect ?? h.aspFrom,
    toAspect: h.aspTo,
    mark: (w, n) => {
      for (const id of h.mk[w === "from" ? 0 : 1]) {
        const m = markOf(id, n);
        if (m) return m;
      }
      return null;
    },
    deep: h.deep,
  };
  const u = uniformsFor(h.spec, d, geo, {
    p,
    kraken: h.spec.kraken?.get() ?? 0,
    flash: flashNow(),
    roll: h.roll,
    titleXf: title?.meta ? titleXf(title.meta, res, d.t, TITLE_ZOOM[h.spec.card]) : null,
  });
  const name = d.kind === "title" ? "title" : d.pass.flavour;
  tgl.draw(name, u, {
    uFrom: h.vid?.tex ?? t(h.from)?.tex,
    uTo: t(h.to)?.tex,
    uNoise: t("noise")?.tex,
    uTitle: title?.tex,
  });
}

function schedule(): void {
  if (raf || !owner || owner.state === "idle") return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    if (owner && owner.state !== "idle") draw(owner);
  });
}

function onP(h: Host): void {
  const v = h.p.get();
  const m = v > 0 && v < 1;
  if (m) lastMove = now();
  // p moved during the fade-in: back to css now, engage at the next end
  // (never a css → GL cross-fade mid-transition)
  if (h.state === "fading" && m) disengage(h, true, "abort");
  if (v >= 1 && h === owner) reprep();
  if (h.state === "idle") return tryEngage(h);
  schedule();
}

/* — install —————————————————————————————————————————————————————————————— */

function install(): void {
  if (installed) return;
  installed = true;
  debug = /[?&](?:gl=force|debug=gl)(?:&|$)/.test(location.search) || location.pathname.startsWith("/lab/");
  if (debug) {
    void import("./gl-debug").then(
      (m) => m.expose({ dbg, owner: () => owner?.spec.card ?? null, hosts, texs, ext: () => loseExt }),
      () => {},
    );
  }
  const near = (k: "near2" | "near1") => (es: IntersectionObserverEntry[]) => {
    es.forEach((e) => {
      const h = byEl.get(e.target);
      if (!h) return;
      // a new approach retries a plate that failed to load
      if (k === "near1" && e.isIntersecting && !h.near1) {
        for (const x of [h.from, h.to]) if (x) broken.delete(x);
      }
      h[k] = e.isIntersecting;
      if (e.boundingClientRect.width) h.cssW = e.boundingClientRect.width;
      prep(h);
    });
  };
  io = [
    new IntersectionObserver(near("near2"), { rootMargin: "200% 0px" }),
    new IntersectionObserver(near("near1"), { rootMargin: "100% 0px" }),
    new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          const h = byEl.get(e.target);
          if (!h) return;
          const r = e.boundingClientRect;
          h.visible = e.isIntersecting && e.intersectionRatio > 0;
          h.dist = Math.abs(r.top + r.height / 2 - (e.rootBounds?.height ?? window.innerHeight) / 2);
        });
        arbitrateSoon();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    ),
  ];
  const stopAll = () => {
    if (!motionOffNow() && glTier() === "gl") {
      // back on: re-arm (engages again at the next p end)
      hosts.forEach(prep);
      return arbitrate();
    }
    hosts.forEach((h) => disengage(h, true));
    cancelAnimationFrame(raf);
    cancelAnimationFrame(flash.raf);
    clearTimeout(retry);
    raf = retry = 0;
    flash.dur = 0;
    free();
  };
  onMotionOffChange(stopAll);
  onGlTierChange(stopAll);
  window.addEventListener(
    "scroll",
    () => {
      lastScroll = now();
    },
    { passive: true },
  );
  on("impact", ({ world }) => {
    const h = owner;
    if (!h || h.state === "idle" || !h.spec.flash || h.spec.b.world !== world || motionOffNow()) return;
    const bloom = world === "hp";
    flash = { t0: now(), dur: bloom ? 520 : 120, amt: h.spec.flash.amount, bloom, raf: 0 };
    const step = () => {
      if (owner && owner.state !== "idle") draw(owner);
      flash.raf = now() - flash.t0 < flash.dur ? requestAnimationFrame(step) : 0;
      if (!flash.raf) {
        flash.dur = 0;
        if (owner && owner.state !== "idle") draw(owner);
      }
    };
    flash.raf = requestAnimationFrame(step);
  });
}

/** Register one card frame host (GlFrame). Returns its handle. */
export function addHost(o: GlHostOptions): { update(o: Partial<GlHostOptions>): void; remove(): void } {
  install();
  const frame = o.el.closest<HTMLElement>("[data-act-card-frame]");
  const h: Host = {
    ...o,
    frame,
    near2: false,
    near1: false,
    visible: false,
    dist: Infinity,
    cssW: 0,
    state: "idle",
    fade: 0,
    deep: cssRgb(getComputedStyle(o.el).getPropertyValue("--bg"), DEEP),
    from: null,
    to: null,
    aspFrom: 16 / 9,
    aspTo: 16 / 9,
    mk: [[], []],
    titleKey: null,
    titleWant: null,
    titling: false,
    vid: null,
    offs: [],
  };
  const sub = (mv: MotionValue<number> | undefined, fn: () => void) => {
    if (mv) h.offs.push(mv.on("change", fn));
  };
  sub(h.p, () => onP(h));
  sub(h.spec.kraken, () => owner === h && schedule());
  hosts.add(h);
  byEl.set(o.el, h);
  io?.forEach((x) => x.observe(o.el));
  o.onTier("css");
  return {
    update(n) {
      const s = n.spec;
      const a = h.spec;
      const plates = !!s && (s.a.from !== a.a.from || s.a.to !== a.a.to);
      const kraken = !!s && s.kraken !== a.kraken;
      // by value: CARDS may rebuild the spec (and its maskOrigin tuple) per render
      const title =
        !!s &&
        (s.b.text !== a.b.text ||
          s.b.world !== a.b.world ||
          s.b.maskOrigin[0] !== a.b.maskOrigin[0] ||
          s.b.maskOrigin[1] !== a.b.maskOrigin[1]);
      Object.assign(h, n);
      if (plates) {
        // a variant switch (popstate), never a scroll: the new plates
        // engage at the next p end
        disengage(h, true);
        h.from = h.to = null;
      }
      // the drawn title stays until the new one is uploaded (titlePrep)
      if (title) h.titleWant = null;
      if (kraken) {
        h.offs.splice(1).forEach((f) => f());
        sub(h.spec.kraken, () => owner === h && schedule());
      }
      prep(h);
      if (owner === h) schedule();
    },
    remove() {
      disengage(h, true);
      h.offs.forEach((f) => f());
      io?.forEach((x) => x.unobserve(o.el));
      hosts.delete(h);
      byEl.delete(o.el);
      if (owner === h) {
        owner = null;
        ro?.disconnect();
        canvas?.remove();
      }
      if (!hosts.size) free();
      arbitrate();
    },
  };
}
