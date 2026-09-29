/* ============================================================================
   INTRO MODEL — everything the prologue (SPEC v2 §5, bars/intro.BAR.md)
   needs, derived on the server from the film layer, the media manifest and
   the motion tokens. Pure data: the overlay renders the copy, and the rest is
   serialized into <script type="application/json" id="intro-data"> for the
   vanilla controller (source components/intro/controller.js, served
   minified as public/intro/intro.js), which therefore contains no film
   titles, no quote text and no magic timings of its own.

   The prologue renders only when all of these hold (otherwise NO overlay
   markup and NO head script ship, so nothing can arm):
     film.enabled && film.prologue.enabled,
     both play-screen plates resolve to a usable image,
     every overlay string may render in this build (SPEC §9.6: `proposed`
     copy and quotes render in dev and FILM_PREVIEW=1 builds, and in
     production only after Aryan's sign-off — the intro is never shipped
     half-worded).
   ========================================================================== */

import { film } from "@/lib/film";
import { anchorId, copyText, copyVisible, sectionById, worksInUse } from "@/lib/sections";
import { getMedia, isUsable, resolveMedia, type MediaId } from "@/lib/media";
import { dur, ease, easeClip, easeDraw, intro as introTiming } from "@/lib/motion";
import { quotes, type QuoteId } from "@/lib/quotes";
import trail from "./intro-trail.json";
import { INTRO_CONTROLLER_VERSION } from "./controller-version";

/** public/intro/intro.js is served unhashed; its content hash (written by
 *  components/intro/build-controller.mjs) busts the cache. */
export const INTRO_CONTROLLER_SRC = `/intro/intro.js?v=${INTRO_CONTROLLER_VERSION}`;

type Pt = readonly [x: number, y: number];

/** The play-screen broom, measured on each plate file (0-1 of the plate,
 *  2026-09-28, checked by overlaying the masks on the files). `tip`/`end`
 *  pose the code-flight SVG broom exactly over the plate's broom; `handle`
 *  (a polyline of width `hw` × plate height) + `tail` (a polygon) are the
 *  mask the controller fills from the surroundings when the broom takes off.
 *  A new plate needs new numbers (the validator does not know them). */
const BROOM: Record<"IN-01" | "IN-01m", { tip: Pt; end: Pt; hw: number; handle: Pt[]; tail: Pt[] }> = {
  "IN-01": {
    tip: [0.543, 0.389],
    end: [0.928, 0.565],
    hw: 0.03,
    handle: [[0.543, 0.389], [0.58, 0.398], [0.62, 0.414], [0.656, 0.434], [0.69, 0.452], [0.715, 0.466], [0.742, 0.484], [0.76, 0.49]],
    tail: [[0.752, 0.468], [0.785, 0.478], [0.86, 0.505], [0.93, 0.54], [0.925, 0.585], [0.895, 0.605], [0.84, 0.59], [0.79, 0.535], [0.758, 0.51]],
  },
  "IN-01m": {
    tip: [0.254, 0.2707],
    end: [0.806, 0.372],
    hw: 0.016,
    handle: [[0.254, 0.2707], [0.3, 0.28], [0.35, 0.288], [0.4326, 0.3014], [0.5, 0.313], [0.549, 0.321], [0.584, 0.3277]],
    tail: [[0.582, 0.322], [0.64, 0.33], [0.72, 0.345], [0.8, 0.36], [0.808, 0.375], [0.78, 0.392], [0.7, 0.382], [0.63, 0.37], [0.585, 0.345]],
  },
};

export type IntroPlate = {
  src: string;
  /** The same plate without its broom (IN-01-empty / IN-01m-empty), or
   *  null: the code flight fills the broom mask from it, else from the
   *  plate's surroundings (pull-push). */
  empty: string | null;
  w: number;
  h: number;
  /** object-position fraction used for BOTH the canvas plate and the video. */
  pos: Pt;
  tip: Pt;
  end: Pt;
  hw: number;
  handle: Pt[];
  tail: Pt[];
};

export type IntroConfig = {
  /** Landscape play screen (IN-01) — also the flight's first frame. */
  plate: IntroPlate;
  /** Portrait play screen (IN-01m) — always the code flight. */
  plateM: IntroPlate;
  /** IN-02 when its media status is usable, else null (code flight only). */
  flight: { mp4: string; webm: string | null; dur: number } | null;
  trail: { emitUntil: number; points: number[][] };
  /** Timings in ms (lib/motion.ts `intro.*` and `dur.*`). */
  t: {
    landing: number;
    readyWait: number;
    loaderDelay: number;
    rest: number;
    mobileFlight: number;
    domeAt: number;
    dome: number;
    base: number;
    reveal: number;
    hero: number;
    preview: number;
    hiddenSkip: number;
  };
  /** The bolt-favicon egg (IC-HP-10) is on. */
  bolt: boolean;
  /** DOM id of the section the flight lands on (the hero); its h1 takes
   *  focus on exit. null → the first `main h1`. */
  land: string | null;
  /** The three motion curves (lib/motion.ts): all enters/exits, clip/inset
   *  openings (launch, dome), stroke draw-ons and the code-flight path. */
  ease: readonly number[];
  easeClip: readonly number[];
  easeDraw: readonly number[];
  /** Candle sprites (DESIGN v3 §6.1 `candle.*`; bar F1/F8 tune these). */
  candle: {
    /** Ambient sprites at ≥ 1024 / below (plus `ring` near the bracket). */
    ambient: number;
    ambientLite: number;
    ring: number;
    /** Distance from the bracket at rest and gathered (px). */
    ringRest: number;
    ringGather: number;
    bobPx: number;
    bobHz: readonly [number, number];
    /** Pointer parallax cap (px, fine pointer only). */
    parallaxPx: number;
  };
  /** Light-trail sprite caps: video flight / code flight. */
  trailMax: number;
  trailMaxLite: number;
  /** Trail sprite decay τ (ms). */
  trailTau: number;
};

