/* ============================================================================
   VARIANTS — every animation and every video ships a DEFAULT and an ALT
   (Aryan's binding answer, 2026-09-28: "two versions of every animation and
   video"). PURE DATA + pure functions: no React, no value imports, so Node
   imports it directly (scripts/check-manifest.mjs validates the registry).

   THE MODEL
   - A PIECE is one swappable choreography or clip, keyed "<host>.<piece>":
       intro.play · intro.flight · intro.landing · hero.aperture ·
       card-seam.choreo · loader-course.motion · journey.voyage …
     The HOST is the first segment:
       "intro"                 the prologue (film.prologue)
       "hero"                  the hero section (type "hero")
       "card-<transition>"     a derived act card (opening, seam, tintype, ignite, reel, title)
       "loader-<kind>"         a world loader (course, gauge, plate-trail, ink-light)
       "<section id>"          any other signature / scene section (journey, work, beyond …)
   - VARIANT_REGISTRY (below) lists every piece: its DEFAULT and its ALT
     (null until someone builds it). The validator requires every host in
     use to register ≥ 1 piece and every piece to have an ALT (warning now;
     error under RELEASE=1).
   - WHICH variant a piece plays is data (a VariantChoice):
       lib/page.ts    `variant` on a section entry (the hero, journey …)
       lib/film.ts    `acts[].variant` (its derived card) · `prologue.variant`
                      · `worlds.<w>.loaderVariant` · `defaultVariant` (global)
     A choice is "default" | "alt" for the whole host, or per piece:
       { flight: "alt", landing: "default", "*": "default" }.
   - PREVIEW from the URL (client only, after hydration — useVariant()):
       ?variant=alt                   every piece that HAS an alt plays it
       ?variant=default               every piece plays its default
       ?variant=intro:alt             one host (all its pieces)
       ?variant=intro.flight:alt      one piece
       ?variant=alt,hero:default      comma-separated; the longest match wins
     An "alt" request for a piece whose ALT is null (or that is not
     registered) resolves to "default": a preview never renders a hole.

   MEDIA ALTERNATES live in lib/media.ts (`alt` on the default asset,
   `variantOf` on the alternate); `resolveVariant(id, variant)` picks one.
   A media-backed piece lists its clips in `media` here too, so /lab/variants
   can show both sides.

   ADD AN ALT (builders)
   1. Build the choreography behind a `variant: Variant` prop (both paths
      obey reduced motion + Pause, focus parity, one decoder, SSR = final).
   2. Fill the piece's `alt` below (name, note, media?) and list the files.
   3. `npm run check`. To make it the manifest's pick, set the choice in
      lib/page.ts / lib/film.ts; to preview it, open `?variant=<key>:alt`.
   ========================================================================== */

import type { MediaId } from "./media";

export const VARIANTS = ["default", "alt"] as const;
export type Variant = (typeof VARIANTS)[number];

/** A manifest choice for one host: one variant for all its pieces, or a map
 *  piece → variant ("*" = every other piece). */
export type VariantChoice = Variant | Readonly<Record<string, Variant>>;

/** "<host>.<piece>" (see the header). */
export type VariantKey = `${string}.${string}`;

export type VariantImpl = {
  /** Short handle shown in /lab/variants, e.g. "mask-sweep". */
  name: string;
  /** One line: what the viewer sees. */
  note: string;
  /** The clips / plates this side plays (MediaIds; the validator checks
   *  they exist and that an ALT's media is the default's registered alt). */
  media?: readonly MediaId[];
};

export type VariantPiece = {
  default: VariantImpl;
  /** null = not built yet (validator: warning; RELEASE=1: error). */
  alt: VariantImpl | null;
  /** While `alt` is null: the planned alternate (a meaningfully different
   *  choreography, never a tweak — AUTOPILOT "Aryan's answers"). */
  plan?: string;
  /** Source files of the piece (both sides), for the lab and reviews. */
  files?: readonly string[];
};

