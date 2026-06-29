import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small mono pill used for tech tags, statuses, and labels.
 *  `interactive` adds a teal fill-wipe + brighten on hover (used on stack tags). */
export function Tag({
  children,
  accent = "muted",
  interactive = false,
  className,
}: {
  children: ReactNode;
  accent?: "gold" | "cyan" | "muted" | "ember";
  interactive?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider",
        accent === "gold" && "border-gold/30 text-gold",
        accent === "cyan" && "border-cyan/30 text-cyan",
        accent === "ember" && "border-ember/30 text-ember",
        accent === "muted" && "border-line text-muted",
        interactive && "tag-wipe cursor-default hover:border-gold/60 hover:text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
