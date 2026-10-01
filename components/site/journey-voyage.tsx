"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { beatAttrs } from "@/lib/beats";
import { journey } from "@/lib/content";
import type { MediaId } from "@/lib/media";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";
import type { Variant } from "@/lib/variants";
import { Loader } from "@/components/primitives/loader";
import { MediaFrame } from "@/components/primitives/media-frame";
import { JourneyChart, Waypoint, WaypointLabel } from "@/components/site/journey-chart";
import { useFrameSequence } from "@/components/worlds/pirates/use-frame-sequence";
import {
  BREAK_INDEX,
  NOW_INDEX,
  bearingTo,
  beatFrames,
  legHeading,
} from "@/components/worlds/pirates/voyage-chart";

/* ============================================================================
   THE VOYAGE — desktop (≥ 1024, fine pointer, motion on, no Save-Data):
   SPEC v2 SM-4, bars/journey-voyage.BAR.md, RECOGNIZABILITY S06.
   Left: the four real steps in normal flow (verbatim content.ts). Right: a
   STICKY column (0 extra travel) holding, top to bottom,
     the cartouche THE CROSSING (the act title in Pirata One);
     THE SEA — a 16:9 frame: the active step's still (MV-05a–d) until every
       JV frame has decoded (+ the LD-PC mini loader after 400 ms with the
       real decoded/72), then the canvas sequence; the step's CAPTION
       ("PORT ROYAL HARBOUR AT NIGHT • PIRATES OF THE CARIBBEAN" …) sits
       bottom-left over the sea whenever the frame is STILL, and hides while
       it moves (never over moving media);
     the CHART STRIP — the brass course through four waypoint links, Jack's
       compass at the rose, the ember tick at the break, the Aztec medallion,
       the brass X at Now.

   TWO CHOREOGRAPHIES (lib/variants.ts `journey.voyage`):
     default "sea-scrub"  — SCROLL drives the frames: frame = the scroll's
       position between the step centres, piecewise-linear between the
       beats (0 / 24 / 48 / 71 = MV-05a/b/c/d exactly at each step's
       centre); positional (the same scrollY from above or below = the same
       frame). The whole course is charted (dashed brass).
     alt "sail-on-cue"    — STATE drives the frames: the sea HOLDS on the
       active step's beat and, when a new step becomes active, SAILS there
       (JV-alt, ~50 ms a frame, 0.6–1.4 s, eased); the course PLOTS itself
       leg by leg in solid brass over an uncharted hairline and the X inks
       when Now is reached.
   Both: the active step (the centre-line article) sets the needle to its
   LEG heading (springNeedle: hunt → settle); hovering OR focusing a
   waypoint link turns it to that waypoint and opens the lid on its star
   chart (IC-PC-03 "points to what you want most"); the medallion's
   moonlight sweep runs once when The break is first reached.
   The canvas mounts only while the section is within one viewport (the
   decoded frames stay cached), and frames are requested only then.

   RASTER (P3-2, spec §12.1 #3): the sticky column is never repainted while
   it scrolls. The sequence canvas is its own layer (a frame draw uploads
   the canvas, nothing else), and the caption veil (the calm bottom + the
   step captions) is one layer that fades by opacity when the sea moves, so
   the cartouche, the frame and the chart above it stay static.
   ========================================================================== */

type Props = {
  variant: Variant;
  /** Poster stills per step (the DEFAULT set: JV and JV-alt both start on them). */
  stills: readonly MediaId[];
  /** Sequence frame urls ([] = the stills behaviour: crossfade at the beats). */
  frames: readonly string[];
  /** One registered SceneCaption per step (server-rendered). */
  captions: readonly ReactNode[];
  /** THE CROSSING (server-rendered lettering). */
  cartouche: ReactNode;
};

const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/** The voyage scrub's two beats (spec §2.3 B10 steps 1–2, B11 steps 3–4). */
const STEP_BEATS: Readonly<Record<number, string>> = { 0: "B10", 2: "B11" };

