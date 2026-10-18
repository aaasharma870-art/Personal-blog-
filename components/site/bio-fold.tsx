"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { requestScrollRefresh } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

/* ============================================================================
   BIO FOLD (fix2c, M3): the About page's second paragraph, the personal one
   (cross country, wrestling, Mandarin, photography, drone), as a PREVIEW
   fold. The whole paragraph is always in the DOM and unchanged; at ≥ 64rem
   with JS the first lines show behind a soft fade and a visible "Read more"
   button opens the rest (aria-expanded + aria-controls). Phones, no-JS and
   anything below 64rem render the full paragraph in flow, with no button
   (the `html.js` class is the gate, as in app/p3/*.css).
   The toggle changes the page height, so it asks Lenis + ScrollTrigger to
   re-measure, as the words binder does for the <details> folds.
   ========================================================================== */

export function BioFold({ text, more, less, className }: { text: string; more: string; less: string; className?: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className={className} data-bio-fold="" data-open={open ? "" : undefined}>
      <p
        id={id}
        className={cn(
          "type-body text-fg-muted",
          // the preview: three lines at ≥ 64rem with JS; the fade is the cue
          // (literal class names: Tailwind only generates what it can read)
          !open &&
            "lg:[html.js_&]:line-clamp-3 lg:[html.js_&]:[mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)]",
        )}
      >
        {text}
      </p>
      {/* the same chip as the other folds (fix2b's `Collapse chip`: a 32 px
          bordered pill in the full text colour, a chevron that turns over) */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setOpen((v) => !v);
          requestScrollRefresh();
        }}
        className="collapse-chip mt-tier-pair hidden min-h-8 w-fit cursor-pointer select-none items-center gap-2 rounded-full border py-1 pr-3 pl-3.5 type-meta text-fg transition-colors duration-(--dur-micro) lg:[html.js_&]:inline-flex"
      >
        <span>{open ? less : more}</span>
        <ChevronDown aria-hidden="true" strokeWidth={2} className="collapse-chev" style={open ? { transform: "rotate(180deg)" } : undefined} />
      </button>
    </div>
  );
}
