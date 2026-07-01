import { cn } from "@/lib/utils";

/**
 * BeyondMotif — an abstract, text-free aqua motif per Beyond block (decorative,
 * aria-hidden). One of four variants selected deterministically by index.
 */
export function BeyondMotif({
  variant,
  className,
}: {
  variant: number;
  className?: string;
}) {
  const v = ((variant % 4) + 4) % 4;
  return (
    <svg
      viewBox="0 0 160 160"
      role="presentation"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      {v === 0 ? (
        <g fill="none" stroke="var(--color-aqua)" strokeWidth="1">
          <circle cx="80" cy="80" r="20" strokeOpacity="0.5" />
          <circle cx="80" cy="80" r="38" strokeOpacity="0.32" />
          <circle cx="80" cy="80" r="56" strokeOpacity="0.18" />
          <circle cx="80" cy="80" r="72" strokeOpacity="0.1" />
        </g>
      ) : null}
      {v === 1 ? (
        <g stroke="var(--color-aqua)" strokeWidth="1" strokeOpacity="0.4">
          <line x1="80" y1="80" x2="30" y2="40" />
          <line x1="80" y1="80" x2="130" y2="46" />
          <line x1="80" y1="80" x2="120" y2="122" />
          <line x1="80" y1="80" x2="36" y2="120" />
          <circle cx="80" cy="80" r="4" fill="var(--color-aqua)" stroke="none" />
          <circle cx="30" cy="40" r="3" fill="var(--color-aqua)" fillOpacity="0.5" stroke="none" />
          <circle cx="130" cy="46" r="3" fill="var(--color-aqua)" fillOpacity="0.5" stroke="none" />
          <circle cx="120" cy="122" r="3" fill="var(--color-aqua)" fillOpacity="0.5" stroke="none" />
          <circle cx="36" cy="120" r="3" fill="var(--color-aqua)" fillOpacity="0.5" stroke="none" />
        </g>
      ) : null}
      {v === 2 ? (
        <g fill="none" stroke="var(--color-aqua)" strokeWidth="1.25">
          <path d="M20 40 C 60 60, 60 100, 100 110 L 140 118" strokeOpacity="0.45" />
          <path d="M20 120 C 60 100, 60 90, 100 110 L 140 118" strokeOpacity="0.28" />
        </g>
      ) : null}
      {v === 3 ? (
        <g stroke="var(--color-aqua)" strokeWidth="6" strokeLinecap="round">
          <line x1="34" y1="120" x2="34" y2="96" strokeOpacity="0.28" />
          <line x1="62" y1="120" x2="62" y2="80" strokeOpacity="0.36" />
          <line x1="90" y1="120" x2="90" y2="60" strokeOpacity="0.46" />
          <line x1="118" y1="120" x2="118" y2="40" strokeOpacity="0.58" />
        </g>
      ) : null}
    </svg>
  );
}
