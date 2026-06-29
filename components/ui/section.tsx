import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionSeam } from "@/components/ui/section-seam";

/** Consistent section rhythm with optional ambient backdrop + an animated
 *  top "seam" transition marker. */
export function Section({
  id,
  children,
  className,
  divider = true,
  backdrop,
  seam = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  divider?: boolean;
  backdrop?: ReactNode;
  seam?: boolean;
}) {
  const positioned = Boolean(backdrop) || seam;
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 py-20 sm:py-28 lg:py-32",
        divider && !seam && "border-t border-line",
        positioned && "relative isolate overflow-hidden",
        className,
      )}
    >
      {seam ? <SectionSeam /> : null}
      {backdrop}
      <div className="container-edge relative z-10">{children}</div>
    </section>
  );
}
