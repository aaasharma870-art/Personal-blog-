/* ============================================================================
   PAGE MANIFEST — the ordered list of sections on the home page (SYNTHESIS §8).
   PURE DATA: no React / component imports (type-only imports are fine), so
   Node can import it directly (scripts/check-manifest.mjs).

   Everything else DERIVES from this array (lib/sections.ts): the header nav,
   the section rail, the command palette, the 01…NN section numbers, the
   sitemap anchors and the active-section observer.

   HOW TO ADD / REMOVE / REORDER A SECTION
   1. Add, remove or move ONE entry in `page` below. To hide a section without
      deleting its content, set `enabled: false`. To rename it in the nav,
      change `nav.label` — never `id` (it is the #anchor; links would break).
   2. Brand-new kind of section? Add a member to `SectionEntry` (its props),
      then one line in components/sections/registry.ts — the compiler names
      anything you missed. Facts go in lib/content.ts, media in lib/media.ts
      (referenced here by MediaId, never by path).
   3. Run `npm run check` (tsc + manifest validator), then `npm run build`.
      Nav, rail, palette, numbering and sitemap update themselves.
   ========================================================================== */

import type { MediaId } from "./media";

/** Ground plane a section sits on. Reserved: SectionFrame will own it (Phase 1+). */
export type Tone = "canvas" | "raised" | "deep" | "paper";

/** Film world a section belongs to (later design phase): neutral, Harry
 *  Potter, Pirates of the Caribbean, 3 Idiots. Unused in Phase 0. */
export type World = "neutral" | "hp" | "potc" | "idiots";

export type Density = "spacious" | "default" | "tight";
export type MotionLevel = "static" | "standard" | "signature";

export const DEFAULT_TONE: Tone = "canvas";
export const DEFAULT_WORLD: World = "neutral";

export type NavSpec = {
  /** Shown in the header nav, section rail and command palette. */
  label: string;
  /** Header nav (default false: keep the header short). */
  primary?: boolean;
  /** Section rail (default true when `nav` exists). */
  rail?: boolean;
  /** Command palette (default true when `nav` exists). */
  palette?: boolean;
  /** Palette wording when it should differ from `label` ("Go to …"). */
  paletteLabel?: string;
  /** Extra command-palette search aliases. */
  keywords?: string[];
};

type Base<T extends string, P> = {
  /** Becomes the #anchor. Never change once shipped (links break). */
  id: string;
  type: T;
  /** Default true. false = hidden everywhere (page, nav, rail, palette,
   *  numbering, sitemap); the content stays in lib/content.ts. */
  enabled?: boolean;
  /** Default true. false = the component renders no #id, so it can't be a
   *  nav / rail / sitemap target (Phase 0: credibility strip, media bands). */
  anchor?: boolean;
  nav?: NavSpec;
  /** Participates in the derived 01…NN numbering. */
  numbered?: boolean;
  /** Reserved for the design phases (default "canvas"); unused in Phase 0. */
  tone?: Tone;
  /** Reserved for the film-world phase (default "neutral"); unused in Phase 0. */
  world?: World;
  /** Reserved: SectionFrame will own spacing (Phase 1+). */
  density?: Density;
  /** Reserved: the validator will cap "signature" sections (Phase 1+). */
  motion?: MotionLevel;
  props: P;
};

type NoProps = Record<string, never>;

export type MediaBandProps = {
  image: MediaId;
  video?: MediaId;
  kicker?: string;
  statement: string;
  attribution?: string;
  /** Scroll-converging words (desktop, motion on). */
  converge?: boolean;
};

/** One member per existing section component (Phase 0). Later phases add
 *  types (statement, chapter, scene, story, …) as new members. */
export type SectionEntry =
  | Base<"hero", NoProps>
  | Base<"credibility", NoProps>
  | Base<"about", NoProps>
  | Base<"journey", NoProps>
  | Base<"mediaBand", MediaBandProps>
  | Base<"work", NoProps>
  | Base<"systems", NoProps>
  | Base<"principles", NoProps>
  | Base<"writing", NoProps>
  | Base<"beyond", NoProps>
  | Base<"voices", NoProps>
  | Base<"contact", NoProps>;

export type SectionType = SectionEntry["type"];
export type EntryOf<K extends SectionType> = Extract<SectionEntry, { type: K }>;

export const page: readonly SectionEntry[] = [
  { id: "top", type: "hero", props: {} },
  { id: "credibility", type: "credibility", anchor: false, props: {} },
  {
    id: "about",
    type: "about",
    numbered: true,
    nav: { label: "About", primary: true },
    props: {},
  },
  {
    id: "journey",
    type: "journey",
    numbered: true,
    nav: { label: "Journey", primary: true },
    props: {},
  },
  {
    id: "band-ethos",
    type: "mediaBand",
    anchor: false,
    props: {
      video: "band-flow",
      image: "still-terminal",
      kicker: "Operating ethos",
      statement: "Treat every backtest as guilty until proven innocent.",
      converge: true,
    },
  },
  {
    id: "work",
    type: "work",
    numbered: true,
    nav: { label: "Work", primary: true },
    props: {},
  },
  {
    id: "systems",
    type: "systems",
    numbered: true,
    nav: { label: "Systems", primary: true },
    props: {},
  },
  {
    id: "band-method",
    type: "mediaBand",
    anchor: false,
    props: {
      video: "v-contour",
      image: "still-network",
      kicker: "On method",
      statement:
        "A good system is not merely fast — it is inspectable, resilient, and honest about its limits.",
    },
  },
  {
    id: "principles",
    type: "principles",
    numbered: true,
    nav: { label: "Principles", primary: true },
    props: {},
  },
  {
    id: "writing",
    type: "writing",
    numbered: true,
    nav: { label: "Writing", primary: true },
    props: {},
  },
  {
    id: "beyond",
    type: "beyond",
    numbered: true,
    nav: { label: "Beyond", primary: true },
    props: {},
  },
  {
    id: "voices",
    type: "voices",
    numbered: true,
    nav: {
      label: "Voices",
      primary: true,
      paletteLabel: "Testimonials",
      keywords: ["teachers", "voices", "quotes", "recommendations"],
    },
    props: {},
  },
  {
    // Not in the primary nav: the header's outlined "Contact" button is the
    // single header entry point. Still in the rail and the palette.
    id: "contact",
    type: "contact",
    nav: { label: "Contact" },
    props: {},
  },
];
