/* ============================================================================
   IDLE — the one place deferred work is scheduled (PHASE3-SPEC §3.1, §3.7).
   requestIdleCallback → scheduler.postTask("background") → setTimeout(1)
   (Safari has no rIC). Raw `requestIdleCallback` is banned everywhere else
   (ESLint no-restricted-globals). Client only; a no-op on the server.
   ========================================================================== */

type PostTask = (
  cb: () => void,
  o?: { priority?: "user-blocking" | "user-visible" | "background"; signal?: AbortSignal },
) => Promise<unknown>;

const noop = () => {};

/** Run `fn` in the next idle slice (`timeout` caps the wait where rIC
 *  exists). Returns a cancel function; `fn` runs at most once. */
export function onIdle(fn: () => void, o: { timeout?: number } = {}): () => void {
  if (typeof window === "undefined") return noop;
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };
  const w = window as Window & { scheduler?: { postTask?: PostTask } };

  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(run, o.timeout != null ? { timeout: o.timeout } : undefined);
    return () => {
      done = true;
      w.cancelIdleCallback(id);
    };
  }

  const postTask = w.scheduler?.postTask;
  if (typeof postTask === "function") {
    const ac = typeof AbortController === "function" ? new AbortController() : null;
    postTask.call(w.scheduler, run, { priority: "background", signal: ac?.signal }).catch(noop);
    return () => {
      done = true;
      ac?.abort();
    };
  }

  const t = window.setTimeout(run, 1);
  return () => {
    done = true;
    window.clearTimeout(t);
  };
}
