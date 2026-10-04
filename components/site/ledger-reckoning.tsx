"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { animate, motion, useMotionValue } from "motion/react";
import { DESKTOP_FINE, useReducedMotion } from "@/lib/flags";
import { springFollow } from "@/lib/motion";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { beatAttrs } from "@/lib/beats";
import { useScrollStar } from "@/lib/spotlight-react";
import { useVariant } from "@/lib/use-variant";
import type { VariantChoice } from "@/lib/variants";
import { cn } from "@/lib/utils";
import { Lens, type LensState } from "@/components/primitives/lens";
import { MediaFrame } from "@/components/primitives/media-frame";
import { LensFigure, type LensFigureKind, type LensRoute } from "@/components/sections/ledger/lens-figure";

/* ============================================================================
   THE RECKONING — the kill-list as a Lens Index (SPEC v2 SM-8, D-6;
   lens-index.BAR v1 H1–H25 + v2 H26–H30; SM-17 host).
   Every program Aryan tested sits at the same quiet weight: at rest every
   row is muted ink (P3-11 r1: ghost rows read as "tiny dim text" to all
   three panels; research data stays readable in every state) and every
   verdict WORD is present (meaning is in the word, never the hue). The row
   on the reading line — focus > pointer > the viewport's centre line —
   lifts to ink and takes its hue: SURVIVED aqua, KILLED ember (with its
   strike), EXCEPTION amber, a flagship its status in muted. No
   chalk and no icons on the rows (austerity; the header carries the film).
   Two choreographies (lib/variants.ts `kill-list.reckoning`):
     default "lens-index"  ≥ 1024 the bracket travels (springFollow) down
                           an empty lane to the active row, framing a CODE
                           schematic of that row's real route (mono at
                           rest, colour on focus); it opens once by
                           aperture on the first activation.
     alt     "index-bar"   the austere ruled ledger: no bracket, no figure;
                           one index bar slides beside the active row.
   Mobile < 1024: no lens (a Meta line, the title, the detail; the centre-
   line row active). Reduced motion: the lens is open, every swap instant.
   No JS: the idle frame, fully legible.
   DEAD EYE (PHASE3-SPEC §9.2 #3, the game; components/games/dead-eye/,
   lazy on a press of the header's pill, the typed word or the palette).
   This ledger keeps its DOM CONTRACT — each killed <li> carries
   data-verdict="killed", its recorded reason data-reason and its name
   data-name — which the round reads (run.ts `killedRows`): it marks the
   rows (`data-de`, `data-deadeye-struck`), walks focus over the killed
   rows only and restores every attribute on exit. While a round marks the
   section (`data-deadeye` on #kill-list), the lens figure takes the Dead
   Eye plate as its media grade (an overlay layer over the figure, never a
   filter). At rest nothing of the game renders.
   THE PEN (egg 9, 3i-pen): every row that reaches the reading line (the
   viewport's centre line) or is activated counts as READ
   (lib/hunt `recordLedgerRowRead`, imported lazily, DESKTOP_FINE only):
   the pen is earned by reading the whole ledger, or by winning Dead Eye.
   RASTER (P3-2, spec §12.1 #4): the lens bracket and the index bar travel
   by transform only, each on its own layer — a spring step never repaints
   the ledger.
   ========================================================================== */

export type LedgerRow = {
  key: string;
  kind: "flagship" | "survived" | "killed";
  name: string;
  detail: string;
  evidence?: string;
  /** EXCEPTION: the caveat sentence (never dimmer than --fg-muted). */
  caveat?: string;
  status?: string;
  href?: string;
  hrefLabel?: string;
  hrefAria?: string;
  figure: LensFigureKind;
  route: LensRoute;
  /** FIG caption for the lens (aria-hidden). */
  figLabel: string;
};

type Nav = { centre: number | null; pointer: number | null; focus: number | null; last: number };
type Geo = { top: number; h: number; mid: number };

const pad = (n: number) => String(n).padStart(2, "0");
/** A colour swap on the reading line: instant under reduced motion / Pause
 *  (no CSS transition is created at all, J9 M1). */
const TC = "transition-colors duration-(--dur-micro) motion-off:transition-none";
const activeOf = (n: Nav) => n.focus ?? n.pointer ?? n.centre;
const withLast = (n: Nav): Nav => {
  const a = activeOf(n);
  return a !== null && a !== n.last ? { ...n, last: a } : n;
};

