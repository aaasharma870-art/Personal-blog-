"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CornerDownLeft, Hash, Mail, Pause, Play, Search } from "lucide-react";
import { useReducedMotion } from "@/lib/flags";
import {
  actCards,
  navGroups,
  paletteCommands,
  type PaletteAction,
  type PaletteIcon,
} from "@/lib/sections";
import { planeAttrs } from "@/lib/worlds";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { GithubMark } from "@/components/ui/icons";
import { useMotionPreference } from "@/components/providers/motion-provider";

/* ============================================================================
   COMMAND PALETTE (SPEC v2 §9.5, DESIGN v3 §9 chrome). ⌘K / Ctrl+K, or the
   Menu's Search. Commands are data derived from the manifest
   (lib/sections.ts); groups follow the ACTS, with the work credit in each
   group header ("Act III · The Frontier — after Red Dead Redemption 2"),
   then "Skip to Act …" jumps (only for act cards on the page), the Pause
   control (aliases: Nox / Lumos — the label stays literal, SPEC §9.4), and
   the links. Plane-aware tokens only (house canvas); the one accent is the
   active option's mark. M2 adds the egg commands and "Turn off easter eggs".
   ========================================================================== */

type Cmd = {
  id: string;
  label: string;
  /** Group header shown above the command. */
  group: string;
  keywords?: string;
  icon: ReactNode;
  external?: boolean;
  run: () => void;
};

const ICONS: Record<PaletteIcon, ReactNode> = {
  hash: <Hash className="size-4" strokeWidth={1.5} aria-hidden="true" />,
  github: <GithubMark className="size-4" />,
  mail: <Mail className="size-4" strokeWidth={1.5} aria-hidden="true" />,
};

/** Browser behaviour for a palette action (runs on selection, never in render). */
function performAction(a: PaletteAction, go: (id: string) => void): void {
  switch (a.kind) {
    case "scroll":
      go(a.target);
      return;
    case "open":
      window.open(a.href, "_blank", "noopener,noreferrer");
      return;
    case "mailto":
      window.location.href = `mailto:${a.address}`;
      return;
    case "copy":
      navigator.clipboard?.writeText(a.text).catch(() => {});
      return;
  }
}

/** Event other components (the header menu) dispatch to open the palette. */
export const OPEN_PALETTE_EVENT = "open-command-palette";

const groupTitle = (g: (typeof navGroups)[number]) => (g.credit ? `${g.label} — ${g.credit}` : g.label);

/** Snapshot of what the page holds, taken when the palette opens: which act
 *  cards exist, and which section each sub-anchor (e.g. #kill-list) lives in. */
type PageSnapshot = { cards: ReadonlySet<string>; hostOf: ReadonlyMap<string, string> };
const EMPTY: PageSnapshot = { cards: new Set(), hostOf: new Map() };

function snapshotPage(): PageSnapshot {
  const cards = new Set(actCards.map((c) => c.id).filter((id) => document.getElementById(id)));
  const hostOf = new Map<string, string>();
  for (const c of paletteCommands) {
    if (c.action.kind !== "scroll") continue;
    const host = document.getElementById(c.action.target)?.closest("[data-section]")?.getAttribute("data-section");
    if (host) hostOf.set(c.action.target, host);
  }
  return { cards, hostOf };
}

