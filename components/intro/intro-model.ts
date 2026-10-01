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
     every overlay string may render in this build (SPEC §9.6 via
     copyVisible: on this branch `film.branchPreview` shows `proposed` copy
     and quotes in every build; with it off, in dev only until Aryan's
     sign-off — the intro is never shipped half-worded).

   VARIANTS (M1.5; lib/variants.ts pieces intro.play · intro.flight ·
   intro.codeflight · intro.landing). The model ships the data of BOTH sides
   (the ALT flight clip + its own trail, the tower the ALT code flight
   circles, the ink and fold parameters); WHICH side plays is decided before
   the first paint by the head script (./variant-snippet.ts: the manifest
   choice `introVariant` + `?variant=…`), which sets html.intro-alt-<piece>
   and window.__introV for the controller. The play-screen plates stay
   IN-01 / IN-01m on both sides: both flight clips START on IN-01, and the
   broom masks are measured on these files (IN-01-alt / IN-01m-alt are not
   pixel-registered to either flight).

   PHASE 3 (P3-3, PHASE3-SPEC §4): the model also ships the hand-off — the
   warm-up / hold / hydration timings, the reveal feather, the canvas DPR
   cap, the hero loop for every hero.plate × hero.loop side (the warm-up
   prefetches the one that will play; "hero.loop" is a pre-paint piece now),
   the codec question for every video (lib/codec.ts, the same rule as
   MediaFrame), the L05 living play screen (`loopFor("IN-01")`, null until
   that loop is registered), the opening titles' timings and copy
   (`titles.1..3`, intro.titles DEFAULT three cards / ALT credit roll) and
   the overlay's "Skip to the research" fast lane.
   ========================================================================== */

import { film, type CaptionWorld } from "@/lib/film";
import {
  acts,
  anchorId,
  copyText,
  copyVisible,
  hrefOfType,
  intensityOf,
  introVariant,
  sectionById,
  variantChoiceOf,
  worksInUse,
} from "@/lib/sections";
import {
  altOf,
  getMedia,
  isUsable,
  registeredTo,
  resolveMedia,
  resolveVariant,
  type MediaAsset,
  type MediaId,
} from "@/lib/media";
import { codecConfigs } from "@/lib/codec";
import { loopFor } from "@/lib/loops";
import { dur, ease, easeClip, easeDraw, intro as introTiming } from "@/lib/motion";
import type { Variant } from "@/lib/variants";
import { quotes, type QuoteId } from "@/lib/quotes";
import trailDefault from "./intro-trail.json";
import trailAlt from "./intro-trail-alt.json";
import { INTRO_CONTROLLER_VERSION } from "./controller-version";
import { prepaintVariants } from "./prepaint-variants";
import type { PrepaintVariants } from "./variant-snippet";

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

/** The castle's tallest tower on each play-screen plate (0-1 of the plate,
 *  measured on the files 2026-09-29 on 10% grids): the ALT code flight
 *  (intro.codeflight "tower-spiral") circles it. `x` = the tower's axis,
 *  `top` = the spire tip, `base` = the foot of the tower body at the
 *  roofline, `hw` = the body's half-width (by plate width). */
const TOWER: Record<"IN-01" | "IN-01m", { x: number; top: number; base: number; hw: number }> = {
  "IN-01": { x: 0.784, top: 0.031, base: 0.35, hw: 0.02 },
  "IN-01m": { x: 0.637, top: 0.14, base: 0.3, hw: 0.033 },
};

/** Per flight clip (keyed by media id): its baked light trail — tracked by
 *  eye on THAT clip, so it never follows the other clip's broom — and
 *  whether its last frame is registered to the hero plate (tail-anchored:
 *  the mask-sweep landing reveals no seam). A clip without an entry flies
 *  with no trail and lands with a crossfade. */
type TrailJson = { emitUntil: number; points: number[][] };
/** `loopAt` (P3-3, optional 0-credit media): the hero loop's start time (s)
 *  when this clip's last frames were re-blended into the loop's first ones
 *  (a true match cut); unset → the loop starts at 0 under the hold. */
