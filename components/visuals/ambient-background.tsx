"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { SeamlessVideo } from "@/components/visuals/seamless-video";

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/* Global "one active ambient video at a time" guard. During fast scroll two
   adjacent in-view sections must not both decode video; the most recent section
   to enter view claims the single slot and deactivates the previous claimant. */
const videoClaimants = new Map<symbol, (v: boolean) => void>();
let activeVideoClaim: symbol | null = null;

function claimActiveVideo(id: symbol, setActive: (v: boolean) => void): void {
  videoClaimants.set(id, setActive);
  if (activeVideoClaim && activeVideoClaim !== id) {
    videoClaimants.get(activeVideoClaim)?.(false);
  }
  activeVideoClaim = id;
}

function releaseActiveVideo(id: symbol): void {
  if (activeVideoClaim === id) activeVideoClaim = null;
  videoClaimants.delete(id);
}

/* Respect Data Saver / slow links: skip video entirely, keep the still poster. */
function connectionAllowsVideo(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const c = nav.connection;
  if (!c) return true;
  if (c.saveData) return false;
  if (c.effectiveType && /(?:^|-)(?:2g|3g)$/.test(c.effectiveType)) return false;
  return true;
}

/* Opacity lives on these wrappers so the (opaque) video fully covers its still
   poster — no still bleeding through a semi-transparent video. */
function StaticMedia({
  opacity,
  style,
  children,
}: {
  opacity: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-[-8%]" style={{ opacity, ...style }}>
      {children}
    </div>
  );
}

function ParallaxMedia({
  opacity,
  style,
  children,
}: {
  opacity: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  return (
    <motion.div ref={ref} style={{ y, opacity, ...style }} className="absolute inset-[-8%]">
      {children}
    </motion.div>
  );
}

/**
 * AmbientBackground — decorative generative media (Higgsfield).
 * - Optimized still via next/image is the poster/fallback.
 * - When the section scrolls into view (desktop, motion-on), a SeamlessVideo
 *   (two-copy crossfade loop) mounts on top — opaque, so nothing ghosts through,
 *   and it loops with no abrupt cut. It unmounts when the section leaves view, so
 *   only the in-view section ever decodes video.
 * - Mobile / reduced-motion: still only. Entirely aria-hidden.
 */
export function AmbientBackground({
  image,
  video,
  opacity = 0.5,
  parallax = true,
  priority = false,
  featherMask = false,
  overlayClassName = "bg-gradient-to-b from-canvas/55 via-canvas/65 to-canvas",
  className,
}: {
  image: string;
  video?: string;
  opacity?: number;
  parallax?: boolean;
  priority?: boolean;
  featherMask?: boolean;
  overlayClassName?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  // Lazy init: connectionAllowsVideo() returns true under SSR (no navigator),
  // so the server renders netOk=true and the client reads the real link speed on
  // first render. netOk never affects first-paint DOM (video is gated by `active`,
  // which starts false), so this is hydration-safe and avoids a setState-in-effect.
  const [netOk] = useState(connectionAllowsVideo);
  const showVideo = Boolean(video) && !reduce && isDesktop && netOk;
  const doParallax = parallax && !reduce;
  const rootRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<symbol | null>(null);
  if (idRef.current === null) idRef.current = Symbol("ambient-video");
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!showVideo) return;
    const host = rootRef.current;
    const id = idRef.current;
    if (!host || !id) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          claimActiveVideo(id, setActive);
          setActive(true);
        } else {
          releaseActiveVideo(id);
          setActive(false);
        }
      },
      { rootMargin: "-12% 0px -12% 0px", threshold: 0 },
    );
    // small defer so the very first paint isn't competing with video fetch
    const t = setTimeout(() => io.observe(host), 500);
    return () => {
      clearTimeout(t);
      io.disconnect();
      releaseActiveVideo(id);
      setActive(false);
    };
  }, [showVideo]);

  const media = (
    <>
      <Image
        src={image}
        alt=""
        fill
        priority={priority}
        quality={45}
        sizes="116vw"
        className="object-cover"
      />
      {showVideo && active && video ? (
        <SeamlessVideo
          src={video}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
    </>
  );

  const featherStyle: CSSProperties | undefined = featherMask
    ? {
        WebkitMaskImage:
          "radial-gradient(120% 90% at 50% 40%, #000 55%, transparent)",
        maskImage: "radial-gradient(120% 90% at 50% 40%, #000 55%, transparent)",
      }
    : undefined;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {doParallax ? (
        <ParallaxMedia opacity={opacity} style={featherStyle}>
          {media}
        </ParallaxMedia>
      ) : (
        <StaticMedia opacity={opacity} style={featherStyle}>
          {media}
        </StaticMedia>
      )}
      <div className={cn("absolute inset-0", overlayClassName)} />
    </div>
  );
}
