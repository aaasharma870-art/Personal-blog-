/* ============================================================================
   SECTIONS — pure derivations of the page manifest (lib/page.ts) and the
   film layer (lib/film.ts), bound to the real data. Server-safe (no React,
   no DOM). The header, rail, command palette, sitemap, footer credits and
   the page renderer all read from here, so adding, hiding, re-acting or
   reordering an entry in lib/page.ts updates every one of them.

   The act/world/card logic itself lives in lib/derive.ts (parameterized, so
   the validator runs the identical code); this file binds it.
   ========================================================================== */

import {
  DEFAULT_TONE,
  page,
  type SectionEntry,
  type SectionType,
  type Tone,
  type World,
} from "./page";
import { site } from "./content";
import {
  FAN_TRIBUTE_LINE,
  film,
  type CaptionKey,
  type CaptionPlace,
  type CaptionWorld,
  type CopyKey,
  type Intensity,
  type LetteringId,
} from "./film";
import { quotes, type QuoteId } from "./quotes";
import {
  effectiveVariant,
  type Variant,
  type VariantChoice,
} from "./variants";
import {
  actCardsOf,
  actRunsOf,
  actSpecOf,
  actsInUse,
  bearingOf as bearingOfRaw,
  fillCopy,
  headerLabelOf,
  pageItemsOf,
  roman,
  seenHereInOf,
  tipForKey,
  workCredit,
  worksInUseOf,
  worksPhrase,
  worldOfIn,
  type ActCardItem,
  type PageItem,
  type WorkInUse,
} from "./derive";

export type { ActCardItem, PageItem, SectionItem, WorkInUse, Epigraph } from "./derive";

/** Sections that render, in page order (`enabled` defaults to true). */
export const enabledSections: readonly SectionEntry[] = page.filter(
  (s) => s.enabled !== false,
);

const byId = new Map(enabledSections.map((s) => [s.id, s] as const));

export function sectionById(id: string): SectionEntry | undefined {
  return byId.get(id);
}

export function toneOf(entry: SectionEntry): Tone {
  return entry.tone ?? DEFAULT_TONE;
}

/** The section's world (SPEC §12.3): override ?? its act's world ?? inherit
 *  (hero → the first act's world; intermission / credits → house). */
export function worldOf(entry: SectionEntry): World {
  return worldOfIn(entry, enabledSections, film);
}

/** film.intensity unless the section turns itself down. */
export function intensityOf(entry: SectionEntry): Intensity {
  return entry.worldIntensity ?? film.intensity;
}

/** A world slot of the section's world, e.g. slot(entry, "loader"). */
export function slot<K extends keyof (typeof film.worlds)["house"]["slots"]>(
  entry: SectionEntry,
  name: K,
) {
  return film.worlds[worldOf(entry)].slots[name];
}

/* — Acts, cards, the render order —————————————————————————————————— */

/** Acts that own an enabled section, in order of first appearance. */
export const acts = actsInUse(enabledSections, film);
export const actRuns = actRunsOf(enabledSections, film);

/** The derived act cards (SPEC §8.2, §9.3, §12.3): one before the first
 *  section of each act run. `transition` picks the choreography:
 *  opening (act 1) · seam (pirates>idiots, long) · tintype (idiots>rdr2,
 *  0 travel) · ignite (rdr2>hp, long) · reel (unknown pair) · title (same
 *  world). `house` sections (the intermission) are transparent. */
export const actCards: readonly ActCardItem[] = actCardsOf(enabledSections, film);

/** THE RENDER ORDER for app/page.tsx: every enabled section, with each act
 *  card inserted before its act's first section.
 *    { kind: "section", entry, world, tone }
 *    { kind: "act", id: "act-2", act, n, numeral, reel, transition, from, to,
 *      long, title, label, credit, epigraph, tip, lettering, summary, before } */
export const pageItems: readonly PageItem[] = pageItemsOf(enabledSections, film);