const FLIGHTS: Partial<Record<MediaId, { trail: TrailJson; anchored: boolean; cut?: number; loopAt?: number }>> = {
  "IN-02": { trail: trailDefault, anchored: true },
  // the IN-02 batch runner-up: last frame SSIM 0.957 vs MV-01 (not tail-anchored).
  // cut 2.9 s (M2 critic 3 #8): the broom plunges into the crest at ~3.1 s
  // in a rectangular foam burst with a hard right edge — the flight hands
  // off to the hero BEFORE it, on its last clean frame (held under the
  // landing)
  "IN-02-alt": { trail: trailAlt, anchored: false, cut: 2.9 },
};

/** A video the controller may play or prefetch: both encodes, the frame
 *  size and the MediaCapabilities question it asks (lib/codec.ts
 *  codecConfigs, so it answers exactly as MediaFrame does). */
export type IntroVideo = {
  mp4: string;
  webm: string | null;
  w: number;
  h: number;
  codec: ReturnType<typeof codecConfigs>;
};

export type IntroFlight = IntroVideo & {
  dur: number;
  /** Frame rate of the encode (the hold is the last presented frame). */
  fps: number;
  /** The hero loop's start time (s) after this flight (FLIGHTS loopAt). */
  loopAt: number;
  /** The last frame is the hero plate (the sweep may reveal it seamlessly). */
  anchored: boolean;
  /** The bristle-end path on the video clock, or null (no light trail). */
  trail: { emitUntil: number; points: number[][] } | null;
  /** Hand off to the hero at this video time (s), holding that frame under
   *  the landing; null = land on the clip's own end. */
  cut: number | null;
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
  /** The tallest tower (the ALT code flight's spiral axis). */
  tower: { x: number; top: number; base: number; hw: number };
};

export type IntroConfig = {
  /** Landscape play screen (IN-01) — also the flight's first frame. */
  plate: IntroPlate;
  /** Portrait play screen (IN-01m) — always the code flight. */
  plateM: IntroPlate;
  /** IN-02 when its media status is usable, else null (code flight only). */
  flight: IntroFlight | null;
  /** intro.flight ALT: IN-02's registered alternate (IN-02-alt) when it is
   *  usable and STARTS on the play plate, else null (the ALT then plays the
   *  default clip). */
  flightAlt: IntroFlight | null;
  /** Timings in ms (lib/motion.ts `intro.*` and `dur.*`). */
  t: {
    /** The reveal wipe (S3r; easeClip). */
    landing: number;
    /** Warm-up lead before the hold (S2w). */
    warm: number;
    /** The hold's caps: the hero loop's `playing`, <PageHydrated/>. */
    handoffMax: number;
    hydrateMax: number;
    /** The frozen trail canvas fades out (WAAPI opacity). */
    trailFade: number;
    /** L05's still crossfades into the flight's first frame. */
    liveFade: number;
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
    /** intro.landing ALT "map-fold": the overlay folds away (dur.hero). */
    fold: number;
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
  /** intro.play ALT "marauders-ink": an ink route draws itself up to Play
   *  and a line of footprints walks it; the bracket inks in on arrival.
   *  Lengths in css px (× `k` at ≥ 1024, × `kLite` below), times in ms. */
  ink: {
    color: string;
    k: number;
    kLite: number;
    /** Footprint spacing along the route; side offset of each print. */
    stride: number;
    side: number;
    /** The route ends this far below Play (never under a text box, I18). */
    gap: number;
    /** Half-width of the ink corridor that draws in on hover / focus. */
    corridor: number;
    routeMs: number;
    stepAt: number;
    stepMs: number;
    /** The walk always ends by then (static long before S0c, I20). */
    walkMaxMs: number;
    fadeInMs: number;
    holdMs: number;
    fadeOutMs: number;
    routeAlpha: number;
    printAlpha: number;
  };
  /** intro.codeflight ALT "tower-spiral": fractions of the code flight's
   *  normalised time for the lift (to the tower foot) and the exit (straight
   *  up), `turns` round the tower in between, the orbit radius as a multiple
   *  of the tower's half-width, the broom's length on the orbit as a multiple
   *  of that radius, and the floor of its end-on foreshortening (so it never
   *  shrinks to a speck at the orbit's sides). */
  spiral: { turns: number; radius: number; span: number; minLen: number; lift: number; exit: number };
  /** intro.landing ALT: the page turns away on a hinge at its right edge. */
  foldDeg: number;
  foldPerspective: number;
  /** The reveal's feather (a fraction of the viewport width). */
  feather: number;
  /** Canvas DPR cap (trail, hold, shade). */
  dprMax: number;
  /** The hero loop per hero.plate side, per hero.loop side (a video
   *  registered to that still, as hero-section.tsx resolves it), or null:
   *  the hero keeps its still (no prefetch, no wait at the hold). */
  heroLoops: Record<Variant, Record<Variant, IntroVideo | null>>;
  /** B00 / L05: the living play screen over IN-01 (`loopFor("IN-01")`), or
   *  null (today: the still). Desktop (not lite) only. */
  playLoop: IntroVideo | null;
  /** Opening titles timings in ms (lib/motion.ts `intro.titles`). */
  titles: {
    capOut: number;
    first: number;
    step: number;
    card: number;
    enter: number;
    exit: number;
    total: number;
    rise: number;
  };
};

/** The opening titles' copy (PHASE3-SPEC §4.3; `titles.1..3`, proposed +
 *  unsigned): card 3 sets the first act's title through <Lettered>. */
export type IntroTitles = {
  one: string;
  two: string;
  three: { before: string; act: string; world: CaptionWorld; after: string };
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
  /** The opening titles, or null (their copy may not render in this build:
   *  the controller then keeps the old 2.5 s caption linger). */
  titles: IntroTitles | null;
  /** "Skip to the research" in the skip row (DESKTOP_WIDE), or null. */
  fastLane: { label: string; href: string } | null;
  config: IntroConfig;
};

/** The registry pieces the intro plays (lib/variants.ts, host "intro"). */
export const INTRO_VARIANT_KEYS = [
  "intro.play",
  "intro.flight",
  "intro.codeflight",
  "intro.landing",
  "intro.titles",
] as const;

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
    tower: TOWER[id],
  };
}

