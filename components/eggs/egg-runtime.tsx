"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { motionOffNow, setMotionPaused, useReducedMotion } from "@/lib/flags";
import { markFound, worthyOfPen } from "@/lib/hunt";
import { quotes, type QuoteVerified } from "@/lib/quotes";
import { copyText, copyVisible } from "@/lib/sections";
import { useVariant } from "@/lib/use-variant";
import type { CopyKey } from "@/lib/film";
import type { WorldId } from "@/lib/worlds";
import { FilmQuote } from "@/components/site/film-quote";
import { Lettered } from "@/components/primitives/scene-caption";
import { eggCopy, type EggCopyKey } from "@/components/eggs/egg-copy";
import { obliviate, setEggsSessionOff, type EggId } from "@/components/eggs/egg-bus";
import { EggToast, type EggToastData } from "@/components/eggs/egg-toast";
import { HUNT_ROWS } from "@/components/eggs/hunt-rows";
import { HUNT_TOTAL, foundIds, type HuntId } from "@/components/eggs/hunt-store";
import type { DeadEyeRun } from "@/components/eggs/dead-eye";
// its CSS (game-lazy.css) loads with this lazy chunk, not the page (W2 assembly)
import "@/app/p3/game-lazy.css";

/* ============================================================================
   EGG RUNTIME (lazy; PHASE3-SPEC §9.1, §9.3, §9.4) — OWNER: W2-HUNT.
   Loaded by <EggHost/> on the first trigger. Runs each egg, counts the hunt
   (lib/hunt.ts markFound, which emits `hunt:found`) and speaks the toasts:
   the egg's own line, then "Egg n of 12 · <name>", or at the 12th find
   "12 / 12" + Q-HP-2 through <FilmQuote>. Finds counted elsewhere (the
   Snitch's catch) arrive as `found` messages and get the hunt line alone.

   The spells (spec §9.1 #1, #2, #4, #7):
   - hp-map: the Map dialog (its own lazy chunk); counts as it opens; the
     hunt line waits until the Map closes (a toast under a modal is lost).
   - hp-lumos: Lumos lights the media +10 % over 300 ms and blooms a wand
     tip at the Pause control (below its glyph: IC-HP-09) while motion
     resumes (the host resumed it already, for the sound engine); Nox dims
     the media −10 % over 300 ms, THEN pauses. Under the OS reduced-motion
     setting: the toast alone (`toast.lumos.os`), no light, no bloom; it
     still counts. Effects only ever come from the typed / palette spells:
     the Pause control triggers none of this.
   - pc-parley: a toast with Q-PC-3 once it is VERIFIED; until then
     "egg.parley.fallback". (The palette jumps to Contact itself.)
   - 3i-aal: the current section h2 settles twice (700 ms) + Q-3I-1.
   The finds (hotspots, kraken, quadcopter, pen) are drawn by their hosts
   (wave 3) from the same EGG_EVENT; here they count and toast. The pen
   counts only for the worthy (every ledger row read, or Dead Eye won).
   Lights (the veil) are opacity-only layers inside each media box in view,
   never over text, removed when done (≤ 2.4 s).
   ========================================================================== */

const MapDialog = dynamic(() => import("@/components/eggs/marauders-map-dialog"), { ssr: false });

export type EggMsg = { kind: "egg"; id: EggId } | { kind: "found"; id: HuntId; count: number };

type HuntLine = { id: HuntId; count: number };

const c = (k: EggCopyKey): string | null => (copyVisible(eggCopy[k]) ? eggCopy[k].text : null);
const copyOf = (k: CopyKey): string | null => {
  const t = copyText(k);
  return copyVisible(t) ? t.text : null;
};

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

/** A quote checked in the work itself (COMMUNITY lines keep their fallback). */
const isVerified = (v: QuoteVerified): boolean => v === "VERIFIED";

/** ≥ 50 % of #kill-list is in view (or it fills ≥ 50 % of the viewport). */
function killListInView(): boolean {
  const el = document.getElementById("kill-list");
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const shown = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
  return shown >= Math.min(r.height, vh) * 0.5;
}

/** Lumos (+1) / Nox (−1): an opacity veil over every media box in view.
 *  Resolves when the ramp (300 ms) is done; the veil lifts by itself. */
function mediaLight(dir: 1 | -1): Promise<void> {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const boxes = Array.from(document.querySelectorAll<HTMLElement>("[data-media], [data-stage-layer]"))
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width * r.height > 4096 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
    })
    .slice(0, 12);
  if (!boxes.length) return Promise.resolve();
  const veils = boxes.map((b) => {
    const v = document.createElement("span");
    v.className = "lumos-veil";
    v.dataset.dir = dir > 0 ? "lumos" : "nox";
    v.setAttribute("aria-hidden", "true");
    b.appendChild(v);
    return v;
  });
  // ramp 300 ms; hold; lift (Nox lifts at once once paused: no motion then)
  const hold = dir > 0 ? 900 : 1800;
  const ramp = veils.map((v) => v.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: EASE_OUT, fill: "forwards" }));
  window.setTimeout(() => {
    for (const v of veils) {
      if (motionOffNow()) v.remove();
      else v.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: "ease", fill: "forwards" }).finished.then(() => v.remove(), () => v.remove());
    }
  }, 300 + hold);
  return Promise.all(ramp.map((a) => a.finished)).then(
    () => {},
    () => {},
  );
}

