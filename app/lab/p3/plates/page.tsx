import type { Metadata } from "next";
import { PlatesLab } from "./plates-lab";

/* /lab/p3/plates — the plates engine's workbench (PHASE3-SPEC §6, §7.7;
   PHASE3-PLAN §6.3). OWNER: W2-PLATES. Not linked, noindex. Every
   LivePlate path (a registered loop, the code camera + depth), the
   progress camera with a registered overlay, depth on a p slider, the four
   weathers and the sequence window. Desktop (DESKTOP_FINE) with motion on;
   reduced motion or Pause shows the stills. The plates-live probe
   (tools/capture/probes/plates-live.mjs) reads `window.__platesLab`. */
export const metadata: Metadata = {
  title: "Plates lab",
  description: "On desktop: the living plates, the virtual camera, depth, weather and the sequence window.",
  robots: { index: false, follow: false, nocache: true },
};

export default function PlatesLabPage() {
  return (
    <div className="mx-auto flex max-w-[84rem] flex-col gap-tier-group px-gutter py-tier-block">
      <div className="flex flex-col gap-2">
        <h1 className="type-heading">Plates lab</h1>
        <p className="type-small max-w-body text-fg-muted">
          On desktop with motion on: one video decodes at a time, every other plate moves in code. Reduced motion or Pause shows
          the stills.
        </p>
      </div>
      <PlatesLab />
    </div>
  );
}
