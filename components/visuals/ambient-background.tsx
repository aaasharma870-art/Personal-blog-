"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
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

/* Opacity lives on these wrappers so the (opaque) video fully covers its still
   poster — no still bleeding through a semi-transparent video. */
function StaticMedia({ opacity, children }: { opacity: number; children: ReactNode }) {
  return (
    <div className="absolute inset-[-8%]" style={{ opacity }}>
      {children}
    </div>
  );
}

function ParallaxMedia({ opacity, children }: { opacity: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  return (
    <motion.div ref={ref} style={{ y, opacity }} className="absolute inset-[-8%]">
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
  overlayClassName = "bg-gradient-to-b from-canvas/55 via-canvas/65 to-canvas",
  className,
}: {
  image: string;
  video?: string;
  opacity?: number;
  parallax?: boolean;
  priority?: boolean;
  overlayClassName?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const showVideo = Boolean(video) && !reduce && isDesktop;
  const doParallax = parallax && !reduce;
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!showVideo) return;
    const host = rootRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "-12% 0px -12% 0px", threshold: 0 },
    );
    // small defer so the very first paint isn't competing with video fetch
    const t = setTimeout(() => io.observe(host), 500);
    return () => {
      clearTimeout(t);
      io.disconnect();
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
        quality={55}
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

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {doParallax ? (
        <ParallaxMedia opacity={opacity}>{media}</ParallaxMedia>
      ) : (
        <StaticMedia opacity={opacity}>{media}</StaticMedia>
      )}
      <div className={cn("absolute inset-0", overlayClassName)} />
    </div>
  );
}