/** The registry's shape. Builders add entries to VARIANT_REGISTRY below. */
export type VariantRegistry = Readonly<Record<VariantKey, VariantPiece>>;

export function isVariant(x: unknown): x is Variant {
  return x === "default" || x === "alt";
}

export function hostOf(key: string): string {
  const i = key.indexOf(".");
  return i < 0 ? key : key.slice(0, i);
}

export function pieceOf(key: string): string {
  const i = key.indexOf(".");
  return i < 0 ? "*" : key.slice(i + 1);
}

/* ============================================================================
   THE REGISTRY — what M1 built (every DEFAULT) and what each ALT will be.
   `alt: null` + `plan` = to build (M1.5 builders own intro/hero and
   cards/loaders; M2 builders own the signature sections).
   ========================================================================== */
export const VARIANT_REGISTRY = {
  /* — Prologue (host "intro"; components/intro/**, public/intro/**) — */
  "intro.play": {
    default: {
      name: "candle-motes",
      note: "The play screen breathes: ≤ 40 candle sprites bob; on hover/focus 12 gather into a ring round the aqua bracket, which draws itself in.",
      media: ["IN-01", "IN-01m"],
    },
    alt: {
      name: "marauders-ink",
      note: "An ink route draws itself up to Play, footprints walk it (the last pair waits under Play), the bracket inks in on arrival; hover/focus inks the corridor walls.",
      media: ["IN-01", "IN-01m"],
    },
    files: ["components/intro/controller.js", "components/intro/intro-overlay.tsx", "app/intro.css", "components/intro/variant-snippet.ts", "components/intro/intro-head-script.tsx", "components/intro/prepaint-variants.ts"],
  },
  "intro.flight": {
    default: {
      name: "tower-chase",
      note: "IN-02 (c3f279c6): the camera chases the broom between the towers, through fog, over the crest; it climbs out above the Pearl.",
      media: ["IN-02"],
    },
    alt: {
      name: "cloud-dive",
      note: "IN-02-alt (9503416d): swoops off the play screen, dives through the cloud deck into the crest; own tracked trail; not tail-anchored, so the sweep crossfades.",
      media: ["IN-02-alt"],
    },
    files: ["components/intro/controller.js", "components/intro/intro-model.ts", "components/intro/intro-trail-alt.json", "components/intro/variant-snippet.ts", "components/intro/intro-head-script.tsx"],
  },
  "intro.codeflight": {
    default: {
      name: "bezier-past-castle",
      note: "Lite path (mobile / low-power / late video): the SVG broom lifts off the broom-less plate and flies a bezier past the castle with a tapered trail.",
      media: ["IN-01-empty", "IN-01m-empty"],
    },
    alt: {
      name: "tower-spiral",
      note: "Lite path: lifts off, spirals 1¼ turns up round the tallest tower (dimmer behind it), shoots straight up past the spire.",
      media: ["IN-01-empty", "IN-01m-empty"],
    },
    files: ["components/intro/controller.js", "components/intro/broom.ts", "components/intro/variant-snippet.ts", "components/intro/intro-head-script.tsx"],
  },
  "intro.landing": {
    default: {
      name: "mask-sweep",
      note: "A left → right mask dissolves the overlay onto the hero; the name zone clears first (the code flight exits by the dome).",
    },
    alt: {
      name: "map-fold",
      note: "'Mischief managed': the overlay folds shut on a right-edge hinge (the name clears first), washing to parchment; replaces sweep and dome.",
    },
    files: ["components/intro/controller.js", "app/intro.css", "components/intro/variant-snippet.ts", "components/intro/intro-head-script.tsx"],
  },

  /* — Hero (host "hero"; components/sections/hero/**) — */
  "hero.plate": {
    default: {
      name: "pearl-at-night",
      note: "MV-01 / MV-02: the night sea, the aqua crest, the Black Pearl with its one warm lantern.",
      media: ["MV-01", "MV-02"],
    },
    alt: {
      name: "moonlit-pearl",
      note: "M2: MV-01 has no acceptable alt (MV-01-alt is parked as a reject, status received), so desktop plays the DEFAULT plate; mobile plays MV-02-alt (alt2, 37eb75b2). The variant differs in choreography (RECOGNIZABILITY S03).",
      media: ["MV-01-alt", "MV-02-alt"],
    },
    files: ["components/sections/hero/hero-section.tsx", "components/sections/hero/hero-stage.tsx", "components/sections/hero/hero-boot.ts"],
  },
  "hero.loop": {
    default: {
      name: "crest-rolls",
      note: "MV-03 (764ca916): the crest rolls in place, glints run along it, the lantern flickers softly (desktop, motion on, one decoder).",
      media: ["MV-03"],
    },
    alt: {
      name: "calm-swell",
      note: "MV-03-alt (M2 alt2, f5130107): a calmer swell (crest amplitude ~57% of the default), join 0.995; over the DEFAULT plate only (registered to MV-01).",
      media: ["MV-03-alt"],
    },
    files: ["components/sections/hero/hero-stage.tsx", "components/sections/hero/hero-boot.ts"],
  },
  "hero.aperture": {
    default: {
      name: "bracket-clip",
      note: "Once per session (no intro): the Lens bracket opens the hero; each half rides a 48 px feathered clip edge.",
    },
    alt: {
      name: "film-gate",
      note: "Once per session (no intro): a horizontal letterbox opens from the horizon to the 2.39:1 reel band, a beat, then full frame; then the bracket grows onto the crest.",
    },
    files: ["components/primitives/lens.tsx", "components/sections/hero/hero-stage.tsx", "components/sections/hero/hero-boot.ts"],
  },
  "hero.velocity": {
    default: {
      name: "grain-and-wake",
      note: "Fast scroll: grain ≤ .10, chroma ≤ 2 px, crest wake ≤ +15 %; clear at rest.",
    },
    alt: {
      name: "crest-spray",
      note: "Fast scroll: pale spray arcs off the crest (≤ 90 droplets, ≤ .65 s each) + the same wake; clear ≤ 1.5 s after stopping.",
    },
    files: ["components/sections/hero/velocity-layers.tsx"],
  },

  /* — Act cards (host "card-<transition>"; components/sections/act-card/**) — */
  "card-opening.choreo": {
    default: {
      name: "compass-course",
      note: "Card I: Jack's compass heads a brass course that plots through the four acts as you scroll; the needle settles on Act I.",
    },
    alt: {
      name: "chart-unfold",
      note: "Card I: a folded chart opens (down, then out); a dotted trail makes landfall and climbs the program leg by leg; an X is inked on Act I.",
    },
    files: ["components/sections/act-card/frames/opening.tsx", "components/sections/act-card/frames/opening-map.tsx"],
  },
  "card-seam.choreo": {
    default: {
      name: "ice-cut",
      note: "Card I→II (pinned): a ragged ice-cut wipes the storm into a blueprint; FIG. 0 draws the Line; Rancho's chalk circle closes it.",
    },
    alt: {
      name: "duster-erase",
      note: "Card I→II (pinned): a chalk duster wipes the storm off the board in five strokes, leaving chalk dust; FIG. 0 is written in chalk; Rancho's circle closes it (no aqua seam line).",
    },
    files: ["components/sections/act-card/frames/seam.tsx", "components/sections/act-card/frames/seam-chalk.tsx"],
  },
  "card-tintype.choreo": {
    default: {
      name: "developing-plate",
      note: "Card II→III: a low sun sinks, a graphite trail draws, and a sepia tintype develops into the frontier dusk.",
    },
    alt: {
      name: "dead-eye",
      note: "Card II→III: the Line is drawn across the frontier tintype, the plate takes the Dead Eye grade (media only), bone marks lock onto the four act points in turn, then resolve at once (mark first, fire once).",
    },
    files: ["components/sections/act-card/frames/tintype.tsx", "components/sections/act-card/frames/tintype-deadeye.tsx"],
  },
  "card-ignite.choreo": {
    default: {
      name: "embers-to-candles",
      note: "Card III→IV (pinned): embers rise from a campfire and become the floating candles along the Line.",
    },
    alt: {
      name: "lumos-sweep",
      note: "Card III→IV (pinned): the campfire goes out, one wand-tip light is struck and sweeps the hall in a flourish; each floating candle catches as the light passes, the Line inks beneath it, and the light becomes the last warm point.",
    },
    files: ["components/sections/act-card/frames/ignite.tsx", "components/sections/act-card/frames/ignite-lumos.tsx"],
  },

  /* — World loaders (host "loader-<kind>"; components/primitives/loaders/**) — */
  "loader-course.motion": {
    default: { name: "compass-course", note: "LD-PC: Jack's compass swings and settles on the bearing while the course line plots." },
    alt: {
      name: "ship-in-bottle",
      note: "LD-PC alt: a ship in a bottle; the rigging line pulled out through the neck is the progress and the masts rise with it; the cork seats at completion (one glint).",
    },
    files: ["components/primitives/loaders/course-loader.tsx", "components/primitives/loaders/compass.tsx", "components/primitives/loaders/course-bottle.tsx"],
  },
  "loader-gauge.motion": {
    default: { name: "honest-gauge", note: "LD-3I: an honest gauge whose needle reports the real progress (never a fake sweep)." },
    alt: {
      name: "chalk-derivation",
      note: "LD-3I alt: a chalk derivation (f(x) = x² + 2x → f′(x) = 2x + 2 → x = −1) writes itself stroke by stroke, then sketches its curve; the answer is boxed at completion.",
    },
    files: ["components/primitives/loaders/gauge.tsx", "components/primitives/loaders/gauge-chalk.tsx"],
  },
  "loader-plate-trail.motion": {
    default: { name: "plate-trail", note: "LD-RD: a tintype plate develops while a graphite trail advances along the progress." },
    alt: {
      name: "journal-sketch",
      note: "LD-RD alt: a journal page; a pencil sketches the frontier (ridges, a pine, the trail, a campfire) stroke by stroke as the progress; one red-pencil underline at completion.",
    },
    files: ["components/primitives/loaders/plate-trail.tsx", "components/primitives/loaders/plate-journal.tsx"],
  },
  "loader-ink-light.motion": {
    default: { name: "ink-light", note: "LD-HP: ink draws itself and a light brightens with the real progress." },
    alt: {
      name: "footprints",
      note: "LD-HP alt: Marauder's-Map footprints walk the Line with the progress, fading behind the walker, and stop together at its end (ink only, no light).",
    },
    files: ["components/primitives/loaders/ink-light.tsx", "components/primitives/loaders/ink-footprints.tsx"],
  },

  /* — Signature sections (host = section id; M2 builds their moments) — */
  "journey.voyage": {
    default: { name: "voyage-chart", note: "The voyage chart and THE CROSSING cartouche; the course plots through the four waypoints." },
    alt: null,
    plan: "M2-A: the sticky sea sequence (MV-05a–d / JV) as the alt, or vice versa.",
    files: ["components/site/journey-voyage.tsx"],
  },
  "work.board": {
    default: { name: "blueprint-reskin", note: "The gauntlet on the blueprint board (M1 re-skin)." },
    alt: null,
    plan: "M2-A: the dawn-board gauntlet with its verb (SM-6).",
    files: ["components/site/projects.tsx"],
  },
  "kill-list.reckoning": {
    default: { name: "austere-ledger", note: "The reckoning (SM-8): equally quiet rows, the verdict word carries the meaning; ember strike only on the active killed row." },
    alt: null,
    plan: "M2 act2-idiots: the Lens Index ledger (SM-8) as one side and the austere rows as the other; the header's astronaut-pen motif + caption (O-5) in both. Dead Eye stays an opt-in egg, never a variant.",
    files: ["components/sections/ledger/ledger-section.tsx", "components/site/ledger-reckoning.tsx"],
  },
  "beyond.frontier": {
    default: { name: "handbill-and-map", note: "The frontier handbill, the trail map and the code golden-hour band." },
    alt: null,
    plan: "M2-B: the RDR2 act moments (SM-15).",
    files: ["components/site/rdr2-frontier.tsx", "components/site/beyond.tsx"],
  },
} as const satisfies VariantRegistry;

