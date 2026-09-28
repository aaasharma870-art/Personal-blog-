/* ============================================================================
   SECTIONS — pure derivations of the page manifest (lib/page.ts).
   Server-safe (no React, no DOM). The header nav, section rail, command
   palette, sitemap and page renderer all read from here, so adding, hiding or
   reordering an entry in lib/page.ts updates every one of them.
   ========================================================================== */

import {
  DEFAULT_TONE,
  DEFAULT_WORLD,
  page,
  type SectionEntry,
  type SectionType,
  type Tone,
  type World,
} from "./page";
import { site } from "./content";

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

export function worldOf(entry: SectionEntry): World {
  return entry.world ?? DEFAULT_WORLD;
}

/** Enabled sections that render a DOM #id (`anchor` defaults to true). Feeds
 *  the sitemap and the shared active-section observer (incl. the `#top`
 *  sentinel, so nothing stays highlighted at the top of the page). */
export const anchors: readonly string[] = enabledSections
  .filter((s) => s.anchor !== false)
  .map((s) => s.id);

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
 *  only while the section it lives `within` is enabled. */
const staticNavigate: readonly {
  id: string;
  label: string;
  keywords: string;
  target: string;
  within: string;
}[] = [
  {
    id: "nav-killlist",
    label: "Go to the Kill-list",
    keywords: "killed rejected post-mortem failures graveyard",
    target: "kill-list",
    within: "work",
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
    .filter((c) => byId.has(c.within))
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
