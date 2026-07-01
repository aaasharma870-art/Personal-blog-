"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SeamlessVideo — a genuinely seamless loop with no hard cut. Two stacked copies
 * of the same clip cross-dissolve at the loop point: as copy A nears its end,
 * copy B starts from 0 and A fades into B. When A ends it swaps roles. The result
 * is a continuous loop with a soft crossfade instead of an abrupt restart.
 * Mounted by AmbientBackground only while the section is in view, so only the
 * active section ever decodes video. Muted + playsInline (autoplay-safe).
 */
export function SeamlessVideo({
  src,
  webm,
  fade = 0.7,
  className,
}: {
  src: string;
  /**
   * Optional explicit WebM path. Opt-in only: when omitted (the default) NO
   * <source type="video/webm"> is rendered, so the browser never probes a
   * non-existent .webm sibling (which logged a 404 on every mount). The mp4
   * <source> remains the played format.
   */
  webm?: string;
  fade?: number;
  className?: string;
}) {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const singleRef = useRef<HTMLVideoElement>(null);
  // Lazy init reads hardwareConcurrency once. SeamlessVideo is a client-only
  // mount (AmbientBackground gates it post-hydration), so this never risks a
  // hydration mismatch; low-core clients render a single-decoder loop from the
  // first frame. Avoids a setState-in-effect.
  const [lowCore] = useState(
    () =>
      typeof navigator !== "undefined" &&
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 4,
  );

  // Low-end fallback: one decoder, native loop, hard cut (cheaper than 2× decode).
  useEffect(() => {
    if (!lowCore) return;
    const v = singleRef.current;
    if (!v) return;
    v.play().catch(() => {});
    return () => {
      v.pause();
    };
  }, [lowCore, src]);

  // Two-copy crossfade (default). Copy B is preload="metadata" and gets decode-
  // primed ~1s before the fade so it has frames ready without a 2nd eager decode.
  useEffect(() => {
    if (lowCore) return;
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    a.style.transition = `opacity ${fade}s linear`;
    b.style.transition = `opacity ${fade}s linear`;
    a.style.opacity = "1";
    b.style.opacity = "0";

    let cur = a;
    let nxt = b;
    let fading = false;
    let primed = false;
    let killed = false;

    const tick = () => {
      if (killed || fading) return;
      const d = cur.duration;
      if (!d || Number.isNaN(d)) return;
      const t = cur.currentTime;
      // Prime the next copy's decode a beat before the crossfade, then hold it
      // paused at frame 0 so the metadata-only preload has buffered pixels.
      if (!primed && t >= d - fade - 1) {
        primed = true;
        try {
          nxt.currentTime = 0;
        } catch {
          /* not seekable yet */
        }
        const p = nxt.play();
        if (p && typeof p.then === "function") {
          p.then(() => {
            if (!fading) nxt.pause();
          }).catch(() => {});
        }
      }
      if (t >= d - fade) {
        fading = true;
        try {
          nxt.currentTime = 0;
        } catch {
          /* not seekable yet */
        }
        nxt.play().catch(() => {});
        cur.style.opacity = "0";
        nxt.style.opacity = "1";
      }
    };

    const onEnded = (e: Event) => {
      const v = e.target as HTMLVideoElement;
      v.pause();
      v.style.opacity = "0";
      if (v === cur) {
        const t = cur;
        cur = nxt;
        nxt = t;
      }
      fading = false;
      primed = false;
    };

    a.addEventListener("timeupdate", tick);
    b.addEventListener("timeupdate", tick);
    a.addEventListener("ended", onEnded);
    b.addEventListener("ended", onEnded);
    a.play().catch(() => {});

    return () => {
      killed = true;
      a.pause();
      b.pause();
      a.removeEventListener("timeupdate", tick);
      b.removeEventListener("timeupdate", tick);
      a.removeEventListener("ended", onEnded);
      b.removeEventListener("ended", onEnded);
    };
  }, [src, fade, lowCore]);

  if (lowCore) {
    return (
      <video ref={singleRef} className={className} muted playsInline loop preload="auto">
        {webm ? <source src={webm} type="video/webm" /> : null}
        <source src={src} type="video/mp4" />
      </video>
    );
  }

  return (
    <>
      <video ref={aRef} className={className} muted playsInline preload="auto">
        {webm ? <source src={webm} type="video/webm" /> : null}
        <source src={src} type="video/mp4" />
      </video>
      <video ref={bRef} className={className} muted playsInline preload="metadata">
        {webm ? <source src={webm} type="video/webm" /> : null}
        <source src={src} type="video/mp4" />
      </video>
    </>
  );
}
