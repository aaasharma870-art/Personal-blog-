/* ============================================================================
   ENHANCER BINDER: words — OWNER: W2-WORDS (plan §3.2, §6.4; spec §8).
   Run by components/enhance/desktop-enhancer.ts (the lazy desktop chunk:
   DESKTOP_FINE, home page; ladder step 2, or after the quiet window with
   motion off) and by /lab/p3/words. Binds the word primitives' SERVER
   MARKUP (`[data-words]`, components/words/**) and never changes their
   text: every effect ends on the server's DOM.

   - title     (in-character-title.tsx) and physical (physical-word.tsx):
               TIME stars. Only an element OFFSCREEN at bind is armed (its
               pre-state set: the title at opacity 0, the strike undrawn);
               one in view stays final. When it enters, it asks the
               spotlight (lib/spotlight.ts) and plays once per page view on
               "play"; "skip" shows the end state at once.
   - fly       (fly-through.tsx): a `needsIdle` time star once its zone is
               half in view; nothing is hidden before it.
   - scrub     (scrub-sentence.tsx): a SCROLL star, scrubbed continuously
               (components/words/bind/scrub.ts).
   - collapse  (components/primitives/collapse.tsx): every toggle asks for a
               scroll refresh (Lenis + ScrollTrigger re-measure the page).

   MOTION OFF (reduced motion, Pause, leaving DESKTOP_FINE): every effect
   ends in the same task (onMotionOffChange is synchronous with the toggle):
   full text, no armed state, nothing scrubbed. Motion back on re-scans:
   elements offscreen and not yet played arm again. Phones, touch, no-JS
   and reduced motion at boot never load this file (the spotlight neither).
   `?debug=words` logs to the console and `window.__words` (the probe).
   ========================================================================== */

import type { BeatWeight } from "@/lib/beats";
import { DESKTOP_FINE, onMotionOffChange } from "@/lib/flags";
import { onIdle } from "@/lib/idle";
import { requestScrollRefresh } from "@/lib/smooth-scroll";
import { spotlight } from "@/lib/spotlight";
import type { Variant } from "@/lib/variants";
import { Run, exposeDebug, liveNow, note, type Restore } from "@/components/words/bind/shared";
import { armTitle, playTitle, titleHold, titleWorldOf } from "@/components/words/bind/titles";
import { PHYSICAL_MS, armPhysical, playPhysical, syncPhysicalVariant } from "@/components/words/bind/physical";
import { playFly } from "@/components/words/bind/fly";
import { Scrub } from "@/components/words/bind/scrub";

type Kind = "title" | "physical" | "fly";

/** When a time star counts as "entered" (IntersectionObserver). */
const OBSERVE: Readonly<Record<Kind, { margin: string; amount: number }>> = {
  title: { margin: "0px 0px -10% 0px", amount: 0.6 },
  physical: { margin: "0px 0px -30% 0px", amount: 1 },
  fly: { margin: "0px", amount: 0.5 },
};

function weightOf(el: HTMLElement, fallback: BeatWeight): BeatWeight {
  const w = Number(el.dataset.beatWeight);
  return w === 1 || w === 2 || w === 3 ? w : fallback;
}

type Item = { readonly el: HTMLElement; reset(): void };

class TimeStar implements Item {
  state: "idle" | "armed" | "asking" | "playing" | "done" = "idle";
  private io: IntersectionObserver | null = null;
  private unarm: Restore | null = null;
  private run: Run | null = null;

  constructor(
    readonly el: HTMLElement,
    readonly kind: Kind,
    readonly key: string,
    private readonly ctl: Controller,
  ) {}

  private get id(): string {
    return this.el.dataset.beat ?? this.key;
  }

