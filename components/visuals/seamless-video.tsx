"use client";

import { useEffect, useRef } from "react";

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
  fade = 0.7,
  className,
}: {
  src: string;
  fade?: number;
  className?: string;
}) {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
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
    let killed = false;

    const tick = () => {
      if (killed || fading) return;
      const d = cur.duration;
      if (!d || Number.isNaN(d)) return;
      if (cur.currentTime >= d - fade) {
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
  }, [src, fade]);

  return (
    <>
      <video ref={aRef} className={className} muted playsInline preload="auto">
        <source src={src} type="video/mp4" />
      </video>
      <video ref={bRef} className={className} muted playsInline preload="auto">
        <source src={src} type="video/mp4" />
      </video>
    </>
  );
}