/** Roman numeral of an act id ("act-3" → "III"), by first appearance. */
export function numeralOf(actId: string): string | undefined {
  const a = actSpecOf(film, actId);
  const i = a ? acts.indexOf(a) : -1;
  return i < 0 ? undefined : roman(i + 1);
}

/** Header act label for the active section/card id (SPEC §9.5): "" at the
 *  hero, "ACT II • THE WORKSHOP", "INTERMISSION", "CREDITS". */
export function headerLabel(activeId: string | null | undefined): string {
  return headerLabelOf(activeId, enabledSections, film);
}

/** Opening-card compass bearing of act row i (SPEC §12.3). */
export function bearingOf(actIndex: number): number {
  return bearingOfRaw(actIndex, acts.length);
}

/* — Works, words, copy ——————————————————————————————————————————————— */

/** The works in use, in act order (+ the prologue's): prologue credit line,
 *  opening rows, films chapter, credits' WORLDS BORROWED FROM. */
export const worksInUse: readonly WorkInUse[] = worksInUseOf(enabledSections, film);

/** "three films and a game" (derived from worksInUse). */
export const worksWords: string = worksPhrase(worksInUse);

/** Page copy with its derived tokens filled ({acts}, {works}, {n} …). The
 *  STATUS travels with it: callers gate it with copyVisible(). */
export function copyText(key: CopyKey, extra: Record<string, string | number> = {}) {
  const c = film.copy[key];
  return { ...c, text: fillCopy(c.text, enabledSections, film, extra) };
}

/** How an act title sets in its world lettering (SPEC §9.7): only when the
 *  face ships and its glyph subset holds EXACTLY this string. The subsets
 *  are cut from `film.lettering[].text` case-sensitively, so an all-caps
 *  lettering ("THE CROSSING") sets a mixed-case title with text-transform
 *  uppercase (never "The Crossing" in blackletter T/C + Newsreader
 *  lowercase). `lettered: false` → Newsreader `title` (fixture L). */
export function letteringFor(
  id: LetteringId | null | undefined,
  text: string,
): { lettered: boolean; upper: boolean } {
  const l = id ? film.lettering.find((x) => x.id === id) : undefined;
  if (!l || !l.shipped) return { lettered: false, upper: false };
  if (l.text === text) return { lettered: true, upper: false };
  const caps = l.text === l.text.toUpperCase();
  if (caps && l.text === text.toUpperCase()) return { lettered: true, upper: true };
  return { lettered: false, upper: false };
}

/* — Lettering in the fan faces (M2, RECOGNIZABILITY O-1) ————————————— */

/** The film world whose face sets `face` ("Kalam" → "idiots"), or null. */
function worldOfFace(face: string): CaptionWorld | null {
  for (const [w, f] of Object.entries(film.worldFaces) as [CaptionWorld, string][]) if (f === face) return w;
  return null;
}

/** Whether `text` may set in `world`'s fan face: a SHIPPED mode-A lettering
 *  string in that face equals it exactly, or equals its caps (then set it
 *  with text-transform: uppercase). Slot "caption" entries count only while
 *  film.fontScope.extended is on. Anything unregistered stays house type:
 *  the subsets hold ONLY the registered strings' glyphs. */
export function letteredIn(world: CaptionWorld, text: string): { lettered: boolean; upper: boolean } {
  const face = film.worldFaces[world];
  for (const l of film.lettering) {
    if (!l.shipped || l.mode !== "A" || l.face !== face || !l.text) continue;
    if (l.slot === "caption" && !film.fontScope.extended) continue;
    // "display" (the hero name) letters only the hero h1 (PHASE3-SPEC §5.4)
    if (l.slot === "display") continue;
    if (l.text === text) return { lettered: true, upper: false };
    if (l.text === l.text.toUpperCase() && l.text === text.toUpperCase()) return { lettered: true, upper: true };
  }
  return { lettered: false, upper: false };
}

