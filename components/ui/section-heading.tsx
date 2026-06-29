import { Reveal } from "@/components/ui/reveal";
import type { RevealVariant } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * SectionHeading — consistent index numeral + mono eyebrow + serif title.
 * The title fades up via the shared Reveal (BlurText is reserved for the hero).
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  className,
  variant = "up",
}: {
  index: string;
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
  variant?: RevealVariant;
}) {
  return (
    <Reveal variant={variant} className={cn("max-w-3xl", className)}>
      <div className="flex items-center gap-3">
        <span className="eyebrow text-gold/80">{index}</span>
        <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {intro ? (
        <p className="measure mt-5 text-base leading-relaxed text-stone sm:text-lg">
          {intro}
        </p>
      ) : null}
    </Reveal>
  );
}