export function CommandPalette() {
  const reduce = useReducedMotion();
  const { paused, setPaused } = useMotionPreference();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [page, setPage] = useState<PageSnapshot>(EMPTY);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el)
      el.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
  }, []);

  const commands = useMemo<Cmd[]>(() => {
    const out: Cmd[] = [];
    const scroll = paletteCommands.filter((c) => c.action.kind === "scroll");
    const placed = new Set<string>();
    // 1. sections, grouped by act (page order)
    for (const g of navGroups) {
      const ids = new Set(g.items.map((n) => n.id));
      for (const c of scroll) {
        if (c.action.kind !== "scroll") continue;
        const target = c.action.target;
        const host = page.hostOf.get(target) ?? target;
        if (!ids.has(target) && !ids.has(host)) continue;
        if (placed.has(c.id)) continue;
        placed.add(c.id);
        out.push({
          id: c.id,
          label: c.label,
          group: groupTitle(g),
          keywords: c.keywords,
          icon: ICONS[c.icon],
          run: () => performAction(c.action, go),
        });
      }
    }
    for (const c of scroll) {
      if (placed.has(c.id)) continue;
      out.push({ id: c.id, label: c.label, group: "Navigate", keywords: c.keywords, icon: ICONS[c.icon], run: () => performAction(c.action, go) });
    }
    // 2. act-card jumps (only cards rendered on the page)
    for (const card of actCards) {
      if (!page.cards.has(card.id)) continue;
      out.push({
        id: `skip-${card.id}`,
        label: `Skip to Act ${card.numeral} · ${card.title}`,
        group: "Acts",
        keywords: `act chapter ${card.credit ?? ""}`,
        icon: ICONS.hash,
        run: () => go(card.id),
      });
    }
    // 3. motion (the WCAG 2.2.2 control; Nox / Lumos are search aliases only)
    out.push({
      id: "motion-toggle",
      label: paused ? "Resume motion" : "Pause motion",
      group: "Motion",
      keywords: "nox lumos pause resume stop animation motion reduce",
      icon: paused ? (
        <Play className="size-4" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Pause className="size-4" strokeWidth={1.5} aria-hidden="true" />
      ),
      run: () => setPaused(!paused),
    });
    // 4. links
    for (const c of paletteCommands) {
      if (c.action.kind === "scroll") continue;
      const action = c.action;
      out.push({
        id: c.id,
        label: c.label,
        group: "Links",
        keywords: c.keywords,
        icon: ICONS[c.icon],
        external: action.kind === "open",
        run: () => performAction(action, go),
      });
    }
    return out;
  }, [go, page, paused, setPaused]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.keywords ?? ""} ${c.group}`.toLowerCase().includes(q));
  }, [commands, query]);

  // open/close: ⌘K / Ctrl+K toggles; the custom event opens. Resets live
  // INSIDE the event callbacks (not in an effect body) so each open is fresh.
  useEffect(() => {
    const openFresh = () => {
      setQuery("");
      setActive(0);
      setPage(snapshotPage());
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openFresh();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, openFresh);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, openFresh);
    };
  }, [open]);

  // lock scroll + focus the input while open (DOM side-effects only)
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  const runAt = (i: number) => {
    const cmd = filtered[i];
    if (!cmd) return;
    setOpen(false);
    // let the modal unmount before scrolling / navigating
    setTimeout(() => cmd.run(), 0);
  };

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAt(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      // the input is the dialog's only tab stop (options are pointer/arrow driven)
      e.preventDefault();
    }
  };

  // keep the active option scrolled into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // group the filtered list, preserving order
  const groups: { title: string; items: { cmd: Cmd; idx: number }[] }[] = [];
  filtered.forEach((cmd, idx) => {
    const last = groups[groups.length - 1];
    if (last && last.title === cmd.group) last.items.push({ cmd, idx });
    else groups.push({ title: cmd.group, items: [{ cmd, idx }] });
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          {...planeAttrs("canvas", "house")}
          className="fixed inset-0 z-(--z-menu) flex items-start justify-center px-4 pt-[12vh] text-fg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : dur.micro, ease }}
        >
          <button
            type="button"
            aria-label="Close command palette"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-bg/85"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : dur.base, ease }}
            className="surface-1 relative z-10 w-full max-w-xl overflow-hidden rounded-frame"
          >
            <div className="flex items-center gap-3 px-4 shadow-[inset_0_-1px_0_var(--rule)]">
              <Search className="size-4 shrink-0 text-fg-muted" strokeWidth={1.5} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-list"
                aria-autocomplete="list"
                aria-activedescendant={filtered[active] ? `cmd-${filtered[active].id}` : undefined}
                placeholder="Jump to an act, a section, GitHub, email…"
                className="min-h-14 w-full bg-transparent type-body text-fg placeholder:text-fg-muted focus:outline-none"
              />
              <kbd className="hidden shrink-0 type-meta text-fg-muted sm:block">Esc</kbd>
            </div>

            <div ref={listRef} id="cmd-list" role="listbox" aria-label="Commands" className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center type-small text-fg-muted">No matches.</p>
              ) : (
                groups.map((g) => (
                  <div key={g.title} role="group" aria-label={g.title} className="mb-1">
                    <p aria-hidden="true" className="px-3 pb-1 pt-3 type-meta text-fg-muted">
                      {g.title}
                    </p>
                    {g.items.map(({ cmd: c, idx }) => {
                      const sel = idx === active;
                      return (
                        <button
                          key={c.id}
                          id={`cmd-${c.id}`}
                          type="button"
                          role="option"
                          tabIndex={-1}
                          aria-selected={sel}
                          data-idx={idx}
                          onMouseMove={() => setActive(idx)}
                          onClick={() => runAt(idx)}
                          className={cn(
                            "relative flex min-h-11 w-full items-center gap-3 rounded-control px-3 py-2 text-left type-small transition-colors",
                            sel ? "bg-surface-2 text-fg" : "text-fg-muted",
                          )}
                        >
                          <span className={sel ? "text-fg" : "text-fg-muted"}>{c.icon}</span>
                          <span className="flex-1">{c.label}</span>
                          {c.external ? <ArrowUpRight className="size-3.5 text-fg-muted" strokeWidth={1.5} aria-hidden="true" /> : null}
                          {sel ? <CornerDownLeft className="size-3.5 text-accent" strokeWidth={1.5} aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
