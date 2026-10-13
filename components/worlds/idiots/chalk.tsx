import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ============================================================================
   ACT II CHALK KIT — the entry point (components/worlds/idiots). NO "use
   client": ChalkboardFrame is static markup, so the server chapters
   (chapter-section.tsx, capabilities.tsx) render it as plain HTML and it
   costs the first load nothing (W3 budget). Everything that moves or uses a
   hook (ChalkFilter, useSvgId, SettleFrame, ChalkLoop, ChalkQuadcopter) is
   the client half, ./chalk-motion.tsx, re-exported here so existing imports
   keep working; client modules may import ./chalk-motion directly.
   ========================================================================== */

export { ChalkFilter, ChalkLoop, ChalkQuadcopter, SettleFrame, useSvgId } from "@/components/worlds/idiots/chalk-motion";

/* — The ICE chalkboard frame (S09: the chapter panels) ———————————————— */

/**
 * ChalkboardFrame — frames a blueprint panel as an ICE classroom board: a
 * wooden frame, a slate-green margin with the ghost of old chalk, and a
 * chalk ledge holding one chalk stub and a felt duster. Pure CSS/SVG from
 * the world tokens (wood = brass into the board's deep). Decorative: the
 * panel inside carries the meaning.
 * `ledge`: something resting ON the ledge (the optuna board's chalk heart,
 * the `3i-aal` hotspot: server markup passed in by the chapter, so it costs
 * no client JS). It renders after the aria-hidden strip, in the frame's own
 * box (`relative`), and positions itself: the ledge's top is 0.5rem above
 * the frame's bottom edge.
 */
export function ChalkboardFrame({
  children,
  className,
  ledge,
}: {
  children: ReactNode;
  className?: string;
  ledge?: ReactNode;
}) {
  return (
    <div className={cn("relative", className)} data-motif="ice-board">
      {/* the wooden frame */}
      <div
        className="rounded-[10px] p-2.5 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--w-brass)_30%,transparent)] sm:p-3"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--w-brass) 46%, var(--idi-deep)) 0%, color-mix(in oklab, var(--w-brass) 34%, var(--idi-deep)) 100%)",
        }}
      >
        {/* the slate margin (green-black, the ghost of yesterday's chalk) */}
        <div
          className="rounded-[4px] p-3 sm:p-5"
          style={{
            backgroundColor: "var(--idi-overlay)",
            backgroundImage:
              "radial-gradient(ellipse 40% 18% at 22% 30%, color-mix(in oklab, var(--w-chalk) 5%, transparent), transparent 70%), radial-gradient(ellipse 34% 14% at 74% 70%, color-mix(in oklab, var(--w-chalk) 4%, transparent), transparent 70%)",
          }}
        >
          {children}
        </div>
      </div>
      {/* the chalk ledge: a wood strip the width of the board … */}
      <div
        aria-hidden="true"
        className="relative mx-1.5 -mt-1 h-2 rounded-b-[3px]"
        style={{ background: "color-mix(in oklab, var(--w-brass) 40%, var(--idi-deep))" }}
      >
        {/* … holding one chalk stub and a felt duster (right third) */}
        <svg
          viewBox="0 0 90 16"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute bottom-full right-[14%] h-4 w-[5.6rem] overflow-visible"
        >
          <rect x="2" y="10" width="15" height="5.5" rx="2.4" className="fill-(--w-chalk)" fillOpacity={0.92} />
          <rect x="34" y="3" width="50" height="8" rx="1.6" style={{ fill: "color-mix(in oklab, var(--w-brass) 58%, var(--idi-deep))" }} />
          <rect x="35" y="11" width="48" height="5" rx="1" className="fill-(--w-storm)" />
        </svg>
      </div>
      {/* outside the aria-hidden strip: a control may rest on the ledge */}
      {ledge}
    </div>
  );
}
