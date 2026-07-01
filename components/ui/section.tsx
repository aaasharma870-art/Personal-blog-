import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionSeam } from "@/components/ui/section-seam";

/** Section vertical rhythm — static Tailwind class-map, no motion.
 *  spacious → signature sections (Projects, Principles); default → most;
 *  tight → dense matrices (Capabilities, Writing, Beyond, Credibility). */
const rhythmMap = {
  spacious: "py-28 sm:py-40 lg:py-52",
  default: "py-20 sm:py-28 lg:py-32",
  tight: "py-14 sm:py-20 lg:py-24",
} as const;

/** Consistent section rhythm with optional ambient backdrop + an animated top
 *  "seam" transition marker. `seam` accepts a boolean (quiet, the new default
 *  seam) or an explicit "quiet" | "signature" variant. */
export function Section({
  id,
  children,
  className,
  divider = true,
  backdrop,
  seam = false,
  rhythm = "default",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  divider?: boolean;
  backdrop?: ReactNode;
  seam?: boolean | "quiet" | "signature";
  rhythm?: "spacious" | "default" | "tight";
}) {
  const seamOn = Boolean(seam);
  const seamVariant = seam === "signature" ? "signature" : "quiet";
  const positioned = Boolean(backdrop) || seamOn;
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24",
        rhythmMap[rhythm],
        divider && !seamOn && "border-t border-line",
        // `overflow-clip` (not `hidden`) clips the backdrop/seam bleed WITHOUT
        // establishing a scroll container — so descendant `position: sticky`
        // set-pieces (the pinned Journey track) can still pin to the viewport.
        positioned && "relative isolate overflow-clip",
        className,
      )}
    >
      {seamOn ? <SectionSeam variant={seamVariant} /> : null}
      {backdrop}
      <div className="container-edge relative z-10">{children}</div>
    </section>
  );
}