export type RegisteredKey = keyof typeof VARIANT_REGISTRY;

/** The registry entry for `key`, or undefined (unregistered piece). */
export function pieceSpec(key: string): VariantPiece | undefined {
  return (VARIANT_REGISTRY as VariantRegistry)[key as VariantKey];
}

/** Every registered key of a host, in registry order. */
export function piecesOf(host: string): VariantKey[] {
  return (Object.keys(VARIANT_REGISTRY) as VariantKey[]).filter((k) => hostOf(k) === host);
}

/** True when the piece has a built ALT. Unregistered keys → false. */
export function hasAlt(key: string): boolean {
  return Boolean(pieceSpec(key)?.alt);
}

/* — Choices ————————————————————————————————————————————————————————— */

/** The manifest's variant for one piece: a plain choice applies to every
 *  piece; a map uses its piece entry, else "*", else `fallback`. */
export function pieceVariant(
  choice: VariantChoice | null | undefined,
  piece: string,
  fallback: Variant = "default",
): Variant {
  if (choice == null) return fallback;
  if (typeof choice === "string") return choice;
  const v = choice[piece] ?? choice["*"];
  return isVariant(v) ? v : fallback;
}

/* — URL overrides (?variant=…) ——————————————————————————————————————— */

export type VariantOverrides = {
  /** Bare `?variant=alt|default`: every piece. */
  all: Variant | null;
  /** `prefix:variant` pairs, longest prefix first. */
  scoped: readonly (readonly [prefix: string, variant: Variant])[];
};