  start(inView: boolean): void {
    // never hide in front of the reader (a fly-through hides nothing)
    if (this.kind !== "fly" && inView) return this.settle("static", "in view at bind");
    if (this.kind === "title") this.unarm = armTitle(this.el);
    else if (this.kind === "physical") this.unarm = armPhysical(this.el);
    this.state = "armed";
    this.mark("armed");
    note("arm", this.key);
    const { margin, amount } = OBSERVE[this.kind];
    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const vh = e.rootBounds?.height ?? window.innerHeight;
          if (e.intersectionRatio >= amount - 0.001 || e.intersectionRect.height >= vh * amount) {
            this.io?.disconnect();
            this.io = null;
            this.ask();
            return;
          }
        }
      },
      { rootMargin: margin, threshold: [...new Set([0, amount, 1])] },
    );
    this.io.observe(this.el);
  }

  private hold(): number {
    if (this.kind === "title") return titleHold(this.el);
    if (this.kind === "physical") return PHYSICAL_MS;
    return Math.min(1200, Number(this.el.dataset.wordsMs) || 1200);
  }

  private ask(): void {
    this.state = "asking";
    note("ask", this.key);
    const fly = this.kind === "fly";
    void spotlight
      .request(this.id, { weight: weightOf(this.el, fly ? 2 : 1), needsIdle: fly || undefined, durationMs: this.hold() })
      .then((answer) => {
        if (this.state !== "asking") return;
        if (answer === "play" && liveNow()) void this.play();
        else this.settle("static", answer === "skip" ? "spotlight skip" : "motion off");
      });
  }

  /** Plays now (the spotlight's grant, or a lab replay). */
  play(variant?: Variant): Promise<void> {
    this.io?.disconnect();
    this.io = null;
    const prev = this.run;
    this.run = null;
    prev?.end();
    const run = new Run();
    this.run = run;
    const ms =
      this.kind === "title"
        ? playTitle(this.el, run, variant)
        : this.kind === "physical"
          ? playPhysical(this.el, run, variant)
          : playFly(this.el, run, variant);
    // the pre-state goes only now: the effect's first frames already hold it
    this.unarm?.();
    this.unarm = null;
    if (ms == null) {
      this.run = null;
      this.settle("static", "nothing to play");
      return Promise.resolve();
    }
    this.state = "playing";
    this.mark("playing");
    note("play", this.key);
    void run.finished.then(() => {
      if (this.run !== run) return;
      this.run = null;
      this.settle("played");
    });
    return run.finished;
  }

  private settle(how: "static" | "played", why?: string): void {
    this.io?.disconnect();
    this.io = null;
    this.unarm?.();
    this.unarm = null;
    this.state = "done";
    this.mark(null);
    this.ctl.decide(this.key);
    note(how, this.key, why);
  }

  /** Motion off / unbind: the final text now. A star that already played
   *  (or is playing) stays decided for this page view. */
  reset(): void {
    const was = this.state;
    if (was === "asking") spotlight.release(this.id);
    this.io?.disconnect();
    this.io = null;
    const run = this.run;
    this.run = null;
    run?.end();
    this.unarm?.();
    this.unarm = null;
    if (was === "playing") this.ctl.decide(this.key);
    this.state = "done";
    this.mark(null);
  }

  private mark(s: "armed" | "playing" | null): void {
    if (s) this.el.dataset.wordsState = s;
    else if (this.el.dataset.wordsState) delete this.el.dataset.wordsState;
  }
}

class Controller {
  readonly items = new Map<HTMLElement, Item>();
  private readonly decided = new Set<string>();
  private readonly elKeys = new WeakMap<HTMLElement, string>();
  private keySeq = 0;
  private live = false;
  private offs: (() => void)[] = [];

  constructor(private readonly root: Document) {}

  start(): () => void {
    // collapses re-measure the page on every toggle (toggle does not bubble)
    const onToggle = (e: Event) => {
      const t = e.target;
      if (t instanceof HTMLDetailsElement && t.hasAttribute("data-collapse")) {
        requestScrollRefresh();
        window.setTimeout(requestScrollRefresh, 320); // after the 240 ms height animation
      }
    };
    this.root.addEventListener("toggle", onToggle, true);
    this.offs.push(() => this.root.removeEventListener("toggle", onToggle, true));

    const check = () => this.check();
    this.offs.push(onMotionOffChange(check));
    const mq = window.matchMedia(DESKTOP_FINE);
    mq.addEventListener("change", check);
    this.offs.push(() => mq.removeEventListener("change", check));

    // late markup (a reduced-motion remount, a client section mounting late)
    let cancelIdle = () => {};
    const mo = new MutationObserver((records) => {
      if (!this.live) return;
      const outside = records.some((r) => r.addedNodes.length > 0 && !(r.target instanceof Element && r.target.closest("[data-words]")));
      if (!outside) return;
      cancelIdle();
      cancelIdle = onIdle(() => this.scan(), { timeout: 1000 });
    });
    mo.observe(this.root.body, { childList: true, subtree: true });
    this.offs.push(() => {
      mo.disconnect();
      cancelIdle();
    });

    this.live = liveNow();
    if (this.live) this.scan();
    exposeDebug({
      state: () => this.debugState(),
      scan: () => this.scan(),
    });
    return () => this.stop();
  }

