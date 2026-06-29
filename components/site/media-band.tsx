"use client";

import { useRef } from "react";
import type { MouseEvent } from "react";
import { Reveal } from "@/components/ui/reveal";
import { SectionSeam } from "@/components/ui/section-seam";
import { AmbientBackground } from "@/components/visuals/ambient-background";
import { cn } from "@/lib/utils";

/**
 * MediaBand — a full-bleed interstitial where the generative media IS the
 * spotlight (high opacity, light scrim), carrying a short statement across the
 * transition between key sections. Video on desktop, still elsewhere (via
 * AmbientBackground). A cursor-tracking aqua highlight makes the media respond
 * to interaction; a center vignette keeps the statement legible.
 */
export function MediaBand({
  image,
  video,
  kicker,
  statement,
  attribution,
  className,
}: {
  image: string;
  video?: string;
  kicker?: string;
  statement: string;
  attribution?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "group relative isolate flex min-h-[40vh] items-center justify-center overflow-hidden border-t border-line py-20",
        className,
      )}
    >
      <SectionSeam />
      <AmbientBackground
        image={image}
        video={video}
        opacity={0.85}
        overlayClassName="bg-gradient-to-b from-canvas/45 via-canvas/35 to-canvas/55"
      />
      {/* cursor-tracking aqua highlight — media adapts to interaction */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(45,212,191,0.14), transparent 62%)",
        }}
      />
      {/* Centered vignette: a dark backing pooled under the centered statement so
          it reads on any media, while the media still glows at the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 90% at 50% 50%, rgba(11,15,18,0.78), rgba(11,15,18,0.32) 60%, transparent 100%)",
        }}
      />

      <div className="container-edge relative z-10">
        <Reveal variant="scale" className="mx-auto max-w-4xl text-center">
          {kicker ? (
            <p className="eyebrow text-aqua/80">{kicker}</p>
          ) : null}
          <p className="mt-5 font-serif text-3xl font-medium leading-[1.15] text-ink text-balance sm:text-4xl lg:text-[3.25rem]">
            {statement}
          </p>
          {attribution ? (
            <p className="eyebrow mt-5 text-muted">{attribution}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