export const NO_OVERRIDES: VariantOverrides = { all: null, scoped: [] };

/** Pure parser — pass any `location.search`-style string. Unknown tokens
 *  are ignored. The last bare value wins. */
export function parseVariantOverrides(search: string): VariantOverrides {
  if (!search || !search.includes("variant")) return NO_OVERRIDES;
  const params = new URLSearchParams(search);
  if (!params.has("variant")) return NO_OVERRIDES;
  let all: Variant | null = null;
  const scoped = new Map<string, Variant>();
  for (const raw of params.getAll("variant").flatMap((v) => v.split(","))) {
    const t = raw.trim().toLowerCase();
    if (!t) continue;
    const i = t.lastIndexOf(":");
    if (i < 0) {
      if (isVariant(t)) all = t;
      continue;
    }
    const prefix = t.slice(0, i);
    const v = t.slice(i + 1);
    if (prefix && isVariant(v)) scoped.set(prefix, v);
  }
  return {
    all,
    scoped: [...scoped.entries()].sort((a, b) => b[0].length - a[0].length),
  };
}

/** The URL's override for `key`, or null. A scoped prefix matches the key
 *  itself or its host ("intro" matches "intro.flight"). */
export function overrideFor(o: VariantOverrides, key: string | undefined): Variant | null {
  if (key) {
    const k = key.toLowerCase();
    for (const [prefix, v] of o.scoped) if (k === prefix || k.startsWith(`${prefix}.`)) return v;
  }
  return o.all;
}

/**
 * The variant a piece renders:
 *   URL override (client, after hydration) ?? the manifest choice ?? fallback,
 * clamped to "default" when the piece is registered without an ALT (so
 * `?variant=alt` never renders a hole). Unregistered keys are not clamped.
 * Server / hydration callers pass `search = ""`.
 */
export function effectiveVariant(
  choice: VariantChoice | null | undefined,
  key: string | undefined,
  search: string,
  fallback: Variant = "default",
): Variant {
  const manifest = pieceVariant(choice, key ? pieceOf(key) : "*", fallback);
  const want = overrideFor(parseVariantOverrides(search), key) ?? manifest;
  if (want === "alt" && key && pieceSpec(key) && !hasAlt(key)) return "default";
  return want;
}
