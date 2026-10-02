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
      note: "MV-01 / MV-02: the night sea, the aqua crest, the Black Pearl with its one warm lantern; the Lens frames the crest AND the Pearl (focalBox ∪ rects.pearl).",
      media: ["MV-01", "MV-02"],
    },
    alt: {
      name: "moonlit-pearl",
      note: "M2: MV-01 has no acceptable alt (MV-01-alt is parked as a reject, status received), so desktop plays the DEFAULT plate; mobile plays MV-02-alt (alt2, 37eb75b2). M2 fix (ART-DIRECTOR #15): the 'spyglass' framing — the plate pushes in x1.18 about the Pearl (after the flight lands; static under RM / Pause / mobile) and the Lens frames the ship alone.",
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
      note: "Card I: Jack's compass heads a brass course that plots through the four acts as you scroll; the needle settles on Act I. Phase 3 (W2-CARDS + W2-GL; SPEC §7.1): the Pirates spyglass IRIS, pre-opened to a 12% brass disc on the lit stern, opens to full frame over p 0–.45 (GL tier + css tier).",
    },
    alt: {
      name: "chart-unfold",
      note: "Card I: a folded chart opens (down, then out); a dotted trail makes landfall and climbs the program leg by leg; an X is inked on Act I. Phase 3: stays the DOM chart-unfold on the new p ranges.",
    },
    files: ["components/sections/act-card/frames/opening.tsx", "components/sections/act-card/frames/opening-map.tsx", "app/p3/cards.css", "components/gl/**", "lib/gl/**"],
  },
  "card-seam.choreo": {
    default: {
      name: "ice-cut",
      note: "Card I→II (pinned): a ragged ice-cut wipes the storm into a blueprint; FIG. 0 draws the Line; Rancho's chalk circle closes it. Phase 3 (SPEC §7.1): a Pirates breaker WAVE rolls out the storm (p 0–.22), then 3 Idiots CHALK dust uncovers the hall (p .22–.45) at the carried line; dawn grade ramp.",
    },
    alt: {
      name: "duster-erase",
      note: "Card I→II (pinned): a chalk duster wipes the storm off the board in five strokes, leaving chalk dust; FIG. 0 is written in chalk; Rancho's circle closes it (no aqua seam line). Phase 3: the WAVE out, then the DUSTER in.",
    },
    files: ["components/sections/act-card/frames/seam.tsx", "components/sections/act-card/frames/seam-chalk.tsx", "app/p3/cards.css", "components/gl/**", "lib/gl/**"],
  },
  "card-tintype.choreo": {
    default: {
      name: "developing-plate",
      note: "Card II→III: a low sun sinks, a graphite trail draws, and a sepia tintype develops into the frontier dusk. Phase 3 (SPEC §7.1): the flash powder fires at p .03 (the hook) and the tintype DEVELOPS outward from the horizon row, sepia → golden hour (p .03–.45).",
    },
    alt: {
      name: "dead-eye",
      note: "Card II→III: the Line is drawn across the frontier tintype, the plate takes the Dead Eye grade (media only), bone marks lock onto the four act points in turn, then resolve at once (mark first, fire once). Phase 3: the Dead Eye grade RAMPS in over the develop's range.",
    },
    files: ["components/sections/act-card/frames/tintype.tsx", "components/sections/act-card/frames/tintype-deadeye.tsx", "app/p3/cards.css", "components/gl/**", "lib/gl/**"],
  },
  "card-ignite.choreo": {
    default: {
      name: "embers-to-candles",
      note: "Card III→IV (pinned): embers rise from a campfire and become the floating candles along the Line. Phase 3 (SPEC §7.1): an RDR2 film BURN eats in from the fire (p 0–.22), then HP INK bleeds the Great Hall in (p .22–.45); the wagon wheel → ring → snitch.",
    },
    alt: {
      name: "lumos-sweep",
      note: "Card III→IV (pinned): the campfire goes out, one wand-tip light is struck and sweeps the hall in a flourish; each floating candle catches as the light passes, the Line inks beneath it, and the light becomes the last warm point. Phase 3: the BURN out, then the LUMOS sweep in.",
    },
    files: ["components/sections/act-card/frames/ignite.tsx", "components/sections/act-card/frames/ignite-lumos.tsx", "app/p3/cards.css", "components/gl/**", "lib/gl/**"],
  },

  /* — Phase 3 card push-ins, star (b) p .50–1 (SPEC §6.2; W2-CARDS).
       W1 assembler (2026-10-01): SEQ-HALL is registered (push-in #3's
       DEFAULT plays it). SEQ-PEARL FAILED Check L2 (lightning flash frames
       and figure-like silhouettes on the bow rail; media-staged/p3/accepted/
       seq-pearl.FAIL.json) and is NOT registered, so push-in #1's DEFAULT is
       the code push on L01 (its former ALT) and the ALT is a code rack. — */
  "card-opening.push": {
    default: {
      name: "code-push-l01",
      note: "Push-in #1: a code push on the L01 loop, 1 → 1.3 about the stern (transform only), over p .50–1; THE CROSSING opens over it from p .68. (DEFAULT since SEQ-PEARL failed Check L2.)",
    },
    alt: {
      name: "code-rack-l01",
      note: "A rack-focus crossfade on L01 from the soft to the sharp rung (opacity between the rungs, never a blur), then a shorter push 1 → 1.15 about the stern (transform only).",
    },
    files: ["components/sections/act-card/**", "app/p3/cards.css"],
  },
  "card-seam.push": {
    default: {
      name: "camera-l08",
      note: "Push-in #2: a code camera on L08 toward the ICE board, 1 → 1.35; FIG. 0 rides the camera group (it arrived with the chalk).",
    },
    alt: {
      name: "rack-from-benches",
      note: "A rack-focus crossfade from the benches (opacity between the soft and sharp rungs, never a blur), then a shorter push 1 → 1.2.",
    },
    files: ["components/sections/act-card/**", "app/p3/cards.css"],
  },
  "card-ignite.push": {
    default: {
      name: "seq-hall",
      note: "Push-in #3: SEQ-HALL, a 72-frame dolly along the tables toward the high table (frame 0 = iconic-hall at the join zoom); the starry ceiling stays in the settled frame.",
      media: ["SEQ-HALL"],
    },
    alt: {
      name: "code-crane-l02",
      note: "A code crane-up on the L02 loop (zoom 1.089 at the join → 1.25, focal .45).",
    },
    files: ["components/sections/act-card/**", "app/p3/cards.css"],
  },

  /* — Phase 3 card title + carried shape (SPEC §7.1, §7.3, §8.1) — */
  "title.mask": {
    default: {
      name: "text-as-mask",
      note: "Each card exits through its act title as a mask: the letters open from p .68 over the still-moving push and reach full-bleed at p 1 (GL SDF knockout; css knockout on the css tier).",
    },
    alt: {
      name: "rising-title",
      note: "The act title rises into place over the push while plain letterbox bars open (no mask).",
    },
    files: ["components/sections/act-card/**", "app/p3/cards.css", "components/gl/**", "lib/gl/**"],
  },
  "match.shape": {
    default: {
      name: "fold",
      note: "The carried shape folds into the next (SDF morph): compass ring → gear on the seam, wagon wheel → ring → snitch on the ignite; part of the transition, never a second star.",
    },
    alt: {
      name: "roll",
      note: "The carried shape rolls across the meet row into the next one (css tier: the static SVG of the incoming shape on both sides).",
    },
    files: ["components/gl/**", "lib/gl/**", "components/stage/carried-shape.tsx"],
  },

  /* — Phase 3 stage + plates (SPEC §3.2, §6.1, §7.4) — */
  "letterbox.breath": {
    default: {
      name: "slide",
      note: "Global letterbox bars slide in from the viewport edges (scaleY 0 → 1) over 40vh as the house lights go down at the films, then open.",
    },
    alt: {
      name: "iris-bars",
      note: "The bars close as an iris toward the 2.39 band, then open the same way.",
    },
    files: ["components/stage/letterbox-bars.tsx", "components/stage/stage-layers.tsx", "app/p3/stage.css"],
  },
  "stage.camera": {
    default: {
      name: "drift",
      note: "Each stage cue drifts slowly across its plate as its section scrolls (transform only).",
    },
    alt: {
      name: "push",
      note: "Each stage cue pushes in toward its focal point instead of drifting.",
    },
    files: ["components/stage/**", "lib/stage.ts", "app/p3/stage.css", "components/primitives/camera.tsx"],
  },
  "plates.loops": {
    default: {
      name: "living-loop",
      note: "Every plate with a registered loop plays it (loopFor(plate); one decoder; RM → the poster, 0 video bytes).",
    },
    alt: {
      name: "code-depth-camera",
      note: "No video: the still moves in code, depth parallax plus the virtual camera (DP-8).",
    },
    files: ["components/primitives/live-plate.tsx", "components/primitives/camera.tsx", "components/primitives/depth-plate.tsx", "components/stage/stage.tsx", "components/stage/stage-video.tsx", "lib/loops.ts", "app/p3/plates.css"],
  },

  /* — Phase 3 words (SPEC §8; W2-WORDS) — */
  "words.title-pirates": {
    default: { name: "stamped", note: "The Act I section titles arrive stamped, a single press in the Pirates world face." },
    alt: { name: "branded", note: "The titles arrive branded: the letters darken in from a warm edge." },
    files: ["components/words/**", "app/p3/words.css"],
  },
  "words.title-idiots": {
    default: { name: "chalked", note: "The Act II section titles are chalked on stroke by stroke." },
    alt: { name: "duster-reveal", note: "A duster pass reveals the chalked titles." },
    files: ["components/words/**", "app/p3/words.css"],
  },
  "words.title-rdr2": {
    default: { name: "poster-press", note: "The Act III section titles land like a poster press." },
    alt: { name: "typewriter", note: "The titles type on, letter by letter." },
    files: ["components/words/**", "app/p3/words.css"],
  },
  "words.title-hp": {
    default: { name: "ink-nib", note: "The Act IV section titles are written on with an ink nib." },
    alt: { name: "ink-bleed", note: "The titles bleed in as ink." },
    files: ["components/words/**", "app/p3/words.css"],
  },
  "words.scrub": {
    default: { name: "word-opacity", note: "One sentence per act brightens word by word as the reader scrolls it (per-word opacity scrub)." },
    alt: { name: "line-sweep", note: "A per-line clip sweep, scrubbed over the same range." },
    files: ["components/words/scrub-sentence.tsx", "components/words/bind/**", "components/enhance/binders/words.ts", "app/p3/words.css"],
  },
  "words.physical": {
    default: { name: "grain-ember", note: "One physical word per section at most: \"noise\" settles like grain, \"Killed\" is struck through with an ember." },
    alt: { name: "jitter-graphite", note: "\"noise\" only jitters its letters; \"Killed\" gets a graphite strike." },
    files: ["components/words/physical-word.tsx", "components/words/bind/**", "components/enhance/binders/words.ts", "app/p3/words.css"],
  },
  "words.flythrough": {
    default: { name: "glide-gallop", note: "A gull glides through the voyage window's sky (Act I); a graphite horse gallops along the journal's bottom edge (Act III); image zones only, never across text." },
    alt: { name: "shadow-pass", note: "Only the sprite's shadow crosses the image zone." },
    files: ["components/words/fly-through.tsx", "components/words/bind/**", "assets/p3/words/**", "app/p3/words.css"],
  },

  /* — Phase 3 intro titles + post-credits (SPEC §4.3, §9.4) — */
  "intro.titles": {
    default: {
      name: "three-cards",
      note: "After the flight lands: three title cards bottom-right in the caption slot (A RESEARCH JOURNAL IN FOUR ACTS · AFTER the four works · ACT I • THE CROSSING ↓), WAAPI opacity + 8 px.",
    },
    alt: {
      name: "credit-roll",
      note: "The same three strings as a short credit roll (translateY).",
    },
    files: ["components/intro/**", "public/intro/intro.js", "app/intro.css"],
  },
  "post-credits.scene": {
    default: {
      name: "riderless-broom",
      note: "The riderless broom drifts in along the bottom, pauses under \"↑ Back to the opening\", tips up and exits up-left (≤ 5 s); the 12/12 cut plays the four instruments first.",
    },
    alt: {
      name: "ink-footprints",
      note: "Ink footprints walk to \"↑ Back to the opening\" and stop.",
    },
    files: ["components/site/post-credits.tsx", "app/p3/game.css", "assets/p3/hunt/**"],
  },

  /* — World loaders (host "loader-<kind>"; components/primitives/loaders/**) — */
  "loader-course.motion": {
    default: { name: "compass-course", note: "LD-PC: Jack's compass (lid open on its star chart) swings and settles on the X while the Black Pearl heads a dashed brass course to it." },
    alt: {
      name: "ship-in-bottle",
      note: "LD-PC alt: the Black Pearl in a bottle (black hull, tattered black sails); the rigging line pulled out through the neck is the progress and the masts rise with it; the cork seats at completion (one glint).",
    },
    files: ["components/primitives/loaders/course-loader.tsx", "components/primitives/loaders/compass.tsx", "components/primitives/loaders/course-bottle.tsx", "components/primitives/loaders/pearl.tsx", "components/primitives/loaders/route-caption.tsx"],
  },
  "loader-gauge.motion": {
    default: { name: "honest-gauge", note: "LD-3I: an honest gauge chalked on a mini ICE chalkboard; its needle reports the real progress (never a fake sweep)." },
    alt: {
      name: "chalk-derivation",
      note: "LD-3I alt: a chalk derivation (f(x) = x² + 2x → f′(x) = 2x + 2 → x = −1) writes itself stroke by stroke, then sketches its curve; the answer is boxed at completion.",
    },
    files: ["components/primitives/loaders/gauge.tsx", "components/primitives/loaders/gauge-chalk.tsx", "components/primitives/loaders/chalkboard.tsx", "components/primitives/loaders/route-caption.tsx"],
  },
  "loader-plate-trail.motion": {
    default: {
      name: "journal-sketch",
      note: "LD-RD: Arthur's journal (leather cover, strap, buckle); a pencil sketches the frontier (ridges, a pine, the trail, a campfire) stroke by stroke as the progress; one red-pencil underline at completion.",
    },
    alt: {
      name: "dead-eye",
      note: "LD-RD alt: the frontier in Dead Eye red-sepia silhouette (oak, fence, homestead, frozen birds); an ember X locks onto the trail at each quarter of the real progress, then one 120 ms bone flash. No reticle, no gun.",
    },
    files: ["components/primitives/loaders/plate-journal.tsx", "components/primitives/loaders/plate-deadeye.tsx", "components/primitives/loaders/route-caption.tsx"],
  },
  "loader-ink-light.motion": {
    default: { name: "ink-light", note: "LD-HP: eight floating candles under a starry ceiling light one by one as the Lumos light passes with the real progress." },
    alt: {
      name: "footprints",
      note: "LD-HP alt: the Marauder's Map (folded parchment, ink rooms, a round tower): footprints walk the corridors with the progress and stop together at the end (ink only, no light).",
    },
    files: ["components/primitives/loaders/ink-light.tsx", "components/primitives/loaders/ink-footprints.tsx", "components/primitives/loaders/route-caption.tsx"],
  },

  /* — Signature sections (host = section id; M2 builds their moments) — */
  "about.compass": {
    default: {
      name: "true-north",
      note: "Jack's compass at the pillar hub, lid open: on entry it spins once and settles on pillar 1; hovering a pillar turns the red arrow to it and lights its bearing label in brass.",
    },
    alt: {
      name: "taking-bearings",
      note: "The compass arrives shut, the lid opens, and the arrow takes the four bearings in turn while brass bearing lines draw toward each pillar; then it settles on pillar 1.",
    },
    files: ["components/site/about-pillars.tsx", "components/worlds/pirates/jack-compass.tsx", "components/site/about.tsx"],
  },
  "journey.voyage": {
    default: {
      name: "sea-scrub",
      note: "SM-4: scroll drives the JV frames (exactly MV-05a-d when each step is centred); Jack's compass settles on each leg's heading; the Aztec medallion's moonlight sweep runs once at The break.",
      media: ["JV", "MV-05a", "MV-05b", "MV-05c", "MV-05d"],
    },
    alt: {
      name: "sail-on-cue",
      note: "SM-4: the sea holds on the active step and sails (JV-alt) to the next step's frame when a new step becomes active; the brass course plots leg by leg and the X inks itself at Now.",
      media: ["JV-alt", "MV-05a-alt", "MV-05b-alt", "MV-05c-alt", "MV-05d"],
    },
    files: [
      "components/site/journey.tsx",
      "components/site/journey-experience.tsx",
      "components/site/journey-voyage.tsx",
      "components/site/journey-carousel.tsx",
      "components/site/journey-stack.tsx",
      "components/site/journey-chart.tsx",
      "components/worlds/pirates/jack-compass.tsx",
      "components/worlds/pirates/aztec-medallion.tsx",
      "components/worlds/pirates/use-frame-sequence.ts",
      "components/worlds/pirates/voyage-chart.ts",
    ],
  },
  "work.board": {
    default: {
      name: "rail-run",
      note: "SM-6: the gauntlet chalked on the ICE dawn board; it settles in two soft pats ('aal izz well') and the Run's dots travel a chalk rail through the 7 gates; Rancho's circle on the tally.",
      media: ["MV-06"],
    },
    alt: {
      name: "marking-sheet",
      note: "SM-6: a duster wipes the board on and the Run fills in a chalk grading sheet (ticks, crosses, strike-throughs). MV-06-alt is parked (received), so it plays the DEFAULT board.",
      media: ["MV-06-alt"],
    },
    files: ["components/site/projects.tsx", "components/site/gauntlet-tabs.tsx", "components/worlds/idiots/gauntlet-board.tsx", "components/worlds/idiots/chalk.tsx"],
  },
  // M2 finish (Act II): the work section's full-bleed head band
  "work.head": {
    default: {
      name: "slow-settle",
      note: "A full-bleed 21:9 band (4:3 < 640) of Virus's astronaut pen in its open case on his desk (iconic-pen-alt; the kill-list shows the other pen plate) fades up while settling from 1.07x, captioned THE ASTRONAUT PEN ON VIRUS'S DESK • 3 IDIOTS. (M2 fix round 3: the ICE corridor alone read as generic architecture, blind 3I .40.)",
      media: ["iconic-pen-alt"],
    },
    alt: {
      name: "light-sweep",
      note: "The plate (iconic-pen, the kill-list's ALT side) comes up from shadow as one bar of light rakes across it; same caption.",
      media: ["iconic-pen"],
    },
    files: ["components/worlds/idiots/plate-band.tsx", "components/site/projects.tsx", "components/worlds/idiots/idiots-section.tsx"],
  },
  "trading-algos.schematic": {
    default: { name: "draw", note: "SM-7: the blueprint of the real pipeline inks itself inside an ICE chalkboard frame; the chalk circle goes around the caveat." },
    alt: { name: "assemble", note: "SM-7: the blueprint's parts drop into place and are taped down on the chalkboard; same circle round the caveat." },
    files: ["components/sections/chapter/chapter-section.tsx", "components/worlds/idiots/schematic.tsx"],
  },
  "optuna-screener.schematic": {
    default: { name: "draw", note: "SM-7: the Optuna pipeline (with its v3 ensemble branch) inks itself on the chalkboard (the machine definition now lives on the head board: optuna-screener.head)." },
    alt: { name: "assemble", note: "SM-7: the pipeline's parts drop in and are taped down; same caption and caveat circle." },
    files: ["components/sections/chapter/chapter-section.tsx", "components/worlds/idiots/schematic.tsx"],
  },
  // M2 finish (Act II): WHAT IS A MACHINE? on the lecture-hall board (IC-3I-05)
  "optuna-screener.head": {
    default: {
      name: "chalk-write",
      note: "The ICE lecture-hall board (iconic-ice-alt): 'What is a machine?' writes itself on, its underline draws, then Rancho's answer (Q-3I-3, Kalam) writes on; captioned WHAT IS A MACHINE? • 3 IDIOTS.",
      media: ["iconic-ice-alt"],
    },
    alt: {
      name: "rancho-circle",
      note: "The pair's other plate (iconic-ice) with both lines already written; Rancho's chalk circle draws round 'reduces human effort'.",
    },
    files: ["components/worlds/idiots/machine-board.tsx", "components/worlds/idiots/plate-band.tsx", "components/sections/chapter/chapter-section.tsx"],
  },
  "systems.fig": {
    default: { name: "draw", note: "'How this page is built' inks itself on the chalkboard." },
    alt: { name: "assemble", note: "'How this page is built': the parts drop in and are taped down on the chalkboard." },
    files: ["components/site/capabilities.tsx", "components/worlds/idiots/schematic.tsx"],
  },
  "systems.band": {
    default: {
      name: "settle",
      note: "A 21:9 band of Rancho's homemade drone over the college courtyard settles in (two soft pats), captioned THE HOMEMADE DRONE • 3 IDIOTS.",
      media: ["iconic-drone"],
    },
    alt: {
      name: "wipe",
      note: "The alt drone plate (iconic-drone-alt) is wiped on; same caption.",
      media: ["iconic-drone-alt"],
    },
    files: ["components/worlds/idiots/drone-band.tsx", "components/site/capabilities.tsx"],
  },
  "kill-list.reckoning": {
    default: {
      name: "lens-index",
      note: "SM-8: equally quiet rows; the active row (focus > pointer > centre) takes its colour; the aqua bracket travels an empty column framing that row's real route; ember strike only on the active killed row; Virus's astronaut pen in the header.",
    },
    alt: {
      name: "index-bar",
      note: "SM-8: the plain ruled ledger with one sliding bar beside the active row. Dead Eye stays an opt-in egg, never a variant.",
    },
    files: ["components/sections/ledger/ledger-section.tsx", "components/sections/ledger/lens-figure.tsx", "components/site/ledger-reckoning.tsx"],
  },
  // M2 finish (Act II): the kill-list's header inset
  "kill-list.head": {
    default: {
      name: "pats",
      note: "A 16:9 inset of Virus's astronaut pen in its open velvet case (iconic-pen; the PenCase drawing while planned) settles in two soft pats; caption VIRUS'S ASTRONAUT PEN • 3 IDIOTS under it.",
      media: ["iconic-pen"],
    },
    alt: {
      name: "lid-lift",
      note: "The inset opens from its bottom edge upward like the case lid lifting while the plate settles from 1.05x; same caption.",
      media: ["iconic-pen-alt"],
    },
    files: ["components/worlds/idiots/plate-band.tsx", "components/worlds/idiots/chalk.tsx", "components/sections/ledger/ledger-section.tsx"],
  },
  "films.screens": {
    default: {
      name: "clip-finales",
      note: "SM-9: each of the four letterboxed screens opens from inset(8%), then its finale draws: Jack's compass + brass course over the tattered-sail Pearl (iconic-pearl-alt), chalk-white blueprint gates + chalk circle, DEAD EYE on the frozen frontier (iconic-deadeye: ember X marks lock on the five birds, then fire once), an ink line with a Lumos light on the Hogwarts Express (one warm point for the hand-off).",
      media: ["iconic-pearl-alt", "F-3I", "iconic-deadeye", "iconic-express"],
    },
    alt: {
      name: "iris-marks",
      note: "SM-9: each frame irises open from its focal point on the alt stills: a dotted brass course across the moon path to an X before the Pearl's bow (iconic-pearl: the Act I card's other plate, so no variant repeats one), a chalk circle + tick round the scooter, the gang's camp by the lake (iconic-camp-alt, from its fire) as a journal clipping, footprints on the enchanted paper (F-HP).",
      media: ["F-3I-alt", "iconic-camp-alt"],
    },
    files: ["components/sections/films/films-section.tsx", "components/sections/films/film-screen.tsx", "components/sections/films/film-frame.tsx", "components/sections/films/finales.tsx", "components/sections/films/plate-marks.ts"],
  },
  "beyond.band": {
    default: {
      name: "ride-in",
      note: "SM-15: MV-10 full-bleed (the Heartlands at golden hour) slowly zooms toward the low sun as you scroll; caption THE HEARTLANDS • RED DEAD REDEMPTION 2 in Rye.",
      media: ["MV-10", "MV-10m"],
    },
    alt: {
      name: "dead-eye-release",
      note: "SM-15: the band arrives as the Dead Eye frontier (iconic-deadeye, red vignette) and releases into MV-10-alt as it comes into view; the caption hands over from DEAD EYE to THE HEARTLANDS.",
      media: ["iconic-deadeye", "MV-10-alt", "MV-10m-alt"],
    },
    files: ["components/site/beyond.tsx", "components/worlds/rdr2/frontier-band.tsx", "components/worlds/rdr2/kit.tsx", "components/worlds/rdr2/rdr2.module.css"],
  },
  "beyond.handbill": {
    default: {
      name: "nailed-up",
      note: "The HTML WANTED handbill (Rye) registered on iconic-wanted's central blank poster drops onto the board and two nails strike.",
      media: ["iconic-wanted"],
    },
    alt: {
      name: "pasted-and-stamped",
      note: "On iconic-wanted-alt: the handbill is pasted down from the top, WANTED is stamped, then tacks.",
      media: ["iconic-wanted-alt"],
    },
    files: ["components/worlds/rdr2/wanted-board.tsx", "components/site/beyond.tsx"],
  },
  "beyond.satchel": {
    default: { name: "spill", note: "Arthur's leather satchel: the real kit (camera, sketchbook + charcoal, drone, running shoes) slides out of the bag." },
    alt: { name: "inventory", note: "The kit sits in a ruled ledger with pencil ticks; the bag is drawn last, buckled." },
    files: ["components/worlds/rdr2/satchel.tsx", "components/site/beyond.tsx"],
  },
  "writing.journal": {
    default: { name: "sketch-at-rest", note: "SM-11: an Arthur-style journal spread; a full-page graphite sketch at rest; hovering an entry swaps the page to its vignette, each drawn once. Drafts stay non-link DRAFT." },
    alt: { name: "leafing", note: "SM-11: scrolling turns the page to each entry's vignette as it crosses the reading line." },
    files: ["components/site/writing.tsx", "components/worlds/rdr2/journal-spread.tsx", "components/worlds/rdr2/journal-sketches.ts"],
  },
  "voices.fire": {
    default: {
      name: "camp-at-dusk",
      note: "SM-16: iconic-camp as a sticky full-bleed backdrop behind the quotes; night falls on the plate except a hole around the fire (marks.fire); caption THE GANG'S CAMP AT DUSK.",
      media: ["iconic-camp"],
    },
    alt: {
      name: "fireside-loop",
      note: "SM-16: the MV-11 band with the MV-11L loop (desktop, one decoder) opens from a letterbox; each quote is read into firelight in turn; caption THE CAMPFIRE.",
      media: ["MV-11", "MV-11L"],
    },
    files: ["components/site/testimonials.tsx", "components/worlds/rdr2/campfire-stage.tsx"],
  },
  "principles.map": {
    default: {
      name: "marauders-map",
      note: "A parchment Marauder's Map unfolds; the five principles are ink rooms on one corridor; footprints walk it with the scroll under a YOU banner; HP-07 ribbons in ink.",
    },
    alt: {
      name: "lumos-candles",
      note: "Floating candles hang in the section's top padding; each principle's own candle lights with a Lumos spark as its row enters; silver-blue ribbons as the underline.",
    },
    files: ["components/site/principles.tsx", "components/site/principles-stage.tsx", "components/site/principles-map.tsx", "components/site/principles-lumos.tsx", "components/worlds/hp/floating-candle.tsx", "components/worlds/hp/footprints.tsx", "components/worlds/hp/sprites.ts"],
  },
  "contact.lastlight": {
    default: {
      name: "bracket-close",
      note: "SM-12: a feathered window onto MV-08 (MV-09 loop on desktop); the bracket halves travel in and turn aqua on arrival round the [ A · flame · S ] monogram.",
      media: ["MV-08", "MV-09"],
    },
    alt: {
      name: "map-walk",
      note: "SM-12: ink footprints walk out of the dark to the candle, then the bracket is inked closed (MV-09-alt loop).",
      media: ["MV-08", "MV-09-alt"],
    },
    files: ["components/site/contact.tsx", "components/site/contact-scene.tsx", "components/site/contact-finale.tsx"],
  },

  /* — Eggs and the 404 (opt-in; not section hosts) — */
  "egg-map.unfold": {
    default: { name: "panels-swing", note: "The Marauder's Map egg: the outer panels swing open in 0.8 s (flat under reduced motion)." },
    alt: { name: "centre-crease", note: "The Marauder's Map egg opens from its centre crease." },
    files: ["components/eggs/marauders-map.tsx", "components/eggs/marauders-map-dialog.tsx", "components/eggs/egg-host.tsx"],
  },
  "404.page": {
    default: { name: "marauders-map", note: "A server-rendered Marauder's Map of the site (works without JS) with 'Mischief managed' back to the top." },
    alt: { name: "journal-tip", note: "Arthur's journal: 'TIP: This trail goes nowhere. Head back to camp.' plus the room links." },
    files: ["app/not-found.tsx", "components/eggs/not-found-switch.tsx"],
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
