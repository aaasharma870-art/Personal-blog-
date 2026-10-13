"use client";

import Image from "next/image";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { CSSProperties } from "react";
import {
  DESKTOP_FINE,
  useDocumentVisible,
  useMediaQuery,
  useReducedMotion,
  useSaveData,
} from "@/lib/flags";
import {
  acquireDecoder,
  decoderHolder,
  releaseDecoder,
  subscribeDecoder,
} from "@/lib/decoder-lock";
import { codecKnown, handoffSource, pickCodec, type CodecEntry, type CodecPick } from "@/lib/codec";
import { getMedia, resolveMedia, type MediaAsset, type MediaId } from "@/lib/media";
import { loader as loaderTiming } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { WorldId } from "@/lib/worlds";
import { Loader } from "@/components/primitives/loader";

/**
 * MediaFrame — the one way media reaches the page (DESIGN v2 §7, SPEC §14).
 * Resolves a manifest id (lib/media.ts `resolveMedia`, walking `fallback`),
 * so a planned/missing asset never 404s or leaves an empty rectangle.
 *
 * POSTER FIRST. The still renders through next/image (lazy by default;
 * `priority` = the LCP plate only: preloaded, eager). A video is swapped in
 * ONLY after its `playing` event, fading over dur.preview — until then, and
 * forever when anything fails, the poster is what you see.
 *
 * A <video> element is MOUNTED (and so requested) only when ALL hold:
 *   the resolved asset is a video · motion is on (OS reduced motion and the
 *   Pause toggle both mean poster-only, 0 video bytes) · no Save-Data /
 *   2G / 3G · `playOn` allows this device (default "desktop" = ≥ 1024 px +
 *   fine pointer: mobile gets 0 bytes of video) · the frame is in view
 *   (IntersectionObserver) · it holds the page-wide DecoderLock.
 * It pauses while the tab is hidden and unmounts when it leaves view. On a
 * rejected play() or a load error it unmounts for good (poster).
 *
 * ONE DECODER, OUTGOING AS A STILL (PHASE3-SPEC §3.2, P3-5; W2-PLATES). A
 * loop that loses the DecoderLock (a higher or newer claim) PAUSES on its
 * current frame (it is the still the incoming video crossfades from), waits
 * in the lock's queue, and unmounts after PARK_MS unless it is re-granted
 * first. GL (lib/gl/gl-lock.ts): `gl:frame` on the <video> (GL took one
 * frame and paused it) keeps the loop paused with the lock RELEASED;
 * `gl:release` re-claims it (still in view, motion on) and resumes, the
 * paused frame standing in while it waits. An inline frame inside a stage
 * backdrop the live stage is showing (`.stage-backdrop` within
 * `[data-stage-on]`, re-checked on the stage's `stage:cover` window event)
 * plays like `playOn="never"`: the stage owns the decoder there.
 *
 * CODEC (PHASE3-SPEC §6.3; lib/codec.ts): the encode is `pickCodec()`'s
 * (the WebM twin only when MediaCapabilities says it decodes smooth and
 * power-efficient and the H.264 does not), set as `video.src` directly;
 * the video mounts once the answer is known (cached per page, so usually at
 * once). The intro's prefetched hand-off (`handoffSource`) is played from
 * its `blob:` URL at its start time. `fade` overrides the poster → video
 * crossfade (s): the hero passes 0 under the intro's hold, where loop
 * frame 0 IS the poster (a match cut needs no fade).
 *
 * `object-position` comes from the asset's `focal`. Decorative media
 * (manifest alt null) is aria-hidden with alt="". If the poster hasn't
 * decoded after loader.showDelayMs (400 ms) the world's mini loader shows,
 * centred in the reserved box (aria-hidden; it idle-stops at 5 s).
 */
/** `paused`: the loop's frame is held without the decoder (parked, or GL
 *  holds it); its video is mounted but not decoding. */
export type MediaFrameState = "poster" | "starting" | "playing" | "paused" | "failed";

