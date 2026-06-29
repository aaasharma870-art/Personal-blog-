"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, Search, X } from "lucide-react";
import { GithubMark } from "@/components/ui/icons";
import { OPEN_PALETTE_EVENT } from "@/components/site/command-palette";
import { nav, site } from "@/lib/content";
import { cn } from "@/lib/utils";
import { dur, ease } from "@/lib/motion";

export function Header() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  // client-only platform check (SSR-safe via server snapshot = false), no effect
  const isMac = useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = nav
      .map((n) => document.getElementById(n.href.slice(1)))
      .filter((el): el is HTMLElement => Boolean(el));
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-200",
        scrolled
          ? "border-b border-line bg-canvas/90 backdrop-blur-sm"
          : "border-b border-transparent",
      )}
    >
      <div className="container-edge flex h-[68px] items-center justify-between">
        <a
          href="#top"
          className="flex items-center gap-3"
          aria-label={`${site.name} — home`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-line-strong font-mono text-xs tracking-wide text-gold">
            {site.initials}
          </span>
          <span className="hidden text-sm font-medium tracking-tight text-ink sm:block">
            {site.name}
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {nav.map((n) => {
            const isActive = active === n.href.slice(1);
            return (
              <a
                key={n.href}
                href={n.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative px-3 py-2 text-sm transition-colors",
                  isActive ? "text-ink" : "text-stone hover:text-ink",
                )}
              >
                {n.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-cyan transition-transform duration-200 group-hover:scale-x-100",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            aria-label="Open command palette"
            className="hidden items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-gold/40 hover:text-stone md:inline-flex"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-mono tracking-tight">
              {isMac ? "⌘" : "Ctrl"} K
            </span>
          </button>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub profile"
            className="hidden h-9 w-9 items-center justify-center rounded-md border border-line text-stone transition-colors hover:border-gold/40 hover:text-ink sm:flex"
          >
            <GithubMark className="h-4 w-4" />
          </a>
          <a
            href="#contact"
            className="hidden rounded-md border border-gold/40 px-3.5 py-2 text-sm text-gold transition-colors hover:bg-gold/10 sm:inline-block"
          >
            Contact
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: dur.base, ease }}
            className="overflow-hidden border-b border-line bg-canvas lg:hidden"
          >
            <nav aria-label="Mobile" className="container-edge grid gap-1 py-4">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === n.href.slice(1) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-base transition-colors",
                    active === n.href.slice(1)
                      ? "bg-elevated text-ink"
                      : "text-stone hover:bg-elevated hover:text-ink",
                  )}
                >
                  {n.label}
                </a>
              ))}
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-line px-3 py-2.5 text-sm text-stone"
                >
                  <GithubMark className="h-4 w-4" /> GitHub
                </a>
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-gold/40 px-3 py-2.5 text-center text-sm text-gold"
                >
                  Contact
                </a>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
