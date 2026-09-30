"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useDesktopFine, useReducedMotion } from "@/lib/flags";
import { dur, ease } from "@/lib/motion";
import { site } from "@/lib/content";
import {
  actCards,
  anchors,
  cardAnchors,
  copyText,
  copyVisible,
  headerLabel,
  hrefOfType,
  navGroups,
  sectionById,
  topHref,
  worldOf,
} from "@/lib/sections";
import { planeAttrs, type WorldId } from "@/lib/worlds";
import { cn } from "@/lib/utils";
import { GithubMark } from "@/components/ui/icons";
import { MotionToggle } from "@/components/primitives/motion-toggle";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { OPEN_PALETTE_EVENT } from "@/components/site/command-palette";
import { useActiveSection } from "@/components/site/use-active-section";
import { recordVisit } from "@/components/eggs/egg-bus";
import { HuntChip } from "@/components/eggs/hunt-chip";
import { SoundToggle } from "@/components/audio/sound-toggle";

/** The DVD chapter select (spec §11.2, W3-CINEMA): fetched only when the
 *  menu opens on DESKTOP_FINE (plan DP-17). */
const ChapterSelect = dynamic(() => import("@/components/site/chapter-select").then((m) => m.ChapterSelect), {
  ssr: false,
});

/* ============================================================================
   HEADER (SPEC v2 §9.5, DESIGN v3 §8/§9 chrome): [AS] · the act label ·
   Work pill · the waveform Pause (Nox / Lumos) · Menu. Chrome speaks Meta.
   There is NO compass, no NOW SHOWING, no progress bar and no rail (the
   compass is never chrome; DESIGN §11.5) — the header's film layer is the
   ACT LABEL (Meta, not aria-live; empty at the top; hidden < 640) and a
   ground that follows the active act's world (its deep plane) once the page
   has scrolled. The menu is grouped by act, with the work credits in the
   group headers (derived: lib/sections.ts navGroups).
   M2 (loaders-eggs-chrome; RECOGNIZABILITY §4.4): the label names the FILM
   across all four acts — "ACT I · PIRATES OF THE CARIBBEAN" … "ACT IV ·
   HARRY POTTER", "INTERMISSION" on the films chapter, "CREDITS" on the roll
   (lib/derive.ts headerLabelOf) — and fades in when it changes (static
   under reduced motion / Pause); the ground follows the act's world (house
   is transparent: the intermission and credits wear house deep). The menu
   groups read "Act II — 3 Idiots · The Workshop". Still NO compass in the
   chrome (SPEC §9.5, DESIGN §11.5, ICONS IC-PC-02 "never in chrome").
   Route-aware: off the home page (the 404) every link is /#id. The active
   section is also the Map egg's footprint trail (sessionStorage: E6).
   ========================================================================== */

/** true after hydration (server + hydration render = false). */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/* — The settled section (M2 fix, ART-DIRECTOR #15 "D20 header act label
   missing") ———————————————————————————————————————————————————————
   The shared observer (use-active-section.ts) only updates on an entry that
   IS intersecting, so a long, fast scroll can leave it stale — a jump from
   the credits back to #about landed with no act label, and a jump down to
   the roll could still read INTERMISSION. Once scrolling settles (150 ms
   after the last scroll event), the header re-reads the truth from the DOM:
   the anchored section (or act card) spanning the observer's own reading
   band (45–50 % of the viewport). A gap between sections keeps the
   observer's value. */
const PROBE_IDS: readonly string[] = [...anchors, ...cardAnchors, ...(sectionById("credits") ? [] : ["credits"])];
const PROBE_SETTLE_MS = 150;

function probeActive(): string | null {
  const y = window.innerHeight * 0.475;
  let hit: string | null = null;
  for (const id of PROBE_IDS) {
    const r = document.getElementById(id)?.getBoundingClientRect();
    if (r && r.height > 0 && r.top <= y && r.bottom > y) hit = id;
  }
  return hit;
}

/** The active id for the header: the observer's live value while it moves,
 *  the DOM probe once the scroll has settled after its last change. */
function useHeaderActive(): string {
  const observed = useActiveSection();
  const observedRef = useRef(observed);
  const [probe, setProbe] = useState<{ id: string | null; base: string }>({ id: null, base: "" });
  useEffect(() => {
    observedRef.current = observed;
  }, [observed]);
  useEffect(() => {
    let t = 0;
    const schedule = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const id = probeActive();
        const base = observedRef.current;
        // an unchanged probe keeps its object: no re-render of the header
        setProbe((prev) => (prev.id === id && prev.base === base ? prev : { id, base }));
      }, PROBE_SETTLE_MS);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  // a probe taken against the CURRENT observer value is newer than it
  return probe.id !== null && probe.base === observed ? probe.id : observed;
}

