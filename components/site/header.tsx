"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useReducedMotion } from "@/lib/flags";
import { dur, ease } from "@/lib/motion";
import { site } from "@/lib/content";
import {
  actCards,
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

/* ============================================================================
   HEADER (SPEC v2 §9.5, DESIGN v3 §8/§9 chrome): [AS] · the act label ·
   Work pill · the waveform Pause (Nox / Lumos) · Menu. Chrome speaks Meta.
   There is NO compass, no NOW SHOWING, no progress bar and no rail (the
   compass is never chrome; DESIGN §11.5) — the header's film layer is the
   ACT LABEL (Meta, not aria-live; empty at the top; hidden < 640) and a
   ground that follows the active act's world (its deep plane) once the page
   has scrolled. The menu is grouped by act, with the work credits in the
   group headers (derived: lib/sections.ts navGroups).
   ========================================================================== */

/** true after hydration (server + hydration render = false). */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** The world whose plane the header wears for the active id. */
function worldForId(id: string): WorldId {
  const card = actCards.find((c) => c.id === id);
  if (card) return card.to;
  const s = sectionById(id);
  return s ? worldOf(s) : "house";
}

/** The [AS] logo: the bracket's chrome use (DESIGN §5.1 ⑤, not counted). */
function Logo() {
  return (
    <a
      href={topHref}
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
  const active = useActiveSection();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cardsPresent, setCardsPresent] = useState<ReadonlySet<string>>(new Set());
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const label = active === "credits" && !sectionById("credits") ? "CREDITS" : headerLabel(active);
  const world = worldForId(active);
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
    <header
      {...planeAttrs("deep", world)}
      className={cn(
        "fixed inset-x-0 top-0 z-(--z-header) transition-colors duration-(--dur-base)",
        scrolled ? "bg-bg" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-(--header-h) w-full max-w-page items-center justify-between gap-4 px-gutter">
        <div className="flex min-w-0 items-center gap-4">
          <Logo />
          <p className="hidden truncate type-meta text-fg-muted sm:block" data-act-label="">
            {label}
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {workHref ? (
            <a
              href={workHref}
              aria-current={active === workHref.slice(1) ? "location" : undefined}
              className="inline-flex min-h-11 items-center rounded-pill px-4 type-meta text-fg shadow-[inset_0_0_0_1px_var(--fg-ghost)] transition-colors duration-(--dur-micro) hover:text-accent-bright"
            >
              Work
            </a>
          ) : null}
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
              <ol className="grid grid-cols-1 gap-x-6 gap-y-tier-block pt-tier-group md:grid-cols-2">
                {navGroups.map((g) => {
                  const cardLink = g.href && cardsPresent.has(g.href.slice(1)) ? g.href : null;
                  return (
                    <li key={g.id} className="border-t border-rule pt-tier-group">
                      <p className="type-meta text-fg-muted">
                        {cardLink ? (
                          <a
                            href={cardLink}
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
                          {g.items.map((n) => {
                            return (
                              <li key={n.id}>
                                <a
                                  href={n.href}
                                  data-menu-first={n.id === FIRST_LINK_ID ? "" : undefined}
                                  onClick={() => closeMenu(false)}
                                  aria-current={active === n.id ? "location" : undefined}
                                  className={cn(
                                    "inline-flex min-h-11 items-center type-heading transition-colors duration-(--dur-micro)",
                                    active === n.id ? "text-fg" : "text-fg-muted hover:text-fg",
                                  )}
                                >
                                  {n.label}
                                </a>
                              </li>
                            );
                          })}
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
    </header>
  );
}