  decide(key: string): void {
    this.decided.add(key);
  }

  private check(): void {
    const next = liveNow();
    if (next === this.live) return;
    this.live = next;
    if (!next) {
      this.resetAll();
      note("off", "*");
      return;
    }
    note("on", "*");
    // let a reduced-motion remount commit before re-scanning
    window.setTimeout(() => {
      if (this.live) this.scan();
    }, 60);
  }

  private resetAll(): void {
    for (const it of this.items.values()) it.reset();
    this.items.clear();
  }

  stop(): void {
    this.resetAll();
    for (const off of this.offs) off();
    this.offs = [];
    if (current === this) current = null;
  }

  private keyOf(el: HTMLElement, kind: string): string {
    if (el.dataset.beat) return `${kind}:${el.dataset.beat}`;
    let k = this.elKeys.get(el);
    if (!k) {
      k = `${kind}:#${++this.keySeq}`;
      this.elKeys.set(el, k);
    }
    return k;
  }

  scan(): void {
    if (!this.live) return;
    for (const [el, it] of this.items) {
      if (!el.isConnected) {
        it.reset();
        this.items.delete(el);
      }
    }
    const found = Array.from(this.root.querySelectorAll<HTMLElement>("[data-words]")).filter((el) => !this.items.has(el));
    if (!found.length) return;
    // every read first (one layout), then the writes
    const vh = window.innerHeight;
    const inView = found.map((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < vh && (r.width > 0 || r.height > 0);
    });
    found.forEach((el, k) => {
      const kind = el.dataset.words;
      if (kind === "scrub") {
        const s = new Scrub(el, el.dataset.beat ?? this.keyOf(el, "scrub"), weightOf(el, 1));
        this.items.set(el, s);
        s.start(inView[k]);
        return;
      }
      if (kind !== "title" && kind !== "physical" && kind !== "fly") return;
      if (kind === "title" && !titleWorldOf(el)) return;
      if (kind === "physical") syncPhysicalVariant(el);
      const key = this.keyOf(el, kind);
      const star = new TimeStar(el, kind, key, this);
      this.items.set(el, star);
      if (this.decided.has(key)) {
        star.state = "done";
        return;
      }
      star.start(inView[k]);
    });
  }

  private debugState() {
    return [...this.items.values()].map((it) => ({
      words: it.el.dataset.words,
      beat: it.el.dataset.beat ?? null,
      state: it instanceof TimeStar ? it.state : "scrub",
    }));
  }
}

let current: Controller | null = null;

export default function bind(root: Document): () => void {
  if (typeof window === "undefined") return () => {};
  current?.stop();
  const ctl = new Controller(root);
  current = ctl;
  return ctl.start();
}

/** /lab/p3/words: plays one primitive now (no spotlight, no once-per-view),
 *  with motion on; resolves when it has ended. Scrub sentences follow the
 *  scroll and have nothing to replay. */
export function playNow(el: Element, variant?: Variant): Promise<void> {
  if (!(el instanceof HTMLElement) || !liveNow()) return Promise.resolve();
  const it = current?.items.get(el);
  if (it instanceof TimeStar) return it.play(variant);
  const kind = el.dataset.words;
  const run = new Run();
  const ms =
    kind === "title" ? playTitle(el, run, variant) : kind === "physical" ? playPhysical(el, run, variant) : kind === "fly" ? playFly(el, run, variant) : null;
  if (ms == null) run.end();
  return run.finished;
}