type MediaFrameProps = {
  media: MediaId;
  /** Override the poster still (default: the asset's `poster`, or itself). */
  poster?: MediaId;
  /** The page's LCP plate only (MV-01, MV-02 on mobile). */
  priority?: boolean;
  /** next/image sizes (default "100vw"). */
  sizes?: string;
  fit?: "cover" | "contain";
  /** "fill" covers the positioned parent; "intrinsic" reserves the asset's
   *  aspect ratio (or `ratio`) so there is no layout shift. */
  layout?: "fill" | "intrinsic";
  ratio?: number;
  radius?: "none" | "frame";
  /** Where video may play (default "desktop": ≥ 1024 px + fine pointer). */
  playOn?: "desktop" | "any" | "never";
  loop?: boolean;
  /** DecoderLock priority (default 0; the intro flight outranks loops). */
  decoderPriority?: number;
  /** Mini world loader while the poster is pending (default true). */
  loader?: boolean;
  /** Poster → video crossfade in seconds (default dur.preview); 0 = cut. */
  fade?: number;
  /** Loader world (default: the nearest WorldProvider). */
  world?: WorldId;
  className?: string;
  onStateChange?: (state: MediaFrameState) => void;
};

/** How long a paused (outgoing) loop keeps its frame without the decoder. */
const PARK_MS = 1500;
/** Then its frame fades to the poster over this long before the <video>
 *  unmounts (P3-11 r1 integration, F2: the swap was one frame). */
const LEAVE_MS = 320;

function focalPosition(asset: MediaAsset | null): string | undefined {
  const f = asset?.focal;
  return f ? `${(f[0] * 100).toFixed(2)}% ${(f[1] * 100).toFixed(2)}%` : undefined;
}

