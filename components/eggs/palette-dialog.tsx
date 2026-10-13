"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CornerDownLeft, Gamepad2, Hash, Mail, Pause, Play, Search, Sparkles } from "lucide-react";
import { film, type CopyKey } from "@/lib/film";
import { DESKTOP_FINE, useReducedMotion } from "@/lib/flags";
import { lockScroll, unlockScroll } from "@/lib/smooth-scroll";
import {
  actCards,
  copyText,
  copyVisible,
  navGroups,
  paletteCommands,
  sectionById,
  type PaletteAction,
  type PaletteIcon,
} from "@/lib/sections";
import { planeAttrs } from "@/lib/worlds";
import { dur, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { GithubMark } from "@/components/ui/icons";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { eggCopy, type EggCopyKey } from "@/components/eggs/egg-copy";
import { eggEnabled, eggsSessionOff, triggerEgg, type EggId } from "@/components/eggs/egg-bus";
import { HUNT_PANEL_EVENT, foundIds } from "@/components/eggs/hunt-store";
import { startDirectorsCut } from "@/components/director/api";

/* ============================================================================
   COMMAND PALETTE — the dialog (lazy). OWNER: W2-HUNT in W2. The always-loaded
   shell (components/site/command-palette.tsx: ⌘K, the Menu's open event, the
   route-aware jump, the EggHost) mounts this chunk on the first open (and
   warms it on the first intent: a pointer over the header, ⌘ / Ctrl held),
   keyed per open so every open is fresh (query, selection, page snapshot).
   It lives under components/eggs/ only because that is the W2-HUNT glob; it
   moved out of the shell to free first-load JS for Phase 3 (plan §0.1).
   ----------------------------------------------------------------------------
   COMMAND PALETTE (SPEC v2 §9.5, DESIGN v3 §9 chrome). ⌘K / Ctrl+K, or the
   Menu's Search. Commands are data derived from the manifest
   (lib/sections.ts); groups follow the ACTS, with the work credit in each
   group header ("Act III · The Frontier — after Red Dead Redemption 2"),
   then "Skip to Act …" jumps (only for act cards on the page), the Pause
   control (aliases: Nox / Lumos — the label stays literal, SPEC §9.4), and
   the links. Plane-aware tokens only (house canvas); the one accent is the
   active option's mark.
   M2 (loaders-eggs-chrome): the EGG commands (SPEC §9.5, §10.3) in their own
   group — the Marauder's Map, Obliviate, Parley, Aal izz well, Dead Eye
   (fine pointer ≥ 64 rem only), "Watch the intro again" (when the prologue
   can re-arm) and "Turn off / on easter eggs" (session); "Accio <room>"
   finds the room (every token of the query must match: "accio work"); the
   EggHost (components/eggs/egg-host.tsx: typed words, toasts, lazy egg
   chunks) mounts here, so it lives wherever the chrome does. Jumps are
   route-aware: off the home page (the 404) a room is /#id.
   PHASE 3 (PHASE3-SPEC §9, §9.1, §11.1; W2-HUNT):
   - The hunt's spells are HIDDEN from the empty-query browse list: a spell
     command appears only when the query holds its spell word ("solemn",
     "lumos" / "nox", "parley", "aal"), still a keyboard path. The browse
     list keeps Obliviate, the intro replay and eggs on/off.
   - Lumos and Nox are their own spell commands (labels: the Pause
     tooltip's). The Pause command is the plain WCAG control: no spell
     aliases, never a trigger, never counted.
   - Parley counts and toasts, then jumps to Contact.
   - A "Play" group: Fly the homemade drone (scroll to Systems, focus the
     take-off control, when it is on the page), Dead Eye, Show egg hints,
     Reset the egg hunt (an explicit confirm), Play the director's cut.
     The drone, the hints and the cut are DESKTOP_FINE only.
   ========================================================================== */

type Cmd = {
  id: string;
  label: string;
  /** Group header shown above the command. */
  group: string;
  keywords?: string;
  icon: ReactNode;
  external?: boolean;
  /** A hunt spell: listed only when the query holds one of these words. */
  spell?: readonly string[];
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

const groupTitle = (g: (typeof navGroups)[number]) => (g.credit ? `${g.label} — ${g.credit}` : g.label);

/** Snapshot of what the page holds, taken when the palette opens: which act
 *  cards exist, which section each sub-anchor (e.g. #kill-list) lives in,
 *  and what the eggs may offer right now. */
type PageSnapshot = {
  cards: ReadonlySet<string>;
  hostOf: ReadonlyMap<string, string>;
  /** Dead Eye: a fine pointer on a ≥ 64 rem viewport, and #kill-list here. */
  deadEye: boolean;
  /** The prologue can re-arm (window.__intro, motion allowed). */
  intro: boolean;
  eggsOff: boolean;
  /** DESKTOP_FINE (the hunt panel, the drone, the director's cut). */
  fine: boolean;
  /** The drone's take-off control is on the page (W3). */
  drone: boolean;
  /** Eggs found so far (Reset is offered once there is something to reset). */
  found: number;
};

type IntroApi = { replay?: () => boolean };

function snapshotPage(): PageSnapshot {
  const cards = new Set(actCards.map((c) => c.id).filter((id) => document.getElementById(id)));
  const hostOf = new Map<string, string>();
  for (const c of paletteCommands) {
    if (c.action.kind !== "scroll") continue;
    const host = document.getElementById(c.action.target)?.closest("[data-section]")?.getAttribute("data-section");
    if (host) hostOf.set(c.action.target, host);
  }
  const intro = (window as Window & { __intro?: IntroApi }).__intro;
  const fine = window.matchMedia(DESKTOP_FINE).matches;
  return {
    cards,
    hostOf,
    // The game's own gate (components/eggs/dead-eye.ts): the kill-list, the
    // DEAD EYE pill (#deadeye-call) and the full DESKTOP_FINE query.
    deadEye: fine && Boolean(document.getElementById("kill-list")) && Boolean(document.getElementById("deadeye-call")),
    intro: typeof intro?.replay === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    eggsOff: eggsSessionOff(),
    fine,
    drone: fine && Boolean(document.getElementById("drone-takeoff")),
    found: foundIds().length,
  };
}

/** An egg command's label, or null when its copy may not render here. */
const eggText = (k: EggCopyKey): string | null => (copyVisible(eggCopy[k]) ? eggCopy[k].text : null);
/** Any page copy key's text, or null when it may not render here. */
const pageText = (k: CopyKey): string | null => {
  const c = copyText(k);
  return copyVisible(c) ? c.text : null;
};

/** Every whitespace token of the query appears in the haystack ("accio work"). */
function matches(hay: string, q: string): boolean {
  const h = hay.toLowerCase();
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((t) => h.includes(t));
}

export default function PaletteDialog({
  open,
  onClose,
  go,
}: {
  open: boolean;
  onClose: () => void;
  /** The shell's route-aware jump (lib/smooth-scroll.ts scrollToTarget). */
  go: (id: string) => Promise<void>;
}) {
  const reduce = useReducedMotion();
  const { paused, setPaused } = useMotionPreference();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // what the page holds right now (the shell mounts a fresh dialog per open)
  const [page] = useState<PageSnapshot>(snapshotPage);
  // where focus was when this (fresh) dialog opened: it goes back there
  const [returnTo] = useState<Element | null>(() => (typeof document === "undefined" ? null : document.activeElement));
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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
          // "Accio <room>" (SPEC §10.3): the spell finds any room
          keywords: `${c.keywords} accio`,
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
      keywords: "pause resume stop animation motion reduce",
      icon: paused ? (
        <Play className="size-4" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Pause className="size-4" strokeWidth={1.5} aria-hidden="true" />
      ),
      run: () => setPaused(!paused),
    });
    // 4. the easter eggs (SPEC §10.3; labels stay literal, spells are
    //    search aliases; nothing here is needed to read the page). The hunt
    //    spells carry `spell`: hidden until the query holds a spell word.
    if (film.enabled && film.eggs.enabled) {
      const group = eggText("group.eggs") ?? "Easter eggs";
      const sparkle = <Sparkles className="size-4" strokeWidth={1.5} aria-hidden="true" />;
      const add = (id: string, label: string | null, keywords: string, run: () => void, on = true, spell?: readonly string[]) => {
        if (!label || !on) return;
        out.push({ id: `egg-${id}`, label, group, keywords, icon: sparkle, run, spell });
      };
      const fire = (id: EggId) => () => triggerEgg(id);
      add("map", eggText("cmd.map"), eggText("cmd.map.keywords") ?? "", fire("marauders-map"), eggEnabled("marauders-map"), ["solemn"]);
      add("lumos", pageText("pause.tooltip.resume"), "lumos light spell resume", fire("lumos"), eggEnabled("lumos"), ["lumos"]);
      add("nox", pageText("pause.tooltip.pause"), "nox dark spell pause", fire("nox"), eggEnabled("nox"), ["nox"]);
      add(
        "parley",
        eggText("cmd.parley"),
        "parley contact talk truce",
        () => {
          triggerEgg("parley");
          void go("contact");
        },
        eggEnabled("parley") && Boolean(sectionById("contact")),
        ["parley"],
      );
      add("aal", eggText("cmd.aal"), "aal all izz is well 3 idiots rancho calm", fire("aal-izz-well"), eggEnabled("aal-izz-well"), ["aal"]);
      add("obliviate", eggText("cmd.obliviate"), "obliviate forget reset clear visit memory", fire("accio-obliviate"), eggEnabled("accio-obliviate"));
      add(
        "intro",
        eggText("cmd.intro"),
        "intro prologue replay again hogwarts broom play",
        () => {
          (window as Window & { __intro?: IntroApi }).__intro?.replay?.();
        },
        page.intro,
      );
      add(
        page.eggsOff ? "eggs-on" : "eggs-off",
        eggText(page.eggsOff ? "cmd.eggs.on" : "cmd.eggs.off"),
        "easter eggs off on disable enable quiet",
        fire(page.eggsOff ? "eggs-on" : "eggs-off"),
      );

      // 4b. Play: the toys, the hints, the reset, the director's cut
      const play = pageText("palette.play") ?? "Play";
      const pad = <Gamepad2 className="size-4" strokeWidth={1.5} aria-hidden="true" />;
      const toy = (id: string, label: string | null, keywords: string, run: () => void, on: boolean) => {
        if (label && on) out.push({ id: `play-${id}`, label, group: play, keywords, icon: pad, run });
      };
      toy(
        "drone",
        pageText("toy.drone.cmd"),
        "drone quadcopter fly game gates systems",
        () => {
          void go("systems").then(() => document.getElementById("drone-takeoff")?.focus({ preventScroll: true }));
        },
        page.drone,
      );
      toy("deadeye", eggText("cmd.deadeye"), "dead eye deadeye red dead kill-list killed mark game", fire("dead-eye"), eggEnabled("dead-eye") && page.deadEye);
      toy(
        "hints",
        pageText("palette.hints"),
        "easter egg hunt hints found count",
        () => window.dispatchEvent(new Event(HUNT_PANEL_EVENT)),
        page.fine && !page.eggsOff,
      );
      toy(
        "reset",
        pageText("egg.hunt.reset"),
        "easter egg hunt reset forget start over",
        () => {
          const ask = pageText("egg.hunt.reset.confirm");
          if (ask && !window.confirm(ask)) return;
          void import("@/lib/hunt").then((m) => m.resetHunt());
        },
        page.found > 0,
      );
      toy("dc", pageText("dc.cmd"), "director's cut directors autoplay film watch movie", () => startDirectorsCut(), page.fine);
    }
    // 5. links
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
    // the browse list never shows a hunt spell; a spell word surfaces it
    if (!q) return commands.filter((c) => !c.spell);
    return commands.filter(
      (c) => (!c.spell || c.spell.some((w) => q.includes(w))) && matches(`${c.label} ${c.keywords ?? ""} ${c.group}`, q),
    );
  }, [commands, query]);

  // lock scroll (body + Lenis) + focus the input while open (DOM side-effects only)
  useEffect(() => {
    if (!open) return;
    lockScroll("palette");
    const input = inputRef;
    const t = setTimeout(() => input.current?.focus(), 20);
    return () => {
      clearTimeout(t);
      unlockScroll("palette");
      // WCAG 2.4.3 (P3-11 J9 M3): on close, focus goes back where it was
      // before the palette opened, at once — a command that moves it (a
      // jump, the drone) runs after this, and a dialog a command opens
      // (the Map) takes this as its opener, so its Esc lands here too, not
      // on <body>. Opened from the menu (its sheet is gone): the Menu button.
      const now = document.activeElement;
      if (now && now !== document.body && now !== input.current) return;
      const back =
        returnTo instanceof HTMLElement && returnTo.isConnected && returnTo !== document.body
          ? returnTo
          : returnTo instanceof HTMLElement && returnTo !== document.body
            ? document.querySelector<HTMLElement>('[aria-controls="site-menu"]')
            : null;
      back?.focus({ preventScroll: true });
    };
  }, [open, returnTo]);

  const runAt = (i: number) => {
    const cmd = filtered[i];
    if (!cmd) return;
    onClose();
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
      onClose();
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
    <>
      <AnimatePresence>
      {open ? (
        <motion.div
          {...planeAttrs("canvas", "house")}
          data-lenis-prevent=""
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
            onClick={onClose}
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
                placeholder="Jump to an act, a section, an easter egg, GitHub…"
                className="min-h-14 w-full bg-transparent type-body text-fg placeholder:text-fg-muted focus:outline-none"
              />
              <kbd className="hidden shrink-0 type-meta text-fg-muted sm:block">Esc</kbd>
            </div>

            <div ref={listRef} id="cmd-list" role="listbox" aria-label="Commands" data-lenis-prevent="" className="max-h-[52vh] overflow-y-auto p-2">
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
    </>
  );
}