function videoOf(a: MediaAsset): IntroVideo {
  return {
    mp4: a.src,
    webm: a.webm ?? null,
    w: a.width,
    h: a.height,
    codec: codecConfigs({ width: a.width, height: a.height }),
  };
}

/** The loop hero-section.tsx plays over `still`'s `plateV` side for
 *  `loopV`: a VIDEO registered to that very still, else null. */
function heroLoopOver(still: MediaId, plateV: Variant, loop: MediaId | undefined, loopV: Variant): IntroVideo | null {
  const s = resolveVariant(still, plateV);
  const l = s && loop ? resolveVariant(loop, loopV) : null;
  return s && l && l.kind === "video" && registeredTo(l, s.id) ? videoOf(l) : null;
}

/** The opening titles' copy, or null when any of it may not render. */
function titlesModel(): IntroTitles | null {
  const first = acts[0];
  if (!first) return null;
  const one = copyText("titles.1");
  const two = copyText("titles.2", { WORKS: worksInUse.map((w) => w.title.toUpperCase()).join(" • ") });
  const three = copyText("titles.3");
  const [before, after] = three.text.split("{ACT}");
  if (after === undefined || !copyVisible(first.title)) return null;
  if (![one, two, three].every(copyVisible)) return null;
  return {
    one: one.text,
    two: two.text,
    three: { before, act: first.title.text, world: first.world, after },
  };
}

/** A flight clip the prologue may play: a usable video that STARTS on the
 *  play plate (its poster), capped at maxFlightS (+0.2 s of encode slack).
 *  `heroStill` = the hero's default plate: a clip that ends anywhere else
 *  is never treated as anchored. */
