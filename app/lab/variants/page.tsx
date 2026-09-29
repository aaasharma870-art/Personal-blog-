import type { Metadata } from "next";
import type { ReactNode } from "react";
import { film } from "@/lib/film";
import { altOf, getMedia, mediaIds, resolveMedia, type MediaId } from "@/lib/media";
import { actCards, copyText, copyVisible, enabledSections } from "@/lib/sections";
import { hostOf, pieceSpec, VARIANT_REGISTRY, type Variant, type VariantKey, type VariantPiece } from "@/lib/variants";
import { planeAttrs, worlds, type WorldId } from "@/lib/worlds";
import { MediaFrame } from "@/components/primitives/media-frame";
import { MotionToggle } from "@/components/primitives/motion-toggle";
import { openingRows, usable } from "@/components/sections/act-card/act-card-section";
import {
  IgniteLumosFrame,
  OpeningMapFrame,
  SeamChalkFrame,
  TintypeDeadEyeFrame,
} from "@/components/sections/act-card/alt-frames";
import { CardReveal } from "@/components/sections/act-card/card-reveal";
import { IgniteFrame } from "@/components/sections/act-card/frames/ignite";
import { OpeningFrame } from "@/components/sections/act-card/frames/opening";
import { SeamFrame } from "@/components/sections/act-card/frames/seam";
import { TintypeFrame } from "@/components/sections/act-card/frames/tintype";
import { MotionReadout } from "../demos";
import { LabCardPair, LabLoaderPair, LabMediaPair, PageReplay } from "./pairs";

/* /lab/variants — every variant-capable piece, DEFAULT beside ALT (M1.5;
   AUTOPILOT "Aryan's answers": two versions of every animation and video).
   Not linked, not in the sitemap, noindex, bare (no site chrome).
   Everything is read from lib/variants.ts VARIANT_REGISTRY and lib/media.ts,
   so a new ALT shows up here without editing this page. Pieces that live
   on the home page (the prologue, the hero) replay there, forced by
   ?variant=…; the act cards, loaders and media play here, each pair on one
   shared clock. */
export const metadata: Metadata = {
  title: "Variants lab",
  description: "Every animation and video, DEFAULT beside ALT.",
  robots: { index: false, follow: false, nocache: true },
};

const SIDES = ["default", "alt"] as const satisfies readonly Variant[];
const REGISTRY = VARIANT_REGISTRY as Readonly<Record<VariantKey, VariantPiece>>;
const KEYS = Object.keys(REGISTRY) as VariantKey[];

function names(key: string): Record<Variant, string> {
  const p = pieceSpec(key);
  return { default: p?.default.name ?? "—", alt: p?.alt?.name ?? "not built" };
}

