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
 * It pauses while the tab is hidden, unmounts when it leaves view or loses
 * the decoder (it waits in the lock's queue and resumes when re-granted),
 * and on a rejected play() or a load error it unmounts for good (poster).
 *
 * `object-position` comes from the asset's `focal`. Decorative media
 * (manifest alt null) is aria-hidden with alt="". If the poster hasn't
 * decoded after loader.showDelayMs (400 ms) the world's mini loader shows,
 * centred in the reserved box (aria-hidden; it idle-stops at 5 s).
 */
export type MediaFrameState = "poster" | "starting" | "playing" | "failed";

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
  /** Loader world (default: the nearest WorldProvider). */
  world?: WorldId;
  className?: string;
  onStateChange?: (state: MediaFrameState) => void;
};

const DESKTOP = "(min-width: 64rem) and (pointer: fine)";

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
  const desktop = useMediaQuery(DESKTOP);
  const visible = useDocumentVisible();

  const boxRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [loaderDue, setLoaderDue] = useState(false);

  // One decoder claim id per frame (lazy, stable across renders).
  const [claimId] = useState(() => Symbol(`media:${media}`));
  const holdsDecoder = useSyncExternalStore(
    subscribeDecoder,
    () => decoderHolder() === claimId,
    () => false,
  );

  const deviceOk = playOn === "any" || (playOn === "desktop" && desktop);
  const eligible = Boolean(video) && !reduced && !saveData && deviceOk && !failed;

  // In view? Drives both the decoder claim and the pending-poster loader.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(Boolean(e?.isIntersecting)), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Want the decoder while eligible + in view; queue (wait) when refused.
  const wantVideo = eligible && inView;
  useEffect(() => {
    if (!wantVideo) return;
    acquireDecoder(claimId, { priority: decoderPriority, wait: true, label: media });
    return () => releaseDecoder(claimId);
  }, [wantVideo, claimId, decoderPriority, media]);

  // Poster still pending 400 ms after the frame came into view → the
  // world's mini loader (a lazy offscreen poster is not "pending" yet).
  useEffect(() => {
    if (!loader || !still || !inView || posterLoaded) return;
    const t = window.setTimeout(() => setLoaderDue(true), loaderTiming.showDelayMs);
    return () => window.clearTimeout(t);
  }, [loader, still, inView, posterLoaded]);

  const mountVideo = wantVideo && holdsDecoder && video !== null;
  const [playing, setPlaying] = useState(false);
  const state: MediaFrameState = failed
    ? "failed"
    : mountVideo
      ? playing
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
          className={fitClass}
          style={objectPosition ? { objectPosition } : undefined}
          onLoad={() => setPosterLoaded(true)}
        />
      ) : null}

      {mountVideo && video ? (
        <VideoLayer
          src={video.src}
          loop={loop}
          active={visible}
          className={fitClass}
          objectPosition={objectPosition}
          onMount={() => setPlaying(false)}
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
  loop,
  active,
  className,
  objectPosition,
  onMount,
  onPlaying,
  onFail,
}: {
  src: string;
  loop: boolean;
  active: boolean;
  className: string;
  objectPosition?: string;
  onMount: () => void;
  onPlaying: () => void;
  onFail: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);
  const mounted = useEffectEvent(onMount);
  const fail = useEffectEvent(onFail);

  // A fresh layer: the frame's previous "playing" is stale until this one plays.
  useEffect(() => {
    mounted();
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
      src={src}
      muted
      playsInline
      loop={loop}
      preload="auto"
      aria-hidden="true"
      disablePictureInPicture
      className={cn(
        "absolute inset-0 size-full transition-opacity duration-(--dur-preview)",
        className,
        shown ? "opacity-100" : "opacity-0",
      )}
      style={objectPosition ? { objectPosition } : undefined}
      onPlaying={() => {
        setShown(true);
        onPlaying();
      }}
      onError={() => onFail()}
    />
  );
}