/** The world whose face letters quote `id` (a shipped lettering entry with
 *  `quote: id`), or null → <FilmQuote rendition="lettered"> sets it in the
 *  host's own type. */
export function quoteLetteringWorld(id: QuoteId): CaptionWorld | null {
  if (!film.enabled || !film.fontScope.extended) return null;
  const l = film.lettering.find((x) => x.quote === id && x.shipped && x.mode === "A");
  return l ? worldOfFace(l.face) : null;
}

/** The film title of a world in caps ("3 IDIOTS"), or null for house. */
export function filmTitleOf(world: World): string | null {
  const w = film.worlds[world].work;
  return w ? w.title.toUpperCase() : null;
}

/* — Scene captions (M2, RECOGNIZABILITY §4, §6) ——————————————————————— */

/** The caption key for a variant: `${base}.alt` when the ALT is rendering
 *  and such a key exists, else `base` ("cap.act-2" + "alt" → "cap.act-2.alt"). */
export function captionKeyFor(base: CaptionKey, variant: Variant): CaptionKey {
  if (variant === "alt") {
    const k = `${base}.alt`;
    if (Object.prototype.hasOwnProperty.call(film.captions, k)) return k as CaptionKey;
  }
  return base;
}

export type ResolvedCaption = {
  key: CaptionKey;
  world: CaptionWorld;
  /** The moment text (caps), or null when the moment is a quote. */
  moment: string | null;
  quote: QuoteId | null;
  /** "3 IDIOTS", or null when the caption carries no film span. */
  film: string | null;
  place: CaptionPlace;
  ariaHidden: boolean;
};

/** A caption ready to render, or null when it may not render in this build
 *  (film layer off, its copy / quote not visible). Pure: SSR = client. */
export function captionOf(key: CaptionKey): ResolvedCaption | null {
  if (!film.enabled) return null;
  const c = film.captions[key];
  if (!c) return null;
  if (c.moment && !copyVisible(c.moment)) return null;
  if (c.quote) {
    const q = quotes[c.quote];
    if (!copyVisible({ text: q.text, status: q.status })) return null;
  }
  if (!c.moment && !c.quote) return null;
  return {
    key,
    world: c.world,
    moment: c.moment ? c.moment.text : null,
    quote: c.quote ?? null,
    film: c.film === false ? null : filmTitleOf(c.world),
    place: c.place,
    ariaHidden: Boolean(c.ariaHidden),
  };
}

/** Whether a copy string may render in THIS build (SPEC §9.6, amended by
 *  Aryan's answer #2): never when empty; everything when `film.branchPreview`
 *  is on (this branch: dev AND plain production — it replaces the old
 *  FILM_PREVIEW env, which a client bundle could not see); otherwise drafts
 *  outside production only, and proposed copy in production only after
 *  Aryan's sign-off. Data only (no env reads in the preview path), so the
 *  server and client agree. The validator's release gate (RELEASE=1) is
 *  what keeps unsigned strings off main. */
export function copyVisible(c: { text: string; status: string }): boolean {
  if (!c.text) return false;
  if (film.branchPreview) return true;
  const prod = process.env.NODE_ENV === "production";
  if (c.status === "draft") return !prod;
  if (c.status === "proposed") return !prod || film.copySignedOff;
  return true;
}

/* — Variants (lib/variants.ts) ———————————————————————————————————————— */

/** A section's variant choice (entry.variant ?? film.defaultVariant). */
export function variantChoiceOf(entry: SectionEntry): VariantChoice {
  return entry.variant ?? film.defaultVariant;
}

/** A section's registry host: "hero" for the hero, else its id. */
export function variantHostOf(entry: SectionEntry): string {
  return entry.type === "hero" ? "hero" : entry.id;
}

/** The intro's variant choice (film.prologue.variant ?? film.defaultVariant). */
export const introVariant: VariantChoice = film.prologue.variant ?? film.defaultVariant;

