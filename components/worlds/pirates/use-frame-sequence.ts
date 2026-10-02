"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import type { SeqHandle, SeqState } from "@/components/stage/stage";

/* ============================================================================
   useFrameSequence — fetch + decode an image sequence for a scroll- or
   state-driven canvas: the Journey's JV (72 × 1280 webp, ≈ 1.5 MB; SPEC v2
   SM-4, journey-voyage.BAR J10/J11) and the card push-ins (SEQ-HALL; spec
   §6.2). Nothing is requested until `enabled` (the host turns it on only on
   the desktop path — ≥ 1024, fine pointer, motion on, no Save-Data — once
   the section is within one viewport): 0 requests otherwise. Keyed by the
   url list, so a variant switch starts clean.

   TWO MODES.
   - LEGACY (no `window`; no caller left since W3-PIRATES moved JV to the
     window mode, kept for the API): ≤ 6 in flight,
     every frame `decode()`d into an <img> kept in `frames.current[i]`;
     `decoded / total` is real progress; `ready` once every frame decoded; a
     failed frame leaves the host on its stills.
   - WINDOW (`{ window: N, index? }`, PHASE3-SPEC §6.2, engineer #13; owner
     W2-PLATES): every frame is fetched once as a compressed Blob (kept for
     the page's life), and only ±N frames around the current index are
     decoded, as ImageBitmaps by createImageBitmap (off the main thread),
     ahead in the scroll direction first, and close()d outside the window.
     ≤ 1 sequence holds decoded frames page-wide (one that starts decoding
     evicts the other's bitmaps; blobs stay) and ≤ 128 MB decoded in total
     (window.__seqMem reports it). Turning `enabled` off (the host's "more
     than one viewport away") drops the bitmaps and keeps the blobs.
     The current index is `index.current` when the host passes it, else the
     last `frameAt(i)` asked for; `frameAt(i)` returns frame i, else the
     nearest decoded neighbour (a fast scrub never draws a hole), else null.
     `decoded / total` = blobs fetched (the LD-PC loader's real progress);
     `ready` = every blob fetched and the window around the entry index
     decoded. The engine is the desktop plates chunk
     (components/stage/stage.tsx `seqWindow`), loaded on first use: this
     first-load hook stays small.
   Drawing never re-renders React (frames live in refs / the engine).
   ========================================================================== */

export type FrameSequence = {
  /** LEGACY mode: decoded frames by index (null until decoded / on
   *  failure). Empty in WINDOW mode (use `frameAt`). */
  frames: { readonly current: readonly (HTMLImageElement | null)[] };
  decoded: number;
  total: number;
  ready: boolean;
  failed: boolean;
  /** WINDOW mode: changes when the asked frame decodes (redraw on it). */
  tick?: number;
};

const CONCURRENCY = 6;

/** `window`: decode only ±window frames around the current index (plan
 *  §3.4); `index`: the host's current frame (read by the engine). */
export type FrameSequenceOptions = { window?: number; index?: MutableRefObject<number> };

type WinProgress = SeqState & { key: string };

export function useFrameSequence(
  urls: readonly string[],
  enabled: boolean,
  o?: FrameSequenceOptions,
): FrameSequence & { frameAt(i: number): CanvasImageSource | null } {
  const key = urls.length ? `${urls[0]}#${urls.length}` : "";
  const win = Math.max(0, Math.round(o?.window ?? 0));
  const indexRef = o?.index;
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  // progress is keyed by the url list, so a new list reads as 0 without a
  // synchronous reset inside the effect
  const [progress, setProgress] = useState<{ key: string; done: number; failed: number }>({
    key: "",
    done: 0,
    failed: 0,
  });
  const engine = useRef<SeqHandle | null>(null);
  const [winState, setWinState] = useState<WinProgress>({ key: "", fetched: 0, failed: 0, ready: false, tick: 0 });

  // LEGACY: every frame decoded into an <img>
  useEffect(() => {
    if (win || !enabled || !key) return;
    let cancelled = false;
    const list: (HTMLImageElement | null)[] = new Array<HTMLImageElement | null>(urls.length).fill(null);
    frames.current = list;
    let next = 0;
    let inflight = 0;
    let done = 0;
    let failed = 0;

    const pump = () => {
      while (!cancelled && inflight < CONCURRENCY && next < urls.length) {
        const i = next++;
        const src = urls[i];
        if (!src) continue;
        inflight++;
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        img
          .decode()
          .then(() => {
            if (!cancelled) list[i] = img;
          })
          .catch(() => {
            failed++;
          })
          .finally(() => {
            inflight--;
            done++;
            if (cancelled) return;
            setProgress({ key, done, failed });
            pump();
          });
      }
    };
    pump();
    return () => {
      cancelled = true;
    };
    // `urls` is represented by `key` (its first url + length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win, enabled, key]);

  // WINDOW: the engine (lazy), fed by the host's index ref
  useEffect(() => {
    if (!win || !enabled || !key) return;
    let live = true;
    let h: SeqHandle | null = null;
    import("@/components/stage/stage").then(
      (m) => {
        if (!live) return;
        h = m.seqWindow(urls, win, () => indexRef?.current ?? -1, (s) => {
          if (live) setWinState({ key, ...s });
        });
        engine.current = h;
      },
      () => {
        if (live) setWinState({ key, fetched: 0, failed: 1, ready: false, tick: 0 });
      },
    );
    return () => {
      live = false;
      h?.drop();
      if (engine.current === h) engine.current = null;
    };
    // `urls` is represented by `key`; `indexRef` is a ref object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win, enabled, key]);

  // plan §3.4: the stable accessor (both modes)
  const frameAt = useCallback(
    (i: number): CanvasImageSource | null => (win ? (engine.current?.frameAt(i) ?? null) : (frames.current[i] ?? null)),
    [win],
  );

  if (win) {
    const mine = winState.key === key;
    return {
      frames,
      decoded: mine ? winState.fetched : 0,
      total: urls.length,
      // a disabled window holds no bitmaps: never "ready" then
      ready: mine && enabled && winState.ready && urls.length > 0,
      failed: mine && winState.failed > 0,
      tick: mine ? winState.tick : 0,
      frameAt,
    };
  }
  const mine = progress.key === key;
  const decoded = mine ? progress.done - progress.failed : 0;
  const failed = mine && progress.failed > 0;
  return {
    frames,
    decoded,
    total: urls.length,
    ready: mine && !failed && urls.length > 0 && progress.done === urls.length,
    failed,
    frameAt,
  };
}
