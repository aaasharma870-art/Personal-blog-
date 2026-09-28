"use client";

import { useActiveSection } from "@/components/site/use-active-section";
import { railItems } from "@/lib/sections";
import { cn } from "@/lib/utils";

/**
 * SectionRail — a slim wayfinding rail of section dots pinned to the right edge.
 * The active section's dot glows (driven by the page's one shared
 * active-section observer, same as the header), hovering a dot reveals its
 * label, and clicking jumps to it. Dots derive from the page manifest
 * (lib/sections.ts `railItems`). Desktop-wide only (xl+) so it sits in the
 * margin, never over content. The header nav remains the primary nav; this is
 * ambient progress + quick-jump.
 */
export function SectionRail() {
  const active = useActiveSection();

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 xl:flex"
    >
      {railItems.map((n) => {
        const isActive = active === n.id;
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
                "pointer-events-none rounded bg-canvas/80 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider backdrop-blur-sm transition-[transform,opacity,color] duration-200",
                isActive
                  ? "text-aqua opacity-100"
                  : "translate-x-1 text-stone opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
              )}
            >
              {n.label}
            </span>
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full border transition-[transform,border-color,background-color] duration-300",
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
