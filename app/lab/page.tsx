import type { Metadata } from "next";
import type { ReactNode } from "react";
import { planeAttrs, TONE_IDS, WORLD_IDS, worlds } from "@/lib/worlds";
import { ActCard } from "@/components/primitives/act-card";
import { MaskReveal } from "@/components/primitives/mask-reveal";
import { MotionToggle } from "@/components/primitives/motion-toggle";
import { Seam } from "@/components/primitives/seam";
import {
  LensOnceDemo,
  LensStatesDemo,
  LensTrackDemo,
  LoaderModesDemo,
  MediaDemo,
  MotionReadout,
  RealLoadDemo,
} from "./demos";

/* /lab — the P1-early primitive workbench. Not linked, not in the sitemap
   (the sitemap derives from the page manifest), noindex, and rendered
   without the site chrome (components/site/chrome-gate.tsx). */
export const metadata: Metadata = {
  title: "Lab",
  description: "Primitive workbench.",
  robots: { index: false, follow: false, nocache: true },
};

const TYPE_STEPS = [
  ["type-display", "display", "Reading line"],
  ["type-chapter", "chapter", "A research journal"],
  ["type-title", "title", "Guilty until proven innocent"],
  ["type-heading", "heading", "Blind holdout, spent once"],
  ["type-lead", "lead", "Treat every backtest as guilty until proven innocent."],
  ["type-body", "body", "Pre-registration commits the hypothesis, parameters and pass/fail thresholds before anything runs."],
  ["type-small", "small", "One-shot; the in-sample figure sits beside the claim."],
  ["type-meta", "meta", "Fig. 0 • The line • 1,000 × 400"],
] as const;