export function MediaFrame({
  media,
  poster,
  priority = false,
  sizes = "100vw",
  fit = "cover",
  layout = "intrinsic",
  ratio,
  radius = "none",
  playOn = "desktop",
  loop = true,
  decoderPriority = 0,
  loader = true,
  fade,
  world,
  className,
  onStateChange,
}: MediaFrameProps) {
  const asset = resolveMedia(media);
  const video = asset?.kind === "video" ? asset : null;
  const posterId = poster ?? (asset?.kind === "image" ? asset.id : asset?.poster);
  const still = posterId ? resolveMedia(posterId) : null;
  const decorative = (asset ?? (posterId ? getMedia(posterId) : null))?.alt == null;
  const objectPosition = focalPosition(asset) ?? focalPosition(still);

  const reduced = useReducedMotion();
  const saveData = useSaveData();
  // the Phase-3 desktop gate (lib/flags.ts): ≥ 64rem, hover, fine pointer
  const desktop = useMediaQuery(DESKTOP_FINE);
  const visible = useDocumentVisible();

  const boxRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [loaderDue, setLoaderDue] = useState(false);
  // under a stage backdrop the live stage is showing (see the header)
  const [covered, setCovered] = useState(false);
  // GL holds the loop's frame (gl:frame → gl:release); parked = paused
  // without the decoder, its frame shown as the still (PARK_MS)
  const [glHold, setGlHold] = useState(false);
  const [parked, setParked] = useState(false);
  /** The parked frame is fading to the poster (LEAVE_MS), then unmounts. */
  const [leaving, setLeaving] = useState(false);
  const layerOn = useRef(false);

  // One decoder claim id per frame (lazy, stable across renders).
  const [claimId] = useState(() => Symbol(`media:${media}`));
  const holdsDecoder = useSyncExternalStore(
    subscribeDecoder,
    () => decoderHolder() === claimId,
    () => false,
  );

  const deviceOk = !covered && (playOn === "any" || (playOn === "desktop" && desktop));
  const eligible = Boolean(video) && !reduced && !saveData && deviceOk && !failed;

  // In view? Drives both the decoder claim and the pending-poster loader.
  // Covered by the stage? Re-read when it comes into view and whenever the
  // stage re-marks its sections (`stage:cover`).
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const cover = () => setCovered(Boolean(el.closest(".stage-backdrop")?.closest("[data-stage-on]")));
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(Boolean(e?.isIntersecting));
        cover();
      },
      { threshold: 0 },
    );
    io.observe(el);
    window.addEventListener("stage:cover", cover);
    return () => {
      io.disconnect();
      window.removeEventListener("stage:cover", cover);
    };
  }, []);

  // Want the decoder while eligible + in view (and GL is not holding the
  // frame); queue (wait) when refused. Preempted while playing → park.
  const wantVideo = eligible && inView;
  useEffect(() => {
    if (!wantVideo || glHold) return;
    acquireDecoder(claimId, {
      priority: decoderPriority,
      wait: true,
      label: media,
      onRevoke: () => {
        if (!layerOn.current) return;
        setParked(true);
        setLeaving(false);
      },
    });
    return () => releaseDecoder(claimId);
  }, [wantVideo, glHold, claimId, decoderPriority, media]);

  // a parked loop gives its frame up after PARK_MS (unless re-granted: then
  // it plays on; the flag is moot while it holds the decoder): its frame
  // fades to the poster under it over LEAVE_MS, then the layer unmounts
  useEffect(() => {
    if (!parked || glHold) return;
    const t = window.setTimeout(() => setLeaving(true), PARK_MS);
    return () => window.clearTimeout(t);
  }, [parked, glHold]);
  const leavingNow = leaving && parked && !holdsDecoder && !glHold;
  useEffect(() => {
    if (!leavingNow) return;
    const t = window.setTimeout(() => {
      setParked(false);
      setLeaving(false);
    }, LEAVE_MS);
    return () => window.clearTimeout(t);
  }, [leavingNow]);

  // Poster still pending 400 ms after the frame came into view → the
  // world's mini loader (a lazy offscreen poster is not "pending" yet).
  useEffect(() => {
    if (!loader || !still || !inView || posterLoaded) return;
    const t = window.setTimeout(() => setLoaderDue(true), loaderTiming.showDelayMs);
    return () => window.clearTimeout(t);
  }, [loader, still, inView, posterLoaded]);

  // The encode (lib/codec.ts): known at once from the page cache (the intro
  // controller fills it for the hero loop), else asked once, async. Read
  // only while the frame wants its video, which is never during hydration.
  const codecEntry: CodecEntry | null = video
    ? { src: video.src, webm: video.webm, width: video.width, height: video.height }
    : null;
  const [askedPick, setAskedPick] = useState<CodecPick | null>(null);
  const asked =
    askedPick && codecEntry && (askedPick.src === codecEntry.src || askedPick.src === codecEntry.webm)
      ? askedPick
      : null;
  const pick = wantVideo && codecEntry ? (codecKnown(codecEntry) ?? asked) : null;
  const needPick = wantVideo && codecEntry !== null && pick === null;
  const codecSrc = codecEntry?.src;
  const codecWebm = codecEntry?.webm;
  const codecW = codecEntry?.width ?? 0;
  const codecH = codecEntry?.height ?? 0;
  useEffect(() => {
    if (!needPick || !codecSrc) return;
    let live = true;
    void pickCodec({ src: codecSrc, webm: codecWebm, width: codecW, height: codecH }).then((p) => {
      if (live) setAskedPick(p);
    });
    return () => {
      live = false;
    };
  }, [needPick, codecSrc, codecWebm, codecW, codecH]);

  const mountVideo = wantVideo && (holdsDecoder || parked || glHold) && video !== null && pick !== null;
  // the intro's prefetched hand-off (a blob: URL + its start), else the pick
  const handoff = mountVideo && pick ? handoffSource(pick.src) : null;
  const [playing, setPlaying] = useState(false);
  const state: MediaFrameState = failed
    ? "failed"
    : mountVideo
      ? !holdsDecoder || glHold
        ? "paused"
        : playing
          ? "playing"
          : "starting"
      : "poster";

  const reportState = useEffectEvent((s: MediaFrameState) => onStateChange?.(s));
  useEffect(() => {
    reportState(state);
  }, [state]);

  const box: CSSProperties | undefined =
    layout === "intrinsic"
      ? { aspectRatio: String(ratio ?? (asset ? asset.width / asset.height : 16 / 9)) }
      : undefined;
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div
      ref={boxRef}
      aria-hidden={decorative ? true : undefined}
      data-media={media}
      data-media-state={state}
      className={cn(
        "overflow-hidden",
        layout === "fill" ? "absolute inset-0" : "relative w-full",
        radius === "frame" && "rounded-frame",
        className,
      )}
      style={box}
    >
      {still ? (
        <Image
          src={still.src}
          alt={decorative ? "" : (still.alt ?? "")}
          fill
          sizes={sizes}
          preload={priority}
          // the LCP plate also outranks the early scripts and fonts (M5:
          // mobile LCP; next/image's preload link carries it too)
          fetchPriority={priority ? "high" : undefined}
          className={fitClass}
          style={objectPosition ? { objectPosition } : undefined}
          onLoad={() => setPosterLoaded(true)}
        />
      ) : null}

      {mountVideo && video && pick ? (
        <VideoLayer
          // a new pick remounts the layer; the hand-off blob arriving late
          // does not (VideoLayer keeps the source it mounted with)
          key={pick.src}
          src={handoff?.url ?? pick.src}
          start={handoff?.at ?? 0}
          fade={fade}
          leaving={leavingNow}
          loop={loop}
          active={visible && holdsDecoder && !glHold}
          className={fitClass}
          objectPosition={objectPosition}
          onMount={() => {
            layerOn.current = true;
            setPlaying(false);
          }}
          onGl={(held) => {
            // null: the layer unmounted (nothing to hold or park any more)
            if (held === null) layerOn.current = false;
            setGlHold(Boolean(held));
            setParked(held === false);
            setLeaving(false);
          }}
          onPlaying={() => setPlaying(true)}
          onFail={() => {
            setFailed(true);
            setPlaying(false);
          }}
        />
      ) : null}

      {loader && still && loaderDue && !posterLoaded ? (
        <span className="absolute inset-0 grid place-items-center">
          <Loader world={world} size="mini" delayMs={0} />
        </span>
      ) : null}
    </div>
  );
}