function LabSection({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="flex scroll-mt-4 flex-col gap-tier-group border-t border-rule py-tier-block">
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

/** One registry piece: its key, both sides' name + note, then `children`
 *  (the side-by-side) and `actions` (replays). */
function Piece({ k, children, actions }: { k: string; children?: ReactNode; actions?: ReactNode }) {
  const p = pieceSpec(k);
  if (!p) return null;
  return (
    <article className="flex flex-col gap-tier-group" data-lab-piece={k} aria-labelledby={`piece-${k.replace(".", "-")}`}>
      <h3 id={`piece-${k.replace(".", "-")}`} className="type-meta text-fg">
        {k}
      </h3>
      <dl className="grid gap-tier-group sm:grid-cols-2">
        {SIDES.map((v) => {
          const impl = v === "alt" ? p.alt : p.default;
          return (
            <div key={v} className="flex flex-col gap-1">
              <dt className="type-meta text-fg-muted">
                <span className={v === "alt" ? "text-accent" : "text-fg"}>{v === "alt" ? "ALT" : "DEFAULT"}</span>{" "}
                • {impl?.name ?? "not built"}
              </dt>
              <dd className="type-small max-w-body text-fg-muted">{impl?.note ?? p.plan ?? "No alternate yet."}</dd>
            </div>
          );
        })}
      </dl>
      {children}
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </article>
  );
}

/** Two stills side by side (a piece whose two sides share one plate). */
function StillPair({ ids }: { ids: Record<Variant, MediaId> }) {
  return (
    <div className="grid gap-tier-group sm:grid-cols-2">
      {SIDES.map((v) => (
        <MediaFrame key={v} media={ids[v]} radius="frame" playOn="never" sizes="(min-width: 40rem) 45vw, 100vw" />
      ))}
    </div>
  );
}

/* — The act cards' frames, resolved exactly as ActCardSection does ———— */

const CARD_KINDS = ["opening", "seam", "tintype", "ignite"] as const;

function cardFrames(kind: (typeof CARD_KINDS)[number]): { world: WorldId; frames: Record<Variant, ReactNode> } | null {
  const item = actCards.find((c) => c.transition === kind);
  if (!item) return null;
  const spec = film.worlds[item.to];
  switch (kind) {
    case "opening": {
      const h2 = copyText("opening.h2");
      const text = copyVisible(h2) ? h2.text : item.title;
      // the rows link to the home page's cards (they are real anchors there)
      const rows = openingRows().map((r) => ({ ...r, href: `/${r.href}` }));
      const heading = (v: Variant) => (
        <h4 id={`lab-opening-${v}-title`} className="type-title max-w-title text-fg">
          <CardReveal at={0.05}>{text}</CardReveal>
        </h4>
      );
      return {
        world: "house",
        frames: {
          default: <OpeningFrame heading={heading("default")} rows={rows} />,
          alt: <OpeningMapFrame heading={heading("alt")} rows={rows} />,
        },
      };
    }
    case "seam": {
      const from = item.from ? film.worlds[item.from] : null;
      const storm = usable(spec.media.reelStill) ?? usable(from?.media.plate) ?? usable(spec.media.cardStill);
      if (!storm) return null;
      const graded = resolveMedia(storm)?.id !== spec.media.reelStill;
      return {
        world: item.to,
        frames: {
          default: <SeamFrame storm={storm} graded={graded} />,
          alt: <SeamChalkFrame storm={storm} graded={graded} />,
        },
      };
    }
    case "tintype": {
      const plate = usable(spec.media.cardStill) ?? usable(spec.media.plate);
      return { world: item.to, frames: { default: <TintypeFrame plate={plate} />, alt: <TintypeDeadEyeFrame plate={plate} /> } };
    }
    case "ignite": {
      const hall = usable(spec.media.cardStill) ?? usable(spec.media.plate);
      return { world: item.to, frames: { default: <IgniteFrame hall={hall} />, alt: <IgniteLumosFrame hall={hall} /> } };
    }
  }
}

const LOADER_WORLDS = ["pirates", "idiots", "rdr2", "hp"] as const satisfies readonly WorldId[];

export default function VariantsLabPage() {
  const hero = enabledSections.find((s) => s.type === "hero");
  const apertureKey = hero ? `once:aperture:${hero.id}` : null;
  const mediaPairs = mediaIds.filter((id) => altOf(id)).map((id) => ({ id, alt: altOf(id) as MediaId }));
  const built = KEYS.filter((k) => REGISTRY[k].alt).length;
  const pending = KEYS.filter((k) => !REGISTRY[k].alt);

  return (
    <div {...planeAttrs("canvas", "house")} className="bg-bg text-fg">
      <div className="mx-auto flex max-w-page flex-col px-gutter pb-tier-block">
        <header className="flex flex-col gap-tier-group pb-tier-block pt-tier-block">
          <p className="type-meta text-fg-muted">M1.5 • variants • not indexed</p>
          <h1 className="type-chapter">Variants lab</h1>
          <p className="type-body max-w-body text-fg-muted">
            Every animation and video ships a DEFAULT and an ALT. Here each one sits beside its alternate, both sides
            on one clock. {built} of {KEYS.length} pieces have an ALT built.
          </p>
          <div className="flex flex-wrap items-center gap-tier-group">
            <MotionToggle showLabel />
            <MotionReadout />
          </div>
          <nav aria-label="Lab sections" className="type-meta flex flex-wrap gap-x-5 gap-y-1 text-fg-muted">
            {[
              ["registry", "Registry"],
              ["prologue", "Prologue"],
              ["hero", "Hero"],
              ["cards", "Act cards"],
              ["loaders", "Loaders"],
              ["media", "Media pairs"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="inline-flex min-h-11 items-center hover:text-fg">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <PageReplay href="/?skip=intro&variant=alt" label="Whole page, ALT" />
            <PageReplay href="/?intro=1&variant=alt" label="Intro + page, ALT" />
            <PageReplay href="/?intro=1&variant=default" label="Intro + page, DEFAULT" />
          </div>
        </header>

        <LabSection
          id="registry"
          title="Registry"
          note="lib/variants.ts VARIANT_REGISTRY. The manifest picks a side per host (lib/page.ts, lib/film.ts); ?variant=… previews either side on the home page."
        >
          <ul className="grid gap-x-tier-group gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {KEYS.map((k) => (
              <li key={k} className="flex flex-col gap-1 rounded-frame p-4 surface-1" data-lab-registry={k}>
                <span className="type-meta text-fg">{k}</span>
                <span className="type-small text-fg-muted">
                  <span className="text-fg">{REGISTRY[k].default.name}</span> /{" "}
                  {REGISTRY[k].alt ? (
                    <span className="text-accent">{REGISTRY[k].alt?.name}</span>
                  ) : (
                    <span>ALT pending ({hostOf(k)}, M2)</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {pending.length ? (
            <p className="type-small max-w-body text-fg-muted">
              Still to build (M2 signature sections): {pending.join(", ")}.
            </p>
          ) : null}
        </LabSection>

        <LabSection
          id="prologue"
          title="Prologue"
          note="The intro plays on the home page, so its replays open it there with one side forced. The video flight needs a desktop (≥ 1024 px, fine pointer); a phone, touch or a low-power device takes the code flight. Reduced motion or Pause never arms it."
        >
          <Piece
            k="intro.play"
            actions={SIDES.map((v) => (
              <PageReplay key={v} href={`/?intro=1&variant=intro.play:${v}`} label={`Replay ${v === "alt" ? "ALT" : "DEFAULT"} ↗`} />
            ))}
          >
            <StillPair ids={{ default: "IN-01", alt: "IN-01" }} />
          </Piece>
          <Piece
            k="intro.flight"
            actions={SIDES.map((v) => (
              <PageReplay key={v} href={`/?intro=1&variant=intro.flight:${v}`} label={`Replay on the page, ${v === "alt" ? "ALT" : "DEFAULT"} ↗`} />
            ))}
          >
            <LabMediaPair ids={{ default: "IN-02", alt: altOf("IN-02") ?? "IN-02" }} video names={names("intro.flight")} />
          </Piece>
          <Piece
            k="intro.codeflight"
            actions={SIDES.map((v) => (
              <PageReplay
                key={v}
                href={`/?intro=1&variant=intro.codeflight:${v},intro.landing:${v}`}
                label={`Replay ${v === "alt" ? "ALT" : "DEFAULT"} (phone / touch) ↗`}
              />
            ))}
          >
            <StillPair ids={{ default: "IN-01-empty", alt: "IN-01-empty" }} />
          </Piece>
          <Piece
            k="intro.landing"
            actions={SIDES.map((v) => (
              <PageReplay key={v} href={`/?intro=1&variant=intro.landing:${v}`} label={`Replay ${v === "alt" ? "ALT" : "DEFAULT"} ↗`} />
            ))}
          />
        </LabSection>

        <LabSection
          id="hero"
          title="Hero"
          note="The hero holds the page's one h1, so its choreography replays on the home page (?skip=intro). The aperture runs once per session: its replay clears that mark first."
        >
          <Piece k="hero.plate">
            <StillPair ids={{ default: "MV-01", alt: altOf("MV-01") ?? "MV-01" }} />
            <StillPair ids={{ default: "MV-02", alt: altOf("MV-02") ?? "MV-02" }} />
          </Piece>
          <Piece k="hero.loop">
            <LabMediaPair ids={{ default: "MV-03", alt: altOf("MV-03") ?? "MV-03" }} video names={names("hero.loop")} />
          </Piece>
          <Piece
            k="hero.aperture"
            actions={SIDES.map((v) => (
              <PageReplay
                key={v}
                href={`/?skip=intro&variant=hero.aperture:${v}`}
                label={`Replay ${v === "alt" ? "ALT" : "DEFAULT"} ↗`}
                clear={apertureKey ? [apertureKey] : []}
              />
            ))}
          />
          <Piece
            k="hero.velocity"
            actions={SIDES.map((v) => (
              <PageReplay key={v} href={`/?skip=intro&variant=hero.velocity:${v}`} label={`Try ${v === "alt" ? "ALT" : "DEFAULT"} (scroll fast) ↗`} />
            ))}
          />
        </LabSection>

        <LabSection
          id="cards"
          title="Act cards"
          note="Each card's frame with the same context the real card gives it; the clock stands in for the scroll passage (or the pinned travel). Replay runs both from 0 to the settled frame."
        >
          {CARD_KINDS.map((kind) => {
            const c = cardFrames(kind);
            const key = `card-${kind}.choreo`;
            if (!c) return null;
            return (
              <Piece key={kind} k={key}>
                <LabCardPair
                  kind={kind}
                  world={c.world}
                  names={names(key)}
                  frames={c.frames}
                  stack={kind === "opening"}
                  seconds={kind === "seam" || kind === "ignite" ? 5 : 4}
                />
              </Piece>
            );
          })}
        </LabSection>

        <LabSection
          id="loaders"
          title="World loaders"
          note="Card and mini size on the world's deep plane. Replay runs a real determinate progress to completion (one flash at most); Wait shows the waiting loop, which stops after 5 s."
        >
          {LOADER_WORLDS.map((w) => {
            const key = `loader-${worlds[w].loader}.motion`;
            return (
              <Piece key={w} k={key}>
                <LabLoaderPair world={w} names={names(key)} />
              </Piece>
            );
          })}
        </LabSection>

        <LabSection
          id="media"
          title="Media pairs"
          note="lib/media.ts: every asset with a registered alternate (the batch runner-up, 0 extra credits). Videos: one decoder, so Play on one side returns the other to its poster; phones get stills."
        >
          {mediaPairs.map(({ id, alt }) => (
            <article key={id} className="flex flex-col gap-3" data-lab-pair={id}>
              <h3 className="type-meta text-fg">
                {id} / {alt}
              </h3>
              <LabMediaPair ids={{ default: id, alt }} video={getMedia(id).kind === "video"} />
            </article>
          ))}
        </LabSection>
      </div>
    </div>
  );
}
