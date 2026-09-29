import type { ReactNode } from "react";
import type { SectionEntry } from "@/lib/page";
import { anchorId, pageItems, toneOf, worldOf } from "@/lib/sections";
import type { ToneId, WorldId } from "@/lib/worlds";
import { Seam } from "@/components/primitives/seam";
import { MaskReveal } from "@/components/primitives/mask-reveal";
import { cn } from "@/lib/utils";

/* ============================================================================
   WORLD KIT — the shared, server-rendered shell every M1 section uses
   (SPEC v2 §9, §11; DESIGN v3 §2–§4, §8). It replaces the retired generic
   layer (ui/Section + ui/SectionHeading: ghost numerals, mono eyebrows at
   11 px, ambient backdrops, the quiet "seam" marker) with:
     - the section's PLANE painted from the semantic vars (bg-bg / text-fg),
       which SectionFrame's data-world × data-tone resolve per world;
     - the dome Seam, derived: only where the previous render item is a
       section on a different plane (an act card owns every act cut);
     - ONE label system (Meta) and the DESIGN type steps.
   Nothing here names a world: move a section to another act and it re-skins.
   ========================================================================== */

type Plane = { tone: ToneId; world: WorldId };

/** Section types whose last 30vh already crossfades into the page's deep
 *  (the ledger's T5 fade, IdiotsSection `fadeOut`): a house-deep section
 *  after one needs no dome (it would repaint the old plane over the fade). */
const EXITS_TO_PAGE_DEEP: ReadonlySet<string> = new Set(["ledger"]);

/** The plane the dome seam should paint at the top of `entry`, or null:
 *  - the item before it is an act card (the incoming world owns that cut);
 *  - it is the first item; or the two planes are identical;
 *  - the previous section already fades into this house-deep plane. */
export function seamFromFor(entry: SectionEntry): Plane | null {
  const i = pageItems.findIndex((it) => it.kind === "section" && it.entry.id === entry.id);
  if (i <= 0) return null;
  const prev = pageItems[i - 1];
  if (!prev || prev.kind !== "section") return null;
  if (prev.tone === toneOf(entry) && prev.world === worldOf(entry)) return null;
  if (EXITS_TO_PAGE_DEEP.has(prev.entry.type) && worldOf(entry) === "house" && toneOf(entry) === "deep") return null;
  return { tone: prev.tone, world: prev.world };
}

/** `•` in the ghost ink between Meta fields (DESIGN §8). */
export function Sep() {
  return (
    <span aria-hidden="true" className="text-fg-ghost">
      {" • "}
    </span>
  );
}

/** One Meta line: ≤ 4 fields, `•`-separated, --fg-muted. */
export function Meta({
  fields,
  className,
  as: Tag = "p",
}: {
  fields: readonly ReactNode[];
  className?: string;
  as?: "p" | "span" | "div" | "dt";
}) {
  const shown = fields.filter((f) => f !== null && f !== undefined && f !== "");
  return (
    <Tag className={cn("type-meta text-fg-muted", className)}>
      {shown.map((f, i) => (
        <span key={i}>
          {i > 0 ? <Sep /> : null}
          {f}
        </span>
      ))}
    </Tag>
  );
}

/**
 * WorldSection — the <section> of a manifest entry: its #anchor, its plane
 * (bg-bg / text-fg from SectionFrame's world × tone), the derived dome seam,
 * an optional world GROUND layer (`.world-ground`: the pirates rhumb lattice
 * or the idiots graph grid, drawn by CSS per data-world in the world-skins
 * block of globals.css — so a section moved to another act re-grounds
 * itself), and the page container (max 1440, the DESIGN gutter).
 */
export function WorldSection({
  entry,
  labelledBy,
  children,
  className,
  containerClassName,
  ground = false,
  groundClassName,
}: {
  entry: SectionEntry;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Paint the world's ground texture (lattice / grid) behind the content. */
  ground?: boolean;
  groundClassName?: string;
}) {
  const from = seamFromFor(entry);
  return (
    <section
      id={anchorId(entry)}
      aria-labelledby={labelledBy}
      data-world-section={entry.id}
      className={cn("relative isolate bg-bg py-section text-fg", className)}
    >
      {from ? <Seam from={from} /> : null}
      {ground ? (
        <div
          aria-hidden="true"
          className={cn("world-ground pointer-events-none absolute inset-0 -z-10", groundClassName)}
        />
      ) : null}
      <div className={cn("relative mx-auto w-full max-w-page px-gutter", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

/**
 * SectionHead — Meta (derived number • label) → h2 in `chapter` (masked R1
 * rise, SSR-final) → optional intro in `lead`. Three type styles, one Meta.
 * No ghost numeral, no eyebrow, no decorative rule.
 */
export function SectionHead({
  id,
  number,
  label,
  title,
  intro,
  className,
  titleClassName,
  after,
}: {
  /** The h2 id (the section's aria-labelledby). */
  id: string;
  number?: string;
  label: string;
  title: string;
  intro?: string;
  className?: string;
  titleClassName?: string;
  /** Rendered right after the h2 (e.g. a world emphasis mark). */
  after?: ReactNode;
}) {
  return (
    <header className={cn("max-w-[56rem]", className)}>
      <Meta fields={[number, label]} />
      <MaskReveal
        as="h2"
        id={id}
        className={cn("mt-tier-group max-w-title type-chapter text-fg", titleClassName)}
      >
        {title}
      </MaskReveal>
      {after}
      {intro ? (
        <p className="mt-tier-group max-w-lead type-lead text-fg-muted">{intro}</p>
      ) : null}
    </header>
  );
}