/** The world whose plane the header wears for the active id. */
function worldForId(id: string): WorldId {
  const card = actCards.find((c) => c.id === id);
  if (card) return card.to;
  const s = sectionById(id);
  return s ? worldOf(s) : "house";
}

/* — The active id reaches only the parts that show it (the ground, the act
   label, the Work pill and the menu's links): a section change re-renders
   those, never the whole header and its menu sheet. — */
const ActiveContext = createContext("");

function labelFor(active: string): string {
  return active === "credits" && !sectionById("credits") ? "CREDITS" : headerLabel(active);
}

/** The <header> itself: its ground follows the active act's world. Its
 *  children are the Header's own elements (unchanged on a section change,
 *  so React skips them); the context consumers below re-render. */
function HeaderGround({ className, children }: { className: string; children: ReactNode }) {
  const active = useHeaderActive();
  // the visitor's own trail, for the Marauder's Map egg (never shown at rest)
  useEffect(() => {
    if (active && sectionById(active)) recordVisit(active);
  }, [active]);
  return (
    <ActiveContext.Provider value={active}>
      <header {...planeAttrs("deep", worldForId(active))} className={className}>
        {children}
      </header>
    </ActiveContext.Provider>
  );
}

/** The act label (M2 fix, ART-DIRECTOR #15): a keyed fade-IN with no exit.
 *  The old AnimatePresence mode="wait" swap could strand the label
 *  mid-exchange on a fast multi-act scroll (an empty act label on #about);
 *  now the newest label always mounts and always ends at opacity 1. The
 *  hydration pass mounts it without animating (server == client); static
 *  under reduced motion / Pause. */
function ActLabel() {
  const label = labelFor(useContext(ActiveContext));
  const reduce = useReducedMotion();
  const mounted = useMounted();
  return (
    <p className="hidden truncate type-meta text-fg-muted sm:block" data-act-label="">
      <motion.span
        key={label}
        className="block truncate"
        initial={mounted && !reduce ? { opacity: 0, y: 4 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : dur.micro, ease }}
      >
        {label}
      </motion.span>
    </p>
  );
}

function WorkPill({ base, href }: { base: string; href: string }) {
  const active = useContext(ActiveContext);
  return (
    <a
      href={`${base}${href}`}
      aria-current={active === href.slice(1) ? "location" : undefined}
      className="inline-flex min-h-11 items-center rounded-pill px-4 type-meta text-fg shadow-[inset_0_0_0_1px_var(--fg-ghost)] transition-colors duration-(--dur-micro) hover:text-accent-bright"
    >
      Work
    </a>
  );
}

function MenuLink({ id, href, label, onPick }: { id: string; href: string; label: string; onPick: () => void }) {
  const current = useContext(ActiveContext) === id;
  return (
    <a
      href={href}
      data-menu-first={id === FIRST_LINK_ID ? "" : undefined}
      onClick={onPick}
      aria-current={current ? "location" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center type-heading transition-colors duration-(--dur-micro)",
        current ? "text-fg" : "text-fg-muted hover:text-fg",
      )}
    >
      {label}
    </a>
  );
}

/** The [AS] logo: the bracket's chrome use (DESIGN §5.1 ⑤, not counted). */
function Logo({ base }: { base: string }) {
  return (
    <a
      href={`${base}${topHref}`}
      aria-label={`${site.name} — back to the top`}
      className="group inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-control px-1"
    >
      <svg viewBox="0 0 8 28" aria-hidden="true" focusable="false" className="h-6 w-2 stroke-fg-ghost transition-colors duration-(--dur-micro) group-hover:stroke-fg-muted">
        <path d="M7 1 L1 1 L1 27 L7 27" fill="none" strokeWidth={1.5} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="type-meta text-fg">{site.initials}</span>
      <svg viewBox="0 0 8 28" aria-hidden="true" focusable="false" className="h-6 w-2 stroke-fg-ghost transition-colors duration-(--dur-micro) group-hover:stroke-fg-muted">
        <path d="M1 1 L7 1 L7 27 L1 27" fill="none" strokeWidth={1.5} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
      </svg>
    </a>
  );
}

/** The waveform Pause with its Lumos / Nox tooltip (IC-HP-09). The
 *  accessible name stays literal ("Pause motion", state in aria-pressed);
 *  the tooltip is a proposed-copy alias shown on hover AND focus, rendered
 *  only after hydration (no server/client copy-gate disagreement). */
