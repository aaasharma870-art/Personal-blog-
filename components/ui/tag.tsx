import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small mono pill used for tech tags, statuses, and labels.
 *  `dot` adds a leading status LED — ember = "killed" (semantic only),
 *  aqua/amber = live status. `interactive` adds a teal fill-wipe + brighten on
 *  hover (used on stack tags). No pulse (only the Draft badge pulses). */
export function Tag({
  children,
  accent = "muted",
  dot,
  interactive = false,
  className,
}: {
  children: ReactNode;
  accent?: "aqua" | "amber" | "gold" | "cyan" | "muted" | "ember";
  dot?: "ember" | "aqua" | "amber";
  interactive?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider",
        (accent === "aqua" || accent === "gold") && "border-aqua/30 text-aqua",
        (accent === "amber" || accent === "cyan") && "border-amber/30 text-amber",
        accent === "ember" && "border-ember/30 text-ember",
        accent === "muted" && "border-line text-muted",
        interactive && "tag-wipe cursor-default hover:border-aqua/60 hover:text-ink",
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
            dot === "ember" && "bg-ember",
            dot === "aqua" && "bg-aqua",
            dot === "amber" && "bg-amber",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
