/* ============================================================================
   IDLE — the one place deferred work is scheduled (PHASE3-SPEC §3.1, §3.7).
   requestIdleCallback → scheduler.postTask("background") → setTimeout(1)
   (Safari has no rIC). Raw `requestIdleCallback` is banned everywhere else
   (ESLint no-restricted-globals). Client only; a no-op on the server.

   P3-11 r3 (J8 F1: idle tasks of 0.1–0.7 s while the page moved, every one
   attributed to this wrapper): the wrapper now keeps the idle contract.
   - SLICED: `fn` gets an IdleSlice whose `timeRemaining()` never reports
     more than SLICE_MS (12 ms) from the moment `fn` starts. Work that loops
     checks it and yields (`await idleSlice()`) when it reaches 0.
   - A SHORT slice waits: an idle period with less than MIN_SLICE_MS left
     (frames are being produced) is passed over for the next one, unless the
     `timeout` has expired.
   - HELD WHILE THE PAGE MOVES: no slice starts within BUSY_MS of a scroll,
     wheel, touch move or scrolling key, nor during `holdIdle(ms)` (a set
     piece that plays on time, not on scroll). A held callback runs anyway
     `hold` ms after it was asked for (default HOLD_CAP_MS: a scroll that
     never settles still makes progress); `hold: 0` never holds.
   Work that resolves a promise here (`await idleSlice()`) runs its
   continuation in the same task: it inherits the slice, so keep it short.
   ========================================================================== */

type PostTask = (
  cb: () => void,
  o?: { priority?: "user-blocking" | "user-visible" | "background"; signal?: AbortSignal },
) => Promise<unknown>;

/** What `fn` receives: the browser's IdleDeadline, capped to one slice. */
export type IdleSlice = {
  /** ms left in this slice (≤ SLICE_MS from the slice's start; 0 = yield). */
  timeRemaining(): number;
  /** The `timeout` forced this slice (the page was never idle long enough). */
  readonly didTimeout: boolean;
};

export type IdleOptions = {
  /** Cap on the wait for an idle period (ms; rIC's own `timeout`). */
  timeout?: number;
  /** Longest hold while the page moves (ms from the call; 0 = never held).
   *  Default HOLD_CAP_MS. */
  hold?: number;
};

/** One slice's budget (ms): J8 F1 "slice to the deadline (≤ 10–15 ms)". */
export const SLICE_MS = 12;
/** An idle period shorter than this is passed over (unless timed out). */
const MIN_SLICE_MS = 8;
/** With no `timeout`, short idle periods are passed over this long at most. */
const SHORT_OK_MS = 2000;
/** The page counts as moving for this long after a scroll input (ms). */
const BUSY_MS = 250;
/** A held callback runs anyway this long after it was asked for (ms). */
const HOLD_CAP_MS = 6000;

const noop = () => {};
const now = () => performance.now();

let lastMove = -1e9;
let holdUntil = 0;
let watching = false;

const SCROLL_KEYS = /^(?:PageUp|PageDown|ArrowUp|ArrowDown|Home|End| |Spacebar)$/;

function watch(): void {
  if (watching) return;
  watching = true;
  const moved = () => {
    lastMove = now();
  };
  const opts = { capture: true, passive: true } as const;
  window.addEventListener("scroll", moved, opts);
  window.addEventListener("wheel", moved, opts);
  window.addEventListener("touchmove", moved, opts);
  window.addEventListener(
    "keydown",
    (e) => {
      if (SCROLL_KEYS.test(e.key)) moved();
    },
    opts,
  );
}

/** ms until the page stops counting as busy (0 = not busy). */
function busyFor(): number {
  const t = now();
  return Math.max(0, lastMove + BUSY_MS - t, holdUntil - t);
}

/** True while the page moves (a scroll input in the last BUSY_MS) or a
 *  `holdIdle()` runs. Client only (false on the server). */
export function idleBusy(): boolean {
  if (typeof window === "undefined") return false;
  watch();
  return busyFor() > 0;
}

/** Hold every idle slice for `ms` from now (a set piece that plays on time,
 *  not on scroll: a card's settle, a game's start). Held callbacks run once
 *  the hold and any scroll are over (or at their own `hold` cap). */
export function holdIdle(ms: number): void {
  if (typeof window === "undefined" || !(ms > 0)) return;
  watch();
  holdUntil = Math.max(holdUntil, now() + ms);
}

/** Run `fn` in the next idle slice that the page is not moving through
 *  (see the header). Returns a cancel function; `fn` runs at most once.
 *  (`onIdle(resolve)` keeps working: a `void` promise resolves with the
 *  slice object, which nobody reads.) */
export function onIdle(fn: () => void, o?: IdleOptions): () => void;
export function onIdle(fn: (slice: IdleSlice) => void, o?: IdleOptions): () => void;
export function onIdle(fn: (slice: IdleSlice) => void, o: IdleOptions = {}): () => void {
  if (typeof window === "undefined") return noop;
  watch();
  const asked = now();
  const holdCap = o.hold ?? HOLD_CAP_MS;
  let done = false;
  let cancelWait = noop;

  const run = (deadline: IdleDeadline | null) => {
    if (done) return;
    done = true;
    const start = now();
    const native = deadline ? () => deadline.timeRemaining() : () => SLICE_MS;
    fn({
      didTimeout: Boolean(deadline?.didTimeout),
      timeRemaining: () => Math.max(0, Math.min(native(), start + SLICE_MS - now())),
    });
  };

  /** Ask for an idle period; `fn` runs in the first that is long enough
   *  and not inside a busy page (or past its caps). */
  const ask = (): void => {
    if (done) return;
    const w = window as Window & { scheduler?: { postTask?: PostTask } };
    const settled = (deadline: IdleDeadline | null) => {
      if (done) return;
      const held = holdCap > 0 && now() - asked < holdCap ? busyFor() : 0;
      if (held > 0) {
        // the page moves: wait it out, then ask again
        const t = window.setTimeout(ask, held + 16);
        cancelWait = () => window.clearTimeout(t);
        return;
      }
      // a short idle period (frames are being made) is passed over, for the
      // `timeout` (or SHORT_OK_MS) at most: then any period will do
      const picky = now() - asked < (o.timeout ?? SHORT_OK_MS);
      if (deadline && picky && !deadline.didTimeout && deadline.timeRemaining() < MIN_SLICE_MS) {
        ask();
        return;
      }
      run(deadline);
    };

    if (typeof w.requestIdleCallback === "function") {
      const left = o.timeout != null ? Math.max(1, o.timeout - (now() - asked)) : undefined;
      const id = w.requestIdleCallback(settled, left != null ? { timeout: left } : undefined);
      cancelWait = () => w.cancelIdleCallback(id);
      return;
    }
    const postTask = w.scheduler?.postTask;
    if (typeof postTask === "function") {
      const ac = typeof AbortController === "function" ? new AbortController() : null;
      postTask.call(w.scheduler, () => settled(null), { priority: "background", signal: ac?.signal }).catch(noop);
      cancelWait = () => ac?.abort();
      return;
    }
    const t = window.setTimeout(() => settled(null), 1);
    cancelWait = () => window.clearTimeout(t);
  };

  ask();
  return () => {
    done = true;
    cancelWait();
  };
}

/** `await idleSlice()`: resolves inside the next idle slice with that slice
 *  (its continuation runs in the same task; keep it within `timeRemaining()`).
 *  Never resolves on the server. */
export function idleSlice(o: IdleOptions = {}): Promise<IdleSlice> {
  return new Promise<IdleSlice>((resolve) => {
    onIdle(resolve, o);
  });
}