/** The <video> itself: muted, inline, no controls, aria-hidden. Mounted only
 *  while the frame may decode; its opacity stays 0 until `playing` fires. */
function VideoLayer({
  src,
  start,
  fade,
  leaving,
  loop,
  active,
  className,
  objectPosition,
  onMount,
  onGl,
  onPlaying,
  onFail,
}: {
  src: string;
  /** Start time (s): the intro hand-off's `loopAt` (0 = the top). */
  start: number;
  /** Crossfade override (s); undefined = dur.preview (the CSS token). */
  fade?: number;
  /** The parked frame fades out to the poster (LEAVE_MS) before unmount. */
  leaving: boolean;
  loop: boolean;
  active: boolean;
  className: string;
  objectPosition?: string;
  onMount: () => void;
  /** GL holds this frame (true, `gl:frame`), hands it back (false,
   *  `gl:release`), or the layer unmounted (null). */
  onGl: (held: boolean | null) => void;
  onPlaying: () => void;
  onFail: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);
  // The source is fixed for the life of this layer: the intro's prefetched
  // loop can resolve to a blob: URL after the video mounted, and swapping
  // `src` then would reload the element and leave it paused on frame 0
  // (the play effect only re-runs on `active`). A remount (mountVideo
  // toggling, or a new pick) reads the hand-off afresh.
  const [first] = useState(() => ({ src, start }));
  const mounted = useEffectEvent(onMount);
  const gl = useEffectEvent(onGl);
  const fail = useEffectEvent(onFail);

  // A fresh layer: the frame's previous "playing" is stale until this one
  // plays. GL's hand-off events arrive on the <video> itself (they bubble).
  useEffect(() => {
    mounted();
    const v = ref.current;
    const hold = () => gl(true);
    const back = () => gl(false);
    v?.addEventListener("gl:frame", hold);
    v?.addEventListener("gl:release", back);
    return () => {
      v?.removeEventListener("gl:frame", hold);
      v?.removeEventListener("gl:release", back);
      gl(null);
    };
  }, []);

  // Play while the tab is visible, pause while hidden. A rejected play()
  // (autoplay policy, unsupported source) keeps the poster for good — but an
  // AbortError only means pause()/unmount interrupted a pending play(), which
  // is ours, not a failure (e.g. the Pause toggle while the video starts).
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let current = true;
    if (active) {
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.catch((err: unknown) => {
          const aborted = err instanceof DOMException && err.name === "AbortError";
          if (current && !aborted) fail();
        });
      }
    } else {
      v.pause();
    }
    return () => {
      current = false;
    };
  }, [active]);

  return (
    <video
      ref={ref}
      src={first.src}
      muted
      playsInline
      loop={loop}
      preload="auto"
      aria-hidden="true"
      disablePictureInPicture
      className={cn(
        "absolute inset-0 size-full transition-opacity duration-(--dur-preview)",
        className,
        shown && !leaving ? "opacity-100" : "opacity-0",
      )}
      style={{
        ...(objectPosition ? { objectPosition } : null),
        ...(leaving ? { transitionDuration: `${LEAVE_MS}ms` } : fade !== undefined ? { transitionDuration: `${fade}s` } : null),
      }}
      onLoadedMetadata={(e) => {
        // the hand-off's match frame (FLIGHTS[*].loopAt), set before play
        const at = first.start;
        if (at > 0 && at < (e.currentTarget.duration || 0)) e.currentTarget.currentTime = at;
      }}
      onPlaying={() => {
        setShown(true);
        onPlaying();
      }}
      onError={() => onFail()}
    />
  );
}