function verdictOf(r: LedgerRow): { word: string | null; hue: string } {
  if (r.kind === "killed") return { word: "Killed", hue: "text-kill" };
  if (r.kind === "survived") return r.caveat ? { word: "Survived", hue: "text-fg" } : { word: "Survived", hue: "text-accent" };
  return { word: null, hue: "text-fg-muted" };
}

export function LedgerIndex({ rows, choice }: { rows: readonly LedgerRow[]; choice: VariantChoice }) {
  const reduced = useReducedMotion();
  const variant = useVariant(choice, "kill-list.reckoning");
  const lensOn = variant === "default";

  const [nav, setNav] = useState<Nav>({ centre: null, pointer: null, focus: null, last: 0 });
  const [roving, setRoving] = useState(0);
  const [geo, setGeo] = useState<Geo[]>([]);
  const [figH, setFigH] = useState(0);
  const [lensState, setLensState] = useState<LensState>("open");
  // Dead Eye is running on the section (components/eggs/dead-eye.ts)
  const [graded, setGraded] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const olRef = useRef<HTMLOListElement>(null);
  const liRefs = useRef<(HTMLLIElement | null)[]>([]);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const figRef = useRef<HTMLDivElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLElement | null>(null);
  const lastPtr = useRef<{ x: number; y: number } | null>(null);
  const placed = useRef<number | null>(null);

  const active = activeOf(nav);
  const lensRow = active ?? nav.last;

  // egg 9: a row on the reading line, or activated, has been READ (once per
  // row per view; the store keeps it across views)
  const read = useRef<Set<string>>(new Set());
  useEffect(() => {
    const key = active === null ? null : rows[active]?.key;
    if (!key || read.current.has(key) || !window.matchMedia(DESKTOP_FINE).matches) return;
    read.current.add(key);
    void import("@/lib/hunt").then(
      (m) => m.recordLedgerRowRead(key),
      () => read.current.delete(key),
    );
  }, [active, rows]);

  /** Any activation opens a closed lens (the first one only). */
  const touch = useCallback((next: (n: Nav) => Nav) => {
    setNav((n) => {
      const m = withLast(next(n));
      return m;
    });
    setLensState((s) => (s === "closed" ? "aperture" : s));
  }, []);

  // the host <section>: the grid mask's span is written on it, and the
  // Dead Eye run marks it with data-deadeye (watched here, never at rest):
  // "aim" from the press, "on" from the draw. A round leaves no trace: the
  // lens (open or closed, the row it rests on, the tab stop) is kept from
  // the press and put back on release; the centre line stays live.
  const live = useRef({ nav, lensState, roving });
  useEffect(() => {
    live.current = { nav, lensState, roving };
  });
  const centreNow = useRef<number | null>(null);
  useEffect(() => {
    const host = listRef.current?.closest("section") ?? null;
    hostRef.current = host;
    if (!host || typeof MutationObserver === "undefined") return;
    let pre: typeof live.current | null = null;
    const mo = new MutationObserver(() => {
      const v = host.dataset.deadeye;
      if (v && !pre) pre = live.current;
      setGraded(v === "on");
      if (v || !pre) return;
      const { nav: n, lensState: l, roving: r } = pre;
      pre = null;
      setNav({ centre: centreNow.current, pointer: null, focus: null, last: n.last });
      setLensState(l === "aperture" ? "open" : l);
      setRoving(r);
    });
    mo.observe(host, { attributes: true, attributeFilter: ["data-deadeye"] });
    return () => mo.disconnect();
  }, []);

  // geometry: each row's top/height and its title's first-line centre,
  // relative to the <ol>; re-measured on resize and font swaps
  useEffect(() => {
    const ol = olRef.current;
    if (!ol || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const base = ol.getBoundingClientRect();
      const next: Geo[] = rows.map((_, i) => {
        const li = liRefs.current[i];
        const btn = btnRefs.current[i];
        if (!li || !btn) return { top: 0, h: 0, mid: 0 };
        const lr = li.getBoundingClientRect();
        const br = btn.getBoundingClientRect();
        const lh = parseFloat(getComputedStyle(btn).lineHeight) || br.height;
        return { top: lr.top - base.top, h: lr.height, mid: br.top - base.top + Math.min(lh, br.height) / 2 };
      });
      setGeo((g) => (g.length === next.length && g.every((x, i) => x.top === next[i]?.top && x.mid === next[i]?.mid && x.h === next[i]?.h) ? g : next));
      // H26: the grid veil's span — half strength down to the first row,
      // then thinning to 0 at the LAST row's top (static per layout)
      const host = hostRef.current;
      if (host instanceof HTMLElement) {
        const top = base.top - host.getBoundingClientRect().top;
        host.style.setProperty("--ledger-grid-a", `${Math.round(top)}px`);
        host.style.setProperty("--ledger-grid-b", `${Math.round(top + (next[next.length - 1]?.top ?? 0))}px`);
      }
      const fh = figRef.current?.getBoundingClientRect().height ?? 0;
      setFigH((h) => (h === fh ? h : fh));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    if (figRef.current) ro.observe(figRef.current);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [rows]);

  // the centre line: the <li> under the viewport's middle (contiguous rows)
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const hits = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.row);
          if (e.isIntersecting) hits.add(i);
          else hits.delete(i);
        }
        const c = hits.size ? Math.min(...hits) : null;
        centreNow.current = c;
        setNav((n) => (n.centre === c ? n : withLast({ ...n, centre: c })));
        if (c !== null) setLensState((s) => (s === "closed" ? "aperture" : s));
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    liRefs.current.forEach((li) => li && io.observe(li));
    return () => io.disconnect();
  }, [rows]);

  // hover release: any scroll hands the lens back to the centre line
  useEffect(() => {
    const onScroll = () => setNav((n) => (n.pointer === null ? n : withLast({ ...n, pointer: null })));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // arm the lens closed only when it mounted OFFSCREEN (never in front of
  // the reader); the first activation opens it by aperture
  useEffect(() => {
    const lane = laneRef.current;
    if (!lane || reduced || !lensOn || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      io.disconnect();
      if (e && !e.isIntersecting && window.matchMedia("(min-width: 64rem)").matches) {
        setLensState((s) => (s === "open" ? "closed" : s));
      }
    });
    io.observe(lane);
    return () => io.disconnect();
  }, [reduced, lensOn]);

  // B29-lens (P3-11 r1, J1 #5: a long UNGATED scroll star held back the
  // time stars inside it, e.g. the B29 "Killed" strike): a GATED scroll
  // star over the ledger crossing the reading line. Told `false` while
  // the ledger is still on the line, a time star holds the spotlight: the
  // lens holds still and travels to the current row when handed back
  // (`true`). `false` with the ledger off the line is the window's end
  // (pointer / focus travel as before). A hold is ≤ 1.2 s; the 1.5 s
  // timer frees the lens if the hand-back never comes (scrolled away).
  // the row the lens holds at while yielded (null: not yielded); its figure,
  // route and label stay that row's until the hand-back moves the lens
  const [held, setHeld] = useState<number | null>(null);
  const yieldTimer = useRef(0);
  const onLensOwn = useCallback((owned: boolean) => {
    window.clearTimeout(yieldTimer.current);
    if (owned) {
      setHeld(null);
      return;
    }
    const r = listRef.current?.getBoundingClientRect();
    const line = window.innerHeight / 2;
    const onLine = Boolean(r && r.top < line && r.bottom > line);
    const at = onLine ? placed.current : null;
    setHeld(at);
    if (at !== null) yieldTimer.current = window.setTimeout(() => setHeld(null), 1500);
  }, []);
  useEffect(() => () => window.clearTimeout(yieldTimer.current), []);
  // the window is the markup's (beatAttrs below); this registration adds the gate
  useScrollStar(listRef, "B29-lens", { weight: 1, onOwn: onLensOwn, on: lensOn });

  // the lens / index bar travel (springFollow; instant under reduced motion)
  const ly = useMotionValue(0);
  const by = useMotionValue(0);
  const bh = useMotionValue(0);
  useEffect(() => {
    const g = geo[lensRow];
    if (!g) return;
    // yielded to a time star: hold still (placed keeps the old row, so the
    // hand-back travels)
    if (held !== null && !reduced) return;
    const targetLens = g.mid - figH / 2;
    // only a change of ROW travels; a layout change (first measure, resize,
    // a font swap) jumps, so nothing moves on its own
    const travel = placed.current !== null && placed.current !== lensRow;
    placed.current = lensRow;
    if (reduced || !travel) {
      ly.jump(targetLens);
      by.jump(g.top);
      bh.jump(g.h);
      return;
    }
    const a = animate(ly, targetLens, { type: "spring", ...springFollow });
    const b = animate(by, g.top, { type: "spring", ...springFollow });
    bh.jump(g.h);
    return () => {
      a.stop();
      b.stop();
    };
  }, [lensRow, geo, figH, reduced, held, ly, by, bh]);

  /* — row events ———————————————————————————————————————————————— */
  const onPointerMove = (i: number) => (e: PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse") return;
    const p = lastPtr.current;
    if (p && p.x === e.clientX && p.y === e.clientY) return; // a scroll under a still pointer
    lastPtr.current = { x: e.clientX, y: e.clientY };
    if (nav.pointer !== i) touch((n) => ({ ...n, pointer: i }));
  };
  const onFocus = (i: number) => (e: FocusEvent<HTMLButtonElement>) => {
    setRoving(i);
    if (e.currentTarget.matches(":focus-visible")) touch((n) => ({ ...n, focus: i }));
  };
  const onBlur = () => setNav((n) => (n.focus === null ? n : withLast({ ...n, focus: null })));
  const onKey = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = rows.length - 1;
    const next =
      e.key === "ArrowDown" ? Math.min(last, i + 1) : e.key === "ArrowUp" ? Math.max(0, i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    const b = btnRefs.current[next];
    if (!b) return;
    b.focus({ preventScroll: true });
    void scrollToTarget(b, { block: "nearest" });
  };

  const lensRowData = rows[held !== null && !reduced ? held : lensRow] ?? rows[0];

  return (
    <div
      ref={listRef}
      className="relative mt-tier-block"
      data-ledger={lensOn ? "lens-index" : "index-bar"}
      /* B29-lens: the bracket's travel down the ledger, a GATED scroll star
         while the ledger crosses the reading line (the lens follows the
         centre line; P3-11 r1 J1 #4 "the kill-list mini-card" performs
         undeclared). The window is here (the words binder registers the
         element too: the spotlight counts one star, and the gate from
         useScrollStar above stays); lib/page.ts declares the star. */
      {...beatAttrs("B29-lens", { weight: 1, scroll: "top 50%, bottom 50%" })}
    >
      <ol
        ref={olRef}
        aria-label="Ledger: flagships, survivors and killed ideas"
        className={cn("relative", lensOn ? "border-t border-rule lg:border-t-0" : "border-t border-rule")}
        onPointerLeave={() => setNav((n) => (n.pointer === null ? n : withLast({ ...n, pointer: null })))}
      >
        {rows.map((r, i) => {
          const on = active === i;
          const v = verdictOf(r);
          const struck = r.kind === "killed" && on;
          const meta = (
            <>
              {v.word ? (
                <span className={cn(TC, on ? v.hue : "text-fg-muted")}>{v.word}</span>
              ) : null}
              {r.caveat ? (
                <>
                  <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
                  <span className="sr-only">, </span>
                  <span className={cn(TC, on ? "text-exception" : "text-fg-muted")}>Exception</span>
                </>
              ) : null}
              {r.status ? (
                <>
                  {v.word ? (
                    <>
                      <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
                      <span className="sr-only">, </span>
                    </>
                  ) : null}
                  <span className={cn(TC, "text-fg-muted")}>{r.status}</span>
                </>
              ) : null}
            </>
          );
          return (
            <li
              key={r.key}
              ref={(el) => {
                liRefs.current[i] = el;
              }}
              data-row={i}
              data-verdict={r.kind}
              onPointerMove={onPointerMove(i)}
              className={cn(
                "grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 py-tier-group lg:grid-cols-12 lg:items-baseline lg:gap-x-6",
                lensOn ? "border-b border-rule lg:border-b-0" : "border-b border-rule",
              )}
            >
              <span className={cn("tnum type-meta lg:col-span-1", TC, on ? "text-fg-muted" : "text-fg-ghost")}>{pad(i + 1)}</span>
              <div className="min-w-0 lg:col-span-6">
                {/* < 1024: the Meta line leads the row */}
                <p className="mb-1 type-meta lg:hidden">{meta}</p>
                <h3 className="type-heading">
                  <button
                    ref={(el) => {
                      btnRefs.current[i] = el;
                    }}
                    type="button"
                    tabIndex={i === roving ? 0 : -1}
                    aria-current={on ? "true" : undefined}
                    onFocus={onFocus(i)}
                    onBlur={onBlur}
                    onKeyDown={onKey(i)}
                    onClick={() => {
                      setRoving(i);
                      touch((n) => ({ ...n, pointer: i }));
                    }}
                    className={cn("relative min-h-11 text-left", TC, on ? "text-fg" : "text-fg-muted")}
                  >
                    <span data-name="">{r.name}</span>
                    {r.kind === "killed" ? (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-0 top-1/2 h-px origin-left bg-kill transition-transform duration-(--dur-base) motion-off:transition-none",
                          struck ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    ) : null}
                  </button>
                </h3>
                <p
                  className={cn("mt-1 max-w-[64ch] type-small", TC, on ? "text-fg" : "text-fg-muted")}
                  {...(r.kind === "killed" ? { "data-reason": "" } : {})}
                >
                  {r.detail}
                </p>
                {r.evidence ? (
                  <p className={cn("tnum mt-1 max-w-[64ch] type-small", TC, on ? "text-fg" : "text-fg-muted")}>
                    {r.evidence}
                  </p>
                ) : null}
                {/* the caveat is never dimmer than muted, in every state */}
                {r.caveat ? <p className="mt-1 max-w-[64ch] type-small text-fg-muted">{r.caveat}</p> : null}
              </div>
              {/* cols 8–9: the lens lane, empty in every row */}
              <div aria-hidden="true" className="hidden lg:col-span-2 lg:block" />
              <div className="col-start-2 flex flex-wrap items-baseline gap-x-4 lg:col-span-3 lg:col-start-auto lg:justify-end">
                <p className="hidden type-meta lg:block lg:text-right">{meta}</p>
                {r.href ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={r.hrefAria}
                    className="inline-flex min-h-11 items-center gap-1 type-meta text-fg-muted transition-colors hover:text-fg"
                  >
                    <span className="normal-case">{r.hrefLabel}</span>
                    <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* ≥ 1024: the lane (cols 8–9, empty in every row). DEFAULT: ONE lens
          — the bracket + the figure — travels to the active row. ALT: the
          lane stays empty (only Dead Eye's plate uses it). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden grid-cols-12 gap-x-6 lg:grid">
        <div ref={laneRef} className="relative col-span-2 col-start-8">
          {/* armed CLOSED (offscreen at mount), the bracket would sit on the
              lane as an empty outlined bar over the FIG label (P3-11 r1: all
              three panels, "a broken image"): it is not drawn until the
              first activation opens it by aperture */}
          <motion.div className={cn("absolute inset-x-0 top-0 will-change-transform", lensState === "closed" && "invisible")} style={{ y: ly }}>
            {lensOn ? (
              <>
                <Lens
                  state={lensState}
                  focus={active !== null}
                  onSettled={(st) => {
                    if (st === "open") setLensState("open");
                  }}
                  className="aspect-[4/3]"
                >
                  <div ref={figRef} className="relative size-full">
                    <LensFigure kind={lensRowData?.figure ?? "ta"} route={lensRowData?.route ?? "all"} colour={active !== null} />
                    {graded ? (
                      <div className="absolute inset-0" data-dead-eye="media">
                        <MediaFrame media="iconic-deadeye" layout="fill" sizes="12rem" loader={false} />
                      </div>
                    ) : null}
                  </div>
                </Lens>
                <p className={cn("mt-3 type-meta", TC, active !== null ? "text-fg-muted" : "text-fg-ghost")}>
                  {lensRowData?.figLabel}
                </p>
              </>
            ) : (
              <div ref={figRef} className="relative aspect-[4/3] overflow-hidden">
                {graded ? (
                  <div className="absolute inset-0" data-dead-eye="media">
                    <MediaFrame media="iconic-deadeye" layout="fill" sizes="12rem" loader={false} />
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {!lensOn ? (
        /* ALT: the index bar beside the active row */
        <motion.div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -left-3 top-0 w-0.5 bg-fg-muted transition-opacity duration-(--dur-micro) will-change-transform motion-off:transition-none sm:-left-4",
            active !== null ? "opacity-100" : "opacity-0",
          )}
          style={{ y: by, height: bh }}
        />
      ) : null}

    </div>
  );
}