function LabSection({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="flex flex-col gap-tier-group border-t border-rule py-tier-block">
      <div className="flex flex-col gap-2">
        <h2 id={`${id}-h`} className="type-heading">
          {title}
        </h2>
        {note ? <p className="type-small max-w-body text-fg-muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function LabPage() {
  return (
    <div {...planeAttrs("canvas", "house")} className="bg-bg text-fg">
      <div className="mx-auto flex max-w-page flex-col px-gutter pb-tier-block">
        {/* — Masthead: in view at load, so the MaskReveal here must stay static — */}
        <header className="flex flex-col gap-tier-group pb-tier-block pt-tier-block">
          <p className="type-meta text-fg-muted">P1-early • primitives • not indexed</p>
          <MaskReveal as="h1" className="type-chapter" lines={["Primitives", "lab"]} />
          <div className="flex flex-wrap items-center gap-tier-group">
            <MotionToggle showLabel />
            <MotionReadout />
          </div>
        </header>

        <LabSection
          id="planes"
          title="Planes: world × tone"
          note="Every tile sets data-tone + data-world and reads only semantic tokens (bg-bg, text-fg, surface-1, text-accent, stroke-world-line …). rdr2 is a placeholder block, so it renders house values."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WORLD_IDS.flatMap((world) =>
              TONE_IDS.map((tone) => (
                <div
                  key={`${world}-${tone}`}
                  {...planeAttrs(tone, world)}
                  data-lab-plane=""
                  className="flex flex-col gap-2 rounded-frame bg-bg p-4 text-fg"
                >
                  <span className="type-meta text-fg-muted">
                    {world} • {tone}
                    {worlds[world].ready ? "" : " • placeholder"}
                  </span>
                  <span className="type-body">
                    Ink <span className="text-fg-muted">stone</span>{" "}
                    <span className="text-fg-ghost">ghost</span>
                  </span>
                  <span className="type-meta">
                    <span className="text-accent">Survived</span>{" "}
                    <span className="text-fg-ghost">•</span> <span className="text-kill">Killed</span>{" "}
                    <span className="text-fg-ghost">•</span>{" "}
                    <span className="text-exception">Exception</span>
                  </span>
                  <span className="flex gap-2" aria-hidden="true">
                    <span className="h-6 flex-1 rounded-focus surface-1" />
                    <span className="h-6 flex-1 rounded-focus surface-2" />
                  </span>
                  <svg viewBox="0 0 120 12" className="h-3 w-full" aria-hidden="true" preserveAspectRatio="none">
                    <line x1="0" y1="3" x2="120" y2="3" className="stroke-world-line" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="9" x2="80" y2="9" className="stroke-world-emphasis" vectorEffect="non-scaling-stroke" />
                    <line x1="84" y1="9" x2="120" y2="9" className="stroke-world-quiet" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              )),
            )}
          </div>
        </LabSection>

        <LabSection id="type" title="Type steps" note="The 8 DESIGN v2 steps as type-* utilities (family, size, leading, tracking, weight, case, wrap).">
          <ol className="flex flex-col gap-tier-group">
            {TYPE_STEPS.map(([cls, name, sample]) => (
              <li key={name} className="flex flex-col gap-1">
                <span className="type-meta text-fg-muted">{name}</span>
                <span className={`${cls} overflow-hidden`}>{sample}</span>
              </li>
            ))}
          </ol>
        </LabSection>

        <LabSection
          id="media"
          title="MediaFrame"
          note="Poster first; video only on 'playing'; one decoder page-wide (two videos below compete — see DECODER in the masthead); poster only under reduced motion, Pause or Save-Data, and on touch / narrow screens."
        >
          <div className="grid gap-tier-group lg:grid-cols-3">
            <MediaDemo media="still-calm" caption="Still • still-calm" />
            <MediaDemo media="band-flow" caption="Video • band-flow" />
            <MediaDemo media="v-contour" caption="Video • v-contour" />
          </div>
        </LabSection>

        <LabSection
          id="lens"
          title="Lens"
          note="The interval bracket. Closed / open are instant; the aperture opens the child's clip on easeClip over dur.hero while the halves ride out to the frame. Track follows the hovered, focused or arrowed row on springFollow."
        >
          <div className="grid items-start gap-tier-block lg:grid-cols-2">
            <LensStatesDemo />
            <LensTrackDemo />
          </div>
        </LabSection>

        <LabSection
          id="loader"
          title="Loader"
          note="The shell with the neutral renderer (world motifs register later). Indeterminate idles out after 5 s; reduced motion renders static. A real load shows visible role=status text after 400 ms; the progress is bytes received / content-length."
        >
          <LoaderModesDemo />
          <RealLoadDemo />
        </LabSection>

        <LabSection
          id="strip"
          title="Native-scroll strip"
          note="Scroll-driven primitives on native scroll: masked rises (armed offscreen, played once), dome seams flattening over the first 60vh of each entry, the aperture once per session, and letterboxed act cards whose progress line follows the scroll."
        >
          <div className="grid h-[70vh] place-items-center rounded-frame surface-1">
            <span className="type-meta text-fg-muted">Scroll</span>
          </div>
        </LabSection>
      </div>

      {/* Full-bleed strip panels (outside the container, like real sections) */}
      <div {...planeAttrs("canvas", "pirates")} className="relative bg-bg py-section text-fg">
        <div className="mx-auto flex max-w-page flex-col gap-tier-group px-gutter">
          <p className="type-meta text-fg-muted">pirates • canvas</p>
          <MaskReveal as="h3" className="type-chapter" lines={["A research journal", "set in type."]} />
          <p className="type-body max-w-body text-fg-muted">
            Each line rises once from below its mask when it first enters the viewport.
          </p>
        </div>
      </div>

      <div {...planeAttrs("canvas", "idiots")} className="relative bg-bg py-section text-fg" data-lab-seam-host="">
        <Seam from={{ tone: "canvas", world: "pirates" }} />
        <div className="mx-auto flex max-w-page flex-col gap-tier-group px-gutter">
          <p className="type-meta text-fg-muted">idiots • canvas • dome from pirates</p>
          <MaskReveal as="h3" className="type-title" lines={["The dome flattens", "as the section rises."]} />
          <div className="h-[40vh]" aria-hidden="true" />
        </div>
      </div>

      <div {...planeAttrs("paper", "hp")} className="relative bg-bg py-section text-fg">
        <Seam from={{ tone: "canvas", world: "idiots" }} />
        <div className="mx-auto flex max-w-page flex-col gap-tier-group px-gutter">
          <p className="type-meta text-fg-muted">hp • paper • dome from idiots</p>
          <MaskReveal as="h3" className="type-title">
            Writing
          </MaskReveal>
          <p className="type-body max-w-body">
            The parchment plane: dark ink, <span className="text-fg-ghost">ghost rows</span>, and the
            paper accent for <span className="text-accent">focus</span>.
          </p>
        </div>
      </div>

      <ActCard
        id="lab-act-2"
        kind="reel"
        world="idiots"
        label="Act II • The workshop"
        reel="II / III"
        title="The Workshop"
        subtitle="Treat every backtest as guilty until proven innocent."
        summary="A letterboxed interstitial: its progress line follows your scroll through the card."
      />

      <div {...planeAttrs("canvas", "house")} className="bg-bg py-section text-fg">
        <div className="mx-auto flex max-w-page flex-col gap-tier-group px-gutter">
          <p className="type-meta text-fg-muted">house • canvas • aperture once per session (at 50% in view)</p>
          <LensOnceDemo />
        </div>
      </div>

      <ActCard
        id="lab-act-3"
        kind="title"
        world="hp"
        label="Act III • The light"
        reel="III / III"
        title="The Light"
        progress={1}
        summary="A title card with fixed, complete progress."
      />

      <div {...planeAttrs("deep", "house")} className="grid h-[60vh] place-items-center bg-bg text-fg">
        <p className="type-meta text-fg-muted">End of strip</p>
      </div>
    </div>
  );
}