export type IntroModel = {
  title: string;
  /** "AFTER" + the works in act order (the credit line wraps only at •). */
  creditLead: string;
  credits: string[];
  oath: QuoteId;
  play: string;
  skip: string;
  desc: string;
  loading: string;
  config: IntroConfig;
};

function quoteVisible(id: QuoteId): boolean {
  const q = quotes[id];
  return copyVisible({ text: q.text, status: q.status });
}

function plateOf(id: string, pos: Pt | null): IntroPlate | null {
  if (id !== "IN-01" && id !== "IN-01m") return null; // no broom measurements
  const a = resolveMedia(id as MediaId);
  // resolveMedia may walk to a fallback; the broom numbers are only valid
  // for the plate itself, so a fallback means "no prologue".
  if (!a || a.id !== id || a.kind !== "image") return null;
  const e = resolveMedia(`${id}-empty` as MediaId);
  return {
    src: a.src,
    // only the plate's own broom-less twin (never its fallback: registration)
    empty: e && e.id === `${id}-empty` && e.width === a.width && e.height === a.height ? e.src : null,
    w: a.width,
    h: a.height,
    pos: pos ?? ((a.focal as Pt | undefined) ?? [0.5, 0.5]),
    ...BROOM[id],
  };
}

/** The prologue's data, or null when it must not render at all. */
export function introModel(): IntroModel | null {
  const p = film.prologue;
  if (!film.enabled || !p.enabled) return null;

  const texts = {
    title: copyText("intro.title"),
    play: copyText("intro.play"),
    skip: copyText("intro.skip"),
    desc: copyText("intro.desc"),
    loading: copyText("intro.loading"),
  };
  if (!Object.values(texts).every(copyVisible)) return null;
  if (!quoteVisible("Q-HP-1")) return null;

  // The flight (IN-02) lands on the hero plate, so the video — and therefore
  // the landscape plate, which IS its first frame — use the hero plate's
  // focal as object-position (SPEC §5.5 registration).
  const f = getMedia(p.flight as MediaId);
  const flightOk = isUsable(f.status) && f.kind === "video";
  const heroFocal = f.endsOn ? (getMedia(f.endsOn).focal as Pt | undefined) : undefined;
  const plate = plateOf(p.poster, flightOk ? (heroFocal ?? null) : null);
  const plateM = plateOf(p.posterMobile, null);
  if (!plate || !plateM) return null;

  const hero = sectionById(p.landsOn);
  const land = hero ? (anchorId(hero) ?? null) : null;

  const eggs = film.eggs;
  const bolt = eggs.enabled && Boolean(eggs.list.find((e) => e.id === "bolt-favicon")?.enabled);
  const ms = (s: number) => Math.round(s * 1000);

  return {
    title: texts.title.text,
    creditLead: "After",
    credits: worksInUse.map((w) => w.title),
    oath: "Q-HP-1",
    play: texts.play.text,
    skip: texts.skip.text,
    desc: texts.desc.text,
    loading: texts.loading.text,
    config: {
      plate,
      plateM,
      flight: flightOk
        ? { mp4: f.src, webm: f.webm ?? null, dur: Math.min(f.durationS ?? p.maxFlightS, p.maxFlightS + 0.2) }
        : null,
      trail: { emitUntil: trail.emitUntil, points: trail.points },
      t: {
        landing: ms(introTiming.landing),
        readyWait: introTiming.readyWaitMs,
        loaderDelay: introTiming.loaderDelayMs,
        rest: introTiming.motesRestMs,
        mobileFlight: ms(introTiming.mobileFlightS),
        // SPEC §5.4: the dome exit starts at 1.2 s and rises for 0.6 s, so
        // the lite path lands at 1.8 s (≤ intro.mobileTotalMaxS 2.4 s).
        domeAt: 1200,
        dome: 600,
        base: ms(dur.base),
        reveal: ms(dur.reveal),
        hero: ms(dur.hero),
        preview: ms(dur.preview),
        hiddenSkip: 30000,
      },
      bolt,
      land,
      ease,
      easeClip,
      easeDraw,
      candle: {
        ambient: 16,
        ambientLite: 8,
        ring: 12,
        ringRest: 120,
        ringGather: 72,
        bobPx: 4,
        bobHz: [0.15, 0.25],
        parallaxPx: 8,
      },
      trailMax: 48,
      trailMaxLite: 24,
      trailTau: 600,
    },
  };
}

/** The config the pre-paint head script needs (tiny; inlined in <head>). */
export function introHeadConfig() {
  return {
    src: INTRO_CONTROLLER_SRC,
    failsafe: introTiming.failsafeMs,
    /** Routes the prologue may arm on (it lands on the home hero). `?intro=1`
     *  forces it anywhere, e.g. a future /lab/intro. */
    paths: ["/"],
  };
}