/** A world's loader variant choice (registry host "loader-<kind>"). */
export function loaderVariantOf(world: World): VariantChoice {
  return film.worlds[world].loaderVariant ?? film.defaultVariant;
}

/** The MANIFEST's variant for one piece — for server components and SSR
 *  (no URL). Client components that must honour ?variant=… use
 *  useVariant() (lib/use-variant.ts) with the same choice + key. */
export function manifestVariant(choice: VariantChoice | null | undefined, key: string): Variant {
  return effectiveVariant(choice, key, "", film.defaultVariant);
}

/** Nav-enabled sections of a world ("Seen here in", films chapter). */
export function seenHereIn(world: World): SectionEntry[] {
  return seenHereInOf(world, enabledSections, film);
}

/** Deterministic TIP for a route / card key (SPEC §8.3). */
export function tipFor(key: string, exclude: readonly string[] = []) {
  return tipForKey(key, film, exclude);
}

/** The world that bookends the page (the prologue's; null if disabled). */
export const bookendWorld: World | null =
  film.enabled && film.prologue.enabled ? film.prologue.world : null;

/** Quote ids whose host renders on this page (credits' LINES QUOTED). */
export const quotesInUse: readonly QuoteId[] = (Object.keys(quotes) as QuoteId[]).filter((id) => {
  if (!film.enabled) return false;
  const host = quotes[id].host;
  if (host === "intro") return film.prologue.enabled;
  if (host === "credits") return bookendWorld !== null;
  if (host === "console") return film.eggs.enabled;
  if (host.startsWith("egg:")) {
    const egg = film.eggs.list.find((e) => e.id === host.slice(4));
    return film.eggs.enabled && Boolean(egg?.enabled);
  }
  if (host.startsWith("card:")) {
    const act = host.slice(5);
    return actCards.some((c) => c.act === act);
  }
  return byId.has(host);
});

/** Everything the closing-credits roll needs (SPEC SM-13, ICONS §10). M2:
 *  the `credits` manifest section renders it (components/sections/credits/
 *  credits-section.tsx → components/site/footer.tsx), after <main>. */
export const credits = {
  enabled: film.enabled,
  /** "Pirates of the Caribbean (2003–2017) · 3 Idiots (2009) · …" */
  worlds: worksInUse.map((w) => `${w.title} (${w.years})`),
  /** H3, verbatim; must render whenever film.enabled (validator #11). */
  legal: FAN_TRIBUTE_LINE,
  legalMore: film.copy["credits.legalMore"],
  ai: film.copy["credits.ai"],
  end: film.copy["credits.end"],
  /** Q-HP-2 (the oath's bookend) — the roll's last line, only with the HP
   *  prologue; render it through <FilmQuote id="Q-HP-2" rendition="line">. */
  lastLine: bookendWorld ? ("Q-HP-2" as const) : null,
  quotes: quotesInUse,
} as const;

/* — Anchors, numbering, labels ———————————————————————————————————— */

/** Enabled sections that render a DOM #id (`anchor` defaults to true). Feeds
 *  the sitemap and the shared active-section observer (incl. the `#top`
 *  sentinel, so nothing stays highlighted at the top of the page). Act card
 *  ids are in `cardAnchors` (they render only once app/page.tsx renders the
 *  cards). */
export const anchors: readonly string[] = enabledSections
  .filter((s) => s.anchor !== false)
  .map((s) => s.id);

/** #act-1 … #act-n (derived card anchors, SPEC §3 "Anchors"). */
export const cardAnchors: readonly string[] = actCards.map((c) => c.id);

/** The DOM id a section component renders: its `id`, or undefined when the
 *  entry says `anchor: false` (so what renders matches `anchors`). */
export function anchorId(entry: SectionEntry): string | undefined {
  return entry.anchor === false ? undefined : entry.id;
}

