import Image from "next/image";
import { ParallaxLayer } from "@/components/visuals/parallax-layer";
import { cn } from "@/lib/utils";

/**
 * QuantCover — the abstract, text-free "quant cover" slot behind a flagship
 * project card. When a Higgsfield asset path is provided (Phase 5) it renders
 * that still; until then a deterministic aqua wash stands in so the slot reads
 * intentionally rather than empty. PURELY DECORATIVE: aria-hidden +
 * pointer-events-none, never a claim or a real figure (honesty guardrail).
 * One ParallaxLayer only — never stacked on the section AmbientBackground.
 */
export function QuantCover({
  src,
  className,
}: {
  src?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className,
      )}
    >
      <ParallaxLayer depth={0.6} className="absolute inset-[-8%]">
        {src ? (
          <div className="relative h-full w-full">
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 1024px) 620px, 100vw"
              className="object-cover opacity-[0.22]"
            />
          </div>
        ) : (
          <div
            className="h-full w-full opacity-[0.55]"
            style={{
              background:
                "radial-gradient(130% 80% at 84% 6%, rgba(45,212,191,0.12), transparent 58%), radial-gradient(90% 70% at 8% 104%, rgba(94,234,212,0.05), transparent 55%)",
            }}
          />
        )}
      </ParallaxLayer>
      {/* legibility wash: cover dissolves into the card so ink stays AA */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface/35 via-surface/72 to-surface/92" />
    </div>
  );
}