export function JourneyVoyage({ variant, stills, frames: urls, captions, cartouche }: Props) {
  const n = journey.length;
  const [active, setActive] = useState(0);
  const [reached, setReached] = useState(0);
  const [intent, setIntent] = useState<number | null>(null);
  const [near, setNear] = useState(false);
  const [wanted, setWanted] = useState(false);
  const [moving, setMoving] = useState(false);
  const [sailing, setSailing] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawnFrame = useRef(-1);

  const seq = useFrameSequence(urls, wanted);
  const live = seq.ready && near;
  const beats = beatFrames(seq.total || 1, n);
  const beat = beats[active] ?? 0;

  /* — the active step: the article crossing the viewport's centre line — */
  useEffect(() => {
    const root = stepsRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.step);
          if (Number.isNaN(i)) continue;
          setActive(i);
          setReached((r) => Math.max(r, i));
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* — near: within one viewport → request the frames (once) + mount the canvas — */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        const hit = Boolean(e?.isIntersecting);
        setNear(hit);
        if (hit) setWanted(true);
      },
      { rootMargin: "100% 0px 100% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** The scrub: the viewport centre's position between the step centres
   *  (read live from the articles' rects: nothing above the section can
   *  leave it stale), piecewise-linear between the beats — positional,
   *  never time-based: the same scrollY gives the same frame. */
  const frameAt = useEffectEvent((): number => {
    const root = stepsRef.current;
    const els = root ? root.querySelectorAll<HTMLElement>("[data-step]") : [];
    const c = Array.from(els, (el) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    if (c.length < 2) return beats[0] ?? 0;
    const mid = window.innerHeight / 2;
    if (mid <= c[0]!) return beats[0] ?? 0;
    for (let i = 0; i < c.length - 1; i++) {
      const a = c[i]!;
      const b = c[i + 1]!;
      if (mid <= b) {
        const t = b > a ? (mid - a) / (b - a) : 1;
        const f0 = beats[i] ?? 0;
        const f1 = beats[i + 1] ?? f0;
        return Math.round(f0 + t * (f1 - f0));
      }
    }
    return beats[beats.length - 1] ?? 0;
  });

  /** Paint frame i (object-fit: cover) unless it is already on the canvas. */
  const paint = useEffectEvent((i: number, force = false) => {
    const c = canvasRef.current;
    const img = seq.frames.current[i];
    if (!c || !img || !c.width) return;
    if (!force && i === drawnFrame.current) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;
    const s = Math.max(c.width / iw, c.height / ih);
    const sw = c.width / s;
    const sh = c.height / s;
    ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, c.width, c.height);
    drawnFrame.current = i;
    c.dataset.frame = String(i);
    c.dataset.drawn = "";
  });

  /* — the canvas: size it to its box (≤ the frames' 1280 px) and repaint — */
  useEffect(() => {
    const c = canvasRef.current;
    if (!live || !c) return;
    drawnFrame.current = -1;
    const fit = () => {
      const box = c.parentElement;
      if (!box) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(Math.min(1280, box.clientWidth * dpr)));
      const h = Math.max(1, Math.round((w * box.clientHeight) / Math.max(1, box.clientWidth)));
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const again = drawnFrame.current >= 0 ? drawnFrame.current : variant === "default" ? frameAt() : beat;
      paint(again, true);
    };
    fit();
    const ro = typeof ResizeObserver !== "undefined" && c.parentElement ? new ResizeObserver(fit) : null;
    if (ro && c.parentElement) ro.observe(c.parentElement);
    return () => ro?.disconnect();
    // `beat` seeds the first paint only; the sail effect owns it afterwards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, variant]);

  /* — DEFAULT: the scroll scrubs the sea — */
  useEffect(() => {
    if (!live || variant !== "default") return;
    let raf = 0;
    let idle = 0;
    const tick = () => {
      raf = 0;
      paint(frameAt());
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
      setMoving(true);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => setMoving(false), 220);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(idle);
    };
  }, [live, variant]);

  /* — ALT: the sea holds on the beat and sails to the next one on cue — */
  useEffect(() => {
    if (!live || variant !== "alt") return;
    const to = beat;
    const from = drawnFrame.current < 0 ? to : drawnFrame.current;
    if (from === to) {
      paint(to, true);
      // an interrupted sail may have stopped exactly on this beat
      const r = requestAnimationFrame(() => setSailing(false));
      return () => cancelAnimationFrame(r);
    }
    const duration = Math.min(1400, Math.max(600, Math.abs(to - from) * 50));
    let t0 = -1;
    let raf = requestAnimationFrame(function step(now) {
      if (t0 < 0) {
        t0 = now;
        setSailing(true);
      }
      const k = Math.min(1, (now - t0) / duration);
      paint(Math.round(from + (to - from) * easeInOut(k)));
      if (k < 1) raf = requestAnimationFrame(step);
      else setSailing(false);
    });
    // ART-DIRECTOR #2: the ALT captions never came back at rest. A sail can
    // end without its last frame (cancelled by the next cue, throttled rAF in
    // a background tab), so the sea is declared at rest after the sail's own
    // duration + 100 ms whatever happened to the loop, and the caption
    // returns on the held beat.
    const rest = window.setTimeout(() => setSailing(false), duration + 100);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(rest);
    };
  }, [beat, live, variant]);

  const onWaypoint = (e: MouseEvent<HTMLAnchorElement>, j: number) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const art = document.getElementById(`journey-step-${j + 1}`);
    if (!art) return;
    e.preventDefault();
    // centre the step, so the sea lands exactly on its beat (instant under
    // reduced motion / Pause); the step's title takes focus on arrival
    void scrollToTarget(art, { block: "center", focus: true, history: "replace" });
  };

  // At rest the caption shows: the stills path (frames not decoded yet, or
  // the section out of range) never moves; the scrub hides it only while
  // scrolling, the sail only while sailing.
  const showCaption = !seq.ready || !live || (variant === "default" ? !moving : !sailing);
  const heading = intent !== null ? bearingTo(intent) : legHeading(active);
  const alt = variant === "alt";

  return (
    <div
      ref={rootRef}
      className="mt-tier-block grid grid-cols-12 gap-x-6"
      data-voyage={variant}
      data-active-step={active + 1}
    >
      {/* ── the four steps, in normal flow ───────────────────────────── */}
      <div ref={stepsRef} className="col-span-6 xl:col-span-5">
        {journey.map((s, i) => (
          <article
            key={s.marker}
            id={`journey-step-${i + 1}`}
            {...(STEP_BEATS[i] ? beatAttrs(STEP_BEATS[i], { weight: 2 }) : {})}
            data-step={i}
            aria-labelledby={`journey-step-${i + 1}-title`}
            className="flex min-h-[62vh] scroll-mt-[30vh] flex-col justify-center border-t border-rule py-tier-block first:border-t-0"
          >
            <p className="type-meta text-fg-muted">
              <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
              <span aria-hidden="true" className="text-fg-ghost">{" • "}</span>
              <span>{s.marker}</span>
            </p>
            <h3
              id={`journey-step-${i + 1}-title`}
              tabIndex={-1}
              className={cn(
                "mt-tier-pair type-heading transition-colors duration-(--dur-micro) motion-off:transition-none",
                i === active ? "text-fg" : "text-fg-muted",
              )}
            >
              {s.title}
            </h3>
            <p className="mt-tier-pair max-w-body type-body text-fg-muted">{s.body}</p>
          </article>
        ))}
      </div>

      {/* ── the sticky column: cartouche · the sea · the chart ────────── */}
      <div className="col-span-6 xl:col-start-7">
        <div className="sticky top-[calc(var(--header-h)+1.5rem)]">
          {cartouche}

          <div className="scene-caption-host relative mt-tier-pair aspect-video max-h-[calc(100svh-var(--header-h)-24rem)] w-full overflow-hidden rounded-frame bg-(--world-deep)">
            {/* the stills: the active step's, crossfading (steps reached so far) */}
            {stills.map((id, i) =>
              i <= Math.max(reached, active) ? (
                <div
                  key={id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-(--dur-preview) motion-off:transition-none",
                    i === active ? "opacity-100" : "opacity-0",
                  )}
                >
                  <MediaFrame media={id} layout="fill" sizes="(min-width: 1280px) 42vw, 50vw" loader={false} />
                </div>
              ) : null,
            )}

            {/* the sequence (desktop only, mounted within one viewport), on
                its own layer: a scrubbed frame never repaints the column */}
            {live ? (
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="absolute inset-0 size-full opacity-0 transition-opacity duration-(--dur-preview) will-change-transform data-drawn:opacity-100 motion-off:transition-none"
              />
            ) : null}

            {/* the caption veil, ONE layer that fades when the sea moves (at
                rest only): the calm bottom and the step captions */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300 will-change-[opacity] motion-off:transition-none",
                showCaption ? "opacity-100" : "opacity-0",
              )}
            >
              {/* a calm bottom for the caption */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-(--world-deep)/85 to-transparent"
              />

              {/* the step captions: MOMENT • FILM, cross-dissolving on the
                  step (hidden from assistive tech while the sea moves) */}
              {captions.map((c, i) => (
                <div
                  key={i}
                  data-step-caption={i + 1}
                  className={cn(
                    "pointer-events-auto transition-[opacity,visibility] duration-300 motion-off:transition-none",
                    i === active ? "opacity-100" : "opacity-0",
                    i === active && showCaption ? "visible" : "invisible",
                  )}
                >
                  {c}
                </div>
              ))}
            </div>

            {/* real loading: the LD-PC mini, after 400 ms, real decoded / 72 */}
            {wanted && !seq.ready && !seq.failed && seq.total > 0 ? (
              <span className="pointer-events-none absolute right-3 top-3 z-[3]">
                <Loader
                  world="pirates"
                  size="mini"
                  progress={seq.decoded / seq.total}
                  delayMs={400}
                />
              </span>
            ) : null}
          </div>

          <JourneyChart
            className="mt-tier-group pb-6 pt-2"
            heading={heading}
            lid={intent !== null ? "open" : "ajar"}
            active={active}
            reached={alt ? reached : active}
            plot={alt ? "legs" : "full"}
            cursed={reached >= BREAK_INDEX}
            xInked={!alt || reached >= NOW_INDEX}
            hunt
            compassClassName="w-[72px]"
            medallionClassName="w-14"
          >
            <ol aria-label="Voyage waypoints" className="absolute inset-0">
              {journey.map((s, i) => (
                <Waypoint key={s.marker} index={i}>
                  <a
                    href={`#journey-step-${i + 1}`}
                    onClick={(e) => onWaypoint(e, i)}
                    onPointerEnter={() => setIntent(i)}
                    onPointerLeave={() => setIntent(null)}
                    onFocus={() => setIntent(i)}
                    onBlur={() => setIntent(null)}
                    aria-current={i === active ? "step" : undefined}
                    className={cn(
                      "flex min-h-11 min-w-11 items-center justify-center rounded-control px-1.5 type-meta transition-colors duration-(--dur-micro) motion-off:transition-none",
                      i === active ? "text-fg" : "text-fg-muted hover:text-fg",
                    )}
                  >
                    <WaypointLabel index={i} />
                  </a>
                </Waypoint>
              ))}
            </ol>
          </JourneyChart>
        </div>
      </div>
    </div>
  );
}
