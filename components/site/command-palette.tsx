"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  CornerDownLeft,
  Hash,
  Mail,
  Search,
} from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { nav, site } from "@/lib/content";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Cmd = {
  id: string;
  label: string;
  group: "Navigate" | "Links";
  keywords?: string;
  icon: ReactNode;
  run: () => void;
};

/** Event other components (the header button) dispatch to open the palette. */
export const OPEN_PALETTE_EVENT = "open-command-palette";

export function CommandPalette() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el)
      el.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
  }, []);

  const commands = useMemo<Cmd[]>(() => {
    const navCmds: Cmd[] = nav.map((n) => ({
      id: `nav-${n.href}`,
      label: `Go to ${n.label}`,
      group: "Navigate",
      keywords: n.label,
      icon: <Hash className="h-4 w-4" />,
      run: () => go(n.href.slice(1)),
    }));
    const extra: Cmd[] = [
      {
        id: "nav-killlist",
        label: "Go to the Kill-list",
        group: "Navigate",
        keywords: "killed rejected post-mortem failures graveyard",
        icon: <Hash className="h-4 w-4" />,
        run: () => go("kill-list"),
      },
      {
        id: "nav-voices",
        label: "Go to Testimonials",
        group: "Navigate",
        keywords: "teachers voices quotes recommendations",
        icon: <Hash className="h-4 w-4" />,
        run: () => go("voices"),
      },
      {
        id: "nav-top",
        label: "Back to top",
        group: "Navigate",
        keywords: "hero home start",
        icon: <Hash className="h-4 w-4" />,
        run: () => go("top"),
      },
    ];
    const links: Cmd[] = [
      {
        id: "link-github",
        label: "View GitHub",
        group: "Links",
        keywords: "code repos source projects",
        icon: <GithubMark className="h-4 w-4" />,
        run: () => window.open(site.github, "_blank", "noopener,noreferrer"),
      },
      {
        id: "link-email",
        label: `Email ${site.name.split(" ")[0]}`,
        group: "Links",
        keywords: `contact reach mail ${site.email}`,
        icon: <Mail className="h-4 w-4" />,
        run: () => {
          window.location.href = `mailto:${site.email}`;
        },
      },
      {
        id: "link-copy",
        label: "Copy email address",
        group: "Links",
        keywords: `clipboard ${site.email}`,
        icon: <Mail className="h-4 w-4" />,
        run: () => {
          navigator.clipboard?.writeText(site.email).catch(() => {});
        },
      },
    ];
    return [...navCmds, ...extra, ...links];
  }, [go]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  // open/close: ⌘K / Ctrl+K toggles; custom event opens. Resets live INSIDE the
  // event callbacks (not in an effect body) so each open starts fresh.
  useEffect(() => {
    const openFresh = () => {
      setQuery("");
      setActive(0);
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

  // lock scroll + focus the input while open (DOM side-effects only, no setState)
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
    // let the modal unmount before scrolling/navigating
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
    }
  };

  // keep the active option scrolled into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  let runningIndex = -1;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease }}
        >
          <button
            type="button"
            aria-label="Close command palette"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-canvas/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: dur.base, ease }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-line-strong bg-elevated shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-md"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
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
                placeholder="Jump to a section, GitHub, email…"
                className="w-full bg-transparent py-4 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.6rem] text-muted sm:block">
                esc
              </kbd>
            </div>

            <div
              ref={listRef}
              id="cmd-list"
              role="listbox"
              aria-label="Commands"
              className="max-h-[52vh] overflow-y-auto p-2"
            >
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  No matches.
                </p>
              ) : (
                (["Navigate", "Links"] as const).map((group) => {
                  const items = filtered.filter((c) => c.group === group);
                  if (items.length === 0) return null;
                  return (
                    <div key={group} className="mb-1">
                      <p className="eyebrow px-3 py-2 text-muted">{group}</p>
                      {items.map((c) => {
                        runningIndex += 1;
                        const idx = runningIndex;
                        const sel = idx === active;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            role="option"
                            aria-selected={sel}
                            data-idx={idx}
                            onMouseMove={() => setActive(idx)}
                            onClick={() => runAt(idx)}
                            className={cn(
                              "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                              sel ? "bg-raised text-ink" : "text-stone",
                            )}
                          >
                            {sel ? (
                              <span
                                aria-hidden="true"
                                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-aqua"
                              />
                            ) : null}
                            <span className={cn(sel ? "text-aqua" : "text-muted")}>
                              {c.icon}
                            </span>
                            <span className="flex-1">{c.label}</span>
                            {c.group === "Links" ? (
                              <ArrowUpRight className="h-3.5 w-3.5 text-muted" />
                            ) : null}
                            {sel ? (
                              <CornerDownLeft className="h-3.5 w-3.5 text-aqua" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
