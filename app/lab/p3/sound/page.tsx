import type { Metadata } from "next";
import { SoundLab } from "./sound-lab";

/* /lab/p3/sound — the sound bench (P3-9, W2-SOUND): every cue and every
   bed, with the page events that trigger them, a level meter and the
   engine's state. Not linked, not in the sitemap, noindex. The root
   layout's header (and its sound toggle) still renders here, but the bed
   follower stays off on /lab, so the bed pads below are not overridden.
   The plan's P3-9 #5 manual listen happens here. */
export const metadata: Metadata = {
  title: "Sound lab",
  description: "Every sound cue and ambient bed, for listening.",
  robots: { index: false, follow: false, nocache: true },
};

export default function SoundLabPage() {
  return (
    <div className="mx-auto flex w-full max-w-page flex-col gap-tier-group px-gutter py-tier-block">
      <header className="flex flex-col gap-2">
        <h1 className="type-heading">Sound lab</h1>
        <p className="type-small max-w-body text-fg-muted">
          Every effect and bed of PHASE3-SPEC §10, procedural unless marked as a file. Turn sound on first (the click
          creates the audio context). Pause or reduced motion suspends everything, as on the page.
        </p>
      </header>
      <SoundLab />
    </div>
  );
}