/** The wand-tip bloom at the Pause control (CSS: app/p3/game.css). */
function wandBloom(): void {
  const btn = Array.from(document.querySelectorAll<HTMLElement>("[data-motion-toggle]")).find((b) => b.offsetParent !== null);
  if (!btn) return;
  btn.removeAttribute("data-wand-bloom");
  void btn.offsetWidth; // restart the one-shot animation on a second Lumos
  btn.setAttribute("data-wand-bloom", "");
  window.setTimeout(() => btn.removeAttribute("data-wand-bloom"), 1000);
}

export default function EggRuntime({
  go,
  attach,
}: {
  go: (id: string) => Promise<void>;
  attach: (fn: (m: EggMsg) => void) => () => void;
}) {
  const reduced = useReducedMotion();
  const mapVariant = useVariant(null, "egg-map.unfold");
  const [region, setRegion] = useState(false);
  const [toast, setToast] = useState<EggToastData | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const deadEye = useRef<DeadEyeRun | null>(null);
  const seq = useRef(0);
  /** markFound() emits `hunt:found` synchronously: our own finds are toasted
   *  with their egg, not twice. */
  const self = useRef<{ on: boolean; count: number }>({ on: false, count: 0 });
  /** The hunt line held while the Map is open. */
  const afterMap = useRef<HuntLine | null>(null);

  const say = useCallback((world: WorldId, body: ReactNode, hunt?: HuntLine | null, ms?: number) => {
    const huntLine = hunt ? huntToastLine(hunt) : null;
    if (!body && !huntLine) return;
    // mount the live region first (never at rest: E1), then speak into it
    setRegion(true);
    window.setTimeout(
      () =>
        setToast({
          key: ++seq.current,
          world,
          body: (
            <div className="flex flex-col gap-2">
              {body}
              {huntLine}
            </div>
          ),
          ms: ms ?? (hunt?.count === HUNT_TOTAL ? 4000 : undefined),
        }),
      60,
    );
  }, []);
  const line = (text: string | null) => (text ? <p className="type-small text-fg">{text}</p> : null);
  const clearToast = useCallback(() => setToast(null), []);

  /** Count a find; returns its hunt line (null when it was already found). */
  const count = useCallback((id: HuntId): HuntLine | null => {
    self.current = { on: true, count: 0 };
    const fresh = markFound(id);
    const n = self.current.count || foundIds().length;
    self.current = { on: false, count: 0 };
    return fresh ? { id, count: n } : null;
  }, []);

  const startDeadEye = useCallback(() => {
    if (deadEye.current) {
      deadEye.current.abort();
      return;
    }
    import("@/components/eggs/dead-eye").then(({ runDeadEye }) => {
      const run = runDeadEye({
        reduced,
        onFired: (n) => {
          const status = copyText("deadeye.status", { n });
          say(
            "rdr2",
            <div className="flex flex-col gap-2">
              <p className="text-[1.5rem] leading-none tracking-[0.06em] text-fg">
                <Lettered world="rdr2" text="DEAD EYE" />
              </p>
              <FilmQuote id="Q-RD-2" rendition="caption" attribution="inline" className="text-fg" />
              {copyVisible(status) ? <p className="type-meta text-fg-muted">{status.text}</p> : null}
            </div>,
            null,
            4000,
          );
        },
        onEnd: () => {
          deadEye.current = null;
        },
      });
      if (!run) {
        say("rdr2", line(c("toast.deadeye.none")));
        return;
      }
      deadEye.current = run;
    });
  }, [reduced, say]);

  /** Runs one egg (called from `handle`, an effect event, so it always sees
   *  this render's state). */
  function run(id: EggId): void {
    const os = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    switch (id) {
      case "marauders-map":
        afterMap.current = count("hp-map");
        setMapOpen(true);
        return;
      case "lumos": {
        // motion was resumed by the host (synchronously, for the sound
        // engine); Lumos never overrides the OS reduced-motion setting (E5)
        if (!os && !motionOffNow()) {
          void mediaLight(1);
          wandBloom();
        }
        say("hp", line(c(os ? "toast.lumos.os" : "toast.lumos")), count("hp-lumos"));
        return;
      }
      case "nox": {
        const hunt = count("hp-lumos");
        if (motionOffNow()) setMotionPaused(true);
        else void mediaLight(-1).then(() => setMotionPaused(true));
        say("hp", line(c("toast.nox")), hunt);
        return;
      }
      case "accio-obliviate":
        // forgets this visit; the hunt (localStorage) is kept (spec §3.6)
        obliviate();
        say("hp", line(c("toast.obliviate")));
        return;
      case "parley": {
        const q = quotes["Q-PC-3"];
        // COMMUNITY-sourced today: the fallback renders until it is verified
        const body =
          isVerified(q.verified) && copyVisible({ text: q.text, status: q.status }) ? (
            <FilmQuote id="Q-PC-3" rendition="caption" attribution="inline" className="text-fg" />
          ) : (
            line(copyOf("egg.parley.fallback"))
          );
        say("pirates", body, count("pc-parley"));
        return;
      }
      case "aal-izz-well": {
        // the current section heading: one two-beat settle (motion on)
        const probe = document.elementFromPoint(window.innerWidth / 2, window.innerHeight * 0.45);
        const host = probe?.closest("section[id], footer[id]");
        const h = host?.querySelector<HTMLElement>("h2");
        if (h && !motionOffNow()) {
          h.animate(
            [
              { transform: "translateY(0)" },
              { transform: "translateY(-6px)", offset: 0.3 },
              { transform: "translateY(2px)", offset: 0.62 },
              { transform: "translateY(0)" },
            ],
            { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          );
        }
        say("idiots", <FilmQuote id="Q-3I-1" rendition="caption" attribution="inline" className="text-fg" />, count("3i-aal"));
        return;
      }
      case "dead-eye":
        if (deadEye.current || killListInView()) startDeadEye();
        else {
          // from the palette: bring the ledger into view, then call it once
          // the jump has ARRIVED (no fixed wait: B3)
          void go("kill-list").then(startDeadEye);
        }
        return;
      case "eggs-off":
        setEggsSessionOff(true);
        say("house", line(c("toast.eggs.off")));
        return;
      case "eggs-on":
        setEggsSessionOff(false);
        say("house", line(c("toast.eggs.on")));
        return;
      case "hidden-kraken":
        say("pirates", null, count("pc-kraken"));
        return;
      case "aztec-coin":
        say("pirates", null, count("pc-coin"));
        return;
      case "quadcopter-lift":
        say("idiots", line(copyOf("egg.quad.toast")), count("3i-quad"));
        return;
      case "worthy-pen":
        // the host draws Rancho's circle when worthyOfPen(); here: count + say
        if (worthyOfPen()) say("idiots", line(copyOf("egg.pen.win")), count("3i-pen"));
        else say("idiots", line(copyOf("egg.pen.read")));
        return;
      case "eagle-eye":
        say("rdr2", null, count("rd-eagle"));
        return;
      case "fossil-bone":
        say("rdr2", null, count("rd-bone"));
        return;
      case "campfire-flare":
        // our own line until Q-RD-1 is verified in the work (spec §9.1 #12)
        say("rdr2", line(copyOf("egg.fire.toast")), count("rd-fire"));
        return;
      case "snitch":
        return;
    }
  }

  const handle = useEffectEvent((m: EggMsg) => {
    if (m.kind === "egg") {
      run(m.id);
      return;
    }
    if (self.current.on) {
      self.current.count = m.count;
      return;
    }
    say(HUNT_ROWS[m.id].world, null, { id: m.id, count: m.count });
  });

  useEffect(() => attach((m) => handle(m)), [attach]);

  // Dead Eye keys: Esc aborts, Enter fires (while it runs)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const d = deadEye.current;
      if (!d) return;
      if (e.key === "Escape") {
        d.abort();
        deadEye.current = null;
      } else if (e.key === "Enter" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        d.fire();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMap = useCallback(() => {
    setMapOpen(false);
    const held = afterMap.current;
    afterMap.current = null;
    if (held) say("hp", null, held);
  }, [say]);

  return (
    <>
      {region ? <EggToast toast={toast} onDone={clearToast} /> : null}
      {mapOpen ? <MapDialog variant={mapVariant} onClose={closeMap} onNavigate={go} /> : null}
    </>
  );
}

/** "Egg 5 of 12 · The cursed coin", or at 12/12 "12 / 12" + Q-HP-2 (null
 *  when its copy may not render here). */
function huntToastLine({ id, count }: HuntLine): ReactNode {
  if (count >= HUNT_TOTAL) {
    const done = copyText("egg.hunt.complete");
    const q = quotes["Q-HP-2"];
    const quoted = copyVisible({ text: q.text, status: q.status });
    if (!copyVisible(done) && !quoted) return null;
    return (
      <div className="flex flex-col gap-1" data-hunt-toast="complete">
        {copyVisible(done) ? <p className="type-meta text-(--w-ink-contour)">{done.text}</p> : null}
        <FilmQuote id="Q-HP-2" rendition="caption" attribution="inline" className="text-fg" />
      </div>
    );
  }
  const name = copyText(HUNT_ROWS[id].name);
  const text = copyText("egg.hunt.toast", { n: count, name: name.text });
  if (!copyVisible(text) || !copyVisible(name)) return null;
  return (
    <p className="type-meta text-fg-muted" data-hunt-toast="">
      {text.text}
    </p>
  );
}
