import type { Metadata } from "next";
import { GlLab } from "./gl-lab";

/* /lab/p3/gl — the contained WebGL layer's workbench (PHASE3-SPEC §3.3,
   §7.1–§7.3, §8.1; PHASE3-PLAN §6.2). OWNER: W2-GL. Not linked, noindex.
   Every flavour on a p slider, DEFAULT and ALT, the kraken, the impact
   pulse and context loss. Desktop (DESKTOP_FINE) with motion on; headless
   captures add `?gl=force` (SwiftShader). */
export const metadata: Metadata = {
  title: "GL lab",
  description: "The card transitions' WebGL flavours on a p slider.",
  robots: { index: false, follow: false, nocache: true },
};

export default function GlLabPage() {
  return (
    <div className="mx-auto flex max-w-[84rem] flex-col gap-tier-group px-gutter py-tier-block">
      <div className="flex flex-col gap-2">
        <h1 className="type-heading">GL lab</h1>
        <p className="type-small max-w-body text-fg-muted">
          One WebGL context, re-parented into the frame below. The tier switches only at p 0 or 1: move the slider to an
          end to hand over. Reduced motion or Pause turns it off at once.
        </p>
      </div>
      <GlLab />
    </div>
  );
}
