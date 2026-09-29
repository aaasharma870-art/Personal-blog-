/* ============================================================================
   DECODER LOCK — at most ONE decoding video page-wide (DESIGN v2 §6.4, §7;
   SPEC §10.1 rule 6). Module-level, framework-free, client-only by use.

   Replaces the private "one active ambient video" guard that lived inside
   components/visuals/ambient-background.tsx, so legacy ambient loops and the
   new MediaFrame share ONE cap.

   Semantics
   - acquire(): take the decoder. An equal-or-higher priority claim preempts
     the holder (most recent wins — the legacy behaviour); a lower priority
     claim is refused while a higher one holds it (e.g. the intro flight,
     priority 10, can't be interrupted by a hero loop, priority 0).
   - A preempted holder gets onRevoke() and must stop its video at once.
   - `wait: true` claimants stay queued while refused or preempted; when the
     holder releases, the best waiter (highest priority, then most recent)
     is granted and gets onGrant(). Legacy AmbientBackground claims with
     wait:false, exactly as before (a preempted loop stays off until its
     section re-enters view).
   - release() in every cleanup path (leaving view, unmount, failure).
   Observers (a React store, the /lab readout) use subscribe()/holder().
   ========================================================================== */

export type DecoderClaim = {
  /** Default 0. Higher can't be preempted by lower. */
  priority?: number;
  /** Called synchronously when a newer/higher claim takes the decoder. */
  onRevoke?: () => void;
  /** Called when a queued (`wait`) claim is granted after a release. */
  onGrant?: () => void;
  /** Stay queued while refused or preempted (default false). */
  wait?: boolean;
  /** Human-readable name for the /lab readout. */
  label?: string;
};

type Entry = Required<Omit<DecoderClaim, "onRevoke" | "onGrant" | "label">> &
  Pick<DecoderClaim, "onRevoke" | "onGrant" | "label"> & { seq: number };

const entries = new Map<symbol, Entry>();
let holderId: symbol | null = null;
let seq = 0;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => l());
}

/** Try to take the decoder. Returns true when `id` holds it afterwards. */
export function acquireDecoder(id: symbol, claim: DecoderClaim = {}): boolean {
  const entry: Entry = {
    priority: claim.priority ?? 0,
    wait: claim.wait ?? false,
    onRevoke: claim.onRevoke,
    onGrant: claim.onGrant,
    label: claim.label,
    seq: ++seq,
  };
  entries.set(id, entry);
  if (holderId === id) {
    notify();
    return true;
  }
  if (holderId) {
    const holder = entries.get(holderId);
    if (holder && holder.priority > entry.priority) {
      if (!entry.wait) entries.delete(id);
      notify();
      return false;
    }
    const prev = holderId;
    if (holder && !holder.wait) entries.delete(prev);
    // Hand over BEFORE notifying the old holder, so its onRevoke (which must
    // stop its video and must not re-acquire synchronously) sees the truth.
    holderId = id;
    holder?.onRevoke?.();
    notify();
    return true;
  }
  holderId = id;
  notify();
  return true;
}

/** Give the decoder back (and leave the queue). Safe to call when not held. */
export function releaseDecoder(id: symbol): void {
  entries.delete(id);
  if (holderId !== id) {
    notify();
    return;
  }
  holderId = null;
  let best: [symbol, Entry] | null = null;
  for (const [key, e] of entries) {
    if (!e.wait) continue;
    if (
      !best ||
      e.priority > best[1].priority ||
      (e.priority === best[1].priority && e.seq > best[1].seq)
    ) {
      best = [key, e];
    }
  }
  if (best) {
    holderId = best[0];
    best[1].onGrant?.();
  }
  notify();
}

/** The current holder (null when the decoder is free). */
export function decoderHolder(): symbol | null {
  return holderId;
}

/** Label of the current holder, for diagnostics. */
export function decoderHolderLabel(): string | null {
  return holderId ? (entries.get(holderId)?.label ?? "unlabelled") : null;
}

export function subscribeDecoder(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}