/** `#id` of the first enabled, anchored section of `type`, or null. Hard-wired
 *  CTAs (hero buttons, logo) link through this and hide themselves on null, so
 *  hiding or re-id-ing a section can't leave a dead link. */
export function hrefOfType(type: SectionType): string | null {
  const s = enabledSections.find((e) => e.type === type && e.anchor !== false);
  return s ? `#${s.id}` : null;
}

/** `#id` of an enabled, anchored section by id, or null (the hero CTA's
 *  `cta.to`, "Seen here in" links). */
export function hrefOfId(id: string): string | null {
  const s = byId.get(id);
  return s && s.anchor !== false ? `#${s.id}` : null;
}

/** Logo / back-to-top target: the hero's anchor ("#" scrolls to the top too,
 *  if the hero ever loses its anchor). */
export const topHref: string = hrefOfType("hero") ?? "#";

/* — Numbering: "01"…"NN" over enabled `numbered` entries, in page order. — */
const numbers = new Map<string, string>(
  enabledSections
    .filter((s) => s.numbered)
    .map((s, i) => [s.id, String(i + 1).padStart(2, "0")] as const),
);

export function numberOf(id: string): string | undefined {
  return numbers.get(id);
}

/** Human label for a section id: its nav label, else the id title-cased. */
export function labelFor(id: string): string {
  const label = byId.get(id)?.nav?.label;
  if (label) return label;
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* — Navigation ————————————————————————————————————————————————————————— */

export type NavItem = { id: string; label: string; href: string };

const navigable = enabledSections.filter(
  (s): s is SectionEntry & { nav: NonNullable<SectionEntry["nav"]> } =>
    Boolean(s.nav) && s.anchor !== false,
);

const toNavItem = (s: (typeof navigable)[number]): NavItem => ({
  id: s.id,
  label: s.nav.label,
  href: `#${s.id}`,
});

/** Header nav (desktop links + mobile drop-sheet): `nav.primary` entries. */
export const navItems: readonly NavItem[] = navigable
  .filter((s) => s.nav.primary)
  .map(toNavItem);

/** Right-edge section rail: every nav entry unless `nav.rail === false`. */
export const railItems: readonly NavItem[] = navigable
  .filter((s) => s.nav.rail !== false)
  .map(toNavItem);

/** The header's single "Contact" call-to-action (null if contact is hidden). */
export const contactItem: NavItem | null = (() => {
  const s = navigable.find((e) => e.type === "contact");
  return s ? toNavItem(s) : null;
})();

export type NavGroup = {
  /** Card id for act groups ("act-2"), "cold-open" / "intermission" / "credits" otherwise. */
  id: string;
  /** "Act II · The Workshop" / "Intermission" … */
  label: string;
  /** null since M2: the film is named in `label` (RECOGNIZABILITY §4.4). */
  credit: string | null;
  /** The card anchor to jump to the act ("#act-2"), or null. */
  href: string | null;
  items: NavItem[];
};

/** Menu + palette groups by act run, with the work credit in the header
 *  ("Act III · The Frontier — after Red Dead Redemption 2", SPEC §9.5). */
export const navGroups: readonly NavGroup[] = (() => {
  const groups: NavGroup[] = [];
  let cur: NavGroup | null = null;
  for (const s of enabledSections) {
    const act = actSpecOf(film, s.act);
    const gid = act
      ? (actCards.find((c) => c.act === act.id)?.id ?? act.id)
      : s.type === "hero"
        ? "cold-open"
        : s.type === "films"
          ? "intermission"
          : s.type === "credits"
            ? "credits"
            : "other";
    if (!cur || cur.id !== gid) {
      const card = act ? actCards.find((c) => c.act === act.id) : undefined;
      const spec = act ? film.worlds[act.world] : undefined;
      cur = {
        id: gid,
        // RECOGNIZABILITY §4.4: the film is named in the group header
        // ("Act II — 3 Idiots · The Workshop"), so `credit` is dropped.
        label: card
          ? spec?.work
            ? `Act ${card.numeral} — ${spec.work.title} · ${card.title}`
            : `Act ${card.numeral} · ${card.title}`
          : gid === "intermission"
            ? "Intermission"
            : gid === "credits"
              ? "Credits"
              : gid === "cold-open"
                ? "Opening"
                : "More",
        credit: null,
        href: card ? `#${card.id}` : null,
        items: [],
      };
      groups.push(cur);
    }
    if (s.nav && s.anchor !== false) cur.items.push(toNavItem(s as (typeof navigable)[number]));
  }
  return groups.filter((g) => g.items.length > 0 || g.href);
})();

/* — Command palette ————————————————————————————————————————————————————— */

export type PaletteGroup = "Navigate" | "Links";
export type PaletteIcon = "hash" | "github" | "mail";
export type PaletteAction =
  | { kind: "scroll"; target: string }
  | { kind: "open"; href: string }
  | { kind: "mailto"; address: string }
  | { kind: "copy"; text: string };

export type PaletteCommand = {
  id: string;
  label: string;
  group: PaletteGroup;
  keywords: string;
  icon: PaletteIcon;
  action: PaletteAction;
};

/** Sub-anchor / utility jumps that are not manifest sections. Each is kept
 *  only while the section it lives `within` is enabled, and dropped once a
 *  manifest section owns the same target (e.g. when `kill-list` is enabled). */
const staticNavigate: readonly {
  id: string;
  label: string;
  keywords: string;
  target: string;
  within: string;
  /** Dropped when an enabled manifest section already owns this target. */
  ownedBySection?: boolean;
}[] = [
  {
    id: "nav-killlist",
    label: "Go to the Kill-list",
    keywords: "killed rejected post-mortem failures graveyard",
    target: "kill-list",
    within: "work",
    ownedBySection: true,
  },
  {
    id: "nav-top",
    label: "Back to top",
    keywords: "hero home start",
    target: "top",
    within: "top",
  },
];

const firstName = site.name.split(" ")[0];

const staticLinks: readonly PaletteCommand[] = [
  {
    id: "link-github",
    label: "View GitHub",
    group: "Links",
    keywords: "code repos source projects",
    icon: "github",
    action: { kind: "open", href: site.github },
  },
  {
    id: "link-email",
    label: `Email ${firstName}`,
    group: "Links",
    keywords: `contact reach mail ${site.email}`,
    icon: "mail",
    action: { kind: "mailto", address: site.email },
  },
  {
    id: "link-copy",
    label: "Copy email address",
    group: "Links",
    keywords: `clipboard ${site.email}`,
    icon: "mail",
    action: { kind: "copy", text: site.email },
  },
];

/** Every palette command, in display order: manifest sections (page order),
 *  then static jumps, then links. */
export const paletteCommands: readonly PaletteCommand[] = [
  ...navigable
    .filter((s) => s.nav.palette !== false)
    .map(
      (s): PaletteCommand => ({
        id: `nav-${s.id}`,
        label: `Go to ${s.nav.paletteLabel ?? s.nav.label}`,
        group: "Navigate",
        keywords: [s.nav.label, ...(s.nav.keywords ?? [])].join(" "),
        icon: "hash",
        action: { kind: "scroll", target: s.id },
      }),
    ),
  ...staticNavigate
    .filter((c) => byId.has(c.within) && !(c.ownedBySection && byId.has(c.target)))
    .map(
      (c): PaletteCommand => ({
        id: c.id,
        label: c.label,
        group: "Navigate",
        keywords: c.keywords,
        icon: "hash",
        action: { kind: "scroll", target: c.target },
      }),
    ),
  ...staticLinks,
];

/** Meta work credit for a world ("AFTER 3 IDIOTS"; null for house). */
export function creditOf(world: World): string | null {
  return workCredit(film.worlds[world]);
}