function PauseWithTooltip() {
  const mounted = useMounted();
  const { paused } = useMotionPreference();
  const tip = copyText(paused ? "pause.tooltip.resume" : "pause.tooltip.pause");
  return (
    <span className="group/tip relative inline-flex">
      <MotionToggle />
      {mounted && copyVisible(tip) ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-full mt-1 whitespace-nowrap rounded-control px-3 py-1.5 type-meta text-fg-muted opacity-0 transition-opacity duration-(--dur-micro) surface-2 group-focus-within/tip:opacity-100 group-hover/tip:opacity-100"
        >
          {tip.text}
        </span>
      ) : null}
    </span>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The menu's first section link (focused when the menu opens). */
const FIRST_LINK_ID = navGroups.flatMap((g) => g.items)[0]?.id;

export function Header() {
  const reduce = useReducedMotion();
  const fine = useDesktopFine();
  const pathname = usePathname();
  // the page's anchors live on the home page: off it, prefix "/" (the 404)
  const base = pathname === "/" || pathname === null ? "" : "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cardsPresent, setCardsPresent] = useState<ReadonlySet<string>>(new Set());
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const workHref = hrefOfType("gauntlet");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = () => {
    // act-card anchors only exist once the cards render: link group headers
    // only to cards that are actually on the page (no dead links)
    setCardsPresent(new Set(actCards.map((c) => c.id).filter((id) => document.getElementById(id))));
    setOpen(true);
  };
  const closeMenu = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }, []);

  // while open: lock scroll, focus the first link, Esc closes
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      sheetRef.current?.querySelector<HTMLElement>("[data-menu-first]")?.focus();
    }, 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeMenu]);

  // focus trap inside the sheet (dialog rules)
  const onSheetKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const els = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    const first = els[0];
    const last = els[els.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <HeaderGround
      className={cn(
        "fixed inset-x-0 top-0 z-(--z-header) transition-colors duration-(--dur-base)",
        scrolled ? "bg-bg" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-(--header-h) w-full max-w-page items-center justify-between gap-4 px-gutter">
        <div className="flex min-w-0 items-center gap-4">
          <Logo base={base} />
          <ActLabel />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {workHref ? <WorkPill base={base} href={workHref} /> : null}
          <HuntChip />
          <SoundToggle />
          <PauseWithTooltip />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => (open ? closeMenu() : openMenu())}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-haspopup="dialog"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control px-3 type-meta text-fg-muted transition-colors duration-(--dur-micro) hover:text-fg"
          >
            Menu
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            ref={sheetRef}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onKeyDown={onSheetKey}
            {...planeAttrs("deep", "house")}
            className="fixed inset-0 z-(--z-menu) overflow-y-auto bg-bg text-fg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : dur.base, ease }}
          >
            <div className="mx-auto flex h-(--header-h) w-full max-w-page items-center justify-between px-gutter">
              <p className="type-meta text-fg-muted">Contents</p>
              <button
                type="button"
                onClick={() => closeMenu()}
                className="inline-flex min-h-11 items-center gap-2 rounded-control px-3 type-meta text-fg-muted transition-colors hover:text-fg"
              >
                Close
                <X className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Sections" className="mx-auto w-full max-w-page px-gutter pb-tier-block">
              {fine ? <ChapterSelect onPick={() => closeMenu(false)} /> : null}
              <ol className="grid grid-cols-1 gap-x-6 gap-y-tier-block pt-tier-group md:grid-cols-2">
                {navGroups.map((g) => {
                  const cardLink = g.href && cardsPresent.has(g.href.slice(1)) ? g.href : null;
                  return (
                    <li key={g.id} className="border-t border-rule pt-tier-group">
                      <p className="type-meta text-fg-muted">
                        {cardLink ? (
                          <a
                            href={`${base}${cardLink}`}
                            onClick={() => closeMenu(false)}
                            className="inline-flex min-h-11 items-center transition-colors hover:text-fg"
                          >
                            {g.label}
                          </a>
                        ) : (
                          <span className="inline-flex min-h-11 items-center">{g.label}</span>
                        )}
                        {g.credit ? (
                          <>
                            <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
                            <span className="sr-only">, </span>
                            <span>{g.credit}</span>
                          </>
                        ) : null}
                      </p>
                      {g.items.length ? (
                        <ul className="mt-tier-pair space-y-1">
                          {g.items.map((n) => (
                            <li key={n.id}>
                              <MenuLink id={n.id} href={`${base}${n.href}`} label={n.label} onPick={() => closeMenu(false)} />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ol>

              <div className="mt-tier-block flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-rule pt-tier-group">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu(false);
                    window.setTimeout(() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT)), 0);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 type-meta text-fg-muted transition-colors hover:text-fg"
                >
                  <Search className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  Search
                </button>
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-h-11 items-center gap-2 type-meta text-fg-muted transition-colors hover:text-fg"
                >
                  <GithubMark className="size-4" />
                  GitHub
                  <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                </a>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </HeaderGround>
  );
}