function flightOf(
  a: MediaAsset | null,
  startsOn: string,
  heroStill: string | null,
  maxS: number,
): IntroFlight | null {
  if (!a || a.kind !== "video" || !isUsable(a.status) || a.poster !== startsOn) return null;
  const known = FLIGHTS[a.id];
  return {
    ...videoOf(a),
    dur: Math.min(a.durationS ?? maxS, maxS + 0.2),
    fps: 24,
    loopAt: known?.loopAt ?? 0,
    anchored: Boolean(known?.anchored && heroStill && a.endsOn === heroStill),
    trail: known ? { emitUntil: known.trail.emitUntil, points: known.trail.points } : null,
    cut: known?.cut ?? null,
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
  const hero = sectionById(p.landsOn);
  const land = hero ? (anchorId(hero) ?? null) : null;
  const heroStill = hero?.type === "hero" ? hero.props.media : null;

  const f = getMedia(p.flight as MediaId);
  const flight = flightOf(f, p.poster, heroStill, p.maxFlightS);
  const altId = altOf(p.flight as MediaId);
  const flightAlt = flight && altId ? flightOf(getMedia(altId), p.poster, heroStill, p.maxFlightS) : null;
  const heroFocal = f.endsOn ? (getMedia(f.endsOn).focal as Pt | undefined) : undefined;
  const plate = plateOf(p.poster, flight ? (heroFocal ?? null) : null);
  const plateM = plateOf(p.posterMobile, null);
  if (!plate || !plateM) return null;

  // the hero loop per plate × loop side (hero-section.tsx: no loop below
  // `full` intensity), and the L05 living play screen
  const heroMedia = hero?.type === "hero" ? hero.props.media : null;
  const heroLoop = hero?.type === "hero" && intensityOf(hero) === "full" ? hero.props.loop : undefined;
  const loopsOf = (pv: Variant): Record<Variant, IntroVideo | null> => ({
    default: heroMedia ? heroLoopOver(heroMedia, pv, heroLoop, "default") : null,
    alt: heroMedia ? heroLoopOver(heroMedia, pv, heroLoop, "alt") : null,
  });
  const liveId = loopFor(p.poster as MediaId);
  const live = liveId ? resolveMedia(liveId) : null;
  const fastLabel = copyText("fastlane.label");
  const fastHref = hrefOfType("gauntlet");

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
    titles: titlesModel(),
    fastLane: fastHref && copyVisible(fastLabel) ? { label: fastLabel.text, href: fastHref } : null,
    config: {
      plate,
      plateM,
      flight,
      flightAlt,
      t: {
        landing: ms(introTiming.landing),
        warm: introTiming.warmMs,
        handoffMax: introTiming.handoffMaxMs,
        hydrateMax: introTiming.hydrateMaxMs,
        trailFade: introTiming.trailFadeMs,
        liveFade: introTiming.liveFadeMs,
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
        // the code path folds from domeAt: 1.2 + 0.85 s ≤ intro.mobileTotalMaxS
        fold: ms(dur.hero),
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
      ink: {
        // the LD-HP ink (#c9ac72), lifted a step so it reads on the lake
        color: "#d6bd88",
        k: 1.6,
        kLite: 1.25,
        stride: 22,
        side: 5,
        gap: 22,
        corridor: 11,
        routeMs: ms(dur.draw.med),
        stepAt: 250,
        stepMs: 170,
        walkMaxMs: 2400,
        fadeInMs: ms(dur.flash),
        holdMs: 1500,
        fadeOutMs: 700,
        routeAlpha: 0.42,
        printAlpha: 0.78,
      },
      spiral: { turns: 1.25, radius: 5, span: 1.8, minLen: 0.5, lift: 0.22, exit: 0.78 },
      foldDeg: 92,
      foldPerspective: 1600,
      feather: introTiming.feather,
      dprMax: introTiming.dprMax,
      heroLoops: { default: loopsOf("default"), alt: loopsOf("alt") },
      playLoop: live && live.kind === "video" ? videoOf(live) : null,
      titles: {
        capOut: ms(introTiming.titles.capOut),
        first: ms(introTiming.titles.first),
        step: ms(introTiming.titles.step),
        card: ms(introTiming.titles.card),
        enter: ms(introTiming.titles.enter),
        exit: ms(introTiming.titles.exit),
        total: ms(introTiming.titles.total),
        rise: introTiming.titles.rise,
      },
    },
  };
}

/** The pre-paint variant data for the head script (./variant-snippet.ts):
 *  the intro's pieces, plus the hero plate — the flight is registered to
 *  the DEFAULT hero plate only, so over the ALT plate it lands with a
 *  crossfade — and the hero loop (the warm-up prefetches the side that
 *  will play). */
export function introPrepaintVariants(): PrepaintVariants {
  const hero = sectionById(film.prologue.landsOn);
  return {
    ...prepaintVariants(introVariant, INTRO_VARIANT_KEYS),
    ...(hero ? prepaintVariants(variantChoiceOf(hero), ["hero.plate", "hero.loop"]) : {}),
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
    /** Variant pieces, resolved before the first paint (./variant-snippet.ts). */
    v: introPrepaintVariants(),
  };
}
