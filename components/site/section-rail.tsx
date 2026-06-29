"use client";

import { useEffect, useState } from "react";
import { nav } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * SectionRail — a slim wayfinding rail of section dots pinned to the right edge.
 * The active section's dot glows (driven by the same IntersectionObserver scheme
 * as the header), hovering a dot reveals its label, and clicking jumps to it.
 * Desktop-wide only (xl+) so it sits in the margin, never over content. The
 * header nav remains the primary nav; this is ambient progress + quick-jump.
 */
export function SectionRail() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = nav
      .map((n) => document.getElementById(n.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el));
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
    >
      {nav.map((n) => {
        const id = n.href.slice(1);
        const isActive = active === id;
        return (
          <a
            key={n.href}
            href={n.href}
            aria-label={n.label}
            aria-current={isActive ? "page" : undefined}
            className="group flex items-center justify-end gap-2.5"
          >
            <span
              className={cn(
                "pointer-events-none rounded bg-canvas/80 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider backdrop-blur-sm transition-all duration-200",
                isActive
                  ? "text-aqua opacity-100"
                  : "translate-x-1 text-stone opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
              )}
            >
              {n.label}
            </span>
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full border transition-all duration-300",
                isActive
                  ? "scale-[1.6] border-aqua bg-aqua shadow-[0_0_10px_2px_rgba(45,212,191,0.6)]"
                  : "border-stone/50 bg-transparent group-hover:border-aqua group-hover:bg-aqua/30",
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}
